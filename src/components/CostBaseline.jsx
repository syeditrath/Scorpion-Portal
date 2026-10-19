import { useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx-js-style";
import { T } from "../theme.js";
import { uid, fmtDate } from "../utils.js";
import { parseCostWorkbook, summarizeBaseline, stageDaysToAppEstimates, collapseManpowerLines } from "../costParser.js";

/* ════════════════════════════════════════════════════════════════════════════
   COST BASELINE — step 1 of running-job cost control
   • Imports the manual costing sheet as a FROZEN budget per crossing.
   • Seeds the crossing's estimated days (so estimates are never typed twice).
   • Stored under data.costBaselines — a new, isolated collection.
   Re-importing the same crossing creates a new version; older ones are kept
   (marked superseded) so history is never rewritten.
════════════════════════════════════════════════════════════════════════════ */

const sar = n => (n == null || isNaN(n)) ? "—" : Math.round(n).toLocaleString();
const EST_ROWS = [
  ["preparation", "Preparation"], ["mobilization", "Mobilization (+ demob)"], ["pilot", "Pilot"],
  ["reaming", "Reaming"], ["cleanpass", "Clean Pass"], ["pullpipe", "Pull Pipe"],
];
const GROUPS = [
  ["manpower", "Manpower", "👷"], ["equipment", "Equipment", "🚜"],
  ["material", "Materials", "🧱"], ["overhead", "Office overhead", "🏢"],
];
const BASIS_LABEL = { duration: "× duration", stage: "stage days", fixedDays: "fixed days", qty: "qty × rate", lump: "lump sum" };
const cleanCrossingName = s => String(s || "").replace(/_/g, " ").replace(/\s+/g, " ").trim();

const inputStyle = () => ({
  width: "100%", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 8,
  padding: "8px 10px", fontSize: 13, color: T.text, outline: "none", colorScheme: "light",
});
const lbl = () => ({ display: "block", fontSize: 10.5, fontWeight: 700, color: T.textMuted, marginBottom: 5, letterSpacing: ".5px" });

function marginColor(pct) { return pct >= 15 ? T.green : pct >= 8 ? T.gold : T.red; }

/* Pure: applies an import to the app data. Never mutates `prev`.
   • creates the rig / crossing if the user chose "new"
   • seeds the six activity estimates (only those keys — other crossing data is untouched)
   • versions the baseline; the previous current version is kept, marked superseded */
export function applyBaselineImport(prev, project, baseline, plan, newId = uid) {
  let rigs = prev.rigs || [];
  if (plan.newRig) rigs = [...rigs, plan.newRig];

  let crossings = prev.crossings || [];
  if (plan.crossingId) {
    if (plan.seed) crossings = crossings.map(c => c.id === plan.crossingId ? { ...c, estimates: { ...(c.estimates || {}), ...plan.estimates } } : c);
  } else {
    crossings = [...crossings, { id: newId(), project, rig: baseline.rig, name: plan.crossingName, status: "Active", estimates: plan.seed ? { ...plan.estimates } : {} }];
  }

  const sameKey = b => b.project === project && b.rig === baseline.rig && b.crossing === baseline.crossing && !b._deleted;
  const version = 1 + Math.max(0, ...(prev.costBaselines || []).filter(sameKey).map(b => b.version || 1));
  const costBaselines = (prev.costBaselines || []).map(b => sameKey(b) && !b.superseded ? { ...b, superseded: true } : b);
  return { ...prev, rigs, crossings, costBaselines: [...costBaselines, { ...baseline, version }] };
}

/* ── import preview (separate component so it can be rendered in isolation) ── */
export function ImportPreview(p) {
  const { parsed } = p;
  const m = parsed.model;
  const failed = (parsed.checks || []).filter(c => !c.ok);
  const section = (title, children) => (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, letterSpacing: ".5px", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {p.sheetNames.length > 1 && (
        <div>
          <label style={lbl()}>SHEET TO IMPORT</label>
          <select value={p.sheet} onChange={e => p.onSheet(e.target.value)} style={inputStyle()}>
            {p.sheetNames.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {!parsed.ok && (
        <div style={{ background: T.redDim, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: T.red, marginBottom: 4 }}>This sheet can't be imported yet</div>
          {parsed.errors.map((e, i) => <div key={i} style={{ fontSize: 12, color: T.red }}>• {e}</div>)}
        </div>
      )}

      {parsed.ok && (<>
        {section("WHAT WAS READ", (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8 }}>
            {[
              ["Client", m.header.client || "—"], ["Location", m.header.location || "—"], ["Rig", m.header.rig || "—"],
              ["Length", m.header.lengthM ? `${m.header.lengthM} m` : "—"], ["Duration", `${m.stageDays.total} days`],
              ["Net cost", `SAR ${sar(m.summary.net)}`], ["Sales price", `SAR ${sar(m.summary.sales)}`],
              ["Margin", `${m.summary.marginPct.toFixed(1)}%`],
            ].map(([k, v]) => (
              <div key={k}><div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700 }}>{k.toUpperCase()}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{v}</div></div>
            ))}
          </div>
        ))}

        {section(`RECONCILIATION  ·  ${parsed.checks.length - failed.length}/${parsed.checks.length} passed`, (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {parsed.checks.map(c => (
              <div key={c.id} style={{ display: "flex", gap: 8, fontSize: 12, color: c.ok ? T.textSub : T.red, fontWeight: c.ok ? 500 : 700 }}>
                <span>{c.ok ? "✓" : "⚠"}</span>
                <span>{c.label}{!c.ok && ` — expected ${sar(c.expected)}, found ${sar(c.found)}`}</span>
              </div>
            ))}
            {parsed.warnings.map((w, i) => <div key={i} style={{ fontSize: 12, color: T.gold, fontWeight: 600 }}>⚠ {w}</div>)}
          </div>
        ))}

        {section("LINK TO A CROSSING IN THE APP", (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={lbl()}>RIG / SPREAD</label>
              <select value={p.rigChoice} onChange={e => p.setRigChoice(e.target.value)} style={inputStyle()}>
                <option value="">Select rig…</option>
                {p.projRigs.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                <option value="__new__">＋ New rig…</option>
              </select>
              {p.rigChoice === "__new__" && <input value={p.newRigName} onChange={e => p.setNewRigName(e.target.value)} placeholder="e.g. 360 TON" style={{ ...inputStyle(), marginTop: 6 }} />}
            </div>
            <div>
              <label style={lbl()}>CROSSING</label>
              <select value={p.crossingChoice} onChange={e => p.setCrossingChoice(e.target.value)} style={inputStyle()} disabled={!p.rigChoice}>
                <option value="">Select crossing…</option>
                {p.rigCrossings.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                <option value="__new__">＋ New crossing…</option>
              </select>
              {p.crossingChoice === "__new__" && <input value={p.newCrossingName} onChange={e => p.setNewCrossingName(e.target.value)} placeholder="Crossing name" style={{ ...inputStyle(), marginTop: 6 }} />}
            </div>
          </div>
        ))}

        {section("ESTIMATED DAYS (feeds Estimated vs Actual)", (
          <div>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: T.text, fontWeight: 600, marginBottom: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={p.seed} onChange={e => p.setSeed(e.target.checked)} />
              Set this crossing's estimated days from the sheet
            </label>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr>{["Activity", "Current", "From sheet"].map((h, i) => (
                <th key={h} style={{ textAlign: i ? "right" : "left", padding: "4px 8px", fontSize: 10, color: T.textMuted, fontWeight: 700 }}>{h}</th>))}</tr></thead>
              <tbody>
                {EST_ROWS.map(([k, label]) => {
                  const cur = p.currentEstimates[k];
                  const changed = p.seed && cur != null && cur !== p.newEst[k];
                  return (
                    <tr key={k} style={{ borderTop: `1px solid ${T.border}` }}>
                      <td style={{ padding: "5px 8px", color: T.textSub }}>{label}</td>
                      <td style={{ padding: "5px 8px", textAlign: "right", color: T.textMuted }}>{cur != null ? `${cur}d` : "—"}</td>
                      <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 700, color: changed ? T.gold : T.text }}>{p.newEst[k]}d{changed && " ⚠ overwrites"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {m.stageDays.foc > 0 && (
              <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontSize: 12, color: T.textSub }}>
                The sheet has <b>{m.stageDays.foc} days of "FOC drilling"</b>, which the app has no category for. Count them as:
                <select value={p.focAs} onChange={e => p.setFocAs(e.target.value)} style={{ ...inputStyle(), width: "auto", padding: "4px 8px" }}>
                  <option value="reaming">Reaming</option><option value="pilot">Pilot</option><option value="none">Don't include</option>
                </select>
              </div>
            )}
          </div>
        ))}

        {section("PRIVACY", (
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: T.text, fontWeight: 600, cursor: "pointer" }}>
            <input type="checkbox" checked={p.collapse} onChange={e => p.setCollapse(e.target.checked)} style={{ marginTop: 2 }} />
            <span>Don't store individual names or salaries — keep manpower as grouped totals
              <span style={{ display: "block", fontWeight: 400, color: T.textMuted, marginTop: 2 }}>
                Totals and the daily burn rate stay exactly the same. Recommended unless you need line-level crew cost in the app.
              </span></span>
          </label>
        ))}
      </>)}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
        <button onClick={p.onBack} style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.textSub, borderRadius: 9, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Choose another file</button>
        <button onClick={p.onConfirm} disabled={!p.canSave}
          style={{ background: p.canSave ? `linear-gradient(135deg,${T.green},#059669)` : T.border, border: "none", color: p.canSave ? "#000" : T.textMuted, borderRadius: 9, padding: "10px 22px", fontSize: 13, fontWeight: 800, cursor: p.canSave ? "pointer" : "not-allowed" }}>
          Save baseline{failed.length ? " (with warnings)" : ""}
        </button>
      </div>
    </div>
  );
}

/* ── import modal ────────────────────────────────────────────────────────── */
function CostImportModal({ proj, data, onClose, onConfirm }) {
  const [fileName, setFileName] = useState("");
  const [sheetNames, setSheetNames] = useState([]);
  const [sheet, setSheet] = useState("");
  const [parsed, setParsed] = useState(null);
  const [readError, setReadError] = useState("");
  const [rigChoice, setRigChoice] = useState("");
  const [newRigName, setNewRigName] = useState("");
  const [crossingChoice, setCrossingChoice] = useState("");
  const [newCrossingName, setNewCrossingName] = useState("");
  const [seed, setSeed] = useState(true);
  const [focAs, setFocAs] = useState("reaming");
  const [collapse, setCollapse] = useState(true);
  const wbRef = useRef(null);
  const fileRef = useRef(null);

  const projRigs = (data.rigs || []).filter(r => r.project === proj.project && !r._deleted);
  const rigName = rigChoice === "__new__" ? newRigName.trim() : rigChoice;
  const rigCrossings = rigChoice === "__new__" ? [] : (data.crossings || []).filter(c => c.project === proj.project && c.rig === rigName && !c._deleted);
  const chosenCrossing = rigCrossings.find(c => c.id === crossingChoice);
  const crossingName = crossingChoice === "__new__" ? newCrossingName.trim() : (chosenCrossing ? chosenCrossing.name : "");

  const newEst = useMemo(() => parsed && parsed.ok ? stageDaysToAppEstimates(parsed.model.stageDays, focAs === "none" ? null : focAs) : {}, [parsed, focAs]);
  const currentEstimates = (chosenCrossing && chosenCrossing.estimates) || {};
  const canSave = !!(parsed && parsed.ok && rigName && crossingName);

  const runParse = (wb, name) => {
    const res = parseCostWorkbook(XLSX, wb, name);
    setParsed(res); setNewCrossingName(cleanCrossingName(name)); setCrossingChoice(""); setReadError("");
  };
  const onFile = async f => {
    if (!f) return;
    try {
      const wb = XLSX.read(await f.arrayBuffer(), { type: "array" });
      wbRef.current = wb; setFileName(f.name); setSheetNames(wb.SheetNames); setSheet(wb.SheetNames[0]);
      runParse(wb, wb.SheetNames[0]);
    } catch (e) { setReadError("Could not read this file: " + (e && e.message ? e.message : e)); }
  };

  const confirm = () => {
    const m = parsed.model;
    const lines = collapse ? collapseManpowerLines(m.lines) : m.lines;
    const derived = summarizeBaseline({ ...m, lines });
    onConfirm({
      baseline: {
        id: uid(), project: proj.project, rig: rigName, crossing: crossingName,
        importedAt: new Date().toISOString(), sourceFile: fileName, sheetName: m.sheetName,
        header: m.header, stageDays: m.stageDays, pricing: m.pricing[0] || null, summary: m.summary,
        lines, manpowerCollapsed: collapse, derived,
        checksTotal: parsed.checks.length, checksFailed: parsed.checks.filter(c => !c.ok).length, focAs,
      },
      plan: {
        newRig: rigChoice === "__new__" ? { id: uid(), project: proj.project, name: rigName } : null,
        crossingId: crossingChoice === "__new__" ? null : crossingChoice,
        crossingName, seed, estimates: newEst,
      },
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: T.card, borderRadius: 18, width: "min(760px,96vw)", maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 28px 80px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "18px 24px 14px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 21, color: T.text }}>⬆ IMPORT COST MODEL</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{proj.project} · one costing sheet = one crossing</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.textMuted, fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: "18px 24px", overflowY: "auto" }}>
          {!parsed ? (
            <div>
              <div onClick={() => fileRef.current && fileRef.current.click()}
                onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
                style={{ border: `2px dashed ${T.green}55`, borderRadius: 14, padding: "40px 20px", textAlign: "center", cursor: "pointer", background: `${T.green}08` }}>
                <div style={{ fontSize: 38, marginBottom: 8 }}>📊</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 18, color: T.text }}>Drop your cost tracking sheet here, or click to browse</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 6 }}>.xlsx — the file is read in your browser; nothing is uploaded until you save</div>
                <input ref={fileRef} type="file" accept=".xlsx,.xlsm" style={{ display: "none" }} onChange={e => { onFile(e.target.files[0]); e.target.value = ""; }} />
              </div>
              {readError && <div style={{ marginTop: 12, fontSize: 12, color: T.red, fontWeight: 700 }}>⚠ {readError}</div>}
            </div>
          ) : (
            <ImportPreview
              parsed={parsed} fileName={fileName} sheetNames={sheetNames} sheet={sheet}
              onSheet={s => { setSheet(s); runParse(wbRef.current, s); }}
              projRigs={projRigs} rigChoice={rigChoice} setRigChoice={v => { setRigChoice(v); setCrossingChoice(""); }}
              newRigName={newRigName} setNewRigName={setNewRigName}
              rigCrossings={rigCrossings} crossingChoice={crossingChoice} setCrossingChoice={setCrossingChoice}
              newCrossingName={newCrossingName} setNewCrossingName={setNewCrossingName}
              seed={seed} setSeed={setSeed} focAs={focAs} setFocAs={setFocAs}
              collapse={collapse} setCollapse={setCollapse}
              currentEstimates={currentEstimates} newEst={newEst} canSave={canSave}
              onConfirm={confirm} onBack={() => { setParsed(null); setFileName(""); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── one saved baseline ──────────────────────────────────────────────────── */
function BaselineCard({ b, isAdmin, historyCount, onReimport, onDelete }) {
  const [open, setOpen] = useState(false);
  const d = b.derived || summarizeBaseline(b);
  const s = b.summary || {};
  const margin = s.marginPct || 0;
  const sd = b.stageDays || {};
  const stageChips = [
    ["Mob", sd.mob], ["Set up", sd.setup], ["Pilot", sd.pilot],
    ["Reaming", Object.values(sd.reams || {}).reduce((a, x) => a + x, 0)], ["FOC", sd.foc],
    ["Clean pass", (sd.cp1 || 0) + (sd.cp2 || 0)], ["Pull", sd.pull], ["Demob", sd.demob],
  ].filter(([, v]) => v);
  const tiles = [
    ["NET COST", `SAR ${sar(s.net)}`, T.text],
    ["SALES PRICE", `SAR ${sar(s.sales)}`, T.text],
    ["BUDGET MARGIN", `${margin.toFixed(1)}%`, marginColor(margin)],
    ["DURATION", `${d.durationDays} days`, T.text],
    ["COST PER DAY", `SAR ${sar(d.burnPerDay)}`, T.gold],
    ["MOVES WITH DAYS", `${d.timeDrivenPct.toFixed(0)}%`, T.gold],
  ];

  return (
    <div className="fade-up" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 18px", boxShadow: T.shadow }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 17, color: T.text }}>🛤️ {b.crossing}</span>
        <span style={{ fontSize: 12, color: T.gold, fontWeight: 700 }}>🔩 {b.rig}</span>
        <span style={{ fontSize: 11, color: T.textMuted }}>v{b.version || 1}{historyCount > 0 ? ` · ${historyCount} earlier` : ""} · imported {fmtDate(b.importedAt)} · {b.sourceFile}</span>
        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: b.checksFailed ? T.gold : T.green }}>
          {b.checksFailed ? `⚠ ${b.checksFailed} check${b.checksFailed > 1 ? "s" : ""} failed at import` : `✓ ${b.checksTotal} checks passed`}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(125px,1fr))", gap: 8, marginBottom: 12 }}>
        {tiles.map(([k, v, c]) => (
          <div key={k} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 12px" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 19, color: c, lineHeight: 1.1 }}>{v}</div>
            <div style={{ fontSize: 9.5, color: T.textMuted, fontWeight: 700, marginTop: 3, letterSpacing: ".4px" }}>{k}</div>
          </div>
        ))}
      </div>

      {stageChips.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {stageChips.map(([k, v]) => (
            <span key={k} style={{ fontSize: 11, background: T.card2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "2px 8px", color: T.textSub, fontWeight: 600 }}>{k} <b style={{ color: T.text }}>{v}d</b></span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setOpen(o => !o)} style={{ background: T.blueDim, border: `1px solid ${T.blue}33`, color: T.blue, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          {open ? "Hide cost breakdown ▲" : "Show cost breakdown ▼"}
        </button>
        {isAdmin && <button onClick={onReimport} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.textSub, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>↻ Re-import (new version)</button>}
        {isAdmin && <button onClick={onDelete} style={{ background: "transparent", border: `1px solid ${T.red}44`, color: T.red, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", marginLeft: "auto" }}>✕ Delete</button>}
      </div>

      {open && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          {GROUPS.map(([key, label, icon]) => {
            const lines = (b.lines || []).filter(l => l.section === key);
            if (!lines.length) return null;
            const total = lines.reduce((a, l) => a + l.total, 0);
            const pct = s.net ? (total / s.net) * 100 : 0;
            const hideLines = key === "manpower" && !b.manpowerCollapsed && !isAdmin;
            return (
              <div key={key} style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ background: T.card2, padding: "8px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span>{icon}</span><span style={{ fontWeight: 800, fontSize: 13, color: T.text }}>{label}</span>
                  <span style={{ fontSize: 11, color: T.textMuted }}>{pct.toFixed(0)}% of cost</span>
                  <span style={{ marginLeft: "auto", fontWeight: 800, fontSize: 13, color: T.text }}>SAR {sar(total)}</span>
                </div>
                {hideLines ? (
                  <div style={{ padding: "8px 14px", fontSize: 12, color: T.textMuted }}>Individual crew lines are visible to admins only.</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <tbody>
                      {lines.filter(l => l.total !== 0).map(l => (
                        <tr key={l.id} style={{ borderTop: `1px solid ${T.border}` }}>
                          <td style={{ padding: "5px 14px", color: T.textSub }}>{l.description}</td>
                          <td style={{ padding: "5px 8px", whiteSpace: "nowrap" }}>
                            <span style={{ fontSize: 10, background: l.basis === "duration" ? T.goldDim : T.card2, color: l.basis === "duration" ? T.gold : T.textMuted, borderRadius: 5, padding: "1px 7px", fontWeight: 700 }}>{BASIS_LABEL[l.basis] || l.basis}</span>
                            {l.allocDivisor ? <span style={{ fontSize: 10, background: T.purpleDim, color: T.purple, borderRadius: 5, padding: "1px 7px", fontWeight: 700, marginLeft: 4 }}>÷{l.allocDivisor} shared</span> : null}
                          </td>
                          <td style={{ padding: "5px 14px", textAlign: "right", color: T.text, fontWeight: 600 }}>{sar(l.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
          <div style={{ fontSize: 11, color: T.textMuted }}>
            "× duration" lines grow with every extra project day — that is what drives margin when a job overruns.
            Lines marked "÷N shared" were divided by a fixed number in your sheet (looks like cost split across N crossings).
          </div>
        </div>
      )}
    </div>
  );
}

/* ── the panel shown at the top of a project's Cost Sheet tab ────────────── */
export function CostBaselinePanel({ proj, data, setData, showToast, isAdmin }) {
  const [importing, setImporting] = useState(false);

  const all = (data.costBaselines || []).filter(b => b.project === proj.project && !b._deleted);
  const current = all.filter(b => !b.superseded).sort((a, b) => (b.importedAt || "").localeCompare(a.importedAt || ""));
  const historyFor = b => all.filter(x => x.superseded && x.rig === b.rig && x.crossing === b.crossing).length;

  const saveImport = ({ baseline, plan }) => {
    setData(prev => applyBaselineImport(prev, proj.project, baseline, plan));
    setImporting(false);
    showToast && showToast(`Cost baseline saved for ${baseline.crossing} ✓`);
  };

  const remove = id => {
    if (typeof window !== "undefined" && !window.confirm("Delete this cost baseline? Older versions stay hidden too.")) return;
    setData(prev => ({ ...prev, costBaselines: (prev.costBaselines || []).map(b => b.id === id ? { ...b, _deleted: true } : b) }));
    showToast && showToast("Baseline removed", "del");
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 19, color: T.text }}>🎯 COST BASELINES</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>The approved budget for each crossing — a frozen snapshot of your costing sheet</div>
        </div>
        {isAdmin && (
          <button onClick={() => setImporting(true)} style={{ background: `linear-gradient(135deg,${T.green},#059669)`, border: "none", color: "#000", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            ⬆ Import Cost Model (Excel)
          </button>
        )}
      </div>

      {current.length === 0 ? (
        <div style={{ textAlign: "center", padding: "34px 20px", background: T.card, border: `1px dashed ${T.border}`, borderRadius: 16 }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 13, color: T.textMuted, fontWeight: 600, maxWidth: 480, margin: "0 auto" }}>
            No cost baseline yet. {isAdmin ? "Import your costing sheet to set the budget for a crossing — its stage days also fill in the estimated days automatically." : "An admin can import the costing sheet for this project."}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {current.map(b => (
            <BaselineCard key={b.id} b={b} isAdmin={isAdmin} historyCount={historyFor(b)} onReimport={() => setImporting(true)} onDelete={() => remove(b.id)} />
          ))}
        </div>
      )}

      {importing && <CostImportModal proj={proj} data={data} onClose={() => setImporting(false)} onConfirm={saveImport} />}
    </div>
  );
}
