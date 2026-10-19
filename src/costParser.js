/* ════════════════════════════════════════════════════════════════════════════
   costParser.js — reads the manual "Cost Tracking" crossing sheet into a
   structured cost model.

   Design notes
   • Label-anchored, not cell-address-anchored: sections are found by their
     titles ("Manpower List", "Equipment List", "Material List", "Summary"),
     the stage-days table by its headers ("Mob", "Set Up", "Total day"…).
     Moving a block up/down a few rows will not break the import.
   • Reads the values Excel last saved (cell.v) and the formulas (cell.f) —
     formulas are used only to classify HOW a line is calculated.
   • Never throws on a surprising layout: returns { ok:false, errors:[…] } and
     a list of reconciliation checks so the UI can show exactly what is off.
   • Pure function of (XLSX library, workbook) so it can be unit-tested in Node.
════════════════════════════════════════════════════════════════════════════ */

const norm = v => String(v ?? "").replace(/\s+/g, " ").trim();
const lc   = v => norm(v).toLowerCase();
const isNum = v => typeof v === "number" && isFinite(v);

function makeSheetApi(XLSX, ws) {
  const range = ws["!ref"] ? XLSX.utils.decode_range(ws["!ref"]) : { s:{r:0,c:0}, e:{r:0,c:0} };
  const at  = (r, c) => ws[XLSX.utils.encode_cell({ r, c })];
  const val = (r, c) => { const x = at(r, c); return x ? x.v : undefined; };
  const fml = (r, c) => { const x = at(r, c); return x && x.f ? String(x.f) : ""; };
  return { range, at, val, fml };
}

/* first non-empty cell to the right of (r,c) — handles merged label cells */
function rightOf(api, r, c, maxHop = 8) {
  for (let k = 1; k <= maxHop; k++) {
    const v = api.val(r, c + k);
    if (v !== undefined && norm(v) !== "") return { v, c: c + k };
  }
  return null;
}

const SECTION_TITLES = {
  manpower:  /^manpower list$/i,
  equipment: /^equipment list$/i,
  material:  /^material list$/i,
  summary:   /^summary$/i,
};

function findTitleRow(api, re, fromRow = 0, maxCol = 3) {
  for (let r = fromRow; r <= api.range.e.r; r++) {
    for (let c = 0; c <= maxCol; c++) {
      const v = api.val(r, c);
      if (typeof v === "string" && re.test(norm(v))) return r;
    }
  }
  return -1;
}

/* ── formula classification ─────────────────────────────────────────────── */
const DURATION_REF = /(?:^|[^A-Z$])\$?(?:E|AM)\$?3(?![0-9])/i;   // E3 / AM3 (project duration)
const STAGE_REF    = /(?:^|[^A-Z$])\$?(?:[V-Z]|A[A-J])\$?3(?![0-9])/i; // V3..AJ3 (stage-day cells)

function classifyLine(section, line) {
  const gF = line.fG, hF = line.fH;
  const alloc = (hF.match(/\/\s*(\d+(?:\.\d+)?)\s*(?:\)|$)/) || [])[1];
  const allocDivisor = alloc ? Number(alloc) : null;

  if (section === "material") {
    const qtyRate = isNum(line.F) && isNum(line.G) && line.F > 0 && line.G > 0;
    return { basis: qtyRate ? "qty" : "lump", allocDivisor };
  }
  if (DURATION_REF.test(gF)) return { basis: "duration", allocDivisor };
  if (STAGE_REF.test(gF))    return { basis: "stage",    allocDivisor };
  if (isNum(line.G) && line.G > 0 && (isNum(line.F) || isNum(line.E))) return { basis: "fixedDays", allocDivisor };
  return { basis: "lump", allocDivisor };
}

/* ── one list section (manpower / equipment / material) ──────────────────── */
function parseSection(api, key, titleRow) {
  const out = { lines: [], sectionTotal: null, errors: [] };
  const headerRow = titleRow + 1;
  let totalRow = -1;
  for (let r = headerRow + 1; r <= api.range.e.r; r++) {
    // G = "Total" label, H = sum
    if (lc(api.val(r, 6)) === "total" && api.val(r, 7) !== undefined) { totalRow = r; break; }
    // safety: next big section title reached without a total row
    if (/^(manpower|equipment|material) list$|^summary$/i.test(norm(api.val(r, 1)))) break;
  }
  if (totalRow < 0) { out.errors.push(`No "Total" row found for ${key} list`); return out; }

  out.sectionTotal = isNum(api.val(totalRow, 7)) ? api.val(totalRow, 7) : null;
  if (out.sectionTotal === null && api.fml(totalRow, 7)) out.errors.push(`${key} total has a formula but no saved value — open the file in Excel and save it again`);

  let subgroup = "";
  for (let r = headerRow + 1; r < totalRow; r++) {
    const label = norm(api.val(r, 2));
    const H = api.val(r, 7);
    if (!label && H === undefined) continue;
    if (label && !isNum(H)) {
      // text row with no amount → sub-heading (e.g. "Equipment Rental : for 1 Rig")
      if (H === undefined || norm(H) === "") { subgroup = label; continue; }
    }
    if (!isNum(H)) continue;
    if (!label && H === 0) continue;               // blank spacer rows that still carry a 0
    const line = {
      section: key, subgroup, description: label || "(unlabelled)",
      D: api.val(r, 3), E: api.val(r, 4), F: api.val(r, 5), G: api.val(r, 6), total: H,
      fG: api.fml(r, 6), fH: api.fml(r, 7),
    };
    const cls = classifyLine(key, line);
    out.lines.push({
      id: `${key}-${r + 1}`, row: r + 1, section: key, subgroup,
      description: line.description,
      qtyOrMen: isNum(line.D) ? line.D : null,
      monthly:  key !== "material" && isNum(line.E) ? line.E : null,
      rate:     key === "material" ? (isNum(line.G) ? line.G : null) : (isNum(line.F) ? line.F : null),
      daysOrQty: key === "material" ? (isNum(line.F) ? line.F : null) : (isNum(line.G) ? line.G : null),
      total: H, basis: cls.basis, allocDivisor: cls.allocDivisor,
    });
  }
  return out;
}

/* ── header block (Client / Location / Duration / Crossing / LM / Equipment) ─ */
function parseHeader(api) {
  const want = {
    client:   /^client\s*:?$/i,   location: /^location\s*:?$/i,
    duration: /^duration in days\s*:?$/i, crossings: /^crossing\s*:?$/i,
    lengthM:  /^lm\s*:?$/i,      rig: /^equipment\s*:$/i,
  };
  const h = {};
  for (let r = 0; r <= Math.min(10, api.range.e.r); r++) {
    for (let c = 0; c <= 3; c++) {
      const v = api.val(r, c);
      if (typeof v !== "string") continue;
      for (const [k, re] of Object.entries(want)) {
        if (h[k] === undefined && re.test(norm(v))) {
          const hit = rightOf(api, r, c);
          if (hit) h[k] = isNum(hit.v) ? hit.v : norm(hit.v);
        }
      }
    }
  }
  return h;
}

/* ── stage-days + pricing tables ─────────────────────────────────────────── */
function parseStageAndPricing(api) {
  const res = { stageDays: null, pricing: [], errors: [], warnings: [] };

  // locate the header row that contains both "Mob" and "Set Up"
  let hdrRow = -1, mobCol = -1;
  for (let r = 0; r <= Math.min(12, api.range.e.r) && hdrRow < 0; r++) {
    let mob = -1, setup = -1;
    for (let c = 0; c <= api.range.e.c; c++) {
      const t = lc(api.val(r, c));
      if (t === "mob") mob = c;
      if (t === "set up" || t === "setup") setup = c;
    }
    if (mob >= 0 && setup >= 0) { hdrRow = r; mobCol = mob; }
  }
  if (hdrRow < 0) { res.errors.push('Stage-days table not found (looking for "Mob" and "Set Up" headers)'); return res; }

  const stage = { reams: {}, extra: {} };
  for (let c = mobCol; c <= api.range.e.c; c++) {
    const rawH = norm(api.val(hdrRow, c));
    if (!rawH) continue;
    const t = rawH.toLowerCase();
    const v = api.val(hdrRow + 1, c);
    const n = isNum(v) ? v : 0;
    if (t === "mob") stage.mob = n;
    else if (t === "set up" || t === "setup") stage.setup = n;
    else if (/pilot/.test(t)) stage.pilot = (stage.pilot || 0) + n;
    else if (/^\d+\s*["”″']?$/.test(t)) stage.reams[parseInt(t, 10)] = n;
    else if (/foc/.test(t)) stage.foc = n;
    else if (/^cp\s*0?1$/.test(t)) stage.cp1 = n;
    else if (/^cp\s*0?2$/.test(t)) stage.cp2 = n;
    else if (/pull/.test(t)) stage.pull = n;
    else if (/demob/.test(t)) stage.demob = n;
    else if (/^total day/.test(t)) stage.total = n;
    else if (/standby|buoyancy/.test(t)) stage.standby = n;
    else if (/mp total/.test(t)) stage.mpDays = n;
    else stage.extra[rawH] = n;
  }
  res.stageDays = stage;

  // pricing/crossing table sits in the same header row, left of the stage table
  const col = {};
  for (let c = 0; c < mobCol; c++) {
    const t = lc(api.val(hdrRow, c));
    if (/^sr\s*#?$/.test(t)) col.sr = c;
    else if (/^location/.test(t)) col.km = c;
    else if (/^description/.test(t)) col.description = c;
    else if (/^diameter/.test(t)) col.diameter = c;
    else if (/^estimated length/.test(t)) col.lengthM = c;
    else if (/^unit price/.test(t)) col.unitPrice = c;
    else if (/^total price/.test(t)) col.salesPrice = c;
  }
  for (let r = hdrRow + 1; r <= Math.min(hdrRow + 12, api.range.e.r); r++) {
    const sr = col.sr !== undefined ? api.val(r, col.sr) : undefined;
    const sales = col.salesPrice !== undefined ? api.val(r, col.salesPrice) : undefined;
    if (sr === undefined && sales === undefined) break;
    res.pricing.push({
      sr: sr ?? null,
      km: col.km !== undefined ? norm(api.val(r, col.km)) : "",
      description: col.description !== undefined ? norm(api.val(r, col.description)) : "",
      diameter: col.diameter !== undefined && isNum(api.val(r, col.diameter)) ? api.val(r, col.diameter) : null,
      lengthM:  col.lengthM  !== undefined && isNum(api.val(r, col.lengthM))  ? api.val(r, col.lengthM)  : null,
      unitPrice: col.unitPrice !== undefined && isNum(api.val(r, col.unitPrice)) ? api.val(r, col.unitPrice) : null,
      salesPrice: isNum(sales) ? sales : null,
    });
  }
  if (res.pricing.length > 1) res.warnings.push(`The sheet lists ${res.pricing.length} priced crossings — only the first is used for the baseline summary; please review.`);
  return res;
}

/* ── summary block ───────────────────────────────────────────────────────── */
function parseSummary(api, fromRow, durationHint) {
  const labels = {
    manpower: /^manpower$/i, equipment: /^equipment$/i, material: /^material$/i,
    subtotal: /^total$/i, overhead: /^office overhead$/i, net: /^net total$/i,
    sales: /^total sales price$/i, profit: /^net profit sar$/i, marginPct: /^net profit\s*%$/i,
  };
  const s = { overheadDays: null, overheadRate: null };
  const stop = findTitleRow(api, SECTION_TITLES.summary, fromRow + 2); // a second "Summary" block starts a different table
  const end = stop > 0 ? stop : Math.min(api.range.e.r, fromRow + 20);
  for (let r = fromRow + 2; r <= end; r++) {
    const lab = norm(api.val(r, 2));
    for (const [k, re] of Object.entries(labels)) {
      if (s[k] === undefined && re.test(lab) && isNum(api.val(r, 7))) {
        s[k] = api.val(r, 7);
        if (k === "overhead") {
          // the days cell is the one that references the project duration (=E3); rate = total ÷ days
          let days = null;
          for (let c = 3; c <= 6; c++) {
            if (isNum(api.val(r, c)) && DURATION_REF.test(api.fml(r, c))) { days = api.val(r, c); break; }
          }
          if (days === null && isNum(durationHint)) days = durationHint;
          s.overheadDays = days;
          s.overheadRate = days ? s[k] / days : null;
        }
      }
    }
  }
  return s;
}

/* ── reconciliation checks the UI shows before saving ────────────────────── */
function buildChecks(m) {
  const checks = [];
  const near = (a, b, tol = 1) => isNum(a) && isNum(b) && Math.abs(a - b) <= tol;
  const add = (id, label, ok, expected, found) => checks.push({ id, label, ok: !!ok, expected, found });
  const sum = arr => arr.reduce((s, x) => s + x.total, 0);

  for (const k of ["manpower", "equipment", "material"]) {
    const sec = m.sections[k];
    if (sec && sec.sectionTotal !== null)
      add(`lines-${k}`, `${k[0].toUpperCase() + k.slice(1)} lines add up to the section total`, near(sum(sec.lines), sec.sectionTotal), sec.sectionTotal, sum(sec.lines));
    if (sec && isNum(m.summary[k]))
      add(`sum-${k}`, `${k[0].toUpperCase() + k.slice(1)} in Summary matches the list total`, near(m.summary[k], sec.sectionTotal), sec.sectionTotal, m.summary[k]);
  }
  if (isNum(m.summary.net) && isNum(m.summary.subtotal) && isNum(m.summary.overhead))
    add("net", "Net total = subtotal + office overhead", near(m.summary.net, m.summary.subtotal + m.summary.overhead), m.summary.subtotal + m.summary.overhead, m.summary.net);
  if (isNum(m.summary.sales) && isNum(m.summary.net) && isNum(m.summary.profit))
    add("profit", "Net profit = sales price − net total", near(m.summary.profit, m.summary.sales - m.summary.net), m.summary.sales - m.summary.net, m.summary.profit);
  if (isNum(m.summary.sales) && isNum(m.summary.profit) && isNum(m.summary.marginPct) && m.summary.sales)
    add("margin", "Margin % = profit ÷ sales price", near(m.summary.marginPct, (m.summary.profit / m.summary.sales) * 100, 0.05), (m.summary.profit / m.summary.sales) * 100, m.summary.marginPct);
  const sd = m.stageDays;
  if (sd) {
    const parts = (sd.mob||0)+(sd.setup||0)+(sd.pilot||0)+Object.values(sd.reams).reduce((a,b)=>a+b,0)+(sd.foc||0)+(sd.cp1||0)+(sd.cp2||0)+(sd.pull||0)+(sd.demob||0);
    if (isNum(sd.total)) add("stage-sum", "Stage days add up to the sheet's Total day", parts === sd.total, sd.total, parts);
    if (isNum(m.header.duration) && isNum(sd.total)) add("duration", "Header duration equals total stage days", m.header.duration === sd.total, sd.total, m.header.duration);
  }
  const p0 = m.pricing[0];
  if (p0 && isNum(p0.salesPrice) && isNum(m.summary.sales))
    add("sales", "Sales price in the crossing table matches the Summary", near(p0.salesPrice, m.summary.sales), p0.salesPrice, m.summary.sales);
  return checks;
}

/* ════════════════════════════════════════════════════════════════════════════
   PUBLIC API
════════════════════════════════════════════════════════════════════════════ */
export function parseCostWorkbook(XLSX, wb, sheetName) {
  const errors = [], warnings = [];
  const name = sheetName || wb.SheetNames[0];
  const ws = wb.Sheets[name];
  if (!ws) return { ok: false, errors: ["Workbook has no readable sheet"], warnings, checks: [] };
  if (wb.SheetNames.length > 1 && !sheetName)
    warnings.push(`Workbook has ${wb.SheetNames.length} sheets — importing "${name}". Import the others separately.`);

  const api = makeSheetApi(XLSX, ws);
  const rows = {};
  for (const k of Object.keys(SECTION_TITLES)) rows[k] = findTitleRow(api, SECTION_TITLES[k]);
  for (const k of ["manpower", "equipment", "material"])
    if (rows[k] < 0) errors.push(`Section "${k[0].toUpperCase() + k.slice(1)} List" not found`);
  if (rows.summary < 0) errors.push('"Summary" block not found');
  if (errors.length) return { ok: false, errors, warnings, checks: [] };

  const sections = {};
  for (const k of ["manpower", "equipment", "material"]) {
    const sec = parseSection(api, k, rows[k]);
    sections[k] = sec;
    errors.push(...sec.errors);
  }
  const sp = parseStageAndPricing(api);
  errors.push(...sp.errors); warnings.push(...sp.warnings);
  const header0 = parseHeader(api);
  const summary = parseSummary(api, rows.summary, header0.duration);
  for (const need of ["net", "sales"]) if (!isNum(summary[need])) errors.push(`Summary is missing "${need === "net" ? "Net Total" : "Total Sales Price"}"`);
  const header = header0;

  const model = {
    sheetName: name, header, stageDays: sp.stageDays, pricing: sp.pricing,
    sections, summary,
  };
  const checks = buildChecks(model);
  const failed = checks.filter(c => !c.ok);
  if (failed.length) warnings.push(`${failed.length} reconciliation check${failed.length > 1 ? "s" : ""} did not pass — review before saving.`);

  // flatten to plain, serialisable lines
  const lines = ["manpower", "equipment", "material"].flatMap(k => sections[k].lines);
  const overheadLine = isNum(summary.overhead) ? [{
    id: "overhead-1", row: null, section: "overhead", subgroup: "", description: "Office overhead",
    qtyOrMen: null, monthly: null, rate: summary.overheadRate, daysOrQty: summary.overheadDays,
    total: summary.overhead, basis: "duration", allocDivisor: null,
  }] : [];

  return {
    ok: errors.length === 0, errors, warnings, checks,
    model: {
      sheetName: name, header, stageDays: sp.stageDays, pricing: sp.pricing,
      summary, lines: [...lines, ...overheadLine],
      sectionTotals: Object.fromEntries(["manpower", "equipment", "material"].map(k => [k, sections[k].sectionTotal])),
    },
  };
}

/* How much of the cost moves with days? (drives overrun cost) */
export function summarizeBaseline(model) {
  const dur = (model.stageDays && model.stageDays.total) || model.header.duration || 0;
  const by = { duration: 0, stage: 0, fixedDays: 0, qty: 0, lump: 0 };
  for (const l of model.lines) by[l.basis] = (by[l.basis] || 0) + l.total;
  const net = model.summary.net || Object.values(by).reduce((a, b) => a + b, 0);
  return {
    durationDays: dur, byBasis: by, net,
    timeDriven: by.duration,
    burnPerDay: dur ? by.duration / dur : 0,
    timeDrivenPct: net ? (by.duration / net) * 100 : 0,
  };
}

/* Stage days → the six activity categories the app already tracks */
export function stageDaysToAppEstimates(sd, focAs = "reaming") {
  if (!sd) return {};
  const reaming = Object.values(sd.reams || {}).reduce((a, b) => a + b, 0);
  const est = {
    preparation: sd.setup || 0,
    mobilization: (sd.mob || 0) + (sd.demob || 0),
    pilot: sd.pilot || 0,
    reaming,
    cleanpass: (sd.cp1 || 0) + (sd.cp2 || 0),
    pullpipe: sd.pull || 0,
  };
  if (sd.foc && focAs && est[focAs] !== undefined) est[focAs] += sd.foc;
  return est;
}

/* Privacy option — replace individual manpower lines (names + monthly pay) with
   one line per calculation basis. Keeps burn-rate accuracy; drops personal data. */
export function collapseManpowerLines(lines) {
  const manpower = lines.filter(l => l.section === "manpower" && l.total !== 0);   // unused zero-cost template rows are dropped
  const rest = lines.filter(l => l.section !== "manpower");
  const label = { duration: "Crew — full duration", stage: "Crew — specific stages only", fixedDays: "Crew — fixed days", qty: "Crew — other", lump: "Crew — other" };
  const groups = {};
  for (const l of manpower) {
    const k = l.basis === "qty" ? "lump" : l.basis;
    (groups[k] = groups[k] || { n: 0, total: 0 }).n += 1;
    groups[k].total += l.total;
  }
  const collapsed = Object.entries(groups).map(([basis, g], i) => ({
    id: `manpower-agg-${i}`, row: null, section: "manpower", subgroup: "",
    description: `${label[basis] || "Crew"} (${g.n} ${g.n === 1 ? "person" : "people"})`,
    qtyOrMen: g.n, monthly: null, rate: null, daysOrQty: null,
    total: g.total, basis, allocDivisor: null,
  }));
  return [...collapsed, ...rest];
}
