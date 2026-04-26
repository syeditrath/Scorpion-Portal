import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

/* ─── Global CSS ─────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'Barlow', sans-serif; background: #f0e6d3; color: #1a0a00; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #f0e6d3; }
  ::-webkit-scrollbar-thumb { background: #e8d5b7; border-radius: 3px; }
  input, select, textarea, button { font-family: 'Barlow', sans-serif; }
  button { cursor: pointer; }
  /* Responsive font scaling */
  html { font-size: 16px; }
  @media (min-width: 1400px) { html { font-size: 17px; } }
  @media (min-width: 1800px) { html { font-size: 19px; } }
  @media (max-width: 768px)  { html { font-size: 14px; } }
  

  /* Responsive layout helpers */
  .resp-grid-2 { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr)); gap:clamp(10px,1.5vw,20px); }
  .resp-grid-3 { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr)); gap:clamp(10px,1.5vw,18px); }
  .resp-grid-4 { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,200px),1fr)); gap:clamp(8px,1.2vw,16px); }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
  @keyframes fadeDown  { from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);} }
  @keyframes slideUp   { from{opacity:0;transform:translateY(32px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);} }
  @keyframes fadeIn    { from{opacity:0;}to{opacity:1;} }
  @keyframes slideIn   { from{opacity:0;transform:translateX(24px);}to{opacity:1;transform:translateX(0);} }
  @keyframes popIn     { 0%{opacity:0;transform:scale(0.88);}70%{transform:scale(1.03);}100%{opacity:1;transform:scale(1);} }
  @keyframes shimmer   { 0%{background-position:-300% center;}100%{background-position:300% center;} }
  @keyframes floatUp   { 0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);} }
  @keyframes goldGlow  { 0%,100%{filter:drop-shadow(0 0 6px rgba(251,191,36,0.4));}50%{filter:drop-shadow(0 0 16px rgba(251,191,36,0.9));} }
  @keyframes logoSpin  { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
  @keyframes logoPulse { 0%,100%{transform:scale(1);}25%{transform:scale(1.04);}75%{transform:scale(0.97);} }
  @keyframes gradShift { 0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;} }
  @keyframes countUp   { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
  @keyframes spinSlow   { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
  @keyframes pulse      { 0%,100%{transform:scale(1);}50%{transform:scale(1.06);} }
  @keyframes glowRing   { 0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,0);}50%{box-shadow:0 0 0 18px rgba(251,191,36,0.18);} }
  @keyframes textReveal { from{opacity:0;letter-spacing:12px;}to{opacity:1;letter-spacing:4px;} }
  @keyframes subReveal  { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
  @keyframes fadeOut    { from{opacity:1;}to{opacity:0;} }
  @keyframes modalFloatIn {
  from {
    opacity: 0;
    transform: translateY(22px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

  .fade-up   { animation: fadeUp   0.35s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-down { animation: fadeDown 0.3s ease both; }
  .slide-up  { animation: slideUp  0.42s cubic-bezier(0.34,1.3,0.64,1) both; }
  .fade-in   { animation: fadeIn   0.22s ease both; }
  .slide-in  { animation: slideIn  0.32s cubic-bezier(0.22,1,0.36,1) both; }
  .pop-in    { animation: popIn    0.4s  cubic-bezier(0.34,1.3,0.64,1) both; }
  .spin-slow  { animation: spinSlow 8s linear infinite; }
  .pulse-logo { animation: pulse 3s ease-in-out infinite; }
  .glow-ring  { animation: glowRing 2.5s ease-in-out infinite; }

  /* Logo animations */
  .logo-animate      { animation: logoPulse 5s ease-in-out infinite; }
  .logo-ring-spin    { animation: logoSpin 12s linear infinite; }
  .logo-ring-spin-rev{ animation: logoSpin 18s linear infinite reverse; }

  /* Card hover lift */
  .card-hover { transition: transform 0.22s ease, box-shadow 0.22s ease; }
  .card-hover:hover { transform: translateY(-4px) !important; box-shadow: 0 10px 32px rgba(26,10,0,0.16) !important; }

  /* Nav item hover indent */
  .nav-item { transition: background 0.15s, padding-left 0.18s; }
  .nav-item:hover { padding-left: 18px !important; }

  /* Gold shimmer text */
  .gold-text {
    background: linear-gradient(90deg,#d97706,#fbbf24,#fde68a,#fbbf24,#d97706);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; animation: shimmer 10s ease-in-out infinite;
  }
  /* App card base */
  .app-card {
    background: #fdf8f0; border: 1px solid #e8d5b7; border-radius: 14px;
    box-shadow: 0 2px 8px rgba(26,10,0,0.06), 0 0 0 1px rgba(232,213,183,0.4);
  }

  /* Dark mode */
  body.dark-mode { background: #0d1117 !important; color: #e8edf5 !important; }
  body.dark-mode ::-webkit-scrollbar-track { background: #0d1117; }
  body.dark-mode ::-webkit-scrollbar-thumb { background: #1e293b; }

  /* Search highlight */
  .search-match { background: rgba(251,191,36,0.3); border-radius:3px; }

  /* Mobile responsive */
  @media (max-width:1200px) {
  .hide-mobile { display:none !important; }
  .mobile-full { width:100% !important; }
}
@media (min-width:1201px) {
  .show-mobile-only { display:none !important; }
}

  /* Export button pulse */
  @keyframes exportPulse { 0%,100%{opacity:1;}50%{opacity:0.6;} }
`;

/* ─── Theme ──────────────────────────────────────────────────────────────── */
const LIGHT = {
  bg:"#f0e6d3",
  sidebar:"#080b10",
  card:"#fdf8f0",
  card2:"#f7f0e6",
  cardHover:"#f0e6d3",
  border:"#e8d5b7",
  borderLight:"#dcc9a0",
  text:"#1a0a00",
  textSub:"#5c3d1e",
  textMuted:"#a07850",
  blue:"#38bdf8",
  green:"#34d399",
  gold:"#fbbf24",
  red:"#f87171",
  purple:"#a78bfa",
  teal:"#2dd4bf",
  orange:"#fb923c",
  blueDim:"rgba(56,189,248,0.12)",
  greenDim:"rgba(52,211,153,0.12)",
  goldDim:"rgba(251,191,36,0.12)",
  redDim:"rgba(248,113,113,0.12)",
  purpleDim:"rgba(167,139,250,0.12)",
  tealDim:"rgba(45,212,191,0.12)",
  orangeDim:"rgba(251,146,60,0.12)",
  inputBg:"#fdf8f0",
  shadow:"0 2px 12px rgba(26,10,0,0.08), 0 0 0 1px rgba(232,213,183,0.6)",
};

/* ─── Dark theme ─────────────────────────────────────────────────────────── */
const DARK = {
  bg:"#0d1117", sidebar:"#0a0e14", card:"#161b22", card2:"#1c2333", cardHover:"#21262d",
  border:"#30363d", borderLight:"#3d444d",
  text:"#e8edf5", textSub:"#8b949e", textMuted:"#484f58",
  blue:"#38bdf8", green:"#34d399", gold:"#fbbf24", red:"#f87171",
  purple:"#a78bfa", teal:"#2dd4bf", orange:"#fb923c",
  blueDim:"rgba(56,189,248,0.12)", greenDim:"rgba(52,211,153,0.12)",
  goldDim:"rgba(251,191,36,0.12)", redDim:"rgba(248,113,113,0.12)",
  purpleDim:"rgba(167,139,250,0.12)", tealDim:"rgba(45,212,191,0.12)",
  orangeDim:"rgba(251,146,60,0.12)",
  inputBg:"#0d1117", shadow:"0 4px 16px rgba(0,0,0,0.4)",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const uid       = () => Math.random().toString(36).slice(2,9);
const daysUntil = d  => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null;
const fmtDate   = d  => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
function formatSarCompact(value) {
  const num = Number(value || 0);
  if (!num) return "—";

  if (num >= 1_000_000_000) {
    return `SAR ${(num / 1_000_000_000).toFixed(2)}B`;
  }

  if (num >= 1_000_000) {
    return `SAR ${(num / 1_000_000).toFixed(2)}M`;
  }

  if (num >= 1_000) {
    return `SAR ${(num / 1_000).toFixed(0)}K`;
  }

  return `SAR ${num.toLocaleString()}`;
}

function getInvoiceRemainingAmount(doc) {
  const total = parseFloat(doc?.amount) || 0;
  const status = String(doc?.paymentStatus || doc?.status || "").toLowerCase();

  if (status === "paid" || status === "received") return 0;
  if (status === "partial") {
    const remaining = parseFloat(doc?.remainingAmount);
    if (Number.isFinite(remaining)) {
      return Math.max(0, Math.min(total, remaining));
    }
    return total;
  }
  return total;
}

function getInvoiceCollectedAmount(doc) {
  const total = parseFloat(doc?.amount) || 0;
  return Math.max(0, total - getInvoiceRemainingAmount(doc));
}

function getInvoiceStream(doc) {
  const explicit = String(doc?.invoiceType || "").trim().toLowerCase();
  if (explicit === "advance") return "advance";
  if (explicit === "income") return "income";

  const raw = [doc?.type, doc?.category, doc?.kind, doc?.notes, doc?.name, doc?.refNo]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return /advance|mobilization|mobilisation/.test(raw) ? 'advance' : 'income';
}


function getMetricTypeTheme(type) {
  const isAdvance = String(type || "").toLowerCase() === "advance";
  const accent = isAdvance ? T.gold : T.blue;
  const dim = isAdvance ? T.goldDim : T.blueDim;
  const glow = isAdvance ? 'rgba(251,191,36,0.22)' : 'rgba(56,189,248,0.22)';
  return { accent, dim, glow };
}
/* ─── Active theme (module-level, updated by App) ───────────────────────── */
let T = LIGHT; // default to light, App.setTheme() updates this
function setTheme(dark) { T = dark ? DARK : LIGHT; }

function useViewport() {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    onResize();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return viewport;
}

/* ─── Export utilities ───────────────────────────────────────────────────── */
function exportToExcel(rows, filename) {
  if(!rows||!rows.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, filename + ".xlsx");
}

function ExportBtn({data, filename, label}) {
  return (
    <button onClick={()=>exportToExcel(data, filename)}
      style={{background:"rgba(52,211,153,0.12)",border:"1px solid rgba(52,211,153,0.3)",color:"#34d399",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6,cursor:"pointer",transition:"all .15s"}}
      onMouseEnter={e=>{e.currentTarget.style.background="rgba(52,211,153,0.22)";}}
      onMouseLeave={e=>{e.currentTarget.style.background="rgba(52,211,153,0.12)";}}>
      ⬇ {label||"Export Excel"}
    </button>
  );
}

function getStatus(days) {
  if (days === null) return { label:"Unknown",       color:T.textMuted, bg:"rgba(61,80,104,.15)" };
  if (days < 0)      return { label:"Expired",       color:T.red,       bg:T.redDim };
  if (days <= 90)    return { label:"Expiring Soon", color:T.gold,      bg:T.goldDim };
  return               { label:"Valid",            color:T.green,     bg:T.greenDim };
}

/* ─── Default data ───────────────────────────────────────────────────────── */
const DEFAULT_SCORPION_CATS = [
  "Company Registration / CR",
  "Insurance Policies",
  "Trade Licenses",
  "Contracts & Agreements",
  "IBAN",
  "Other",
];

const DEFAULT_MANPOWER_CATS = [
  "Drillers / Operators",
  "Safety Officers (HSE)",
  "Supervisors",
  "Laborers / General Workers",
];


/* ─── Excel column maps ──────────────────────────────────────────────────── */
// Manpower certifications Excel map
// Expected columns: NAME, EMPLOYEE ID, CERTIFICATE, CERT NO, ISSUE DATE, EXPIRY DATE
// (flexible - tries multiple common header names)
const MP_CERT_MAP = {
  // Exact headers from TUV_Manpower_Tracker.xlsx (headers on row 4)
  "NAME":"name","EMPLOYEE NAME":"name","EMPLOYEE":"name",
  "ID":"idNo","EMPLOYEE ID":"idNo","EMPLOYEE NO":"idNo","EMP ID":"idNo","EMP NO":"idNo","ID NO":"idNo","ID NUMBER":"idNo","STAFF ID":"idNo",
  "CERTIFICATE":"certName","CERTIFICATE TYPE":"certName","CERT TYPE":"certName","CERTIFICATION":"certName",
  "ISSUED BY":"issuedBy","ISSUING BODY":"issuedBy","ISSUING AUTHORITY":"issuedBy",
  "CERT NO":"certNo","CERTIFICATE NO":"certNo","CERT NO.":"certNo","CERTIFICATE NO.":"certNo","CERTIFICATE NUMBER":"certNo",
  "ISSUE DATE":"issueDate","ISSUED DATE":"issueDate","DATE ISSUED":"issueDate","START DATE":"issueDate",
  "EXPIRY DATE":"expiryDate","EXPIRY":"expiryDate","EXPIRE DATE":"expiryDate","EXPIRATION DATE":"expiryDate",
  "REMARKS":"remarks","NOTES":"remarks",
};
// Manpower file has headers on row 4 — handled by skipToHeaderRow below
const MP_HEADER_ROW = 1;

// Equipment certifications Excel map
// Expected columns: EQUIPMENT, SERIAL NO, CERT NO, ISSUED BY, INSPECTION DATE, EXPIRY DATE
const EQ_CERT_MAP = {
  // TUV MASTERSHEET headers: Item Type, EQUIPMENT, Serial No, Issued By, Inspection Date, Expiry Date
  // Sheet3 headers:          Item Type, Item Name/ID, Reg/Serial No, TUV Provider, Start Date, Expiry Date
  "ITEM TYPE":"itemType",
  "EQUIPMENT ":"eqName","EQUIPMENT":"eqName","ITEM NAME/ID":"eqName","EQUIPMENT NAME":"eqName","UNIT":"eqName",
  "SERIAL NO":"serialNo","SERIAL NO.":"serialNo","REG/SERIAL NO":"serialNo","SERIAL NUMBER":"serialNo","S/N":"serialNo",
  "ISSUED BY":"issuedBy","TUV PROVIDER":"issuedBy","PROVIDER":"issuedBy","ISSUING AUTHORITY":"issuedBy",
  "INSPECTION DATE":"issueDate","START DATE":"issueDate","ISSUE DATE":"issueDate","ISSUED DATE":"issueDate",
  "EXPIRY DATE":"expiryDate","EXPIRY":"expiryDate","EXPIRE DATE":"expiryDate","EXPIRATION DATE":"expiryDate",
  "CERT NO":"certNo","CERTIFICATE NO":"certNo","CERT NO.":"certNo","CERTIFICATE NUMBER":"certNo",
  "REMARKS":"remarks","NOTES":"remarks",
};
const EQ_HEADER_ROW = 1;

function excelDateToStr(val) {
  if (!val) return "";
  // JS Date object (from cellDates:true)
  if (val instanceof Date) { if(!isNaN(val)) return val.toISOString().slice(0,10); }
  if (typeof val==="number") { const d=new Date(Math.round((val-25569)*86400*1000)); return d.toISOString().slice(0,10); }
  if (typeof val==="string") {
    if(val.startsWith("=")) return ""; // skip formulas
    const d=new Date(val); if(!isNaN(d)) return d.toISOString().slice(0,10);
  }
  return "";
}

function parseExcelRows(rows, map) {
  const DATE_KEYS=["expiryDate","issueDate","inspectionDate","startDate"];
  return rows
    .filter(row=>Object.values(row).some(v=>v!==null&&v!==""))
    .map(row=>{
      const rec={id:uid()};
      // Uppercase all keys for case-insensitive matching
      const upper={};
      Object.entries(row).forEach(([k,v])=>{ upper[String(k).toUpperCase().trim()]=v; });
      Object.entries(map).forEach(([col,key])=>{
        // Strip map key too (handles "EQUIPMENT " trailing space etc.)
        const val=upper[col.toUpperCase().trim()];
        if(val===undefined||val===null||val==="") return;
        const strVal=String(val);
        // Skip Excel formula cells
        if(strVal.startsWith("=")) return;
        rec[key]=DATE_KEYS.includes(key)?excelDateToStr(val):strVal.trim();
      });
      return rec;
    })
    // Filter out rows where only id was set (no real data mapped)
    .filter(rec=>Object.keys(rec).filter(k=>k!=="id").length>0);
}

// Parse Excel with a specific header row (1-based)
function parseExcelWithHeaderRow(arrayBuffer, map, headerRow) {
  const wb = XLSX.read(arrayBuffer, {type:"array", cellDates:true});
  const ws = wb.Sheets[wb.SheetNames[0]];
  // range: headerRow-1 makes XLSX use that row as the header
  const rawRows = XLSX.utils.sheet_to_json(ws, {defval:"", range: headerRow - 1});
  // Normalize: uppercase all keys so map lookup always works
  const rows = rawRows.map(row => {
    const norm = {};
    Object.entries(row).forEach(([k,v]) => { norm[k.toUpperCase().trim()] = v; });
    return norm;
  });
  return parseExcelRows(rows, map);
}

/* ─── Auth ────────────────────────────────────────────────────────────────── */
const COMPANY_PASSWORD  = "scorpion2025"; // Change this to your desired password
const AUTH_KEY          = "cta_auth";
const FINANCE_PASSWORD  = "finance2025"; // Change this to your desired finance password

/* ─── Supabase config — paste your values here after setup ──────────────── */
const SUPABASE_URL    = "https://rgjyvbcqstkteprfrgnu.supabase.co";
const SUPABASE_ANON   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnanl2YmNxc3RrdGVwcmZyZ251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NzI5MDEsImV4cCI6MjA5MTA0ODkwMX0.kzVvgeuCx001S-POe-pQANmz84ddUGuNzKEt8gpv1R8";
const STORAGE_BUCKET  = "portal-files";
async function fetchAppData() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/app_state?id=eq.main&select=data`, {
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
    },
  });

  if (!res.ok) throw new Error("Failed to load app data");

  const rows = await res.json();
  if (!rows.length || !rows[0].data) return EMPTY_DATA;

  return { ...EMPTY_DATA, ...rows[0].data };
}
async function uploadToSupabase(file, folder) {
  const ext   = file.name.split(".").pop();
  const path  = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
  const res   = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${path}`, {
    method:"POST",
    headers:{"Authorization":`Bearer ${SUPABASE_ANON}`,"Content-Type":file.type,"x-upsert":"true"},
    body: file,
  });
  if (!res.ok) { const e=await res.json(); throw new Error(e.message||"Upload failed"); }
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}
async function saveAppData(data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/app_state?id=eq.main`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      data,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) throw new Error("Failed to save app data");
}
function isSupabaseConfigured() {
  return SUPABASE_URL !== "YOUR_SUPABASE_URL" && SUPABASE_ANON !== "YOUR_SUPABASE_ANON_KEY";
}

function getPreviewUrl(url) {
  if (!url) return null;
  // OneDrive: convert share link to embed
  if (url.includes("1drv.ms") || url.includes("onedrive.live.com")) {
    const encoded = encodeURIComponent(url);
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encoded}`;
  }
  // SharePoint
  if (url.includes("sharepoint.com")) {
    return url.includes("?") ? url + "&action=embedview" : url + "?action=embedview";
  }
  // Google Drive: convert to embed
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  // Supabase public URL (PDF/image — direct embed)
  if (url.includes("supabase.co/storage")) return url;
  return url;
}

function isAuthenticated() {
  try { return localStorage.getItem(AUTH_KEY) === "true"; } catch { return false; }
}

const EMPTY_DATA = {
  scorpionDocs: [],   // { id, category, name, docNo, issueDate, expiryDate, fileLink, notes }
  manpowerCats: DEFAULT_MANPOWER_CATS,
  manpower: [],       // { id, category, name, idNo, nationality, designation,
                      //   passportNo, passportExpiry, visaNo, visaExpiry,
                      //   iqamaNo, iqamaExpiry, muqeemNo, muqeemExpiry,
                      //   certs: [{id,name,certNo,issueDate,expiryDate,fileLink}],
                      //   docs:  [{id,type,docNo,expiryDate,fileLink}]  }
  equipment: [],      // { id, name, model, serialNo, status, operator, project,
                      //   purchaseDate, notes,
                      //   certifications:[{id,certNo,issuedBy,issueDate,expiryDate,fileLink}],
                      //   invoices:      [{id,invoiceNo,supplier,amount,date,fileLink}],
                      //   insurance:     [{id,policyNo,insurer,type,issueDate,expiryDate,fileLink}],
                      //   permits:       [{id,permitNo,type,issuedBy,issueDate,expiryDate,fileLink}] }
  scorpionDocCats: DEFAULT_SCORPION_CATS,
  projects: ["NEOM Phase 1","NEOM Phase 2","Riyadh Metro"],
  projectDocs: [],  // { id, project, subTab, name, refNo, date, expiryDate, amount, fileLink, notes }
  projectAnalysis: [], // { id, project, poValue, poNumber, quotationRef, clientName,
                       //   startDate, estEndDate, status, description,
                       //   dailyReports: [{id,date,weather,activities,manpower,equipment,issues,notes}] }
};


/* ════════════════════════════════════════════════════════════════════════════
   ROOT APP
════════════════════════════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════════════════════════
   LOGIN PAGE
════════════════════════════════════════════════════════════════════════════ */
function LoginPage({onLogin}) {
  const [pw,    setPw]    = useState("");
  const [error, setError] = useState("");
  const [show,  setShow]  = useState(false);
  const [shake, setShake] = useState(false);

  const attempt = () => {
    if(!onLogin(pw)) {
      setError("Incorrect password. Please try again.");
      setShake(true);
      setPw("");
      setTimeout(()=>setShake(false), 600);
    }
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:9998,background:"linear-gradient(135deg,#080b10 0%,#0e1520 60%,#080b10 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>

      {/* Background rings */}
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        {[500,700,900].map((s,i)=>(
          <div key={i} style={{position:"absolute",top:"50%",left:"50%",width:s,height:s,transform:"translate(-50%,-50%)",border:`1px solid rgba(251,191,36,${0.04-i*0.01})`,borderRadius:"50%",animation:`spinSlow ${16+i*6}s linear infinite ${i%2?"reverse":""}`}}/>
        ))}
      </div>

      <div className="slide-up" style={{
        background:"rgba(14,17,23,0.95)",
        border:"1px solid rgba(251,191,36,0.2)",
        borderRadius:20,
        padding:"40px 36px",
        width:"100%",
        maxWidth:420,
        backdropFilter:"blur(12px)",
        boxShadow:"0 24px 64px rgba(0,0,0,0.6)",
        animation: shake ? "none" : undefined,
        transform: shake ? "translateX(0)" : undefined,
      }}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:72,height:72,borderRadius:"50%",overflow:"hidden",margin:"0 auto 16px",border:"2px solid rgba(251,191,36,0.5)",boxShadow:"0 0 24px rgba(251,191,36,0.2)"}}>
            <img src="logo.png" alt="Scorpion Arabia" style={{width:"100%",height:"100%",objectFit:"cover",mixBlendMode:"lighten"}}/>
          </div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,letterSpacing:"2px",background:"linear-gradient(90deg,#92400e,#fbbf24,#fef3c7,#fbbf24,#f59e0b,#92400e)",backgroundSize:"300% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",filter:"drop-shadow(0 0 10px rgba(251,191,36,0.6))"}}>SCORPION ARABIA</div>
          <div style={{fontSize:12,color:"#38bdf8",letterSpacing:"3px",marginTop:4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600}}>PORTAL ACCESS</div>
        </div>

        {/* Password field */}
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",marginBottom:8,letterSpacing:"1.5px"}}>COMPANY PASSWORD</label>
          <div style={{position:"relative"}}>
            <input
              type={show?"text":"password"}
              value={pw}
              onChange={e=>{setPw(e.target.value);setError("");}}
              onKeyDown={e=>e.key==="Enter"&&attempt()}
              placeholder="Enter password…"
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${error?"rgba(248,113,113,0.6)":"rgba(255,255,255,0.12)"}`,borderRadius:10,padding:"12px 44px 12px 14px",fontSize:14,color:"#ffffff",outline:"none",colorScheme:"dark",transition:"border-color .2s"}}
              onFocus={e=>e.target.style.borderColor="rgba(251,191,36,0.5)"}
              onBlur={e=>e.target.style.borderColor=error?"rgba(248,113,113,0.6)":"rgba(255,255,255,0.12)"}
            />
            <button onClick={()=>setShow(s=>!s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:16,cursor:"pointer",padding:2}}>
              {show?"🙈":"👁"}
            </button>
          </div>
          {error && <div style={{fontSize:12,color:"#f87171",marginTop:6,display:"flex",alignItems:"center",gap:5}}>⚠ {error}</div>}
        </div>

        {/* Login button */}
        <button onClick={attempt} style={{
          width:"100%",
          background:"linear-gradient(135deg,#fbbf24,#f59e0b)",
          border:"none",borderRadius:10,
          padding:"13px",
          fontFamily:"'Barlow Condensed',sans-serif",
          fontWeight:800,fontSize:16,
          color:"#080b10",
          letterSpacing:"1.5px",
          cursor:"pointer",
          boxShadow:"0 4px 20px rgba(251,191,36,0.35)",
          transition:"transform .15s,box-shadow .15s",
          marginBottom:16,
        }}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 28px rgba(251,191,36,0.5)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 20px rgba(251,191,36,0.35)";}}
        >
          ENTER PORTAL
        </button>

        <div style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.2)",letterSpacing:"1px"}}>
          Contact your administrator if you forgot the password
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   WELCOME SCREEN
════════════════════════════════════════════════════════════════════════════ */
function WelcomeScreen({onEnter}) {
  const [leaving, setLeaving] = useState(false);

  const handleEnter = () => {
    setLeaving(true);
    setTimeout(onEnter, 600);
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"linear-gradient(135deg,#080b10 0%,#0e1520 50%,#080b10 100%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      opacity: leaving ? 0 : 1,
      transition: leaving ? "opacity 0.6s ease" : "none",
    }}>

      {/* Animated background rings */}
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        {[300,450,600,750].map((s,i)=>(
          <div key={i} style={{
            position:"absolute",top:"50%",left:"50%",
            width:s,height:s,
            transform:`translate(-50%,-50%)`,
            border:`1px solid rgba(251,191,36,${0.06-i*0.01})`,
            borderRadius:"50%",
            animation:`spinSlow ${12+i*4}s linear infinite ${i%2===0?"":"reverse"}`,
          }}/>
        ))}
      </div>

      {/* Logo container */}
      <div style={{position:"relative",marginBottom:40}}>

        {/* Outer glow ring */}
        <div className="glow-ring" style={{
          width:180, height:180, borderRadius:"50%",
          border:"2px solid rgba(251,191,36,0.4)",
          position:"absolute", top:-14, left:-14,
          zIndex:0,
        }}/>

        {/* Spinning accent ring */}
        <div className="spin-slow" style={{
          position:"absolute", top:-8, left:-8,
          width:168, height:168, borderRadius:"50%",
          border:"2px dashed rgba(56,189,248,0.3)",
          zIndex:0,
        }}/>

        {/* Logo */}
        <div className="pulse-logo" style={{
          width:152, height:152, borderRadius:"50%",
          overflow:"hidden", position:"relative", zIndex:1,
          boxShadow:"0 0 40px rgba(251,191,36,0.3), 0 0 80px rgba(251,191,36,0.1)",
          border:"3px solid rgba(251,191,36,0.6)",
        }}>
          <img src="logo.png" alt="Scorpion Arabia"
            style={{width:"100%",height:"100%",objectFit:"cover",mixBlendMode:"lighten"}}/>
        </div>
      </div>

      {/* Welcome text */}
      <div style={{textAlign:"center",marginBottom:48}}>
        <div style={{
          fontFamily:"'Barlow Condensed',sans-serif",
          fontWeight:800,
          fontSize:"clamp(18px,3vw,28px)",
          color:"#fbbf24",
          letterSpacing:"4px",
          animation:"textReveal 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s both",
          textTransform:"uppercase",
          marginBottom:12,
        }}>
          WELCOME TO
        </div>
        <div style={{
          fontFamily:"'Barlow Condensed',sans-serif",
          fontWeight:800,
          fontSize:"clamp(26px,5vw,48px)",
          letterSpacing:"5px",
          animation:"textReveal 1.4s cubic-bezier(0.16,1,0.3,1) 0.5s both, shimmer 4s linear infinite",
          textTransform:"uppercase",
          lineHeight:1.1,
          marginBottom:8,
          background:"linear-gradient(90deg,#92400e,#fbbf24,#fef3c7,#fbbf24,#f59e0b,#92400e)",
          backgroundSize:"300% auto",
          WebkitBackgroundClip:"text",
          WebkitTextFillColor:"transparent",
          backgroundClip:"text",
          filter:"drop-shadow(0 0 18px rgba(251,191,36,0.8))",
        }}>
          SCORPION ARABIA
        </div>
        <div style={{
          fontFamily:"'Barlow Condensed',sans-serif",
          fontWeight:600,
          fontSize:"clamp(14px,2.5vw,20px)",
          color:"#38bdf8",
          letterSpacing:"6px",
          animation:"textReveal 1.4s cubic-bezier(0.16,1,0.3,1) 0.7s both",
          textTransform:"uppercase",
        }}>
          PORTAL
        </div>
        <div style={{
          width:80, height:2,
          background:"linear-gradient(90deg,transparent,#fbbf24,transparent)",
          margin:"18px auto 0",
          animation:"subReveal 1s ease 1.2s both",
        }}/>
      </div>

      {/* Enter button */}
      <button onClick={handleEnter} style={{
        background:"linear-gradient(135deg,#fbbf24,#f59e0b)",
        border:"none", borderRadius:999,
        padding:"14px 48px",
        fontFamily:"'Barlow Condensed',sans-serif",
        fontWeight:800, fontSize:16,
        color:"#080b10",
        letterSpacing:"2px",
        textTransform:"uppercase",
        cursor:"pointer",
        boxShadow:"0 4px 24px rgba(251,191,36,0.4)",
        animation:"subReveal 1s ease 1.5s both",
        transition:"transform 0.2s, box-shadow 0.2s",
      }}
        onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.05)";e.currentTarget.style.boxShadow="0 6px 32px rgba(251,191,36,0.6)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 24px rgba(251,191,36,0.4)";}}
      >
        ENTER PORTAL
      </button>

      {/* Bottom tagline */}
      <div style={{
        position:"absolute", bottom:32,
        fontSize:11, color:"rgba(255,255,255,0.3)",
        letterSpacing:"2px", textTransform:"uppercase",
        fontFamily:"'Barlow Condensed',sans-serif",
        animation:"subReveal 1s ease 2s both",
      }}>
        Document & Asset Management System
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   PROJECT ANALYSIS PAGE
   ─ Progress = totalInvoiced / poValue  (live from projectDocs invoices)
   ─ Each "Job" = a group of invoices sharing the same jobNo under a project
   ─ Daily reports are stored per project analysis record
════════════════════════════════════════════════════════════════════════════ */

/* ── pure helpers ── */
function pctColor(p) {
  if (p >= 80) return T.green;
  if (p >= 40) return T.blue;
  if (p >= 20) return T.gold;
  return T.red;
}
function daysLeft(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
}

/* Derive live stats for one project from projectDocs invoices */
function deriveProjectStats(projectName, projectDocs) {
  const invs = (projectDocs || []).filter(d => d.subTab === "invoices" && d.project === projectName);
  const certs = (projectDocs || []).filter(d => d.subTab === "certificates" && d.project === projectName);

  const totalInvoiced  = invs.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);
  const totalCollected = invs.reduce((s, d) => s + getInvoiceCollectedAmount(d), 0);
  const totalDue       = invs.reduce((s, d) => s + getInvoiceRemainingAmount(d), 0);

  // Group invoices by jobNo — each unique jobNo = one Job/phase
  const jobMap = {};
  invs.forEach(d => {
    const key = d.jobNo || "__no_job__";
    if (!jobMap[key]) jobMap[key] = { jobNo: d.jobNo || "", invoices: [], certs: [] };
    jobMap[key].invoices.push(d);
  });
  certs.forEach(d => {
    const key = d.jobNo || "__no_job__";
    if (!jobMap[key]) jobMap[key] = { jobNo: d.jobNo || "", invoices: [], certs: [] };
    jobMap[key].certs.push(d);
  });

  const jobs = Object.values(jobMap).map(j => ({
    ...j,
    totalInvoiced:  j.invoices.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0),
    totalCollected: j.invoices.reduce((s, d) => s + getInvoiceCollectedAmount(d), 0),
    totalDue:       j.invoices.reduce((s, d) => s + getInvoiceRemainingAmount(d), 0),
  })).sort((a, b) => (a.jobNo || "zzz").localeCompare(b.jobNo || "zzz"));

  return { invs, certs, totalInvoiced, totalCollected, totalDue, jobs };
}

/* ── Daily Report Modal ── */
/* ── Bulk Daily Report Import (multiple rows from one Excel) ── */
function BulkDailyReportImport({ projectName, onImport }) {
  const [status, setStatus] = useState(null); // null | "parsing" | {count,skipped}  | "error"
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setStatus("parsing");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseDailyReportExcel(e.target.result);
        if (!rows.length) { setStatus("error"); return; }
        onImport(rows);
        setStatus({ count: rows.length });
        setTimeout(() => setStatus(null), 3000);
      } catch(err) {
        console.error(err);
        setStatus("error");
        setTimeout(() => setStatus(null), 3000);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <button onClick={()=>fileRef.current.click()} disabled={status==="parsing"}
        style={{background:T.goldDim,border:`1px solid ${T.gold}44`,color:T.gold,borderRadius:9,padding:"8px 16px",fontSize:13,fontWeight:700,cursor:status==="parsing"?"wait":"pointer",display:"flex",alignItems:"center",gap:6}}>
        {status==="parsing"?"⏳ Importing…":"📊 Bulk Import Excel"}
      </button>
      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}}
        onChange={e=>{if(e.target.files[0]){handleFile(e.target.files[0]);e.target.value="";}}}/>
      {status&&status!=="parsing"&&status!=="error"&&(
        <span style={{fontSize:12,color:T.green,fontWeight:700}}>✓ {status.count} row{status.count!==1?"s":""} imported</span>
      )}
      {status==="error"&&<span style={{fontSize:12,color:T.red,fontWeight:700}}>✕ Parse failed</span>}
    </div>
  );
}

/* ── Excel column map for daily report import ───────────────────────────── */
const DR_COL_MAP = {
  "DATE":"date","REPORT DATE":"date","DAY":"date",
  "WEATHER":"weather","WEATHER CONDITIONS":"weather","CONDITIONS":"weather",
  "ACTIVITIES":"activities","WORK DONE":"activities","WORK":"activities","ACTIVITY":"activities","DESCRIPTION":"activities","WORK DESCRIPTION":"activities",
  "MANPOWER":"manpower","MANPOWER COUNT":"manpower","WORKERS":"manpower","NO. OF WORKERS":"manpower","HEADCOUNT":"manpower","NO OF WORKERS":"manpower",
  "EQUIPMENT":"equipment","EQUIPMENT USED":"equipment","PLANT":"equipment","PLANT & EQUIPMENT":"equipment","MACHINERY":"equipment",
  "ISSUES":"issues","DELAYS":"issues","ISSUES / DELAYS":"issues","PROBLEMS":"issues","REMARKS":"issues",
  "NOTES":"notes","ADDITIONAL NOTES":"notes","COMMENTS":"notes","SUPERVISOR NOTES":"notes",
};

function parseDailyReportExcel(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type:"array", cellDates:true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(ws, { defval:"" });
  return rawRows
    .filter(row => Object.values(row).some(v => v !== null && v !== ""))
    .map(row => {
      const rec = { id: uid() };
      const upper = {};
      Object.entries(row).forEach(([k,v]) => { upper[String(k).toUpperCase().trim()] = v; });
      Object.entries(DR_COL_MAP).forEach(([col, key]) => {
        const val = upper[col];
        if (val === undefined || val === null || val === "") return;
        if (key === "date") {
          rec[key] = excelDateToStr(val) || String(val);
        } else {
          rec[key] = String(val).trim();
        }
      });
      return rec;
    })
    .filter(rec => Object.keys(rec).filter(k => k !== "id").length > 0);
}

function DailyReportModal({ report, projectName, onSave, onClose }) {
  const blank = { id: uid(), date: new Date().toISOString().slice(0,10), weather:"", activities:"", manpower:"", equipment:"", issues:"", notes:"", fileLink:"", fileName:"" };
  const [f, setF]         = useState(report ? { ...blank, ...report } : blank);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [parsing,   setParsing]   = useState(false);
  const [parseMsg,  setParseMsg]  = useState("");
  const fileRef = useRef();
  const excelRef = useRef();
  const upd = (k, v) => setF(p => ({ ...p, [k]: v }));
  const IS = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:T.text, outline:"none" };
  const LS = { display:"block", fontSize:11, fontWeight:700, color:T.textMuted, marginBottom:5, letterSpacing:.5 };

  /* Upload daily report file (PDF/image/doc) to Supabase */
  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true); setUploadErr("");
    try {
      const folder = `daily-reports/${(projectName||"general").replace(/[^a-zA-Z0-9]/g,"_")}`;
      const url = await uploadToSupabase(file, folder);
      upd("fileLink", url);
      upd("fileName", file.name);
    } catch(err) {
      setUploadErr("Upload failed: " + (err.message || "check Supabase config"));
    } finally {
      setUploading(false);
    }
  };

  /* Import from Excel — auto-fill fields from the sheet's first data row */
  const handleExcelImport = (file) => {
    if (!file) return;
    setParsing(true); setParseMsg("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseDailyReportExcel(e.target.result);
        if (!rows.length) { setParseMsg("⚠ No data rows found — check column headers."); setParsing(false); return; }
        // If single row: auto-fill form. If multi-row: show count and use first.
        const first = rows[0];
        setF(prev => ({ ...prev, ...first, id: prev.id }));
        setParseMsg(rows.length === 1
          ? "✓ Fields filled from Excel. Review and save."
          : `✓ ${rows.length} rows found — filled from first row. Use bulk import for all rows.`
        );
      } catch(err) {
        setParseMsg("✕ Could not parse Excel: " + err.message);
      }
      setParsing(false);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,width:"100%",maxWidth:600,maxHeight:"93vh",overflowY:"auto",boxShadow:T.shadow,animation:"modalFloatIn .3s ease both"}}>

        {/* Header */}
        <div style={{padding:"20px 24px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:T.card,zIndex:1,borderRadius:"18px 18px 0 0"}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.text}}>{report?"✎ Edit Daily Report":"+ New Daily Report"}</div>
            {projectName&&<div style={{fontSize:12,color:T.textMuted,marginTop:2}}>{projectName}</div>}
          </div>
          <button onClick={onClose} style={{background:T.redDim,border:`1px solid ${T.red}33`,color:T.red,borderRadius:8,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>✕</button>
        </div>

        <div style={{padding:"18px 24px",display:"flex",flexDirection:"column",gap:16}}>

          {/* ── Excel import strip ── */}
          <div style={{background:`${T.gold}0f`,border:`1px solid ${T.gold}33`,borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontSize:12,fontWeight:700,color:T.gold,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
              <span>⬆</span> IMPORT FROM EXCEL SHEET
            </div>
            <div style={{fontSize:12,color:T.textMuted,marginBottom:10,lineHeight:1.5}}>
              Upload the supervisor's Excel daily report sheet to auto-fill the fields below.
              Expected columns: <span style={{color:T.text,fontWeight:600}}>Date, Weather, Activities, Manpower, Equipment, Issues, Notes</span>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <button onClick={()=>excelRef.current.click()} disabled={parsing}
                style={{background:T.goldDim,border:`1px solid ${T.gold}44`,color:T.gold,borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:700,cursor:parsing?"wait":"pointer",display:"flex",alignItems:"center",gap:6}}>
                {parsing?"⏳ Parsing…":"📊 Choose Excel File"}
              </button>
              <input ref={excelRef} type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}}
                onChange={e=>{if(e.target.files[0]){handleExcelImport(e.target.files[0]);e.target.value="";}}}/>
              {parseMsg&&<div style={{fontSize:12,color:parseMsg.startsWith("✓")?T.green:T.red,fontWeight:600,flex:1}}>{parseMsg}</div>}
            </div>
          </div>

          {/* ── Manual fields ── */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label style={LS}>DATE</label><input type="date" value={f.date} onChange={e=>upd("date",e.target.value)} style={IS} onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/></div>
            <div><label style={LS}>WEATHER</label><input value={f.weather} onChange={e=>upd("weather",e.target.value)} placeholder="e.g. Sunny, 38°C" style={IS} onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/></div>
          </div>
          <div><label style={LS}>ACTIVITIES / WORK DONE</label><textarea value={f.activities} onChange={e=>upd("activities",e.target.value)} rows={3} placeholder="Describe the work carried out today…" style={{...IS,resize:"vertical"}} onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label style={LS}>MANPOWER COUNT</label><input type="number" min="0" value={f.manpower} onChange={e=>upd("manpower",e.target.value)} placeholder="e.g. 12" style={IS} onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/></div>
            <div><label style={LS}>EQUIPMENT USED</label><input value={f.equipment} onChange={e=>upd("equipment",e.target.value)} placeholder="e.g. Excavator, 2× Trucks" style={IS} onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/></div>
          </div>
          <div><label style={LS}>ISSUES / DELAYS</label><textarea value={f.issues} onChange={e=>upd("issues",e.target.value)} rows={2} placeholder="Problems, delays, safety incidents…" style={{...IS,resize:"vertical"}} onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/></div>
          <div><label style={LS}>ADDITIONAL NOTES</label><textarea value={f.notes} onChange={e=>upd("notes",e.target.value)} rows={2} placeholder="Inspector remarks, client feedback, etc." style={{...IS,resize:"vertical"}} onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/></div>

          {/* ── File attachment (PDF / Excel / image) ── */}
          <div>
            <label style={LS}>ATTACH DAILY REPORT FILE (PDF / EXCEL / IMAGE)</label>
            <div style={{border:`2px dashed ${T.border}`,borderRadius:10,padding:"16px",textAlign:"center",background:T.card2}}>
              {f.fileLink ? (
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:22}}>{/\.pdf$/i.test(f.fileName||f.fileLink)?"📄":/\.(xlsx?|csv)$/i.test(f.fileName||f.fileLink)?"📊":/\.(png|jpe?g|webp)$/i.test(f.fileName||f.fileLink)?"🖼️":"📎"}</span>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontSize:13,fontWeight:700,color:T.text,wordBreak:"break-all"}}>{f.fileName||"Uploaded file"}</div>
                      <a href={f.fileLink} target="_blank" rel="noreferrer" style={{fontSize:11,color:T.blue,fontWeight:600,textDecoration:"none"}}>↗ View / Download</a>
                    </div>
                  </div>
                  <button onClick={()=>{upd("fileLink","");upd("fileName","");}}
                    style={{background:T.redDim,border:`1px solid ${T.red}33`,color:T.red,borderRadius:7,padding:"5px 12px",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <>
                  <div style={{fontSize:28,marginBottom:8}}>📎</div>
                  <div style={{fontSize:13,color:T.textMuted,marginBottom:10}}>
                    {uploading ? "Uploading…" : "Drop the supervisor's daily report sheet here"}
                  </div>
                  <button onClick={()=>fileRef.current.click()} disabled={uploading}
                    style={{background:T.blueDim,border:`1px solid ${T.blue}44`,color:T.blue,borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:700,cursor:uploading?"wait":"pointer"}}>
                    {uploading?"⏳ Uploading…":"⬆ Choose File"}
                  </button>
                  <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp,.doc,.docx" style={{display:"none"}}
                    onChange={e=>{if(e.target.files[0]){handleFileUpload(e.target.files[0]);e.target.value="";}}}/>
                  {uploadErr&&<div style={{marginTop:8,fontSize:12,color:T.red,fontWeight:600}}>{uploadErr}</div>}
                </>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{padding:"12px 24px 20px",borderTop:`1px solid ${T.border}`,display:"flex",gap:10,justifyContent:"flex-end",position:"sticky",bottom:0,background:T.card,borderRadius:"0 0 18px 18px"}}>
          <button onClick={onClose} style={{background:T.bg,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>
          <button onClick={()=>{ if(uploading){return;} onSave(f); }} disabled={uploading}
            style={{background:`linear-gradient(135deg,${T.blue},#2563eb)`,border:"none",color:"#fff",borderRadius:10,padding:"10px 24px",fontSize:13,fontWeight:800,cursor:uploading?"not-allowed":"pointer",opacity:uploading?0.7:1}}>
            {uploading?"Uploading…":"Save Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Project Analysis Form Modal (PO details, dates, etc.) ── */
function ProjectAnalysisModal({ proj, projectNames, onSave, onClose }) {
  const blank = { id: uid(), project:"", poValue:"", poNumber:"", quotationRef:"", clientName:"", startDate:"", estEndDate:"", status:"In Progress", description:"", dailyReports:[] };
  const [f, setF] = useState(proj ? { dailyReports:[], ...proj } : blank);
  const upd = (k,v) => setF(p=>({...p,[k]:v}));
  const IS = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:T.text, outline:"none" };
  const LS = { display:"block", fontSize:11, fontWeight:700, color:T.textMuted, marginBottom:5, letterSpacing:.5 };
  return (
    <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,width:"100%",maxWidth:600,maxHeight:"92vh",overflowY:"auto",boxShadow:T.shadow,animation:"modalFloatIn .3s ease both"}}>
        <div style={{padding:"20px 24px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:T.card,zIndex:1,borderRadius:"18px 18px 0 0"}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.text}}>{proj?"✎ Edit Project":"+ New Project Analysis"}</div>
          <button onClick={onClose} style={{background:T.redDim,border:`1px solid ${T.red}33`,color:T.red,borderRadius:8,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:"18px 24px",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:`${T.blue}10`,border:`1px solid ${T.blue}30`,borderRadius:10,padding:"10px 14px",fontSize:12,color:T.blue}}>
            ℹ Progress is calculated automatically from invoices in Project Docs. Just enter the contract PO value here.
          </div>
          <div>
            <label style={LS}>PROJECT *</label>
            <select value={f.project} onChange={e=>upd("project",e.target.value)} style={{...IS,colorScheme:"light"}} onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}>
              <option value="">— Select project —</option>
              {projectNames.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label style={LS}>PO NUMBER</label><input value={f.poNumber} onChange={e=>upd("poNumber",e.target.value)} placeholder="e.g. PO-2025-001" style={IS} onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/></div>
            <div><label style={LS}>PO VALUE (SAR) — Total Contract</label><input type="number" value={f.poValue} onChange={e=>upd("poValue",e.target.value)} placeholder="e.g. 2700000" style={IS} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label style={LS}>QUOTATION REF</label><input value={f.quotationRef} onChange={e=>upd("quotationRef",e.target.value)} placeholder="e.g. QT-2024-089" style={IS} onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/></div>
            <div><label style={LS}>CLIENT NAME</label><input value={f.clientName} onChange={e=>upd("clientName",e.target.value)} placeholder="e.g. NEOM Company" style={IS} onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label style={LS}>START DATE</label><input type="date" value={f.startDate} onChange={e=>upd("startDate",e.target.value)} style={IS} onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/></div>
            <div><label style={LS}>ESTIMATED END DATE</label><input type="date" value={f.estEndDate} onChange={e=>upd("estEndDate",e.target.value)} style={IS} onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/></div>
          </div>
          <div>
            <label style={LS}>STATUS</label>
            <select value={f.status} onChange={e=>upd("status",e.target.value)} style={{...IS,colorScheme:"light"}} onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}>
              {["Not Started","In Progress","On Hold","Completed","Cancelled"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label style={LS}>DESCRIPTION / SCOPE OF WORK</label><textarea value={f.description} onChange={e=>upd("description",e.target.value)} rows={3} placeholder="Brief scope of work…" style={{...IS,resize:"vertical"}} onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/></div>
        </div>
        <div style={{padding:"12px 24px 20px",borderTop:`1px solid ${T.border}`,display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{background:T.bg,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>
          <button onClick={()=>{if(!f.project)return; onSave(f);}} style={{background:`linear-gradient(135deg,${T.gold},#d97706)`,border:"none",color:"#000",borderRadius:10,padding:"10px 24px",fontSize:13,fontWeight:800,cursor:"pointer"}}>Save Project</button>
        </div>
      </div>
    </div>
  );
}

/* ── Project Detail view ── */
function ProjectAnalysisDetail({ proj, projectDocs, projectNames, onUpdate, onDelete, onBack, go }) {
  const [editProj, setEditProj]     = useState(false);
  const [drModal,  setDrModal]      = useState(null);
  const [expandDr, setExpandDr]     = useState(null);
  const [expandJob, setExpandJob]   = useState(null);

  const { invs, totalInvoiced, totalCollected, totalDue, jobs } = deriveProjectStats(proj.project, projectDocs);
  const poValue = parseFloat(proj.poValue) || 0;
  const pct = poValue > 0 ? Math.min(100, Math.round((totalInvoiced / poValue) * 100)) : 0;
  const dl = daysLeft(proj.estEndDate);
  const duration = proj.startDate && proj.estEndDate
    ? Math.ceil((new Date(proj.estEndDate) - new Date(proj.startDate)) / 86400000)
    : null;
  const stColor = { "Not Started":T.textMuted,"In Progress":T.blue,"On Hold":T.gold,"Completed":T.green,"Cancelled":T.red }[proj.status]||T.textMuted;
  const reports = (proj.dailyReports||[]).slice().sort((a,b)=>b.date.localeCompare(a.date));

  const saveReport = r => {
    const existing = (proj.dailyReports||[]).find(x=>x.id===r.id);
    const updated  = existing ? (proj.dailyReports||[]).map(x=>x.id===r.id?r:x) : [...(proj.dailyReports||[]),r];
    onUpdate({...proj,dailyReports:updated});
    setDrModal(null);
  };
  const delReport = id => onUpdate({...proj,dailyReports:(proj.dailyReports||[]).filter(r=>r.id!==id)});

  return (
    <div style={{maxWidth:"min(1200px,98vw)",margin:"0 auto"}}>
      {/* Back + title bar */}
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={onBack} style={{background:T.card,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:9,padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer"}}>← Back</button>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{proj.project}</div>
          <div style={{fontSize:12,color:T.textMuted,marginTop:2,display:"flex",gap:12,flexWrap:"wrap"}}>
            {proj.clientName&&<span>Client: {proj.clientName}</span>}
            {proj.poNumber&&<span>PO: {proj.poNumber}</span>}
            {proj.quotationRef&&<span>QT: {proj.quotationRef}</span>}
          </div>
        </div>
        <button onClick={()=>setEditProj(true)} style={{background:T.blueDim,border:`1px solid ${T.blue}33`,color:T.blue,borderRadius:9,padding:"8px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>✎ Edit</button>
        <button onClick={()=>{if(window.confirm("Delete this project analysis?")) onDelete();}} style={{background:T.redDim,border:`1px solid ${T.red}33`,color:T.red,borderRadius:9,padding:"8px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>✕ Delete</button>
      </div>

      {/* Progress hero */}
      <div className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:"24px 28px",marginBottom:16,boxShadow:T.shadow}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:20,alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
          <div style={{flex:1,minWidth:220}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{background:`${stColor}18`,border:`1px solid ${stColor}44`,color:stColor,borderRadius:20,padding:"4px 14px",fontSize:12,fontWeight:700}}>{proj.status||"—"}</span>
            </div>
            {proj.description&&<div style={{fontSize:13,color:T.textSub,lineHeight:1.6,maxWidth:520}}>{proj.description}</div>}
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:56,fontWeight:800,color:pctColor(pct),lineHeight:1}}>{pct}%</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:2,fontWeight:700}}>INVOICED / CONTRACT</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{height:14,background:T.border,borderRadius:999,overflow:"hidden",marginBottom:10}}>
          <div style={{height:"100%",width:`${pct}%`,borderRadius:999,background:`linear-gradient(90deg,${pctColor(pct)},${pctColor(pct)}bb)`,transition:"width 1.2s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.textMuted,flexWrap:"wrap",gap:8}}>
          <span>{formatSarCompact(totalInvoiced)} invoiced of {poValue>0?formatSarCompact(poValue):"? PO value"}</span>
          <span>
            {dl !== null
              ? dl >= 0 ? `${dl} days remaining` : `${Math.abs(dl)} days overdue`
              : proj.estEndDate ? fmtDate(proj.estEndDate) : "No end date set"}
          </span>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:18}}>
        {[
          {icon:"💰",label:"PO VALUE",         v:poValue?formatSarCompact(poValue):"—",          color:T.gold},
          {icon:"🧾",label:"TOTAL INVOICED",   v:formatSarCompact(totalInvoiced),                color:T.green},
          {icon:"✓", label:"COLLECTED",        v:formatSarCompact(totalCollected),               color:T.blue},
          {icon:"⏳",label:"DUE / REMAINING",  v:formatSarCompact(totalDue),                     color:totalDue>0?T.red:T.textMuted},
          {icon:"📋",label:"JOBS (PHASES)",    v:jobs.filter(j=>j.jobNo).length||invs.length,    color:T.purple},
          {icon:"📅",label:"DURATION",         v:duration?`${duration} days`:"—",                color:T.teal},
        ].map((k,i)=>(
          <div key={k.label} className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:"16px 18px",boxShadow:T.shadow,animationDelay:`${i*.05}s`}}>
            <div style={{fontSize:20,marginBottom:6}}>{k.icon}</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(15px,2vw,22px)",fontWeight:800,color:k.color,lineHeight:1.1,wordBreak:"break-word"}}>{k.v}</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:4,fontWeight:600,letterSpacing:.5}}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── Jobs / Phases (from invoices grouped by jobNo) ── */}
      <div className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:"20px 22px",marginBottom:16,boxShadow:T.shadow}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.text}}>🏗 JOBS / PHASES</div>
            <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>
              {jobs.length} job{jobs.length!==1?"s":""} from Project Docs invoices · Progress = Total Invoiced ÷ PO Value
            </div>
          </div>
          <button onClick={()=>go("projects")} style={{background:T.greenDim,border:`1px solid ${T.green}44`,color:T.green,borderRadius:9,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
            ➕ Add Invoice in Project Docs →
          </button>
        </div>

        {invs.length === 0 ? (
          <div style={{textAlign:"center",padding:"30px 20px",background:T.card2,borderRadius:12,border:`1px dashed ${T.border}`}}>
            <div style={{fontSize:32,marginBottom:10}}>🧾</div>
            <div style={{fontSize:14,color:T.textMuted,fontWeight:600}}>No invoices found for this project.</div>
            <div style={{fontSize:12,color:T.textMuted,marginTop:6}}>Add invoices in <strong>Project Docs → Invoices</strong> tab with a Job No. to see them here as phases.</div>
            <button onClick={()=>go("projects")} style={{marginTop:14,background:`linear-gradient(135deg,${T.green},#059669)`,border:"none",color:"#fff",borderRadius:9,padding:"10px 20px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Go to Project Docs →</button>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {jobs.map(job => {
              const jobPct = poValue > 0 ? Math.min(100, Math.round((job.totalInvoiced / poValue) * 100)) : 0;
              const jobKey = job.jobNo || "__no_job__";
              const isExp  = expandJob === jobKey;
              const hasCerts = job.certs.length > 0;
              return (
                <div key={jobKey} style={{border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
                  {/* Job header */}
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:isExp?T.card2:T.card,cursor:"pointer"}} onClick={()=>setExpandJob(isExp?null:jobKey)}>
                    <div style={{width:38,height:38,borderRadius:9,background:T.goldDim,border:`1px solid ${T.gold}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,fontWeight:800,color:T.gold,fontFamily:"'Barlow Condensed',sans-serif"}}>
                      {job.jobNo?"J":"?"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:T.text}}>
                        {job.jobNo ? `Job ${job.jobNo}` : "Unassigned Invoices"}
                      </div>
                      <div style={{fontSize:12,color:T.textMuted,marginTop:2,display:"flex",gap:14,flexWrap:"wrap"}}>
                        <span style={{color:T.green,fontWeight:600}}>{formatSarCompact(job.totalInvoiced)} invoiced</span>
                        <span style={{color:T.blue}}>{formatSarCompact(job.totalCollected)} collected</span>
                        {job.totalDue>0&&<span style={{color:T.red}}>{formatSarCompact(job.totalDue)} due</span>}
                        <span>{job.invoices.length} invoice{job.invoices.length!==1?"s":""}</span>
                        {hasCerts&&<span style={{color:T.teal}}>📜 {job.certs.length} cert{job.certs.length!==1?"s":""}</span>}
                      </div>
                    </div>
                    {/* Mini progress bar */}
                    <div style={{width:100,flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                      <span style={{fontSize:13,fontWeight:800,color:pctColor(jobPct)}}>{jobPct}%</span>
                      <div style={{width:"100%",height:5,background:T.border,borderRadius:999,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${jobPct}%`,borderRadius:999,background:pctColor(jobPct)}}/>
                      </div>
                      <span style={{fontSize:10,color:T.textMuted}}>of total PO</span>
                    </div>
                    <span style={{color:T.textMuted,fontSize:14}}>{isExp?"▲":"▼"}</span>
                  </div>

                  {/* Expanded invoice list */}
                  {isExp && (
                    <div style={{borderTop:`1px solid ${T.border}`,background:T.card2}}>
                      {/* Invoices */}
                      {job.invoices.map(inv=>{
                        const collected = getInvoiceCollectedAmount(inv);
                        const due       = getInvoiceRemainingAmount(inv);
                        const stC       = /paid|received/i.test(inv.paymentStatus||"") ? T.green : /partial/i.test(inv.paymentStatus||"") ? T.gold : T.red;
                        const stream    = getInvoiceStream(inv);
                        return (
                          <div key={inv.id} style={{padding:"12px 16px 12px 62px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                            <div style={{flex:1,minWidth:200}}>
                              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6}}>
                                <span style={{fontWeight:700,fontSize:13,color:T.text}}>{inv.name||"Invoice"}</span>
                                {inv.refNo&&<span style={{background:T.greenDim,color:T.green,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}}>#{inv.refNo}</span>}
                                <span style={{background:stream==="advance"?T.goldDim:T.tealDim,color:stream==="advance"?T.gold:T.teal,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}}>{stream==="advance"?"Advance":"Income"}</span>
                                <span style={{background:`${stC}18`,color:stC,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}}>{inv.paymentStatus||"Pending"}</span>
                              </div>
                              <div style={{display:"flex",gap:10,flexWrap:"wrap",fontSize:12,color:T.textMuted}}>
                                <span style={{color:T.green,fontWeight:600}}>SAR {Number(inv.amount||0).toLocaleString()}</span>
                                {collected>0&&<span style={{color:T.blue}}>✓ {formatSarCompact(collected)}</span>}
                                {due>0&&<span style={{color:T.red}}>⏳ {formatSarCompact(due)}</span>}
                                {inv.dueDate&&<span>Due: {fmtDate(inv.dueDate)}</span>}
                                {inv.fileLink&&<a href={inv.fileLink} target="_blank" rel="noreferrer" style={{color:T.blue,textDecoration:"none",fontWeight:600}}>📎 View</a>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {/* Certs */}
                      {job.certs.map(cert=>(
                        <div key={cert.id} style={{padding:"10px 16px 10px 62px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",background:`${T.teal}08`}}>
                          <span style={{fontSize:14}}>📜</span>
                          <span style={{fontWeight:700,fontSize:13,color:T.text}}>{cert.refNo?"Cert #"+cert.refNo:"Job Completion Certificate"}</span>
                          {cert.completionDate&&<span style={{fontSize:12,color:T.textMuted}}>Completed: {fmtDate(cert.completionDate)}</span>}
                          {cert.fileLink&&<a href={cert.fileLink} target="_blank" rel="noreferrer" style={{color:T.teal,textDecoration:"none",fontSize:12,fontWeight:600}}>📎 View</a>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Daily Reports ── */}
      <div className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:"20px 22px",boxShadow:T.shadow}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.text}}>📝 DAILY REPORTS</div>
            <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>{reports.length} report{reports.length!==1?"s":""}</div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {/* Export all reports to Excel */}
            {reports.length>0&&(
              <button onClick={()=>exportToExcel(
                reports.map(r=>({
                  "Project": proj.project,
                  "Date": r.date,
                  "Weather": r.weather||"",
                  "Activities / Work Done": r.activities||"",
                  "Manpower Count": r.manpower||"",
                  "Equipment Used": r.equipment||"",
                  "Issues / Delays": r.issues||"",
                  "Notes": r.notes||"",
                  "File Attached": r.fileName||"",
                  "File Link": r.fileLink||"",
                })),
                `Daily_Reports_${(proj.project||"Project").replace(/\s+/g,"_")}`
              )}
                style={{background:"rgba(52,211,153,0.12)",border:"1px solid rgba(52,211,153,0.3)",color:"#34d399",borderRadius:9,padding:"8px 16px",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                ⬇ Export Excel
              </button>
            )}
            {/* Bulk import multiple rows from Excel */}
            <BulkDailyReportImport projectName={proj.project} onImport={(rows)=>{
              const updated = [...(proj.dailyReports||[])];
              rows.forEach(r=>{
                const dup = updated.find(x=>x.date===r.date);
                if(!dup) updated.push(r);
              });
              onUpdate({...proj,dailyReports:updated});
            }}/>
            <button onClick={()=>setDrModal("new")} style={{background:`linear-gradient(135deg,${T.blue},#2563eb)`,border:"none",color:"#fff",borderRadius:10,padding:"9px 18px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Add Report</button>
          </div>
        </div>
        {reports.length===0 ? (
          <div style={{textAlign:"center",padding:"30px 20px",color:T.textMuted,fontSize:14}}>
            <div style={{fontSize:36,marginBottom:10}}>📋</div>
            No daily reports yet. Click <strong>+ Add Report</strong> to start tracking site progress.
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {reports.map(r=>{
              const isE = expandDr===r.id;
              return (
                <div key={r.id} style={{border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:isE?T.card2:T.card,cursor:"pointer"}} onClick={()=>setExpandDr(isE?null:r.id)}>
                    <div style={{width:34,height:34,borderRadius:8,background:T.blueDim,border:`1px solid ${T.blue}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>📅</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:T.text}}>{fmtDate(r.date)}</div>
                      <div style={{fontSize:11,color:T.textMuted,marginTop:2,display:"flex",gap:10,flexWrap:"wrap"}}>
                        {r.weather&&<span>🌤 {r.weather}</span>}
                        {r.manpower&&<span>👷 {r.manpower} workers</span>}
                        {r.equipment&&<span>🚧 {r.equipment}</span>}
                        {r.fileLink&&<span style={{color:T.blue,fontWeight:600}}>📎 {r.fileName||"File attached"}</span>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <button onClick={e=>{e.stopPropagation();setDrModal(r);}} style={{background:T.blueDim,border:`1px solid ${T.blue}33`,color:T.blue,borderRadius:7,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,cursor:"pointer"}}>✎</button>
                      <button onClick={e=>{e.stopPropagation();delReport(r.id);}} style={{background:T.redDim,border:`1px solid ${T.red}33`,color:T.red,borderRadius:7,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,cursor:"pointer"}}>✕</button>
                      <span style={{color:T.textMuted,fontSize:13,marginLeft:2}}>{isE?"▲":"▼"}</span>
                    </div>
                  </div>
                  {isE&&(
                    <div style={{padding:"12px 14px 14px 60px",borderTop:`1px solid ${T.border}`,background:T.card2,display:"flex",flexDirection:"column",gap:12}}>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
                        {r.activities&&<div><div style={{fontSize:10,fontWeight:700,color:T.textMuted,marginBottom:4}}>ACTIVITIES</div><div style={{fontSize:13,color:T.text,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{r.activities}</div></div>}
                        {r.issues&&<div><div style={{fontSize:10,fontWeight:700,color:T.red,marginBottom:4}}>ISSUES / DELAYS</div><div style={{fontSize:13,color:T.text,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{r.issues}</div></div>}
                        {r.notes&&<div><div style={{fontSize:10,fontWeight:700,color:T.textMuted,marginBottom:4}}>NOTES</div><div style={{fontSize:13,color:T.text,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{r.notes}</div></div>}
                      </div>
                      {r.fileLink&&(
                        <div style={{display:"flex",alignItems:"center",gap:10,background:T.card,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 14px"}}>
                          <span style={{fontSize:18}}>{/\.pdf$/i.test(r.fileName||r.fileLink)?"📄":/\.(xlsx?|csv)$/i.test(r.fileName||r.fileLink)?"📊":/\.(png|jpe?g|webp)$/i.test(r.fileName||r.fileLink)?"🖼️":"📎"}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:700,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.fileName||"Daily Report File"}</div>
                            <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>Attached report sheet</div>
                          </div>
                          <a href={r.fileLink} target="_blank" rel="noreferrer"
                            style={{background:T.blueDim,border:`1px solid ${T.blue}33`,color:T.blue,borderRadius:7,padding:"6px 14px",fontSize:12,fontWeight:700,textDecoration:"none",flexShrink:0}}>
                            ↗ Open
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editProj&&<ProjectAnalysisModal proj={proj} projectNames={projectNames} onSave={p=>{onUpdate(p);setEditProj(false);}} onClose={()=>setEditProj(false)}/>}
      {drModal&&<DailyReportModal report={drModal==="new"?null:drModal} projectName={proj.project} onSave={saveReport} onClose={()=>setDrModal(null)}/>}
    </div>
  );
}

/* ── Project Analysis list page ── */
function ProjectAnalysisPage({ data, setData, showToast, go }) {
  const [modal,  setModal]  = useState(null);
  const [detail, setDetail] = useState(null);
  const [fStat,  setFStat]  = useState("All");
  const [search, setSearch] = useState("");

  const projects  = data.projects || [];
  const analysis  = data.projectAnalysis || [];
  const projectDocs = data.projectDocs || [];

  const save = p => {
    const exists = analysis.find(x=>x.id===p.id);
    const updated = exists ? analysis.map(x=>x.id===p.id?p:x) : [...analysis,p];
    setData(prev=>({...prev,projectAnalysis:updated}));
    showToast(exists?"Project updated":"Project added");
    setModal(null);
  };
  const del = id => {
    setData(prev=>({...prev,projectAnalysis:prev.projectAnalysis.filter(x=>x.id!==id)}));
    showToast("Project deleted","del");
    setDetail(null);
  };
  const update = p => {
    setData(prev=>({...prev,projectAnalysis:(prev.projectAnalysis||[]).map(x=>x.id===p.id?p:x)}));
    showToast("Saved");
  };

  const detailRec = detail ? analysis.find(x=>x.id===detail) : null;
  if (detailRec) {
    return <ProjectAnalysisDetail
      proj={detailRec} projectDocs={projectDocs} projectNames={projects}
      onUpdate={p=>{update(p);setDetail(p.id);}} onDelete={()=>del(detailRec.id)}
      onBack={()=>setDetail(null)} go={go}/>;
  }

  // Enrich each record with live invoice stats
  const enriched = analysis.map(p => ({
    ...p,
    ...deriveProjectStats(p.project, projectDocs),
  }));

  let visible = enriched;
  if (fStat !== "All") visible = visible.filter(x=>x.status===fStat);
  if (search.trim()) visible = visible.filter(x=>
    [x.project,x.poNumber,x.clientName,x.quotationRef,x.status].some(v=>String(v||"").toLowerCase().includes(search.toLowerCase()))
  );

  const totalPO        = enriched.reduce((s,x)=>s+(parseFloat(x.poValue)||0),0);
  const totalInvoiced  = enriched.reduce((s,x)=>s+x.totalInvoiced,0);
  const totalCollected = enriched.reduce((s,x)=>s+x.totalCollected,0);
  const totalDue       = enriched.reduce((s,x)=>s+x.totalDue,0);

  return (
    <div style={{maxWidth:"min(1300px,98vw)",margin:"0 auto"}}>
      {/* Header */}
      <div style={{display:"flex",flexWrap:"wrap",gap:12,alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"clamp(22px,3vw,32px)",color:T.text,letterSpacing:1}}>PROJECT ANALYSIS</div>
          <div style={{fontSize:13,color:T.textMuted,marginTop:4}}>
            {analysis.length} project{analysis.length!==1?"s":""} · Progress auto-calculated from Project Docs invoices
          </div>
        </div>
        <button onClick={()=>setModal("new")} style={{background:`linear-gradient(135deg,${T.gold},#d97706)`,border:"none",color:"#000",borderRadius:11,padding:"11px 22px",fontSize:14,fontWeight:800,cursor:"pointer",boxShadow:`0 4px 14px ${T.gold}44`}}>+ New Project</button>
      </div>

      {/* Portfolio KPI strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:18}}>
        {[
          {label:"Total PO Value",   v:formatSarCompact(totalPO),        color:T.gold},
          {label:"Total Invoiced",   v:formatSarCompact(totalInvoiced),  color:T.green},
          {label:"Total Collected",  v:formatSarCompact(totalCollected), color:T.blue},
          {label:"Total Due",        v:formatSarCompact(totalDue),       color:totalDue>0?T.red:T.textMuted},
          {label:"In Progress",      v:enriched.filter(x=>x.status==="In Progress").length, color:T.blue},
          {label:"Completed",        v:enriched.filter(x=>x.status==="Completed").length,   color:T.green},
        ].map((k,i)=>(
          <div key={k.label} className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 16px",boxShadow:T.shadow,animationDelay:`${i*.05}s`}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(16px,2.5vw,26px)",fontWeight:800,color:k.color,lineHeight:1}}>{k.v}</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:4,fontWeight:600}}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16,alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects…"
          style={{background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 13px",fontSize:13,color:T.text,outline:"none",width:200}}
          onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/>
        <select value={fStat} onChange={e=>setFStat(e.target.value)}
          style={{background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 13px",fontSize:13,color:T.text,outline:"none"}}>
          <option value="All">All Statuses</option>
          {["Not Started","In Progress","On Hold","Completed","Cancelled"].map(s=><option key={s}>{s}</option>)}
        </select>
        {(fStat!=="All"||search)&&(
          <button onClick={()=>{setFStat("All");setSearch("");}} style={{background:T.redDim,border:`1px solid ${T.red}33`,color:T.red,borderRadius:9,padding:"8px 13px",fontSize:12,fontWeight:600,cursor:"pointer"}}>✕ Clear</button>
        )}
        <div style={{marginLeft:"auto",fontSize:12,color:T.textMuted}}>{visible.length} result{visible.length!==1?"s":""}</div>
      </div>

      {/* Project cards */}
      {visible.length===0 ? (
        <div style={{textAlign:"center",padding:"60px 20px",background:T.card,border:`1px solid ${T.border}`,borderRadius:18}}>
          <div style={{fontSize:48,marginBottom:16}}>📊</div>
          <div style={{fontSize:16,color:T.textMuted,fontWeight:600}}>
            {analysis.length===0 ? "No projects yet — click + New Project to get started" : "No projects match the filters"}
          </div>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,380px),1fr))",gap:16}}>
          {visible.map((p,i)=>{
            const poValue = parseFloat(p.poValue)||0;
            const pct = poValue>0 ? Math.min(100,Math.round((p.totalInvoiced/poValue)*100)) : 0;
            const dl = daysLeft(p.estEndDate);
            const stColor = {"Not Started":T.textMuted,"In Progress":T.blue,"On Hold":T.gold,"Completed":T.green,"Cancelled":T.red}[p.status]||T.textMuted;
            return (
              <div key={p.id} className="fade-up card-hover" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"20px",boxShadow:T.shadow,animationDelay:`${i*.04}s`,cursor:"pointer",display:"flex",flexDirection:"column",gap:14}}
                   onClick={()=>setDetail(p.id)}>
                {/* Header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.project||"Unnamed"}</div>
                    <div style={{fontSize:12,color:T.textMuted,marginTop:2,display:"flex",gap:10,flexWrap:"wrap"}}>
                      {p.clientName&&<span>{p.clientName}</span>}
                      {p.poNumber&&<span>PO: {p.poNumber}</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>setModal(p)} style={{background:T.blueDim,border:`1px solid ${T.blue}33`,color:T.blue,borderRadius:7,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,cursor:"pointer"}}>✎</button>
                    <button onClick={()=>del(p.id)} style={{background:T.redDim,border:`1px solid ${T.red}33`,color:T.red,borderRadius:7,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,cursor:"pointer"}}>✕</button>
                  </div>
                </div>
                {/* Status + PO value */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{background:`${stColor}18`,border:`1px solid ${stColor}44`,color:stColor,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700}}>{p.status||"—"}</span>
                  {poValue>0&&<span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,color:T.gold}}>{formatSarCompact(poValue)}</span>}
                </div>
                {/* Progress bar — invoiced vs PO */}
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:12}}>
                    <span style={{color:T.textMuted,fontWeight:600}}>INVOICED PROGRESS</span>
                    <span style={{fontWeight:800,color:pctColor(pct)}}>{pct}%</span>
                  </div>
                  <div style={{height:8,background:T.border,borderRadius:999,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,borderRadius:999,background:`linear-gradient(90deg,${pctColor(pct)},${pctColor(pct)}bb)`,transition:"width 1s"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:11,color:T.textMuted}}>
                    <span>{formatSarCompact(p.totalInvoiced)} invoiced</span>
                    <span>{poValue>0?formatSarCompact(poValue)+" total":p.invs.length+" invoices"}</span>
                  </div>
                </div>
                {/* Collected / Due */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div style={{background:T.greenDim,border:`1px solid ${T.green}33`,borderRadius:9,padding:"8px 12px"}}>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,color:T.green}}>{formatSarCompact(p.totalCollected)}</div>
                    <div style={{fontSize:10,color:T.green,marginTop:2,fontWeight:700}}>✓ COLLECTED</div>
                  </div>
                  <div style={{background:p.totalDue>0?T.redDim:T.greenDim,border:`1px solid ${p.totalDue>0?T.red:T.green}33`,borderRadius:9,padding:"8px 12px"}}>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,color:p.totalDue>0?T.red:T.green}}>{formatSarCompact(p.totalDue)}</div>
                    <div style={{fontSize:10,color:p.totalDue>0?T.red:T.green,marginTop:2,fontWeight:700}}>⏳ DUE</div>
                  </div>
                </div>
                {/* Date row */}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.textMuted}}>
                  <span>{p.startDate?fmtDate(p.startDate):"No start date"}</span>
                  {dl!==null
                    ? <span style={{color:dl<0?T.red:dl<30?T.gold:T.green,fontWeight:600}}>{dl>=0?`${dl}d left`:`${Math.abs(dl)}d overdue`}</span>
                    : <span>{p.estEndDate?fmtDate(p.estEndDate):"No end date"}</span>
                  }
                </div>
                {/* Jobs count */}
                {p.jobs.filter(j=>j.jobNo).length>0&&(
                  <div style={{background:T.goldDim,border:`1px solid ${T.gold}33`,borderRadius:8,padding:"6px 12px",fontSize:12,color:T.gold,fontWeight:600}}>
                    🏗 {p.jobs.filter(j=>j.jobNo).length} Job{p.jobs.filter(j=>j.jobNo).length!==1?"s":""} · {p.invs.length} Invoice{p.invs.length!==1?"s":""}
                    {(p.dailyReports?.length||0)>0&&<span style={{marginLeft:10,color:T.orange}}>📝 {p.dailyReports.length} report{p.dailyReports.length!==1?"s":""}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal&&<ProjectAnalysisModal proj={modal==="new"?null:modal} projectNames={projects} onSave={save} onClose={()=>setModal(null)}/>}
    </div>
  );
}


export default function App() {
  const [data, setData] = useState(EMPTY_DATA);
  const [loadingData, setLoadingData] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [projMod, setProjMod] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [authed, setAuthed] = useState(() => isAuthenticated());
  const [financeAuthed, setFinanceAuthed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("cta_dark") === "true"; }
    catch { return false; }
  });
  const [globalSearch, setGlobalSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedInvoiceYear, setSelectedInvoiceYear] = useState("All");
  const { width: viewportWidth } = useViewport();

  useEffect(() => {
    if (!document.getElementById("ct-g")) {
      const s = document.createElement("style");
      s.id = "ct-g";
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`${SUPABASE_URL}/rest/v1/app_state?id=eq.main&select=data`, {
          headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const rows = await res.json();
          if (rows.length && rows[0].data) setData({ ...EMPTY_DATA, ...rows[0].data });
        }
      } catch (err) {
        console.error("Supabase load failed:", err);
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    document.body.style.background = darkMode ? DARK.bg : LIGHT.bg;
    try { localStorage.setItem("cta_dark", darkMode); } catch {}
  }, [darkMode]);

  useEffect(() => {
    if (loadingData) return;

    const t = setTimeout(() => {
      saveAppData(data).catch(err => { console.error("Save failed:", err); });
    }, 400);

    return () => clearTimeout(t);
  }, [data, loadingData]);

  T = darkMode ? DARK : LIGHT;

  if (loadingData) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: T.bg,
        color: T.text,
        fontFamily: "'Barlow Condensed',sans-serif",
        fontSize: 24,
        fontWeight: 700
      }}>
        Loading shared data...
      </div>
    );
  }

  const logout = () => {
    try { localStorage.removeItem(AUTH_KEY); } catch {}
    setAuthed(false);
    setFinanceAuthed(false);
  };

  // ...rest of your App code continues here

  const showToast = (msg, type="ok") => { setToast({msg,type}); setTimeout(() => setToast(null), 3200); };

  const go = p => { setPage(p); setSideOpen(false); if (p !== "finance") setFinanceAuthed(false); };

  const saveProjects = projects => setData(prev=>({...prev,projects}));

  /* ── expiry alerts across everything ── */
  const allExpiries = [
    ...data.scorpionDocs.filter(d=>d.expiryDate).map(d=>({label:d.name,src:"Company Doc",days:daysUntil(d.expiryDate)})),
    ...(data.projectDocs||[]).filter(d=>d.expiryDate).map(d=>({label:d.name,src:"Project Doc",days:daysUntil(d.expiryDate)})),
    ...data.manpower.flatMap(p=>[
      p.passportExpiry && {label:p.name,src:"Passport",    days:daysUntil(p.passportExpiry)},
      p.visaExpiry     && {label:p.name,src:"Visa",        days:daysUntil(p.visaExpiry)},
      p.iqamaExpiry    && {label:p.name,src:"Iqama",       days:daysUntil(p.iqamaExpiry)},
      p.muqeemExpiry   && {label:p.name,src:"Muqeem",      days:daysUntil(p.muqeemExpiry)},
      ...(p.certs||[]).map(c=>({label:`${p.name} — ${c.name}`,src:"Cert",days:daysUntil(c.expiryDate)})),
    ].filter(Boolean)),
    ...data.equipment.flatMap(e=>[
      ...(e.certifications||[]).map(c=>({label:`${e.name} — ${c.certNo||"Cert"}`,src:"Eq Cert",days:daysUntil(c.expiryDate)})),
      ...(e.insurance||[]).map(c=>({label:`${e.name} — Insurance`,src:"Insurance",days:daysUntil(c.expiryDate)})),
      ...(e.permits||[]).map(c=>({label:`${e.name} — ${c.type||"Permit"}`,src:"Permit",days:daysUntil(c.expiryDate)})),
    ]),
  ].filter(x=>x.days!==null&&x.days<=90).sort((a,b)=>a.days-b.days);

  // Global search results
  const searchResults = globalSearch.length > 1 ? (() => {
    const q = globalSearch.toLowerCase();
    const results = [];
    data.scorpionDocs.forEach(d=>{ if(Object.values(d).some(v=>String(v).toLowerCase().includes(q))) results.push({type:"Company Doc",label:d.name,sub:d.category,page:"scorpion"}); });
    (data.projectDocs||[]).forEach(d=>{ if(Object.values(d).some(v=>String(v).toLowerCase().includes(q))) results.push({type:"Project Doc",label:d.name,sub:d.project,page:"projects"}); });
    data.manpower.forEach(p=>{ if(Object.values(p).some(v=>String(v).toLowerCase().includes(q))) results.push({type:"Person",label:p.name,sub:p.designation,page:"manpower"}); });
    data.equipment.forEach(e=>{ if(Object.values(e).some(v=>String(v).toLowerCase().includes(q))) results.push({type:"Equipment",label:e.name,sub:e.serialNo,page:"equipment"}); });
    return results.slice(0,12);
  })() : [];

  if (!authed) {
    return <LoginPage onLogin={(pw) => {
      if (pw === COMPANY_PASSWORD) { try{localStorage.setItem(AUTH_KEY,"true");}catch{} setAuthed(true); return true; }
      return false;
    }} />;
  }

  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:T.bg}}>
      {showWelcome && <WelcomeScreen onEnter={()=>setShowWelcome(false)}/>}
      {sideOpen && <div className="fade-in" onClick={()=>setSideOpen(false)} style={{position:"fixed",inset:0,background:"rgba(13,31,53,0.45)",zIndex:49}}/>}

      <Sidebar page={page} go={go} sideOpen={sideOpen} alerts={allExpiries.length} data={data} viewportWidth={viewportWidth} onManageProjects={()=>{setSideOpen(false);setProjMod(true);}} darkMode={darkMode} onToggleDark={()=>setDarkMode(d=>!d)} onLogout={logout} financeAuthed={financeAuthed}/>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        {/* ── Top bar ── */}
        <header style={{background:T.sidebar,borderBottom:"2px solid transparent",backgroundImage:`linear-gradient(${T.sidebar},${T.sidebar}), linear-gradient(90deg,#fbbf24,#38bdf8,#34d399,#fbbf24)`,backgroundOrigin:"border-box",backgroundClip:"padding-box, border-box",padding:"0 20px",flexShrink:0,boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}>
          <div style={{display:"flex",alignItems:"center",height:56,position:"relative"}}>
            {viewportWidth < 1200 && (
  <button
    onClick={() => setSideOpen(true)}
    style={{
      background:"rgba(255,255,255,0.08)",
      border:"1px solid rgba(255,255,255,0.15)",
      color:"#ffffff",
      borderRadius:8,
      width:40,
      height:40,
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      fontSize:18,
      flexShrink:0,
      zIndex:1
    }}
  >
    ☰
  </button>
)}
            <div style={{position:"absolute",left:0,right:0,textAlign:"center",pointerEvents:"none"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,letterSpacing:"2px",color:"#f59e0b",textTransform:"uppercase"}}>SCORPION ARABIA</div>
              <div style={{fontSize:11,color:"#93c5fd",letterSpacing:"1.5px",marginTop:1}}>DOCUMENT & ASSET MANAGER</div>
            </div>
            <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center",zIndex:1}}>
              {/* Global search */}
              <div style={{position:"relative"}}>
                {showSearch
                  ? <input autoFocus value={globalSearch} onChange={e=>setGlobalSearch(e.target.value)}
                      onBlur={()=>{if(!globalSearch)setShowSearch(false);}}
                      placeholder="Search everything…"
                      style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:8,padding:"7px 12px",fontSize:13,color:"#fff",outline:"none",width:220}}/>
                  : <button onClick={()=>setShowSearch(true)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"#fff",borderRadius:8,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⌕</button>
                }
                {searchResults.length>0&&showSearch&&(
                  <div style={{position:"absolute",top:42,right:0,background:T.card,border:`1px solid ${T.border}`,borderRadius:12,width:320,maxHeight:380,overflowY:"auto",boxShadow:T.shadow,zIndex:200}}>
                    {searchResults.map((r,i)=>(
                      <div key={i} onClick={()=>{go(r.page);setShowSearch(false);setGlobalSearch("");}}
                        style={{padding:"10px 14px",cursor:"pointer",borderBottom:`1px solid ${darkMode?DARK.border:T.border}`,transition:"background .15s"}}
                        onMouseEnter={e=>e.currentTarget.style.background=darkMode?DARK.cardHover:T.cardHover}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <div style={{fontSize:13,fontWeight:600,color:T.text}}>{r.label}</div>
                        <div style={{fontSize:11,color:T.textMuted,marginTop:2,display:"flex",gap:6}}>
                          <span style={{background:T.blueDim,color:T.blue,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>{r.type}</span>
                          <span>{r.sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {allExpiries.length>0 && (
                <div style={{background:"rgba(220,38,38,0.25)",border:"1px solid rgba(220,38,38,0.5)",color:"#fca5a5",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
                  ▲ <span style={{background:"#dc2626",color:"#fff",borderRadius:999,padding:"1px 6px",fontSize:11,fontWeight:700}}>{allExpiries.length}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={{flex:1,overflowY:"auto",padding:"clamp(14px,2vw,28px) clamp(14px,2.5vw,32px)"}}>
          {page==="dashboard" && <div className="fade-in" key="dashboard"><Dashboard data={data} alerts={allExpiries} go={go}/></div>}
          {page==="scorpion"  && <div className="fade-in" key="scorpion"><ScorpionDocs data={data} setData={setData} showToast={showToast}/></div>}
          {page==="projects"  && <div className="fade-in" key="projects"><ProjectDocs data={data} setData={setData} showToast={showToast}/></div>}
          {page==="analysis"  && <div className="fade-in" key="analysis"><ProjectAnalysisPage data={data} setData={setData} showToast={showToast} go={go}/></div>}
          {page==="manpower"  && <div className="fade-in" key="manpower"><ManpowerPage data={data} setData={setData} showToast={showToast}/></div>}
          {page==="equipment" && <div className="fade-in" key="equipment"><EquipmentPage data={data} setData={setData} showToast={showToast}/></div>}
          {page==="finance"   && (
            financeAuthed
              ? <div className="fade-in" key="finance"><FinancePage data={data} selectedInvoiceYear={selectedInvoiceYear} setSelectedInvoiceYear={setSelectedInvoiceYear}/></div>
              : <FinanceLoginPage onLogin={(pw) => {
                  if (pw === FINANCE_PASSWORD) {
                    setFinanceAuthed(true);
                    return true;
                  }
                  return false;
                }}/>
          )}
        </main>
      </div>

      {projMod && <ProjectsModal projects={data.projects||[]} onSave={saveProjects} onClose={()=>setProjMod(false)}/>}

      {toast && (
        <div className="pop-in" style={{position:"fixed",bottom:24,right:24,zIndex:999,background:toast.type==="del"?"#fee2e2":"#d1fae5",border:`1px solid ${toast.type==="del"?T.red:T.green}`,color:toast.type==="del"?T.red:T.green,borderRadius:10,padding:"12px 20px",fontSize:14,fontWeight:600,boxShadow:T.shadow,display:"flex",alignItems:"center",gap:10}}>
          {toast.type==="del"?"✕":"✓"} {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════════════════════════════════════════ */
function Sidebar({page,go,sideOpen,alerts,data,viewportWidth,onManageProjects,darkMode,onToggleDark,onLogout,financeAuthed}) {
  const isMobile = viewportWidth < 1200;
  const NAV = [
    {id:"dashboard", icon:"▦", label:"Dashboard",          desc:"Overview"},
    {id:"scorpion",  icon:"◉", label:"Scorpion Documents", desc:"Company docs & licenses"},
    {id:"projects",  icon:"◆", label:"Project Docs",       desc:"Invoices, certs & orders"},
    {id:"analysis",  icon:"◐", label:"Project Analysis",   desc:"PO value, progress & jobs"},
    {id:"manpower",  icon:"◈", label:"Manpower",           desc:"Staff & certifications"},
    {id:"equipment", icon:"◎", label:"Equipment",          desc:"Assets & records"},
    {id:"finance",   icon:"$", label:"Finance",            desc:"Financial overview", locked:!financeAuthed},
  ];
  return (
    <aside style={{width:"clamp(220px,18vw,280px)",flexShrink:0,background:T.sidebar,borderRight:"none",display:"flex",flexDirection:"column",zIndex:50,position:isMobile?"fixed":"relative",top:0,left:0,height:"100%",transform:isMobile?(sideOpen?"translateX(0)":"translateX(-100%)"):"none",transition:"transform .28s ease",boxShadow:"2px 0 12px rgba(0,0,0,0.06)"}}>
      <div style={{padding:"22px 20px 18px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{position:"relative",flexShrink:0,width:72,height:72}}>
          {/* Spinning rings — thin and tight */}
          <div className="logo-ring-spin" style={{position:"absolute",inset:-2,borderRadius:"50%",border:"1px solid rgba(251,191,36,0.4)",pointerEvents:"none"}}/>
          <div className="logo-ring-spin-rev" style={{position:"absolute",inset:-5,borderRadius:"50%",border:"1px dashed rgba(56,189,248,0.18)",pointerEvents:"none"}}/>
          {/* Logo — bigger, black border minimal */}
          <div className="logo-animate" style={{width:72,height:72,borderRadius:"50%",background:"#000",overflow:"hidden",boxShadow:"0 0 16px rgba(251,191,36,0.35)",border:"1.5px solid rgba(251,191,36,0.4)",position:"relative",zIndex:1}}>
            <img src="logo.png" alt="Scorpion Arabia" style={{width:"100%",height:"100%",objectFit:"cover",mixBlendMode:"lighten"}}/>
          </div>
        </div>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"clamp(16px,1.4vw,22px)",letterSpacing:"1px",lineHeight:1.1,background:"linear-gradient(90deg,#92400e,#fbbf24,#fef3c7,#fbbf24,#f59e0b,#92400e)",backgroundSize:"300% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmer 8s linear infinite",filter:"drop-shadow(0 0 8px rgba(251,191,36,0.6))"}}>SCORPION ARABIA</div>
            <div style={{fontSize:12,color:T.textSub,fontWeight:600,letterSpacing:"1.4px",marginTop:3,color:"#93c5fd"}}>PORTAL</div>
          </div>
        </div>
      </div>
      <nav style={{padding:"14px 10px",flex:1,overflowY:"auto"}}>
          {NAV.map(n=>{
          const active=page===n.id;
          const badge=n.id==="dashboard"?alerts:0;
          return (
            <button key={n.id} onClick={()=>go(n.id)} className="nav-item" style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 12px",borderRadius:8,border:"none",marginBottom:3,textAlign:"left",background:active?"rgba(59,130,246,0.15)":"transparent",borderLeft:`2px solid ${active?"#93c5fd":"transparent"}`,transition:"all .15s",cursor:"pointer"}}>
              <span style={{fontSize:20,color:active?"#93c5fd":n.locked?"#64748b":"#94a3b8"}}>{n.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:"clamp(12px,1vw,14px)",fontWeight:600,color:active?"#93c5fd":n.locked?"#64748b":"#e2e8f0"}}>{n.label}</div>
                <div style={{fontSize:10,color:"#64748b",marginTop:1}}>{n.locked?"🔒 Finance access required":n.desc}</div>
              </div>
              {badge>0&&<span style={{background:T.red,color:"#fff",borderRadius:999,padding:"1px 7px",fontSize:10,fontWeight:700}}>{badge}</span>}
            </button>
          );
        })}
      </nav>
      {/* Manage Projects */}
      <div style={{padding:"6px 10px 0"}}>
        <button onClick={onManageProjects} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:"1px solid #334155",background:"transparent",textAlign:"left",transition:"all .15s",marginBottom:4}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.borderColor="#93c5fd";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="#334155";}}>
          <span style={{fontSize:16,color:T.blue}}>⊕</span>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>Manage Projects</div>
            <div style={{fontSize:10,color:"#64748b"}}>Add, rename, delete</div>
          </div>
        </button>
      </div>
      <div style={{padding:"10px 10px 16px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",gap:6}}>
        <button onClick={onToggleDark} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:darkMode?"rgba(251,191,36,0.12)":"transparent",cursor:"pointer",transition:"all .15s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}
          onMouseLeave={e=>e.currentTarget.style.background=darkMode?"rgba(251,191,36,0.12)":"transparent"}>
          <span style={{fontSize:16}}>{darkMode?"☀️":"🌙"}</span>
          <span style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{darkMode?"Light Mode":"Dark Mode"}</span>
        </button>
        <button onClick={onLogout} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:8,border:"1px solid rgba(248,113,113,0.2)",background:"transparent",cursor:"pointer",transition:"all .15s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(248,113,113,0.1)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <span style={{fontSize:14}}>🚪</span>
          <span style={{fontSize:12,fontWeight:600,color:"#f87171"}}>Log Out</span>
        </button>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.2)",textAlign:"center",marginTop:2}}>Scorpion Arabia © 2025</div>
      </div>
    </aside>
  );
}

/* ── Projects Manager Modal ──────────────────────────────────────────────── */
function ProjectsModal({projects,onSave,onClose}) {
  const [list,    setList]    = useState([...projects]);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(null); // {idx, val}

  const add = () => {
    const n=newName.trim();
    if(!n||list.includes(n)) return;
    setList(l=>[...l,n]);
    setNewName("");
  };

  const del = idx => setList(l=>l.filter((_,i)=>i!==idx));

  const startEdit = (idx,val) => setEditing({idx,val});
  const commitEdit = () => {
    if(!editing) return;
    const n=editing.val.trim();
    if(n&&!list.some((x,i)=>x===n&&i!==editing.idx)){
      setList(l=>l.map((x,i)=>i===editing.idx?n:x));
    }
    setEditing(null);
  };

  return (
    <Overlay onClose={onClose}>
      <div className="slide-up" style={{background:T.sidebar,border:`1px solid ${T.border}`,borderRadius:18,width:"100%",maxWidth:460,maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"20px 22px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20,color:T.text}}>MANAGE PROJECTS</div>
            <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>Add, rename or delete projects</div>
          </div>
          <button onClick={onClose} style={{background:T.bg,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>×</button>
        </div>

        {/* Add new */}
        <div style={{padding:"14px 22px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          <div style={{display:"flex",gap:8}}>
            <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}
              placeholder="New project name…"
              style={{flex:1,background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",colorScheme:"light"}}
              onFocus={e=>e.target.style.borderColor=T.green} onBlur={e=>e.target.style.borderColor=T.border}/>
            <button onClick={add} style={{background:T.green,color:"#000",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:700,flexShrink:0}}>+ Add</button>
          </div>
        </div>

        {/* List */}
        <div style={{flex:1,overflowY:"auto",padding:"12px 22px"}}>
          <div style={{fontSize:11,fontWeight:700,color:T.textMuted,marginBottom:10,letterSpacing:".5px"}}>PROJECTS ({list.length})</div>
          {list.length===0&&<div style={{textAlign:"center",padding:"30px",color:T.textMuted,fontSize:13}}>No projects yet.</div>}
          {list.map((p,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:T.bg,borderRadius:9,marginBottom:7,border:`1px solid ${T.border}`}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:T.blue,flexShrink:0}}/>
              {editing&&editing.idx===i
                ? <input autoFocus value={editing.val} onChange={e=>setEditing({...editing,val:e.target.value})} onKeyDown={e=>{if(e.key==="Enter")commitEdit();if(e.key==="Escape")setEditing(null);}} onBlur={commitEdit}
                    style={{flex:1,background:T.inputBg,border:`1px solid ${T.blue}`,borderRadius:6,padding:"5px 9px",fontSize:13,color:T.text,outline:"none"}}/>
                : <span style={{flex:1,fontSize:14,color:T.text,cursor:"text"}} onDoubleClick={()=>startEdit(i,p)}>{p}</span>
              }
              <button onClick={()=>startEdit(i,p)} style={{background:T.blueDim,border:`1px solid ${T.blue}33`,color:T.blue,borderRadius:6,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>✎</button>
              <button onClick={()=>del(i)} style={{background:T.redDim,border:`1px solid ${T.red}33`,color:T.red,borderRadius:6,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>✕</button>
            </div>
          ))}
        </div>

        <div style={{padding:"12px 22px 22px",flexShrink:0,borderTop:`1px solid ${T.border}`}}>
          <button onClick={()=>{onSave(list);onClose();}} style={{width:"100%",background:T.blue,border:"none",color:"#000",borderRadius:10,padding:"12px",fontSize:14,fontWeight:700}}>Save Projects</button>
        </div>
      </div>
    </Overlay>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════════════════════════════ */
function Dashboard({ data, alerts, go }) {
  /* ── computed stats ── */
  const scorpionExp = data.scorpionDocs.filter(d=>{ const x=daysUntil(d.expiryDate); return x!==null&&x<=90; }).length;
  const scorpionExp30 = data.scorpionDocs.filter(d=>{ const x=daysUntil(d.expiryDate); return x!==null&&x<=30; }).length;

  const mpPeople = data.manpower.length;
  const mpCats   = data.manpowerCats.length;
  const mpDocAlerts = data.manpower.reduce((n,p)=>{
    const ds=[p.passportExpiry,p.visaExpiry,p.iqamaExpiry,p.muqeemExpiry,...(p.certs||[]).map(c=>c.expiryDate)];
    return n + ds.filter(d=>{ const x=daysUntil(d); return x!==null&&x<=90; }).length;
  },0);

  const eqTotal  = data.equipment.length;
  const eqActive = data.equipment.filter(e=>e.status==="Active").length;
  const eqMaint  = data.equipment.filter(e=>e.status==="Under Maintenance").length;
  const eqExp    = data.equipment.reduce((n,e)=>{
    const ds=[...(e.certifications||[]).map(c=>c.expiryDate),...(e.insurance||[]).map(c=>c.expiryDate),...(e.permits||[]).map(c=>c.expiryDate)];
    return n + ds.filter(d=>{ const x=daysUntil(d); return x!==null&&x<=90; }).length;
  },0);

  const totalAlerts  = alerts.length;
  const overdueCount = alerts.filter(a=>a.days<0).length;
  const expiring30   = alerts.filter(a=>a.days>=0&&a.days<=30).length;

  /* ── compliance pct (items with expiry tracked) ── */
  const allTracked = [
    ...data.scorpionDocs.filter(d=>d.expiryDate).map(d=>daysUntil(d.expiryDate)),
    ...data.manpower.flatMap(p=>[p.passportExpiry,p.visaExpiry,p.iqamaExpiry,p.muqeemExpiry,...(p.certs||[]).map(c=>c.expiryDate)].filter(Boolean).map(daysUntil)),
    ...data.equipment.flatMap(e=>[...(e.certifications||[]),...(e.insurance||[]),...(e.permits||[])].map(r=>daysUntil(r.expiryDate))),
  ];
  const validCount = allTracked.filter(d=>d!==null&&d>0).length;
  const pct = allTracked.length ? Math.round(validCount/allTracked.length*100) : 100;

  const expired  = alerts.filter(a=>a.days<0).sort((a,b)=>a.days-b.days);
  const expiring = alerts.filter(a=>a.days>=0).sort((a,b)=>a.days-b.days);

  const invoiceDocs = (data.projectDocs || []).filter(d => d.subTab === "invoices");

  return (
    <div style={{maxWidth:"min(1400px,95vw)",margin:"0 auto",width:"100%"}}>

      {/* ── Top KPI strip ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:16}}>
        {[
          {label:"Total Alerts",    v:totalAlerts,  color:totalAlerts>0?T.red:T.green,  icon:"▲"},
          {label:"Overdue",         v:overdueCount, color:overdueCount>0?T.red:T.textMuted, icon:"✕"},
          {label:"Due in 30 Days",  v:expiring30,   color:expiring30>0?T.gold:T.textMuted,  icon:"⏱"},
          {label:"Compliance",      v:`${pct}%`,    color:pct>=80?T.green:pct>=60?T.gold:T.red, icon:"◎"},
          {label:"People",          v:mpPeople,     color:T.green,  icon:"◈"},
          {label:"Equipment Assets",v:eqTotal,      color:T.gold,   icon:"◎"},
        ].map((k,i)=>(
          <div key={k.label} className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,boxShadow:"0 1px 6px rgba(26,10,0,0.06),0 0 0 1px rgba(232,213,183,0.4)",padding:"16px 18px",animationDelay:`${i*.05}s`,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:10,right:14,fontSize:26,color:k.color,opacity:.08,fontWeight:800}}>{k.icon}</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(28px,3vw,42px)",fontWeight:800,color:k.color,lineHeight:1,animation:"countUp 0.6s ease both"}}>{k.v}</div>
            <div style={{fontSize:12,color:T.textSub,marginTop:5,fontWeight:500}}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── Compliance bar ── */}
      <div className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,boxShadow:"0 2px 10px rgba(26,10,0,0.07),0 0 0 1px rgba(232,213,183,0.5)",padding:"16px 20px",marginBottom:18,animationDelay:".3s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.textSub,letterSpacing:".5px"}}>OVERALL COMPLIANCE</span>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"clamp(18px,2vw,26px)",color:pct>=80?T.green:pct>=60?T.gold:T.red}}>{pct}%</span>
        </div>
        <div style={{height:8,background:T.border,borderRadius:999}}>
          <div style={{height:"100%",width:`${pct}%`,borderRadius:999,transition:"width 1.2s cubic-bezier(0.22,1,0.36,1)",background:pct>=80?`linear-gradient(90deg,${T.green},#059669,${T.green})`:pct>=60?`linear-gradient(90deg,${T.gold},#d97706,${T.gold})`:`linear-gradient(90deg,${T.red},#dc2626,${T.red})`,backgroundSize:"200% 100%",animation:"shimmer 2s linear infinite"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:12,color:T.textSub}}>
          <span>{validCount} valid of {allTracked.length} tracked items</span>
          <span>{overdueCount>0?`${overdueCount} overdue`:"No overdue items"}</span>
        </div>
      </div>

      {/* ── Section cards ── */}
      <div style={{display:"grid",gap:18,marginBottom:18}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>
          <DashboardMiniCard
            title="SCORPION DOCUMENTS"
            sub="CR, insurance, licenses, contracts"
            icon="◉"
            color={T.blue}
            stats={[
              {label:"Total Docs", value:data.scorpionDocs.length},
              {label:"Expiring", value:scorpionExp},
              {label:"Due in 30d", value:scorpionExp30},
              {label:"Categories", value:(data.scorpionDocCats||[]).length},
            ]}
            actionLabel="Open Documents →"
            onClick={() => go("scorpion")}
          />

          <DashboardMiniCard
            title="PROJECT DOCS"
            sub="Invoices, completion certs & work orders"
            icon="◆"
            color={T.teal}
            stats={[
              {label:"Total", value:(data.projectDocs || []).length},
              {label:"Invoices", value:invoiceDocs.length},
              {label:"Projects", value:(data.projects||[]).length},
              {label:"Docs per project", value:(data.projects||[]).length > 0 ? Math.round((data.projectDocs||[]).length / (data.projects||[]).length) : 0},
            ]}
            actionLabel="Open Project Docs →"
            onClick={() => go("projects")}
          />

          <DashboardMiniCard
            title="MANPOWER"
            sub="Staff, documents & certifications"
            icon="◈"
            color={T.green}
            stats={[
              {label:"People", value:mpPeople},
              {label:"Categories", value:mpCats},
              {label:"Doc Alerts", value:mpDocAlerts},
              {label:"Certs", value:data.manpower.reduce((n,p)=>n+(p.certs||[]).length,0)},
            ]}
            footer={(data.manpowerCats||[]).slice(0,4).map(c => `${c} (${data.manpower.filter(p=>p.category===c).length})`).join("   •   ")}
            actionLabel="Open Manpower →"
            onClick={() => go("manpower")}
          />

          <DashboardMiniCard
            title="EQUIPMENT"
            sub="Assets, certs, invoices & permits"
            icon="◎"
            color={T.gold}
            stats={[
              {label:"Total Assets", value:eqTotal},
              {label:"Active", value:eqActive},
              {label:"Maintenance", value:eqMaint},
              {label:"Exp. Alerts", value:eqExp},
            ]}
            footer={`Certs: ${data.equipment.reduce((n,e)=>n+(e.certifications||[]).length,0)}   •   Invoices: ${data.equipment.reduce((n,e)=>n+(e.invoices||[]).length,0)}   •   Insurance: ${data.equipment.reduce((n,e)=>n+(e.insurance||[]).length,0)}   •   Permits: ${data.equipment.reduce((n,e)=>n+(e.permits||[]).length,0)}`}
            actionLabel="Open Equipment →"
            onClick={() => go("equipment")}
          />

          {/* Finance teaser card */}
          <div
            className="fade-up card-hover"
            onClick={() => go("finance")}
            style={{background:`linear-gradient(135deg,${T.card},${T.card2})`,border:`1px solid ${T.gold}44`,borderRadius:18,boxShadow:T.shadow,padding:"18px 18px 16px",minHeight:230,display:"flex",flexDirection:"column",cursor:"pointer",position:"relative",overflow:"hidden"}}
          >
            <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at top right,${T.goldDim},transparent 60%)`,pointerEvents:"none"}}/>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,position:"relative",zIndex:1}}>
              <div style={{width:42,height:42,borderRadius:12,background:T.goldDim,color:T.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800}}>$</div>
              <div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20,color:T.text,lineHeight:1}}>FINANCE</div>
                <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>Invoice values, collections & receivables</div>
              </div>
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,position:"relative",zIndex:1}}>
              <div style={{fontSize:38}}>🔒</div>
              <div style={{fontSize:13,color:T.textMuted,textAlign:"center"}}>Finance access required</div>
              <div style={{fontSize:12,color:T.gold,fontWeight:700}}>Click to unlock →</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Alerts split into 2 columns ── */}
      {alerts.length>0 ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:14}}>
          <div className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,boxShadow:"0 2px 10px rgba(26,10,0,0.07),0 0 0 1px rgba(232,213,183,0.5)",padding:"18px 20px",animationDelay:".55s"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <div style={{width:3,height:18,borderRadius:2,background:T.red}}/>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.red,letterSpacing:".5px"}}>OVERDUE</span>
              <span style={{background:T.redDim,color:T.red,borderRadius:999,padding:"1px 8px",fontSize:11,fontWeight:700}}>{expired.length}</span>
            </div>
            {expired.length===0
              ?<div style={{textAlign:"center",padding:"20px",color:T.textMuted,fontSize:13}}>✓ Nothing overdue</div>
              :<div style={{display:"grid",gap:7}}>
                {expired.slice(0,8).map((a,i)=><AlertRow key={i} a={a}/>)}
                {expired.length>8&&<div style={{fontSize:12,color:T.textSub,textAlign:"center",paddingTop:4}}>+{expired.length-8} more — check Alerts page</div>}
              </div>
            }
          </div>

          <div className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,boxShadow:"0 2px 10px rgba(26,10,0,0.07),0 0 0 1px rgba(232,213,183,0.5)",padding:"18px 20px",animationDelay:".62s"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <div style={{width:3,height:18,borderRadius:2,background:T.gold}}/>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.gold,letterSpacing:".5px"}}>EXPIRING SOON</span>
              <span style={{background:T.goldDim,color:T.gold,borderRadius:999,padding:"1px 8px",fontSize:11,fontWeight:700}}>{expiring.length}</span>
            </div>
            {expiring.length===0
              ?<div style={{textAlign:"center",padding:"20px",color:T.textMuted,fontSize:13}}>✓ Nothing expiring soon</div>
              :<div style={{display:"grid",gap:7}}>
                {expiring.slice(0,8).map((a,i)=><AlertRow key={i} a={a}/>)}
                {expiring.length>8&&<div style={{fontSize:12,color:T.textSub,textAlign:"center",paddingTop:4}}>+{expiring.length-8} more</div>}
              </div>
            }
          </div>
        </div>
      ) : (
        <div className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,boxShadow:"0 2px 10px rgba(26,10,0,0.07),0 0 0 1px rgba(232,213,183,0.5)",padding:"40px 20px",textAlign:"center",animationDelay:".55s"}}>
          <div style={{fontSize:44,marginBottom:12}}>✓</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.green,marginBottom:6}}>ALL CLEAR</div>
          <div style={{fontSize:13,color:T.textMuted}}>No expiring or overdue items — everything is up to date.</div>
        </div>
      )}
    </div>
  );
}

function DashboardMiniCard({ title, sub, icon, color, stats, actionLabel, onClick, footer }) {
  return (
    <div
      className="fade-up card-hover"
      onClick={onClick}
      style={{
        background:T.card,
        border:`1px solid ${T.border}`,
        borderRadius:18,
        boxShadow:T.shadow,
        padding:"18px 18px 16px",
        minHeight:230,
        display:"flex",
        flexDirection:"column",
        cursor:"pointer",
      }}
    >
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
        <div style={{width:42,height:42,borderRadius:12,background:`${color}22`,color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800}}>
          {icon}
        </div>
        <div style={{minWidth:0}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20,color:T.text,lineHeight:1}}>{title}</div>
          <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>{sub}</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(2, minmax(0,1fr))",gap:10,marginBottom:14}}>
        {stats.map((s) => (
          <div key={s.label} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 12px 10px"}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:26,color}}>{s.value}</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {footer && (
        <div style={{fontSize:11,color:T.textMuted,lineHeight:1.5,marginBottom:14}}>{footer}</div>
      )}

      <div style={{marginTop:"auto",display:"flex",justifyContent:"flex-end"}}>
        <button onClick={e=>{e.stopPropagation(); onClick?.();}} style={{background:"transparent",border:"none",color,fontSize:13,fontWeight:700,cursor:"pointer"}}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function InvoiceMetricCard({ title, amount, sub, color, onClick, miniCards = [] }) {
  const cardGlow = `0 10px 34px ${String(color || T.blue).replace(')', ',0.16)').replace('rgb', 'rgba')}`;
  return (
    <div
      className="card-hover"
      style={{
        background:`linear-gradient(180deg, ${T.card} 0%, ${T.bg} 100%)`,
        border:`1px solid ${T.border}`,
        borderRadius:18,
        padding:"18px 18px 16px",
        boxShadow:T.shadow,
        position:"relative",
        overflow:"hidden",
      }}
    >
      <div
        style={{
          position:"absolute",
          inset:0,
          pointerEvents:"none",
          background:`radial-gradient(circle at top right, ${String(color || T.blue).replace(')', ',0.14)').replace('rgb', 'rgba')} 0%, transparent 40%)`,
        }}
      />

      <button
        onClick={onClick}
        style={{
          background:"transparent",
          border:"none",
          padding:0,
          margin:0,
          width:"100%",
          textAlign:"left",
          cursor:"pointer",
          position:"relative",
          zIndex:1,
        }}
      >
        <div style={{fontSize:12,color:T.textMuted,fontWeight:700,letterSpacing:".08em",marginBottom:10}}>{title}</div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"clamp(28px,4vw,44px)",color,lineHeight:1,textShadow:darkenTextShadow(color)}}>{amount}</div>
        <div style={{fontSize:13,color:T.textMuted,marginTop:10}}>{sub}</div>
        <div style={{fontSize:12,color:color,marginTop:10,fontWeight:700}}>Click to view details →</div>
      </button>

      {miniCards.length > 0 && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10,marginTop:14,position:"relative",zIndex:1}}>
          {miniCards.map((card) => {
            const type = /advance/i.test(card.title) ? "advance" : "income";
            const theme = getMetricTypeTheme(type);
            return (
              <button
                key={card.title}
                onClick={card.onClick}
                style={{
                  background:`linear-gradient(180deg, ${theme.dim} 0%, ${T.card} 100%)`,
                  border:`1px solid ${theme.accent}55`,
                  borderRadius:14,
                  padding:"12px 12px 10px",
                  textAlign:"left",
                  cursor:"pointer",
                  boxShadow:`inset 0 1px 0 rgba(255,255,255,0.04), 0 6px 18px ${theme.glow}`,
                  transition:"transform .18s ease, box-shadow .18s ease, border-color .18s ease",
                }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 24px ${theme.glow}`; e.currentTarget.style.borderColor=`${theme.accent}88`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=`inset 0 1px 0 rgba(255,255,255,0.04), 0 6px 18px ${theme.glow}`; e.currentTarget.style.borderColor=`${theme.accent}55`;}}
              >
                <div style={{fontSize:10,color:theme.accent,fontWeight:800,letterSpacing:".09em",marginBottom:8}}>{card.title}</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:theme.accent,lineHeight:1}}>{card.amount}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function darkenTextShadow(color) {
  if (color === T.gold) return '0 2px 16px rgba(251,191,36,0.16)';
  if (color === T.blue) return '0 2px 16px rgba(56,189,248,0.16)';
  if (color === T.red) return '0 2px 16px rgba(248,113,113,0.12)';
  if (color === T.green) return '0 2px 16px rgba(52,211,153,0.12)';
  return 'none';
}

/* ════════════════════════════════════════════════════════════════════════════
   FINANCE LOGIN PAGE
   Shown when user navigates to Finance but hasn't authenticated yet.
════════════════════════════════════════════════════════════════════════════ */
function FinanceLoginPage({ onLogin }) {
  const [pw,    setPw]    = useState("");
  const [error, setError] = useState("");
  const [show,  setShow]  = useState(false);
  const [shake, setShake] = useState(false);

  const attempt = () => {
    if (!onLogin(pw)) {
      setError("Incorrect finance password. Please try again.");
      setShake(true);
      setPw("");
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      minHeight:"60vh", padding:16,
    }}>
      <div
        className="slide-up"
        style={{
          background: T.card,
          border: `1px solid ${T.gold}55`,
          borderRadius: 20,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 420,
          boxShadow: `0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px ${T.gold}22`,
          animation: shake ? "none" : undefined,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Gold glow top */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${T.gold},transparent)`,borderRadius:"20px 20px 0 0"}}/>

        {/* Header */}
        <div style={{textAlign:"center", marginBottom:28}}>
          <div style={{width:64,height:64,borderRadius:"50%",background:T.goldDim,border:`2px solid ${T.gold}55`,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,boxShadow:`0 0 24px ${T.gold}33`}}>
            🔒
          </div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,letterSpacing:"2px",color:T.gold}}>
            FINANCE ACCESS
          </div>
          <div style={{fontSize:13,color:T.textMuted,marginTop:6,lineHeight:1.5}}>
            This section is restricted.<br/>Enter the finance password to continue.
          </div>
        </div>

        {/* Password field */}
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:T.textMuted,marginBottom:8,letterSpacing:"1.5px"}}>FINANCE PASSWORD</label>
          <div style={{position:"relative"}}>
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={e => { setPw(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && attempt()}
              placeholder="Enter finance password…"
              style={{
                width:"100%",
                background:T.inputBg,
                border:`1px solid ${error ? T.red : T.border}`,
                borderRadius:10,
                padding:"12px 44px 12px 14px",
                fontSize:14,
                color:T.text,
                outline:"none",
                transition:"border-color .2s",
                colorScheme:"light",
              }}
              onFocus={e => e.target.style.borderColor = T.gold}
              onBlur={e => e.target.style.borderColor = error ? T.red : T.border}
            />
            <button onClick={() => setShow(s => !s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:T.textMuted,fontSize:16,cursor:"pointer",padding:2}}>
              {show ? "🙈" : "👁"}
            </button>
          </div>
          {error && <div style={{fontSize:12,color:T.red,marginTop:6,display:"flex",alignItems:"center",gap:5}}>⚠ {error}</div>}
        </div>

        <button
          onClick={attempt}
          style={{
            width:"100%",
            background:`linear-gradient(135deg,${T.gold},#d97706)`,
            border:"none", borderRadius:10,
            padding:"13px",
            fontFamily:"'Barlow Condensed',sans-serif",
            fontWeight:800, fontSize:16,
            color:"#080b10",
            letterSpacing:"1.5px",
            cursor:"pointer",
            boxShadow:`0 4px 20px ${T.gold}44`,
            transition:"transform .15s,box-shadow .15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow=`0 6px 28px ${T.gold}66`; }}
          onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=`0 4px 20px ${T.gold}44`; }}
        >
          UNLOCK FINANCE
        </button>

        <div style={{textAlign:"center",fontSize:11,color:T.textMuted,marginTop:16,letterSpacing:"1px"}}>
          Contact your administrator if you forgot the password
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   FINANCE PAGE
   Full financial overview — invoice values, collections, receivables.
   Only accessible after finance authentication.
════════════════════════════════════════════════════════════════════════════ */
function FinancePage({ data, selectedInvoiceYear, setSelectedInvoiceYear }) {
  const [invoiceDetailView, setInvoiceDetailView] = useState(null);

  const invoiceDocs = (data.projectDocs || []).filter(d => d.subTab === "invoices");

  const availableInvoiceYears = Array.from(
    new Set(
      invoiceDocs
        .map(doc => {
          if (!doc.dueDate) return null;
          const dt = new Date(doc.dueDate);
          return Number.isNaN(dt.getTime()) ? null : String(dt.getFullYear());
        })
        .filter(Boolean)
    )
  ).sort((a, b) => Number(b) - Number(a));

  const filteredInvoiceDocs = selectedInvoiceYear === "All"
    ? invoiceDocs
    : invoiceDocs.filter(doc => {
        if (!doc.dueDate) return false;
        const dt = new Date(doc.dueDate);
        if (Number.isNaN(dt.getTime())) return false;
        return String(dt.getFullYear()) === selectedInvoiceYear;
      });

  const totalInvoiceValue    = filteredInvoiceDocs.reduce((s,d) => s + (parseFloat(d.amount)||0), 0);
  const totalReceived        = filteredInvoiceDocs.reduce((s,d) => s + getInvoiceCollectedAmount(d), 0);
  const totalDue             = filteredInvoiceDocs.reduce((s,d) => s + getInvoiceRemainingAmount(d), 0);

  const incomeInvs   = filteredInvoiceDocs.filter(d => getInvoiceStream(d) === "income");
  const advanceInvs  = filteredInvoiceDocs.filter(d => getInvoiceStream(d) === "advance");

  const incomeInvoiced   = incomeInvs.reduce((s,d) => s + (parseFloat(d.amount)||0), 0);
  const advanceInvoiced  = advanceInvs.reduce((s,d) => s + (parseFloat(d.amount)||0), 0);

  const receivedFromIncome   = incomeInvs.reduce((s,d) => s + getInvoiceCollectedAmount(d), 0);
  const receivedFromAdvance  = advanceInvs.reduce((s,d) => s + getInvoiceCollectedAmount(d), 0);

  const dueFromIncome   = incomeInvs.reduce((s,d) => s + getInvoiceRemainingAmount(d), 0);
  const dueFromAdvance  = advanceInvs.reduce((s,d) => s + getInvoiceRemainingAmount(d), 0);

  // Per-project breakdown
  const projects = data.projects || [];
  const projectBreakdown = projects.map(proj => {
    const projInvs = filteredInvoiceDocs.filter(d => d.project === proj);
    const invoiced  = projInvs.reduce((s,d) => s + (parseFloat(d.amount)||0), 0);
    const collected = projInvs.reduce((s,d) => s + getInvoiceCollectedAmount(d), 0);
    const due       = projInvs.reduce((s,d) => s + getInvoiceRemainingAmount(d), 0);
    const pct       = invoiced > 0 ? Math.round((collected / invoiced) * 100) : 0;
    return { proj, invoiced, collected, due, pct, count: projInvs.length };
  }).filter(p => p.invoiced > 0 || p.count > 0).sort((a,b) => b.invoiced - a.invoiced);

  // Collection rate
  const collectionRate = totalInvoiceValue > 0 ? Math.round((totalReceived / totalInvoiceValue) * 100) : 0;

  return (
    <div style={{maxWidth:"min(1400px,95vw)",margin:"0 auto",width:"100%"}}>

      {/* ── Page header ── */}
      <div className="fade-up" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:32,color:T.text,display:"flex",alignItems:"center",gap:10}}>
            <span style={{color:T.gold}}>$</span> FINANCE OVERVIEW
          </div>
          <div style={{fontSize:13,color:T.textMuted,marginTop:4}}>
            Invoice values, collections & receivables · Finance personnel only
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <label style={{fontSize:12,fontWeight:700,color:T.textMuted}}>YEAR</label>
          <select
            value={selectedInvoiceYear}
            onChange={e => setSelectedInvoiceYear(e.target.value)}
            style={{background:T.inputBg,color:T.text,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",fontSize:13,fontWeight:600,outline:"none"}}
          >
            <option value="All">All Years</option>
            {availableInvoiceYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* ── Summary KPI bar ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:20}}>
        {[
          {label:"Total Invoiced",    v:formatSarCompact(totalInvoiceValue),  color:T.green,  icon:"📋"},
          {label:"Total Collected",   v:formatSarCompact(totalReceived),      color:T.blue,   icon:"✓"},
          {label:"Total Outstanding", v:formatSarCompact(totalDue),           color:T.red,    icon:"⏳"},
          {label:"Collection Rate",   v:`${collectionRate}%`,                 color:collectionRate>=80?T.green:collectionRate>=50?T.gold:T.red, icon:"◎"},
          {label:"Total Invoices",    v:filteredInvoiceDocs.length,            color:T.purple, icon:"◆"},
        ].map((k,i) => (
          <div key={k.label} className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 18px",animationDelay:`${i*.05}s`,position:"relative",overflow:"hidden",boxShadow:T.shadow}}>
            <div style={{position:"absolute",top:10,right:14,fontSize:22,opacity:.1}}>{k.icon}</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(22px,2.5vw,36px)",fontWeight:800,color:k.color,lineHeight:1}}>{k.v}</div>
            <div style={{fontSize:11,color:T.textSub,marginTop:5,fontWeight:500}}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── Collection rate bar ── */}
      <div className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 20px",marginBottom:20,animationDelay:".28s",boxShadow:T.shadow}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.textSub,letterSpacing:".5px"}}>COLLECTION RATE</span>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"clamp(18px,2vw,26px)",color:collectionRate>=80?T.green:collectionRate>=50?T.gold:T.red}}>{collectionRate}%</span>
        </div>
        <div style={{height:8,background:T.border,borderRadius:999}}>
          <div style={{height:"100%",width:`${collectionRate}%`,borderRadius:999,transition:"width 1.2s cubic-bezier(0.22,1,0.36,1)",background:collectionRate>=80?`linear-gradient(90deg,${T.green},#059669)`:collectionRate>=50?`linear-gradient(90deg,${T.gold},#d97706)`:`linear-gradient(90deg,${T.red},#dc2626)`}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:12,color:T.textSub}}>
          <span>{formatSarCompact(totalReceived)} collected of {formatSarCompact(totalInvoiceValue)} invoiced</span>
          <span style={{color:T.red}}>{formatSarCompact(totalDue)} outstanding</span>
        </div>
      </div>

      {/* ── Invoice metric cards ── */}
      <div className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,boxShadow:T.shadow,padding:"22px",marginBottom:20,animationDelay:".32s"}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text,marginBottom:4}}>
          INVOICE VALUE {selectedInvoiceYear !== "All" ? `— ${selectedInvoiceYear}` : "— ALL YEARS"}
        </div>
        <div style={{fontSize:13,color:T.textMuted,marginBottom:20}}>
          {selectedInvoiceYear === "All" ? `Across all ${filteredInvoiceDocs.length} invoices` : `For ${selectedInvoiceYear} · ${filteredInvoiceDocs.length} invoices`}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>
          <InvoiceMetricCard
            title="TOTAL INVOICE VALUE"
            amount={formatSarCompact(totalInvoiceValue)}
            sub={`${filteredInvoiceDocs.length} invoices · ${selectedInvoiceYear === "All" ? "all years" : selectedInvoiceYear}`}
            color={T.green}
            onClick={() => setInvoiceDetailView({ mode:"all", stream:"all" })}
            miniCards={[
              { title:"INCOME INVOICED",  amount:formatSarCompact(incomeInvoiced),  color:T.green, onClick:() => setInvoiceDetailView({mode:"all",stream:"income"}) },
              { title:"ADVANCE INVOICED", amount:formatSarCompact(advanceInvoiced), color:T.gold,  onClick:() => setInvoiceDetailView({mode:"all",stream:"advance"}) },
            ]}
          />
          <InvoiceMetricCard
            title="AMOUNT RECEIVED"
            amount={formatSarCompact(totalReceived)}
            sub={selectedInvoiceYear === "All" ? "Collected across all invoices" : `Collected for ${selectedInvoiceYear}`}
            color={T.blue}
            onClick={() => setInvoiceDetailView({ mode:"received", stream:"all" })}
            miniCards={[
              { title:"RECEIVED FROM INCOME",  amount:formatSarCompact(receivedFromIncome),  color:T.blue, onClick:() => setInvoiceDetailView({mode:"received",stream:"income"}) },
              { title:"RECEIVED FROM ADVANCE", amount:formatSarCompact(receivedFromAdvance), color:T.teal, onClick:() => setInvoiceDetailView({mode:"received",stream:"advance"}) },
            ]}
          />
          <InvoiceMetricCard
            title="AMOUNT DUE"
            amount={formatSarCompact(totalDue)}
            sub={selectedInvoiceYear === "All" ? "Pending and partial balances" : `Outstanding for ${selectedInvoiceYear}`}
            color={T.red}
            onClick={() => setInvoiceDetailView({ mode:"due", stream:"all" })}
            miniCards={[
              { title:"DUE FROM INCOME",  amount:formatSarCompact(dueFromIncome),  color:T.red,    onClick:() => setInvoiceDetailView({mode:"due",stream:"income"}) },
              { title:"DUE FROM ADVANCE", amount:formatSarCompact(dueFromAdvance), color:T.orange, onClick:() => setInvoiceDetailView({mode:"due",stream:"advance"}) },
            ]}
          />
        </div>
      </div>

      {/* ── Per-project breakdown ── */}
      {projectBreakdown.length > 0 && (
        <div className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,boxShadow:T.shadow,padding:"22px",marginBottom:20,animationDelay:".4s"}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text,marginBottom:4}}>
            PER-PROJECT BREAKDOWN
          </div>
          <div style={{fontSize:13,color:T.textMuted,marginBottom:20}}>
            Invoice collection status by project {selectedInvoiceYear !== "All" ? `for ${selectedInvoiceYear}` : ""}
          </div>
          <div style={{display:"grid",gap:12}}>
            {projectBreakdown.map((p, i) => (
              <div key={p.proj} className="fade-up" style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 18px",animationDelay:`${i*.04}s`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:10}}>
                  <div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.text}}>{p.proj}</div>
                    <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>{p.count} invoice{p.count!==1?"s":""}</div>
                  </div>
                  <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.green}}>{formatSarCompact(p.invoiced)}</div>
                      <div style={{fontSize:10,color:T.textMuted,fontWeight:600}}>INVOICED</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.blue}}>{formatSarCompact(p.collected)}</div>
                      <div style={{fontSize:10,color:T.textMuted,fontWeight:600}}>COLLECTED</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:p.due>0?T.red:T.green}}>{formatSarCompact(p.due)}</div>
                      <div style={{fontSize:10,color:T.textMuted,fontWeight:600}}>DUE</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.textMuted,marginBottom:4}}>
                    <span>Collection progress</span>
                    <span style={{fontWeight:700,color:pctColor(p.pct)}}>{p.pct}%</span>
                  </div>
                  <div style={{height:6,background:T.border,borderRadius:999,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${p.pct}%`,borderRadius:999,background:`linear-gradient(90deg,${pctColor(p.pct)},${pctColor(p.pct)}bb)`,transition:"width 1s"}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Invoice detail modal ── */}
      {invoiceDetailView && (
        <InvoiceYearDetailsModal
          view={invoiceDetailView}
          invoices={filteredInvoiceDocs}
          yearLabel={selectedInvoiceYear}
          onClose={() => setInvoiceDetailView(null)}
        />
      )}

      {/* ── Empty state ── */}
      {filteredInvoiceDocs.length === 0 && (
        <div className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"48px 20px",textAlign:"center",boxShadow:T.shadow}}>
          <div style={{fontSize:44,marginBottom:12}}>📋</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.textSub,marginBottom:8}}>NO INVOICES</div>
          <div style={{fontSize:13,color:T.textMuted}}>
            {selectedInvoiceYear === "All"
              ? "No invoices found. Add invoices in Project Docs to see financial data here."
              : `No invoices found for ${selectedInvoiceYear}. Try selecting a different year.`}
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceYearDetailsModal({ view, invoices, yearLabel, onClose }) {
  const rawMode = typeof view === "string" ? view : view?.mode;
  const rawStream = typeof view === "object" && view?.stream ? view.stream : "all";
  const normalizedView = rawMode === "received" ? "received" : rawMode === "due" ? "due" : "all";
  const normalizedStream = rawStream === "income" ? "income" : rawStream === "advance" ? "advance" : "all";

  const streamLabel = normalizedStream === "income"
    ? "Income"
    : normalizedStream === "advance"
    ? "Advance"
    : "All";

  const title = normalizedView === "received"
    ? normalizedStream === "all" ? "Amount Received Details" : `Received from ${streamLabel} Details`
    : normalizedView === "due"
    ? normalizedStream === "all" ? "Amount Due Details" : `Due from ${streamLabel} Details`
    : normalizedStream === "all"
    ? "Invoice Details"
    : `${streamLabel} Invoice Details`;

  const rows = invoices.filter((doc) => {
    const matchesStream = normalizedStream === "all" ? true : getInvoiceStream(doc) === normalizedStream;
    if (!matchesStream) return false;
    if (normalizedView === "received") return getInvoiceCollectedAmount(doc) > 0;
    if (normalizedView === "due") return getInvoiceRemainingAmount(doc) > 0;
    return true;
  });

  const totalAmount = rows.reduce((sum, doc) => sum + (parseFloat(doc.amount) || 0), 0);
  const totalReceived = rows.reduce((sum, doc) => sum + getInvoiceCollectedAmount(doc), 0);
  const totalDue = rows.reduce((sum, doc) => sum + getInvoiceRemainingAmount(doc), 0);

  return (
    <Overlay onClose={onClose}>
      <div className="slide-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,width:"min(1100px, calc(100vw - 24px))",maxWidth:"calc(100vw - 24px)",maxHeight:"calc(100vh - 24px)",display:"flex",flexDirection:"column",boxShadow:T.shadow}}>
        <div style={{padding:"18px 22px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexShrink:0}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,color:T.text}}>{title}</div>
            <div style={{fontSize:13,color:T.textMuted,marginTop:4}}>{yearLabel === "All" ? "All years" : `Year ${yearLabel}`} • {rows.length} invoice{rows.length !== 1 ? "s" : ""}</div>
          </div>
          <button onClick={onClose} style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,borderRadius:10,width:38,height:38,fontSize:20,cursor:"pointer"}}>×</button>
        </div>

        <div style={{padding:"16px 22px",borderBottom:`1px solid ${T.border}`,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,flexShrink:0}}>
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:11,color:T.textMuted,fontWeight:700,letterSpacing:".08em"}}>TOTAL VALUE</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:28,color:T.green,marginTop:6}}>{formatSarCompact(totalAmount)}</div>
          </div>
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:11,color:T.textMuted,fontWeight:700,letterSpacing:".08em"}}>RECEIVED</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:28,color:T.blue,marginTop:6}}>{formatSarCompact(totalReceived)}</div>
          </div>
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:11,color:T.textMuted,fontWeight:700,letterSpacing:".08em"}}>DUE</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:28,color:T.red,marginTop:6}}>{formatSarCompact(totalDue)}</div>
          </div>
        </div>

        <div style={{padding:"14px 22px 22px",overflowY:"auto"}}>
          {rows.length === 0 ? (
            <div style={{textAlign:"center",padding:"40px 20px",color:T.textMuted}}>No invoices found for this section.</div>
          ) : (
            <div style={{display:"grid",gap:10}}>
              {rows.map((doc) => {
                const total = parseFloat(doc.amount) || 0;
                const received = getInvoiceCollectedAmount(doc);
                const due = getInvoiceRemainingAmount(doc);
                const status = String(doc.paymentStatus || doc.status || "Pending");
                const statusColor = /paid|received/i.test(status) ? T.green : /partial/i.test(status) ? T.gold : T.red;
                const stream = getInvoiceStream(doc);
                return (
                  <div key={doc.id} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 16px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:"wrap"}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20,color:T.text}}>{doc.name || "Invoice"}</div>
                          {doc.refNo && <Tag color={T.green}>#{doc.refNo}</Tag>}
                          {doc.project && <Tag color={T.blue}>{doc.project}</Tag>}
                          <Tag color={stream === "advance" ? T.gold : T.teal}>{stream === "advance" ? "Advance" : "Income"}</Tag>
                          <Tag color={statusColor}>{status}</Tag>
                        </div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
                          {doc.dueDate && <Chip color={T.gold}>Due: {fmtDate(doc.dueDate)}</Chip>}
                          <Chip color={T.green}>Total: {formatSarCompact(total)}</Chip>
                          <Chip color={T.blue}>Received: {formatSarCompact(received)}</Chip>
                          <Chip color={T.red}>Due: {formatSarCompact(due)}</Chip>
                          {doc.fileLink && <FileLink href={doc.fileLink} />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}

function AlertRow({a}) {
  const s=getStatus(a.days);
  const SRC_COLOR={"Company Doc":T.blue,"Passport":T.purple,"Visa":T.teal,"Iqama":T.green,"Muqeem":T.orange,"Cert":T.green,"Eq Cert":T.blue,"Insurance":T.purple,"Permit":T.gold};
  const sc=SRC_COLOR[a.src]||T.blue;
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:T.bg,borderRadius:9,border:`1px solid ${T.border}`}}>
      <div style={{width:3,height:32,borderRadius:2,background:s.color,flexShrink:0}}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,fontWeight:600,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.label}</div>
        <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
          <span style={{background:`${sc}18`,color:sc,borderRadius:4,padding:"0px 6px",fontSize:9,fontWeight:700}}>{a.src}</span>
          {a.project&&<span style={{fontSize:10,color:T.textMuted}}>{a.project}</span>}
        </div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:s.color,lineHeight:1}}>{Math.abs(a.days)}</div>
        <div style={{fontSize:8,color:T.textMuted,fontWeight:600,letterSpacing:".3px"}}>{a.days<0?"OVERDUE":"DAYS LEFT"}</div>
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════════════════
   PROJECT DOCS
════════════════════════════════════════════════════════════════════════════ */
const PD_TABS = [
  {id:"invoices",      label:"Invoices",                    icon:"🧾", color:T.green,  dim:T.greenDim},
  {id:"certificates",  label:"Job Completion Certificates", icon:"📜", color:T.blue,   dim:T.blueDim},
  {id:"workorders",    label:"Work Orders / Agreements",    icon:"📋", color:T.purple, dim:T.purpleDim},
  {id:"dailyreports",  label:"Daily Reports",               icon:"📅", color:T.gold,   dim:T.goldDim},
];

/* ════════════════════════════════════════════════════════════════════════════
   PROJECT DOCS
════════════════════════════════════════════════════════════════════════════ */
function ProjectDocs({data,setData,showToast}) {
  // ALL hooks must be at the top — never after a conditional return
  const [selectedProject, setSelectedProject] = useState(null);
  const [subTab,  setSubTab]  = useState("invoices");
  const [selProj, setSelProj] = useState(null);
  const [modal,   setModal]   = useState(null);
  const [fProj,   setFProj]   = useState("");
  const [bulkModal, setBulkModal] = useState(false);
  const [multiPdfModal, setMultiPdfModal] = useState(null);
  const docs     = data.projectDocs || [];
  const projects = data.projects    || [];
  const cur      = PD_TABS.find(t=>t.id===subTab);
  const counts   = Object.fromEntries(PD_TABS.map(t=>[t.id, docs.filter(d=>d.subTab===t.id).length]));

  const openProject = (project) => {
    setSelectedProject(project);
    setSelProj(project);
    setFProj(project);
  };

  const backToProjects = () => {
    setSelectedProject(null);
    setSelProj(null);
    setFProj("");
  };

  const changeTab = t => { setSubTab(t); if (selectedProject) { setSelProj(selectedProject); setFProj(selectedProject); } else { setSelProj(null); setFProj(""); } };

  const saveDoc = (doc, mode) => {
    const st = subTab; // capture before any state changes
    // Close modal FIRST so it unmounts cleanly before data update triggers re-render
    setModal(null);
    setTimeout(() => {
      setData(prev=>{
        const list=[...prev.projectDocs];
        if(mode==="add") list.push({...doc,id:uid(),subTab:st});
        else { const i=list.findIndex(d=>d.id===doc.id); if(i>=0) list[i]={...doc,subTab:st}; }
        return{...prev,projectDocs:list};
      });
      showToast(mode==="add"?"Document added":"Updated");
    }, 0);
  };

  const delDoc = id => {
    setData(prev=>({...prev,projectDocs:prev.projectDocs.filter(d=>d.id!==id)}));
    showToast("Deleted","del");
  };

  // ── Derived data (no hooks below this line) ───────────────────────────
  const invDocs   = docs.filter(d=>d.subTab==="invoices");
  const projInvs  = selProj ? invDocs.filter(d=>d.project===selProj) : [];
  const totalAmt  = projInvs.reduce((s,d)=>s+(parseFloat(d.amount)||0),0);

  const certAll   = docs.filter(d=>d.subTab==="certificates");
  const projCerts = selProj ? certAll.filter(d=>d.project===selProj) : [];

  const woAll     = docs.filter(d=>d.subTab==="workorders");
  const projWOs   = selProj ? woAll.filter(d=>d.project===selProj) : [];
  const woDocs    = fProj ? woAll.filter(d=>d.project===fProj) : woAll;

  const drAll     = docs.filter(d=>d.subTab==="dailyreports");
  const projDRs   = selProj ? drAll.filter(d=>d.project===selProj) : [];

  if (!selectedProject) {
    return (
      <div style={{maxWidth:"min(1400px,95vw)",margin:"0 auto",width:"100%"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:18}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:28,color:T.text}}>PROJECTS</div>
            <div style={{fontSize:13,color:T.textMuted,marginTop:4}}>Select a project to view invoices, certificates, work orders and daily reports</div>
          </div>
        </div>

        {projects.length===0
          ? <Empty icon="◆" label="No projects yet" sub="Add projects from Manage Projects in the sidebar" color={T.blue} onAdd={()=>{}}/>
          : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
              {projects.map((project,i)=>{
                const projectDocs = docs.filter(d=>d.project===project);
                const projectInvoices = projectDocs.filter(d=>d.subTab==="invoices");
                const projectCerts = projectDocs.filter(d=>d.subTab==="certificates");
                const projectWos = projectDocs.filter(d=>d.subTab==="workorders");
                const projectDailyReports = projectDocs.filter(d=>d.subTab==="dailyreports");

                return (
                  <button
                    key={project}
                    type="button"
                    onClick={()=>openProject(project)}
                    className="fade-up card-hover"
                    style={{
                      background:T.card,
                      border:`1px solid ${T.border}`,
                      borderRadius:18,
                      boxShadow:T.shadow,
                      padding:"18px",
                      textAlign:"left",
                      cursor:"pointer",
                      animationDelay:`${i*.04}s`
                    }}
                  >
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:14}}>
                      <div style={{minWidth:0}}>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{project}</div>
                        <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>{projectDocs.length} total document{projectDocs.length!==1?"s":""}</div>
                      </div>
                      <div style={{width:42,height:42,borderRadius:12,background:T.blueDim,display:"flex",alignItems:"center",justifyContent:"center",color:T.blue,fontSize:18,fontWeight:800,flexShrink:0}}>◆</div>
                    </div>

                    <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>
                      <div style={{background:T.greenDim,border:`1px solid ${T.green}33`,borderRadius:12,padding:"12px"}}>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:800,color:T.green,lineHeight:1}}>{projectInvoices.length}</div>
                        <div style={{fontSize:11,color:T.green,marginTop:6,fontWeight:700}}>🧾 Invoices</div>
                      </div>
                      <div style={{background:T.blueDim,border:`1px solid ${T.blue}33`,borderRadius:12,padding:"12px"}}>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:800,color:T.blue,lineHeight:1}}>{projectCerts.length}</div>
                        <div style={{fontSize:11,color:T.blue,marginTop:6,fontWeight:700}}>📜 Certificates</div>
                      </div>
                      <div style={{background:T.purpleDim,border:`1px solid ${T.purple}33`,borderRadius:12,padding:"12px"}}>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:800,color:T.purple,lineHeight:1}}>{projectWos.length}</div>
                        <div style={{fontSize:11,color:T.purple,marginTop:6,fontWeight:700}}>📋 Work Orders</div>
                      </div>
                      <div style={{background:T.goldDim,border:`1px solid ${T.gold}33`,borderRadius:12,padding:"12px"}}>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:800,color:T.gold,lineHeight:1}}>{projectDailyReports.length}</div>
                        <div style={{fontSize:11,color:T.gold,marginTop:6,fontWeight:700}}>📅 Daily Reports</div>
                      </div>
                    </div>

                    <div style={{marginTop:14,fontSize:12,color:T.blue,fontWeight:700,textAlign:"right"}}>Open Project →</div>
                  </button>
                );
              })}
            </div>
        }
      </div>
    );
  }

  return (
    <div style={{maxWidth:"min(1400px,95vw)",margin:"0 auto",width:"100%"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:16}}>
        <div>
          <button onClick={backToProjects} style={{background:"transparent",border:"none",color:T.blue,fontWeight:700,cursor:"pointer",marginBottom:6,padding:0}}>← Back to Projects</button>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:26,color:T.text}}>{selectedProject}</div>
          <div style={{fontSize:13,color:T.textMuted,marginTop:3}}>Project dashboard and document records</div>
        </div>
      </div>
      <SubTabBar tabs={PD_TABS} active={subTab} counts={counts} onChange={changeTab}/>

      {/* ══ INVOICES ════════════════════════════════════════════════════ */}
      {subTab==="invoices" && (
        selProj ? (
          /* Project detail — invoice list */
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <button onClick={backToProjects} style={{background:T.card,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:600}}>← Back</button>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:26,color:T.text}}>{selectedProject}</div>
                <div style={{fontSize:14,color:T.textMuted,marginTop:3}}>
                  {projInvs.length} invoice{projInvs.length!==1?"s":""} · Total: <span style={{color:T.green,fontWeight:700}}>SAR {totalAmt.toLocaleString()}</span>
                </div>
              </div>
              <Btn color={T.green} solid onClick={()=>setModal({mode:"add",doc:{project:selProj}})}>+ Add Invoice</Btn>
            </div>
            {projInvs.length===0
              ?<Empty icon="🧾" label="No invoices yet" sub="Add the first invoice for this project" color={T.green} onAdd={()=>setModal({mode:"add",doc:{project:selProj}})}/>
              :<div style={{display:"grid",gap:10}}>
                {projInvs.map((doc,i)=><InvoiceCard key={doc.id} doc={doc} delay={i*.03} onEdit={()=>setModal({mode:"edit",doc})} onDel={()=>delDoc(doc.id)}/>)}
              </div>
            }
          </div>
        ) : (
          /* Project grid */
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:18}}>
              <div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text}}>INVOICES</div>
                <div style={{fontSize:13,color:T.textMuted,marginTop:2}}>Select a project to view and manage its invoices</div>
              </div>
              <Btn color={T.green} solid onClick={()=>setModal({mode:"add"})}>+ Add Invoice</Btn>
            </div>
            {projects.length===0
              ?<Empty icon="🧾" label="No projects yet" sub="Add projects via Manage Projects in the sidebar" color={T.green} onAdd={()=>{}}/>
              :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
                {projects.map((p,i)=>{
                  const pinvs=invDocs.filter(d=>d.project===p);
                  const total=pinvs.reduce((s,d)=>s+(parseFloat(d.amount)||0),0);
                  return (
                    <div key={p} className="fade-up" onClick={()=>openProject(p)}
                      style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,boxShadow:"0 2px 10px rgba(26,10,0,0.07),0 0 0 1px rgba(232,213,183,0.5)",padding:"20px",cursor:"pointer",animationDelay:`${i*.05}s`,transition:"border-color .2s,transform .2s"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.green;e.currentTarget.style.transform="translateY(-2px)";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="none";}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                        <div style={{width:38,height:38,background:T.greenDim,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🧾</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"clamp(14px,1.1vw,17px)",color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p}</div>
                          <div style={{fontSize:12,color:T.textSub,marginTop:2}}>{pinvs.length} invoice{pinvs.length!==1?"s":""}</div>
                        </div>
                      </div>
                      <div style={{background:T.greenDim,border:`1px solid ${T.green}33`,borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:800,color:T.green,lineHeight:1}}>{pinvs.length}</span>
                        <span style={{fontSize:12,color:T.green,fontWeight:700}}>Total Invoices</span>
                      </div>
                      <div style={{fontSize:12,color:T.green,fontWeight:600,textAlign:"right",marginTop:10}}>View Invoices →</div>
                    </div>
                  );
                })}
              </div>
            }
          </div>
        )
      )}

      {/* ══ CERTIFICATES ════════════════════════════════════════════════ */}
      {subTab==="certificates" && (
  selProj ? (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button
          onClick={backToProjects}
          style={{
            background:T.card,
            border:`1px solid ${T.border}`,
            color:T.textSub,
            borderRadius:8,
            padding:"8px 14px",
            fontSize:13,
            fontWeight:600
          }}
        >
          ← Back
        </button>

        <div style={{flex:1}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:26,color:T.text}}>
            {selectedProject}
          </div>
          <div style={{fontSize:14,color:T.textMuted,marginTop:3}}>
            {projCerts.length} certificate{projCerts.length!==1?"s":""}
          </div>
        </div>

        <Btn color={T.blue} solid onClick={()=>setModal({mode:"add",doc:{project:selProj}})}>
          <div style={{display:"flex", gap:8}}>
  <Btn color={T.blue} onClick={()=>setMultiPdfModal({project:selProj})}>⬆ Upload PDFs</Btn>
  <Btn color={T.blue} solid onClick={()=>setModal({mode:"add",doc:{project:selProj}})}>+ Add Manually</Btn>
</div>
        </Btn>
      </div>

      {projCerts.length===0
        ? <Empty
            icon="📜"
            label="No certificates yet"
            sub="Add the first certificate for this project"
            color={T.blue}
            onAdd={()=>setModal({mode:"add",doc:{project:selProj}})}
          />
        : <div style={{display:"grid",gap:10}}>
            {projCerts.map((doc,i)=>(
              <div
                key={doc.id}
                className="fade-up"
                style={{
                  background:T.card,
                  border:`1px solid ${T.border}`,
                  borderLeft:`4px solid ${T.blue}`,
                  borderRadius:12,
                  padding:"16px 18px",
                  animationDelay:`${i*.03}s`,
                  display:"flex",
                  alignItems:"flex-start",
                  gap:14
                }}
              >
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
                    <span style={{
  fontFamily:"'Barlow Condensed',sans-serif",
  fontWeight:800,
  fontSize:"clamp(14px,1.1vw,17px)",
  color:T.text
}}>
  {doc.jobNo ? `JOB ${doc.jobNo}` : "Job Completion Certificate"}
</span>
                    {doc.project && <Tag color={T.blue}>{doc.project}</Tag>}
                  </div>

                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {doc.refNo && <Chip>Ref: {doc.refNo}</Chip>}
                    {doc.client && <Chip>Client: {doc.client}</Chip>}
                    {doc.amount && <Chip color={T.green}>SAR {Number(doc.amount).toLocaleString()}</Chip>}
                    {doc.date && <Chip>Date: {fmtDate(doc.date)}</Chip>}
                    {doc.fileLink && <FileLink href={doc.fileLink}/>}
                  </div>

                  {doc.notes && (
                    <div style={{marginTop:6,fontSize:12,color:T.textMuted,fontStyle:"italic"}}>
                      {doc.notes}
                    </div>
                  )}
                </div>

                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <ABtn color={T.blue} onClick={()=>setModal({mode:"edit",doc})}>✎</ABtn>
                  <ABtn color={T.red} onClick={()=>delDoc(doc.id)}>✕</ABtn>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  ) : (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:18}}>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text}}>
            JOB COMPLETION CERTIFICATES
          </div>
          <div style={{fontSize:13,color:T.textMuted,marginTop:2}}>
            Select a project to view and manage its certificates
          </div>
        </div>
        <Btn color={T.blue} solid onClick={()=>setModal({mode:"add"})}>
          + Add Certificate
        </Btn>
      </div>

      {projects.length===0
        ? <Empty
            icon="📜"
            label="No projects yet"
            sub="Add projects via Manage Projects in the sidebar"
            color={T.blue}
            onAdd={()=>{}}
          />
        : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
            {projects.map((p,i)=>{
              const pcerts = certAll.filter(d=>d.project===p);

              return (
                <div
                  key={p}
                  className="fade-up"
                  onClick={()=>openProject(p)}
                  style={{
                    background:T.card,
                    border:`1px solid ${T.border}`,
                    borderRadius:14,
                    boxShadow:"0 2px 10px rgba(26,10,0,0.07),0 0 0 1px rgba(232,213,183,0.5)",
                    padding:"20px",
                    cursor:"pointer",
                    animationDelay:`${i*.05}s`,
                    transition:"border-color .2s,transform .2s"
                  }}
                  onMouseEnter={e=>{
                    e.currentTarget.style.borderColor=T.blue;
                    e.currentTarget.style.transform="translateY(-2px)";
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.style.borderColor=T.border;
                    e.currentTarget.style.transform="none";
                  }}
                >
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <div style={{width:38,height:38,background:T.blueDim,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
                      📜
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"clamp(14px,1.1vw,17px)",color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {p}
                      </div>
                      <div style={{fontSize:12,color:T.textSub,marginTop:2}}>
                        {pcerts.length} certificate{pcerts.length!==1?"s":""}
                      </div>
                    </div>
                  </div>

                  <div style={{background:T.bg,borderRadius:8,padding:"10px 12px",marginBottom:10}}>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:800,color:T.blue,lineHeight:1}}>
                      {pcerts.length}
                    </div>
                    <div style={{fontSize:12,color:T.textSub,marginTop:4,fontWeight:800}}>
                      Total Certificates
                    </div>
                  </div>

                  <div style={{fontSize:12,color:T.blue,fontWeight:600,textAlign:"right"}}>
                    View Certificates →
                  </div>
                </div>
              );
            })}
          </div>
      }
    </div>
  )
)}

      {/* ══ WORK ORDERS ═════════════════════════════════════════════════ */}
      {subTab==="workorders" && (
        <div>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:18}}>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text}}>WORK ORDERS / AGREEMENTS</div>
              <div style={{fontSize:13,color:T.textMuted,marginTop:2}}>Contracts and work orders with clients</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <select value={fProj} onChange={e=>setFProj(e.target.value)} style={{background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:T.textSub,outline:"none",colorScheme:"light"}}>
                <option value="">All Projects</option>
                {projects.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
              <Btn color={T.purple} solid onClick={()=>setModal({mode:"add"})}>+ Add Work Order</Btn>
            </div>
          </div>
          <div style={{fontSize:13,color:T.textMuted,marginBottom:12}}>{woDocs.length} record{woDocs.length!==1?"s":""}</div>
          {woDocs.length===0
            ?<Empty icon="📋" label="No work orders yet" sub="Add your first work order or agreement" color={T.purple} onAdd={()=>setModal({mode:"add"})}/>
            :<div style={{display:"grid",gap:10}}>
              {woDocs.map((doc,i)=>{
                const hasExp=!!doc.expiryDate;
                const s=getStatus(daysUntil(doc.expiryDate));
                return (
                  <div key={doc.id} className="fade-up"
                    style={{background:T.card,border:`1px solid ${hasExp&&daysUntil(doc.expiryDate)<=90?s.color+"44":T.border}`,borderLeft:"4px solid "+T.purple,borderRadius:12,padding:"16px 18px",animationDelay:`${i*.03}s`,display:"flex",alignItems:"flex-start",gap:14}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"clamp(14px,1.1vw,17px)",color:T.text}}>{doc.name}</span>
                        {doc.project&&<Tag color={T.teal}>{doc.project}</Tag>}
                        {hasExp&&<Tag color={s.color}>{s.label}</Tag>}
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {doc.refNo&&<Chip>Ref: {doc.refNo}</Chip>}
                        {doc.supplier&&<Chip>Client: {doc.supplier}</Chip>}
                        {doc.amount&&<Chip color={T.green}>SAR {Number(doc.amount).toLocaleString()}</Chip>}
                        {doc.date&&<Chip>Signed: {fmtDate(doc.date)}</Chip>}
                        {hasExp&&<Chip color={s.color}>Expires: {fmtDate(doc.expiryDate)}</Chip>}
                        {hasExp&&daysUntil(doc.expiryDate)!==null&&daysUntil(doc.expiryDate)<=90&&<Chip color={s.color}>{daysUntil(doc.expiryDate)>=0?`${daysUntil(doc.expiryDate)}d left`:`${Math.abs(daysUntil(doc.expiryDate))}d overdue`}</Chip>}
                        {doc.fileLink&&<FileLink href={doc.fileLink}/>}
                      </div>
                      {doc.notes&&<div style={{marginTop:6,fontSize:12,color:T.textMuted,fontStyle:"italic"}}>{doc.notes}</div>}
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      <ABtn color={T.blue} onClick={()=>setModal({mode:"edit",doc})}>✎</ABtn>
                      <ABtn color={T.red}  onClick={()=>delDoc(doc.id)}>✕</ABtn>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </div>
      )}

      {/* ══ DAILY REPORTS ═══════════════════════════════════════════════ */}
      {subTab==="dailyreports" && (
        selProj ? (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <button onClick={backToProjects} style={{background:T.card,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:600}}>← Back</button>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:26,color:T.text}}>{selectedProject}</div>
                <div style={{fontSize:14,color:T.textMuted,marginTop:3}}>{projDRs.length} daily report{projDRs.length!==1?"s":""}</div>
              </div>
              <Btn color={T.gold} solid onClick={()=>setModal({mode:"add",doc:{project:selProj}})}>+ Add Report</Btn>
            </div>
            {projDRs.length===0
              ?<Empty icon="📅" label="No daily reports yet" sub="Add the first daily report for this project" color={T.gold} onAdd={()=>setModal({mode:"add",doc:{project:selProj}})}/>
              :<div style={{display:"grid",gap:10}}>
                {projDRs.map((doc,i)=>(
                  <div key={doc.id} className="fade-up"
                    style={{background:T.card,border:`1px solid ${T.border}`,borderLeft:`4px solid ${T.gold}`,borderRadius:12,padding:"16px 18px",animationDelay:`${i*.03}s`,display:"flex",alignItems:"flex-start",gap:14}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"clamp(14px,1.1vw,17px)",color:T.text}}>{doc.name}</span>
                        {doc.project&&<Tag color={T.teal}>{doc.project}</Tag>}
                        {doc.date&&<Tag color={T.gold}>{fmtDate(doc.date)}</Tag>}
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {doc.refNo&&<Chip>Ref: {doc.refNo}</Chip>}
                        {doc.fileLink&&<FileLink href={doc.fileLink}/>}
                      </div>
                      {doc.notes&&<div style={{marginTop:6,fontSize:12,color:T.textMuted,fontStyle:"italic"}}>{doc.notes}</div>}
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      <ABtn color={T.blue} onClick={()=>setModal({mode:"edit",doc})}>✎</ABtn>
                      <ABtn color={T.red}  onClick={()=>delDoc(doc.id)}>✕</ABtn>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        ) : (
          <div>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:18}}>
              <div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text}}>DAILY REPORTS</div>
                <div style={{fontSize:13,color:T.textMuted,marginTop:2}}>Site activity and progress reports by project</div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <select value={fProj} onChange={e=>setFProj(e.target.value)} style={{background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:T.textSub,outline:"none",colorScheme:"light"}}>
                  <option value="">All Projects</option>
                  {projects.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
                <Btn color={T.gold} solid onClick={()=>setModal({mode:"add"})}>+ Add Report</Btn>
              </div>
            </div>
            {(() => {
              const drDocs = fProj ? drAll.filter(d=>d.project===fProj) : drAll;
              return drDocs.length===0
                ?<Empty icon="📅" label="No daily reports yet" sub="Add your first daily report" color={T.gold} onAdd={()=>setModal({mode:"add"})}/>
                :<div style={{display:"grid",gap:10}}>
                  {drDocs.map((doc,i)=>(
                    <div key={doc.id} className="fade-up"
                      style={{background:T.card,border:`1px solid ${T.border}`,borderLeft:`4px solid ${T.gold}`,borderRadius:12,padding:"16px 18px",animationDelay:`${i*.03}s`,display:"flex",alignItems:"flex-start",gap:14}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
                          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:"clamp(14px,1.1vw,17px)",color:T.text}}>{doc.name}</span>
                          {doc.project&&<Tag color={T.teal}>{doc.project}</Tag>}
                          {doc.date&&<Tag color={T.gold}>{fmtDate(doc.date)}</Tag>}
                        </div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                          {doc.refNo&&<Chip>Ref: {doc.refNo}</Chip>}
                          {doc.fileLink&&<FileLink href={doc.fileLink}/>}
                        </div>
                        {doc.notes&&<div style={{marginTop:6,fontSize:12,color:T.textMuted,fontStyle:"italic"}}>{doc.notes}</div>}
                      </div>
                      <div style={{display:"flex",gap:6,flexShrink:0}}>
                        <ABtn color={T.blue} onClick={()=>setModal({mode:"edit",doc})}>✎</ABtn>
                        <ABtn color={T.red}  onClick={()=>delDoc(doc.id)}>✕</ABtn>
                      </div>
                    </div>
                  ))}
                </div>;
            })()}
          </div>
        )
      )}

      {/* ══ MODALS ═══════════════════════════════════════════════════════ */}
      {modal && subTab==="invoices"      && <InvoiceModal      mode={modal.mode} doc={modal.doc} projects={projects} defaultProject={selectedProject} onClose={()=>setModal(null)} onSave={saveDoc}/>}
      {modal && subTab==="certificates"  && <CertificateModal  mode={modal.mode} doc={modal.doc} projects={projects}                          onClose={()=>setModal(null)} onSave={saveDoc}/>}
      {modal && subTab==="workorders"    && <WorkOrderModal     mode={modal.mode} doc={modal.doc} projects={projects}                          onClose={()=>setModal(null)} onSave={saveDoc}/>}
      {modal && subTab==="dailyreports"  && <DailyReportModal   mode={modal.mode} doc={modal.doc} projects={projects} defaultProject={selectedProject} onClose={()=>setModal(null)} onSave={saveDoc}/>}
      {bulkModal && <BulkUploadModal subTab={subTab} projects={projects} onClose={()=>setBulkModal(false)} onImport={(rows)=>{ rows.forEach(r=>{ setData(prev=>({...prev,projectDocs:[...prev.projectDocs,{...r,id:uid(),subTab}]})); }); setBulkModal(false); showToast(`✓ ${rows.length} records imported`); }}/>}
      {multiPdfModal && (
  <MultiPdfCertUpload
    project={multiPdfModal.project}
    projects={projects}
    onClose={()=>setMultiPdfModal(null)}
    onImport={records => {
      setData(prev => ({
        ...prev,
        projectDocs: [...prev.projectDocs, ...records.map(r => ({...r, id:uid(), subTab:"certificates"}))]
      }));
      setMultiPdfModal(null);
      showToast(`✓ ${records.length} certificate${records.length!==1?"s":""} uploaded`);
    }}
  />
)}
    </div>
  );
}

function SubTabBar({tabs,active,counts,onChange}) {
  return (
    <div style={{display:"flex",gap:8,marginBottom:20,overflowX:"auto",paddingBottom:4}}>
      {tabs.map(t=>{
        const isActive=active===t.id;
        return (
          <button key={t.id} onClick={()=>onChange(t.id)} style={{flexShrink:0,padding:"9px 18px",borderRadius:999,border:`1px solid ${isActive?t.color:T.border}`,background:isActive?t.dim:"transparent",color:isActive?t.color:T.textSub,fontSize:13,fontWeight:isActive?700:500,display:"flex",alignItems:"center",gap:8,transition:"all .2s"}}>
            <span>{t.icon}</span>{t.label}
            <span style={{background:isActive?t.color:T.border,color:isActive?"#000":T.textMuted,borderRadius:999,padding:"1px 8px",fontSize:11,fontWeight:700}}>{counts[t.id]}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Invoice card ────────────────────────────────────────────────────────── */
function InvoiceCard({ doc, delay, onEdit, onDel }) {
  const due = daysUntil(doc.dueDate);
  const paymentStatus = doc.paymentStatus || "Pending";
  const isPaid = paymentStatus === "Paid";
  const isPartial = paymentStatus === "Partial";

  // Only show overdue / due-soon logic for unpaid or partial invoices
  const showDueAlert = !isPaid && doc.dueDate && due !== null && due <= 30;
  const dueStatus = isPaid
    ? { color: T.green, bg: T.greenDim, label: "Paid" }
    : getStatus(due);

  return (
    <div
      className="fade-up"
      style={{
        background: T.card,
        border: `1px solid ${showDueAlert ? dueStatus.color + "44" : T.border}`,
        borderLeft: `4px solid ${isPaid ? T.green : isPartial ? T.gold : T.green}`,
        borderRadius: 12,
        padding: "16px 18px",
        animationDelay: `${delay}s`,
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontWeight: 800,
              fontSize: "clamp(14px,1.1vw,17px)",
              color: T.text,
            }}
          >
            {doc.name}
          </span>

          {doc.refNo && <Tag color={T.green}>#{doc.refNo}</Tag>}

          {showDueAlert && (
            <Tag color={dueStatus.color}>
              {due < 0 ? `${Math.abs(due)}d overdue` : `Due in ${due}d`}
            </Tag>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {doc.client && <Chip>Client: {doc.client}</Chip>}

          {doc.dueDate && (
            <Chip color={isPaid ? T.green : dueStatus.color}>
              Due: {fmtDate(doc.dueDate)}
            </Chip>
          )}

          {doc.amount && (
            <Chip color={T.green}>
              SAR {Number(doc.amount).toLocaleString()}
            </Chip>
          )}

          <Chip color={getInvoiceStream(doc) === "advance" ? T.purple : T.blue}>
            {getInvoiceStream(doc) === "advance" ? "Advance" : "Income"}
          </Chip>

          {(() => {
            const c =
              paymentStatus === "Paid"
                ? T.green
                : paymentStatus === "Partial"
                ? T.gold
                : T.red;

            return (
              <Tag color={c}>
                {paymentStatus === "Paid"
                  ? "✓ Paid"
                  : paymentStatus === "Partial"
                  ? "½ Partial"
                  : "⏳ Pending"}
              </Tag>
            );
          })()}

          {doc.fileLink && <FileLink href={doc.fileLink} />}
        </div>

        {doc.notes && (
          <div style={{ marginTop: 6, fontSize: 12, color: T.textMuted, fontStyle: "italic" }}>
            {doc.notes}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <ABtn color={T.blue} onClick={onEdit}>✎</ABtn>
        <ABtn color={T.red} onClick={onDel}>✕</ABtn>
      </div>
    </div>
  );
}

/* ── Invoice modal ───────────────────────────────────────────────────────── */
function InvoiceModal({mode,doc,projects,defaultProject,onClose,onSave}) {
  const [f,setF]=useState(doc||{project:defaultProject||"", invoiceType:"Income", paymentStatus:"Pending"});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return (
    <FormModal title={`${mode==="add"?"ADD":"EDIT"} INVOICE`} color={T.green} onClose={onClose}
      onSave={()=>{if(!f.name){alert("Invoice title required");return;}onSave({...f, invoiceType: f.invoiceType || "Income"},mode);}}>
      <FieldRow label="Invoice Title *"><FInput value={f.name||""} onChange={set("name")} color={T.green}/></FieldRow>
      <FieldRow label="Project *">
        <FSelect value={f.project||""} onChange={set("project")} color={T.green}>
          <option value="">Select project…</option>
          {projects.map(p=><option key={p} value={p}>{p}</option>)}
        </FSelect>
      </FieldRow>
      <FieldRow label="Invoice No."><FInput value={f.refNo||""} onChange={set("refNo")} color={T.green}/></FieldRow>
      <FieldRow label="Due Date"><FInput type="date" value={f.dueDate||""} onChange={set("dueDate")} color={T.green}/></FieldRow>
      <FieldRow label="Invoice Value (SAR)"><FInput type="number" value={f.amount||""} onChange={set("amount")} color={T.green}/></FieldRow>
      <FieldRow label="Invoice Type">
        <div style={{display:"flex", gap:8}}>
          {["Income","Advance"].map(s => {
            const active = (f.invoiceType || "Income") === s;
            const tone = s === "Income" ? T.blue : T.purple;
            const bg = s === "Income" ? T.blueDim : T.purpleDim;
            return (
              <button
                key={s}
                type="button"
                onClick={() => set("invoiceType")(s)}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: 8,
                  border: `1px solid ${active ? tone : T.border}`,
                  background: active ? bg : "transparent",
                  color: active ? tone : T.textMuted,
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </FieldRow>
      <FieldRow label="Payment Status">
        <div style={{display:"flex", gap:8}}>
          {["Pending","Paid","Partial"].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => set("paymentStatus")(s)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 8,
                border: `1px solid ${
                  f.paymentStatus === s
                    ? s === "Paid"    ? T.green
                    : s === "Partial" ? T.gold
                    :                  T.red
                    : T.border
                }`,
                background:
                  f.paymentStatus === s
                    ? s === "Paid"    ? T.greenDim
                    : s === "Partial" ? T.goldDim
                    :                  T.redDim
                    : "transparent",
                color:
                  f.paymentStatus === s
                    ? s === "Paid"    ? T.green
                    : s === "Partial" ? T.gold
                    :                  T.red
                    : T.textMuted,
                fontSize: 13,
                fontWeight: f.paymentStatus === s ? 700 : 500,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              {s === "Paid" ? "✓ Paid" : s === "Partial" ? "½ Partial" : "⏳ Pending"}
            </button>
          ))}
        </div>
      </FieldRow>
      {f.paymentStatus === "Partial" && (
        <FieldRow label="Remaining Amount (SAR)">
          <div>
            <FInput type="number" value={f.remainingAmount || ""} onChange={set("remainingAmount")} color={T.gold}/>
            <div style={{fontSize:11,color:T.textMuted,marginTop:6}}>
              Enter the exact amount still remaining for this invoice.
            </div>
          </div>
        </FieldRow>
      )}
      <FieldRow label="File Link (Google Drive / SharePoint)"><FLink value={f.fileLink||""} onChange={set("fileLink")}/></FieldRow>
      <FieldRow label="Notes"><FTextarea value={f.notes||""} onChange={set("notes")} color={T.green}/></FieldRow>
    </FormModal>
  );
}

/* ── Job Completion Certificate modal ────────────────────────────────────── */
function CertificateModal({mode,doc,projects,onClose,onSave}) {
  const [f,setF]=useState(doc||{});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return (
    <FormModal title={`${mode==="add"?"ADD":"EDIT"} JOB COMPLETION CERTIFICATE`} color={T.blue} onClose={onClose}
      onSave={()=>{onSave(f,mode);}}>
      
      <FieldRow label="Project *">
        <FSelect value={f.project||""} onChange={set("project")} color={T.blue}>
          <option value="">Select project…</option>
          {projects.map(p=><option key={p} value={p}>{p}</option>)}
        </FSelect>
      </FieldRow>
      <FieldRow label="Job Number"><FInput value={f.jobNo||""} onChange={set("jobNo")} color={T.blue}/></FieldRow>
      <FieldRow label="Certificate No."><FInput value={f.refNo||""} onChange={set("refNo")} color={T.blue}/></FieldRow>
      <FieldRow label="Start Date"><FInput type="date" value={f.startDate||""} onChange={set("startDate")} color={T.blue}/></FieldRow>
      <FieldRow label="Completion Date"><FInput type="date" value={f.completionDate||""} onChange={set("completionDate")} color={T.blue}/></FieldRow>
      <FieldRow label="Invoice Value (SAR)"><FInput type="number" value={f.amount||""} onChange={set("amount")} color={T.blue}/></FieldRow>
      <FieldRow label="File Link (Google Drive / SharePoint)"><FLink value={f.fileLink||""} onChange={set("fileLink")}/></FieldRow>
      <FieldRow label="Notes"><FTextarea value={f.notes||""} onChange={set("notes")} color={T.blue}/></FieldRow>
    </FormModal>
  );
}

/* ── Work Order modal ────────────────────────────────────────────────────── */
function WorkOrderModal({mode,doc,projects,onClose,onSave}) {
  const [f,setF]=useState(doc||{});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return (
    <FormModal title={`${mode==="add"?"ADD":"EDIT"} WORK ORDER / AGREEMENT`} color={T.purple} onClose={onClose}
      onSave={()=>{if(!f.name){alert("Title required");return;}onSave(f,mode);}}>
      <FieldRow label="Title *"><FInput value={f.name||""} onChange={set("name")} color={T.purple}/></FieldRow>
      <FieldRow label="Project *">
        <FSelect value={f.project||""} onChange={set("project")} color={T.purple}>
          <option value="">Select project…</option>
          {projects.map(p=><option key={p} value={p}>{p}</option>)}
        </FSelect>
      </FieldRow>
      <FieldRow label="Reference No."><FInput value={f.refNo||""} onChange={set("refNo")} color={T.purple}/></FieldRow>
      <FieldRow label="Client / Counterparty"><FInput value={f.supplier||""} onChange={set("supplier")} color={T.purple}/></FieldRow>
      <FieldRow label="Contract Value (SAR)"><FInput type="number" value={f.amount||""} onChange={set("amount")} color={T.purple}/></FieldRow>
      <FieldRow label="Date Signed"><FInput type="date" value={f.date||""} onChange={set("date")} color={T.purple}/></FieldRow>
      <FieldRow label="Expiry / End Date"><FInput type="date" value={f.expiryDate||""} onChange={set("expiryDate")} color={T.purple}/></FieldRow>
      <FieldRow label="File Link (Google Drive / SharePoint)"><FLink value={f.fileLink||""} onChange={set("fileLink")}/></FieldRow>
      <FieldRow label="Notes"><FTextarea value={f.notes||""} onChange={set("notes")} color={T.purple}/></FieldRow>
    </FormModal>
  );
}

function DailyReportModal({mode,doc,projects,defaultProject,onClose,onSave}) {
  const [f,setF]=useState({project:defaultProject||"",...(doc||{})});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return (
    <FormModal title={`${mode==="add"?"ADD":"EDIT"} DAILY REPORT`} color={T.gold} onClose={onClose}
      onSave={()=>{if(!f.name){alert("Report title required");return;}onSave(f,mode);}}>
      <FieldRow label="Report Title *"><FInput value={f.name||""} onChange={set("name")} color={T.gold}/></FieldRow>
      <FieldRow label="Project *">
        <FSelect value={f.project||""} onChange={set("project")} color={T.gold}>
          <option value="">Select project…</option>
          {projects.map(p=><option key={p} value={p}>{p}</option>)}
        </FSelect>
      </FieldRow>
      <FieldRow label="Report Date"><FInput type="date" value={f.date||""} onChange={set("date")} color={T.gold}/></FieldRow>
      <FieldRow label="Reference No."><FInput value={f.refNo||""} onChange={set("refNo")} color={T.gold}/></FieldRow>
      <FieldRow label="File Link (Google Drive / SharePoint)"><FLink value={f.fileLink||""} onChange={set("fileLink")}/></FieldRow>
      <FieldRow label="Notes / Summary"><FTextarea value={f.notes||""} onChange={set("notes")} color={T.gold}/></FieldRow>
    </FormModal>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCORPION DOCUMENTS
════════════════════════════════════════════════════════════════════════════ */
function ScorpionDocs({data,setData,showToast}) {
  const [modal,    setModal]    = useState(null);
  const [catModal, setCatModal] = useState(false);
  const [selCat,   setSelCat]   = useState("All");

  const docs    = data.scorpionDocs || [];
  const cats    = data.scorpionDocCats || DEFAULT_SCORPION_CATS;
  const visible = selCat==="All" ? docs : docs.filter(d=>d.category===selCat);

  const saveDoc = (doc, mode) => {
    setModal(null);
    setTimeout(() => {
      setData(prev => {
        const list = [...prev.scorpionDocs];
        if (mode==="add") list.push({...doc, id:uid()});
        else { const i=list.findIndex(d=>d.id===doc.id); if(i>=0) list[i]=doc; }
        return {...prev, scorpionDocs:list};
      });
      showToast(mode==="add"?"Document added":"Document updated");
    }, 0);
  };

  const delDoc = id => {
    setData(prev=>({...prev, scorpionDocs:prev.scorpionDocs.filter(d=>d.id!==id)}));
    showToast("Document deleted","del");
  };

  const saveCats = cats => setData(prev=>({...prev, scorpionDocCats:cats}));

  return (
    <div style={{maxWidth:"min(1200px,95vw)",margin:"0 auto",width:"100%"}}>
      <PageHeader title="SCORPION DOCUMENTS" sub="Company licenses, insurance, contracts & registrations" color={T.blue}>
        <Btn color={T.blue} onClick={()=>setCatModal(true)}>⊕ Categories</Btn>
        <ExportBtn data={docs.map(d=>({Name:d.name,Category:d.category,"Ref No":d.docNo,"Issue Date":d.issueDate,"Expiry Date":d.expiryDate,"File Link":d.fileLink,Notes:d.notes}))} filename="Scorpion_Documents"/>
        <Btn color={T.blue} solid onClick={()=>setModal({mode:"add"})}>+ Add Document</Btn>
      </PageHeader>

      {/* Category filter pills */}
      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
        {["All",...cats].map(c=>(
          <button key={c} onClick={()=>setSelCat(c)} style={{padding:"6px 14px",borderRadius:999,border:`1px solid ${selCat===c?T.blue:T.border}`,background:selCat===c?T.blueDim:"transparent",color:selCat===c?T.blue:T.textSub,fontSize:12,fontWeight:selCat===c?700:500,transition:"all .15s"}}>
            {c} {c!=="All"&&<span style={{opacity:.6}}>({docs.filter(d=>d.category===c).length})</span>}
          </button>
        ))}
      </div>

      {visible.length===0
        ?<Empty icon="◉" label="No documents yet" sub="Add your first company document" color={T.blue} onAdd={()=>setModal({mode:"add"})}/>
        :<div style={{display:"grid",gap:10}}>
          {visible.map((doc,i)=>{
            const s=getStatus(daysUntil(doc.expiryDate));
            return (
              <div key={doc.id} className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderLeft:`4px solid ${doc.expiryDate?s.color:T.blue}`,borderRadius:12,padding:"16px 18px",animationDelay:`${i*.03}s`,display:"flex",alignItems:"center",gap:14}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:16,color:T.text}}>{doc.name}</span>
                    <Tag color={T.blue}>{doc.category}</Tag>
                    {doc.expiryDate&&<Tag color={s.color}>{s.label}</Tag>}
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {doc.docNo&&<Chip>Ref: {doc.docNo}</Chip>}
                    {doc.issueDate&&<Chip>Issued: {fmtDate(doc.issueDate)}</Chip>}
                    {doc.expiryDate&&<Chip color={s.color}>Expires: {fmtDate(doc.expiryDate)}</Chip>}
                    {doc.fileLink&&<FileLink href={doc.fileLink}/>}
                  </div>
                  {doc.notes&&<div style={{marginTop:6,fontSize:12,color:T.textMuted,fontStyle:"italic"}}>{doc.notes}</div>}
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <ABtn color={T.blue} onClick={()=>setModal({mode:"edit",doc})}>✎</ABtn>
                  <ABtn color={T.red}  onClick={()=>delDoc(doc.id)}>✕</ABtn>
                </div>
              </div>
            );
          })}
        </div>
      }

      {modal    && <DocModal mode={modal.mode} doc={modal.doc} cats={cats} onClose={()=>setModal(null)} onSave={saveDoc}/>}
      {catModal && <CatManagerModal title="Document Categories" cats={cats} onSave={saveCats} onClose={()=>setCatModal(false)}/>}
    </div>
  );
}

function DocModal({mode,doc,cats,onClose,onSave}) {
  const [f,setF]=useState(doc||{});
  const F=(k,label,type)=>({key:k,label,type:type||"text"});
  const fields=[F("name","Document Name"),F("category","Category","select"),F("fileLink","File Link (Google Drive / SharePoint)","link"),F("notes","Notes","textarea")];
  return (
    <FormModal title={`${mode==="add"?"ADD":"EDIT"} DOCUMENT`} color={T.blue} onClose={onClose}
      onSave={()=>{if(!f.name){alert("Document name is required");return;}onSave(f,mode);}}>
      {fields.map(fl=>(
        <FieldRow key={fl.key} label={fl.label}>
          {fl.type==="select"
            ?<FSelect value={f[fl.key]||""} onChange={v=>setF(p=>({...p,[fl.key]:v}))} color={T.blue}>
                <option value="">Select…</option>
                {cats.map(c=><option key={c} value={c}>{c}</option>)}
              </FSelect>
            :fl.type==="textarea"
              ?<FTextarea value={f[fl.key]||""} onChange={v=>setF(p=>({...p,[fl.key]:v}))} color={T.blue}/>
              :fl.type==="link"
                ?<FLink value={f[fl.key]||""} onChange={v=>setF(p=>({...p,[fl.key]:v}))}/>
                :<FInput type={fl.type} value={f[fl.key]||""} onChange={v=>setF(p=>({...p,[fl.key]:v}))} color={T.blue}/>
          }
        </FieldRow>
      ))}
    </FormModal>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MANPOWER PAGE
════════════════════════════════════════════════════════════════════════════ */
function ManpowerPage({data,setData,showToast}) {
  const [selCat,      setSelCat]      = useState("All");
  const [catModal,    setCatModal]    = useState(false);
  const [addModal,    setAddModal]    = useState(false);
  const [person,      setPerson]      = useState(null);
  const [editingFrom, setEditingFrom] = useState(null); // person being edited from detail view
  const [impModal,    setImpModal]    = useState(false);
  const mpFileRef = useRef();

  const people  = data.manpower || [];
  const cats    = data.manpowerCats || DEFAULT_MANPOWER_CATS;
  const visible = selCat==="All" ? people : people.filter(p=>p.category===selCat);

  const savePerson = (p,mode) => {
    const ef = editingFrom;
    setAddModal(false);
    setTimeout(()=>{
      setData(prev=>{
        const list=[...prev.manpower];
        if(mode==="add"){
          list.push({...p,id:uid(),certs:[],docs:[]});
        } else {
          const i=list.findIndex(x=>x.id===p.id);
          if(i>=0) list[i]={...list[i],...p,certs:list[i].certs||[],docs:list[i].docs||[]};
        }
        return{...prev,manpower:list};
      });
      showToast(mode==="add"?"Person added":"Updated");
      if(ef){
        setPerson(prev=>{ const base=prev||ef; return{...base,...p,certs:base.certs||[],docs:base.docs||[]}; });
        setEditingFrom(null);
      }
    },0);
  };

  const delPerson = id => {
    setData(prev=>({...prev,manpower:prev.manpower.filter(p=>p.id!==id)}));
    showToast("Deleted","del"); setPerson(null);
  };

  const saveCats = cats => setData(prev=>({...prev,manpowerCats:cats}));

  const updatePerson = updated => {
    setData(prev=>{
      const list=[...prev.manpower];
      const i=list.findIndex(p=>p.id===updated.id);
      if(i>=0)list[i]=updated;
      return{...prev,manpower:list};
    });
    setPerson(updated);
  };

  // Import manpower certifications from Excel
  // Each row: NAME, EMPLOYEE ID, CERTIFICATE, CERT NO, ISSUE DATE, EXPIRY DATE
  // Finds matching person by name and appends certs; creates person if not found
  const importMpCerts = (file, defaultCat) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        // Headers are on row 4 in TUV_Manpower_Tracker.xlsx
        const parsed=parseExcelWithHeaderRow(e.target.result, MP_CERT_MAP, MP_HEADER_ROW);
        if(!parsed.length){showToast("No valid rows found","del");return;}

        setData(prev=>{
          const manpower=[...prev.manpower];
          let added=0, updated=0;
          parsed.forEach(row=>{
            const personName=(row.name||"").trim();
            if(!personName) return;
            const certName=row.certName||"Certification";
            const cert={id:uid(),name:certName,certNo:row.certNo||"",issueDate:row.issueDate||"",expiryDate:row.expiryDate||"",issuedBy:row.issuedBy||"",fileLink:""};
            const idx=manpower.findIndex(p=>p.name.toLowerCase()===personName.toLowerCase());
            if(idx>=0){
              if(row.idNo&&!manpower[idx].idNo) manpower[idx]={...manpower[idx],idNo:row.idNo};
              // Skip duplicate: same cert name + same expiry date already exists
              const alreadyExists=(manpower[idx].certs||[]).some(c=>
                c.name.toLowerCase()===certName.toLowerCase()&&c.expiryDate===cert.expiryDate
              );
              if(!alreadyExists){
                manpower[idx]={...manpower[idx],certs:[...(manpower[idx].certs||[]),cert]};
                updated++;
              }
            } else {
              manpower.push({id:uid(),name:personName,idNo:row.idNo||"",category:defaultCat||"",certs:[cert],docs:[]});
              added++;
            }
          });
          showToast(`✓ ${parsed.length} certs imported (${added} new people, ${updated} updated)`);
          return{...prev,manpower};
        });
        setImpModal(false);
      } catch(err){ showToast("Failed to read Excel file","del"); }
    };
    reader.readAsArrayBuffer(file);
  };

  const personFresh = person ? (data.manpower.find(p=>p.id===person.id)||person) : null;

  return (
    <div style={{maxWidth:"min(1200px,95vw)",margin:"0 auto",width:"100%"}}>
      {/* Show PersonDetail when a person is selected */}
      {personFresh && (
        <PersonDetail person={personFresh} cats={cats}
          onBack={()=>setPerson(null)}
          onUpdate={updatePerson}
          onDelete={()=>delPerson(personFresh.id)}
          onEdit={()=>{setEditingFrom(personFresh);setPerson(null);setAddModal({mode:"edit",person:personFresh});}}
          showToast={showToast}/>
      )}
      {/* Show list when no person selected */}
      {!personFresh && <>
      <PageHeader title="MANPOWER" sub="Staff profiles, documents & certifications" color={T.green}>
        <Btn color={T.green} onClick={()=>setCatModal(true)}>⊕ Categories</Btn>
        <Btn color={T.gold}  onClick={()=>setImpModal(true)}>⬆ Import Excel</Btn>
        <ExportBtn data={people.map(p=>({Name:p.name,ID:p.idNo,Category:p.category,Designation:p.designation,Nationality:p.nationality,"Passport No":p.passportNo,"Passport Expiry":p.passportExpiry,"Visa No":p.visaNo,"Visa Expiry":p.visaExpiry,"Iqama No":p.iqamaNo,"Iqama Expiry":p.iqamaExpiry,"Muqeem No":p.muqeemNo,"Muqeem Expiry":p.muqeemExpiry}))} filename="Manpower_List"/>
        <Btn color={T.green} solid onClick={()=>setAddModal({mode:"add"})}>+ Add Person</Btn>
      </PageHeader>

      {/* Excel import banner */}
      <div style={{background:T.goldDim,border:`1px solid ${T.gold}33`,borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:T.gold}}>📂 Import Manpower Certifications from Excel</div>
          <div style={{fontSize:12,color:T.textSub,marginTop:2}}>Columns: <strong style={{color:T.textSub}}>NAME, ID, CERTIFICATE, ISSUED BY, ISSUE DATE, EXPIRY DATE</strong> (headers auto-detected from row 4) — matches people by name, creates new if not found</div>
        </div>
        <input ref={mpFileRef} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{if(e.target.files[0]){setImpModal({file:e.target.files[0]});e.target.value="";}}}/>
        <button onClick={()=>mpFileRef.current.click()} style={{background:T.gold,color:"#000",border:"none",borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:700,flexShrink:0}}>⬆ Upload Excel</button>
      </div>

      {/* Category filter */}
      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
        {["All",...cats].map(c=>(
          <button key={c} onClick={()=>setSelCat(c)} style={{padding:"6px 14px",borderRadius:999,border:`1px solid ${selCat===c?T.green:T.border}`,background:selCat===c?T.greenDim:"transparent",color:selCat===c?T.green:T.textSub,fontSize:12,fontWeight:selCat===c?700:500,transition:"all .15s"}}>
            {c} {c!=="All"&&<span style={{opacity:.6}}>({people.filter(p=>p.category===c).length})</span>}
          </button>
        ))}
      </div>

      {visible.length===0
        ?<Empty icon="◈" label="No people in this category" sub="Add your first team member" color={T.green} onAdd={()=>setAddModal({mode:"add"})}/>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
          {visible.map((p,i)=>{
            const exps=[p.passportExpiry,p.visaExpiry,p.iqamaExpiry,p.muqeemExpiry,...(p.certs||[]).map(c=>c.expiryDate)].filter(Boolean);
            const critical=exps.filter(d=>{ const x=daysUntil(d); return x!==null&&x<=90; }).length;
            return (
              <div key={p.id} className="fade-up" onClick={()=>setPerson(p)}
                style={{background:T.card,border:`1px solid ${critical>0?T.gold:T.border}`,borderRadius:14,padding:"18px",cursor:"pointer",animationDelay:`${i*.04}s`,transition:"border-color .2s,transform .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.green;e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=critical>0?T.gold:T.border;e.currentTarget.style.transform="none";}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
                  <div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.text}}>{p.name}</div>
                    <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>{p.designation||"—"} · {p.nationality||""}</div>
                  </div>
                  {critical>0&&<span style={{background:T.goldDim,color:T.gold,borderRadius:999,padding:"2px 10px",fontSize:11,fontWeight:700,flexShrink:0}}>{critical} alerts</span>}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
                  {p.category&&<Tag color={T.green}>{p.category}</Tag>}
                  {p.idNo&&<Chip>ID: {p.idNo}</Chip>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {[["Passport",p.passportExpiry],["Visa",p.visaExpiry],["Iqama",p.iqamaExpiry],["Muqeem",p.muqeemExpiry]].map(([lbl,exp])=>{
                    const s=getStatus(daysUntil(exp));
                    return (
                      <div key={lbl} style={{background:T.bg,borderRadius:8,padding:"7px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:12,color:T.textSub}}>{lbl}</span>
                        {exp
                          ?<span style={{fontSize:11,color:s.color,fontWeight:600}}>{s.label==="Valid"?fmtDate(exp):s.label}</span>
                          :<span style={{fontSize:12,color:T.textSub}}>—</span>
                        }
                      </div>
                    );
                  })}
                </div>
                <div style={{marginTop:8,fontSize:12,color:T.textMuted,display:"flex",gap:8}}>
                  <span>{(p.certs||[]).length} cert{(p.certs||[]).length!==1?"s":""}</span>
                  <span style={{color:T.border}}>·</span>
                  <span>click to view details →</span>
                </div>
              </div>
            );
          })}
        </div>
      }

      {addModal  && <PersonModal mode={addModal.mode} person={addModal.person} cats={cats}
        onClose={()=>{
          setAddModal(false);
          if(editingFrom){setPerson(editingFrom);setEditingFrom(null);}
        }}
        onSave={savePerson}/>}
      {catModal  && <CatManagerModal title="Manpower Categories" cats={cats} onSave={saveCats} onClose={()=>setCatModal(false)}/>}
      {impModal  && impModal.file && <MpImportModal file={impModal.file} cats={cats} onClose={()=>setImpModal(false)} onImport={importMpCerts}/>}
      </>}
    </div>
  );
}

/* ─── Manpower Import Options Modal ─────────────────────────────────────── */
function MpImportModal({file,cats,onClose,onImport}) {
  const [selCat,setSelCat]=useState("");
  return (
    <Overlay onClose={onClose}>
      <div className="slide-up" style={{background:T.sidebar,border:`1px solid ${T.border}`,borderRadius:18,width:"100%",maxWidth:420,padding:"24px"}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.text,marginBottom:6}}>IMPORT MANPOWER CERTS</div>
        <div style={{fontSize:12,color:T.textMuted,marginBottom:20}}>File: <span style={{color:T.textSub}}>{file.name}</span></div>
        <div style={{marginBottom:18}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:T.textMuted,marginBottom:6,letterSpacing:".5px"}}>ASSIGN TO CATEGORY (for new people)</label>
          <select value={selCat} onChange={e=>setSelCat(e.target.value)}
            style={{width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:selCat?T.text:T.textMuted,outline:"none",colorScheme:"light"}}>
            <option value="">No category / assign manually later</option>
            {cats.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{background:T.blueDim,border:`1px solid ${T.blue}33`,borderRadius:10,padding:"12px 14px",marginBottom:18,fontSize:12,color:T.blue}}>
          ℹ Existing people are matched by name. New certs are <strong>added</strong> to their profile — existing certs are not deleted.
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:10,padding:"11px",fontSize:13,fontWeight:600}}>Cancel</button>
          <button onClick={()=>onImport(file,selCat)} style={{flex:2,background:T.gold,border:"none",color:"#000",borderRadius:10,padding:"11px",fontSize:14,fontWeight:700}}>Import Certifications</button>
        </div>
      </div>
    </Overlay>
  );
}

/* ─── Person Detail view ─────────────────────────────────────────────────── */
function PersonDetail({person,cats,onBack,onUpdate,onDelete,onEdit,showToast}) {
  const [certModal, setCertModal] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  const PTABS=[{id:"profile",label:"Profile"},{id:"certs",label:`Certifications (${(person.certs||[]).length})`}];

  const saveCert=(cert,mode)=>{
    setCertModal(null);
    setTimeout(()=>{
      const certs=[...(person.certs||[])];
      if(mode==="add")certs.push({...cert,id:uid()});
      else{const i=certs.findIndex(c=>c.id===cert.id);if(i>=0)certs[i]=cert;}
      onUpdate({...person,certs});
      showToast(mode==="add"?"Cert added":"Cert updated");
    },0);
  };

  const delCert=id=>{
    const certs=(person.certs||[]).filter(c=>c.id!==id);
    onUpdate({...person,certs});
    showToast("Cert deleted","del");
  };

  const PROFILE_ROWS=[
    ["Full Name",person.name],["ID No.",person.idNo],["Nationality",person.nationality],
    ["Designation",person.designation],["Category",person.category],
    ["Passport No.",person.passportNo],["Passport Expiry",fmtDate(person.passportExpiry)],
    ["Visa No.",person.visaNo],["Visa Expiry",fmtDate(person.visaExpiry)],
    ["Iqama No.",person.iqamaNo],["Iqama Expiry",fmtDate(person.iqamaExpiry)],
    ["Muqeem No.",person.muqeemNo],["Muqeem Expiry",fmtDate(person.muqeemExpiry)],
  ].filter(([,v])=>v&&v!=="—");

  return (
    <div style={{maxWidth:"min(1100px,95vw)",margin:"0 auto",width:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
        <button onClick={onBack} style={{background:T.card,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>← Back</button>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,color:T.text}}>{person.name}</div>
          <div style={{fontSize:12,color:T.textMuted}}>{person.designation} · {person.category}</div>
        </div>
        <Btn color={T.blue}  onClick={onEdit}>✎ Edit</Btn>
        <Btn color={T.red}   onClick={()=>{ if(window.confirm("Delete this person?")) onDelete(); }}>✕ Delete</Btn>
      </div>

      {/* Status cards row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10,marginBottom:22}}>
        {[["Passport",person.passportExpiry],["Visa",person.visaExpiry],["Iqama",person.iqamaExpiry],["Muqeem",person.muqeemExpiry]].map(([lbl,exp])=>{
          const s=getStatus(daysUntil(exp));
          return (
            <div key={lbl} style={{background:T.card,border:`1px solid ${exp?s.color+"44":T.border}`,borderRadius:12,padding:"14px 16px"}}>
              <div style={{fontSize:12,color:T.textSub,fontWeight:600,marginBottom:6}}>{lbl.toUpperCase()}</div>
              {exp
                ?<><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800,color:s.color}}>{s.label}</div>
                   <div style={{fontSize:12,color:T.textSub,marginTop:2}}>{fmtDate(exp)}</div>
                   {daysUntil(exp)!==null&&<div style={{fontSize:11,color:s.color,marginTop:2,fontWeight:600}}>{Math.abs(daysUntil(exp))} days {daysUntil(exp)<0?"overdue":"left"}</div>}
                </>
                :<div style={{fontSize:13,color:T.textMuted}}>Not recorded</div>
              }
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:18}}>
        {PTABS.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{padding:"8px 18px",borderRadius:999,border:`1px solid ${activeTab===t.id?T.green:T.border}`,background:activeTab===t.id?T.greenDim:"transparent",color:activeTab===t.id?T.green:T.textSub,fontSize:13,fontWeight:activeTab===t.id?700:500,transition:"all .15s"}}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab==="profile"&&(
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,boxShadow:"0 2px 10px rgba(26,10,0,0.07),0 0 0 1px rgba(232,213,183,0.5)",padding:"18px 22px"}}>
          {PROFILE_ROWS.map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:13,color:T.textMuted,fontWeight:500}}>{k}</span>
              <span style={{fontSize:13,color:T.textSub,fontWeight:500}}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab==="certs"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
            <Btn color={T.green} solid onClick={()=>setCertModal({mode:"add"})}>+ Add Certification</Btn>
          </div>
          {(person.certs||[]).length===0
            ?<Empty icon="◈" label="No certifications" sub="Add this person's certifications" color={T.green} onAdd={()=>setCertModal({mode:"add"})}/>
            :<div style={{display:"grid",gap:10}}>
              {(person.certs||[]).map((c,i)=>{
                const s=getStatus(daysUntil(c.expiryDate));
                return (
                  <div key={c.id} className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderLeft:`4px solid ${s.color}`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,animationDelay:`${i*.04}s`}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.text}}>{c.name}</span>
                        <Tag color={s.color}>{s.label}</Tag>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {c.certNo&&<Chip>No: {c.certNo}</Chip>}
                        {c.issuedBy&&<Chip>{c.issuedBy}</Chip>}
                        {c.issueDate&&<Chip>Issued: {fmtDate(c.issueDate)}</Chip>}
                        {c.expiryDate&&<Chip color={s.color}>Exp: {fmtDate(c.expiryDate)}</Chip>}
                        {c.fileLink&&<FileLink href={c.fileLink}/>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      <ABtn color={T.blue} onClick={()=>setCertModal({mode:"edit",cert:c})}>✎</ABtn>
                      <ABtn color={T.red}  onClick={()=>delCert(c.id)}>✕</ABtn>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </div>
      )}

      {certModal&&<CertModal mode={certModal.mode} cert={certModal.cert} onClose={()=>setCertModal(null)} onSave={saveCert}/>}
    </div>
  );
}

function PersonModal({mode,person,cats,onClose,onSave}) {
  const [f,setF]=useState(person||{});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return (
    <FormModal title={`${mode==="add"?"ADD":"EDIT"} PERSON`} color={T.green} onClose={onClose}
      onSave={()=>{if(!f.name){alert("Name required");return;}onSave(f,mode);}}>
      <FieldRow label="Full Name *"><FInput value={f.name||""} onChange={set("name")} color={T.green}/></FieldRow>
      <FieldRow label="Category">
        <FSelect value={f.category||""} onChange={set("category")} color={T.green}>
          <option value="">Select…</option>
          {cats.map(c=><option key={c} value={c}>{c}</option>)}
        </FSelect>
      </FieldRow>
      <FieldRow label="ID No."><FInput value={f.idNo||""} onChange={set("idNo")} color={T.green}/></FieldRow>
      <FieldRow label="Nationality"><FInput value={f.nationality||""} onChange={set("nationality")} color={T.green}/></FieldRow>
      <FieldRow label="Designation"><FInput value={f.designation||""} onChange={set("designation")} color={T.green}/></FieldRow>
      <SectionDivider label="PASSPORT"/>
      <FieldRow label="Passport No."><FInput value={f.passportNo||""} onChange={set("passportNo")} color={T.green}/></FieldRow>
      <FieldRow label="Passport Expiry"><FInput type="date" value={f.passportExpiry||""} onChange={set("passportExpiry")} color={T.green}/></FieldRow>
      <SectionDivider label="VISA"/>
      <FieldRow label="Visa No."><FInput value={f.visaNo||""} onChange={set("visaNo")} color={T.green}/></FieldRow>
      <FieldRow label="Visa Expiry"><FInput type="date" value={f.visaExpiry||""} onChange={set("visaExpiry")} color={T.green}/></FieldRow>
      <SectionDivider label="IQAMA"/>
      <FieldRow label="Iqama No."><FInput value={f.iqamaNo||""} onChange={set("iqamaNo")} color={T.green}/></FieldRow>
      <FieldRow label="Iqama Expiry"><FInput type="date" value={f.iqamaExpiry||""} onChange={set("iqamaExpiry")} color={T.green}/></FieldRow>
      <SectionDivider label="MUQEEM"/>
      <FieldRow label="Muqeem No."><FInput value={f.muqeemNo||""} onChange={set("muqeemNo")} color={T.green}/></FieldRow>
      <FieldRow label="Muqeem Expiry"><FInput type="date" value={f.muqeemExpiry||""} onChange={set("muqeemExpiry")} color={T.green}/></FieldRow>
    </FormModal>
  );
}

function CertModal({mode,cert,onClose,onSave}) {
  const [f,setF]=useState(cert||{});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return (
    <FormModal title={`${mode==="add"?"ADD":"EDIT"} CERTIFICATION`} color={T.green} onClose={onClose}
      onSave={()=>{if(!f.name){alert("Cert name required");return;}onSave(f,mode);}}>
      <FieldRow label="Certification Name *"><FInput value={f.name||""} onChange={set("name")} color={T.green}/></FieldRow>
      <FieldRow label="Certificate No."><FInput value={f.certNo||""} onChange={set("certNo")} color={T.green}/></FieldRow>
      <FieldRow label="Issued By"><FInput value={f.issuedBy||""} onChange={set("issuedBy")} color={T.green}/></FieldRow>
      <FieldRow label="Issue Date"><FInput type="date" value={f.issueDate||""} onChange={set("issueDate")} color={T.green}/></FieldRow>
      <FieldRow label="Expiry Date"><FInput type="date" value={f.expiryDate||""} onChange={set("expiryDate")} color={T.green}/></FieldRow>
      <FieldRow label="File Link"><FLink value={f.fileLink||""} onChange={set("fileLink")}/></FieldRow>
    </FormModal>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   EQUIPMENT PAGE
════════════════════════════════════════════════════════════════════════════ */
function EquipmentPage({data,setData,showToast}) {
  const [modal,   setModal]   = useState(null);
  const [selEq,   setSelEq]   = useState(null); // selected equipment
  const [fProj,   setFProj]   = useState("");
  const [fStatus, setFStatus] = useState("");
  const eqBulkRef = useRef(); // must be here — hooks cannot be after early return

  const equipment = data.equipment || [];
  const projects  = data.projects  || [];

  const visible = equipment.filter(e=>{
    return (!fProj||e.project===fProj)&&(!fStatus||e.status===fStatus);
  });

  const saveEq=(eq,mode)=>{
    setModal(null);
    setTimeout(()=>{
      setData(prev=>{
        const list=[...prev.equipment];
        if(mode==="add")list.push({...eq,id:uid(),certifications:[],invoices:[],insurance:[],permits:[]});
        else{const i=list.findIndex(e=>e.id===eq.id);if(i>=0)list[i]=eq;}
        return{...prev,equipment:list};
      });
      showToast(mode==="add"?"Equipment added":"Updated");
      if(selEq)setSelEq(eq);
    },0);
  };

  const delEq=id=>{
    setData(prev=>({...prev,equipment:prev.equipment.filter(e=>e.id!==id)}));
    showToast("Deleted","del");setSelEq(null);
  };

  const updateEq=updated=>{
    setData(prev=>{
      const list=[...prev.equipment];
      const i=list.findIndex(e=>e.id===updated.id);
      if(i>=0)list[i]=updated;
      return{...prev,equipment:list};
    });
    setSelEq(updated);
  };

  const eqFresh = selEq ? (data.equipment.find(e=>e.id===selEq.id)||selEq) : null;
  const STATUS_COLORS={"Active":T.green,"Under Maintenance":T.gold,"Inactive":T.red};

  const importBulkEqCerts = file => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb=XLSX.read(e.target.result,{type:"array",cellDates:true});
        const sheetName=wb.SheetNames.includes("TUV MASTERSHEET")?"TUV MASTERSHEET":wb.SheetNames.includes("Sheet3")?"Sheet3":wb.SheetNames[0];
        const ws=wb.Sheets[sheetName];
        const rawRows=XLSX.utils.sheet_to_json(ws,{defval:""});
        // Normalize keys to uppercase for case-insensitive matching
        const rows=rawRows.map(row=>{const n={};Object.entries(row).forEach(([k,v])=>{n[k.toUpperCase().trim()]=v;});return n;});
        const parsed=parseExcelRows(rows,EQ_CERT_MAP);
        if(!parsed.length){showToast("No valid rows found","del");return;}

        setData(prev=>{
          const equipment=[...prev.equipment];
          let matched=0, unmatched=0;
          parsed.forEach(r=>{
            const cert={id:uid(),equipmentName:r.eqName||"",itemType:r.itemType||"",certNo:r.certNo||"",issuedBy:r.issuedBy||"",issueDate:r.issueDate||"",expiryDate:r.expiryDate||"",serialNo:r.serialNo||"",fileLink:""};
            // match by name or serial number
            const idx=equipment.findIndex(eq=>{
              const nameMatch=eq.name&&r.eqName&&(eq.name.toLowerCase().includes(r.eqName.toLowerCase())||r.eqName.toLowerCase().includes(eq.name.toLowerCase()));
              const serialMatch=eq.serialNo&&r.serialNo&&eq.serialNo.toLowerCase()===r.serialNo.toLowerCase();
              return nameMatch||serialMatch;
            });
            if(idx>=0){
              equipment[idx]={...equipment[idx],certifications:[...(equipment[idx].certifications||[]),cert]};
              matched++;
            } else {
              // Create new equipment entry for unmatched
              equipment.push({id:uid(),name:r.eqName||"Unknown Equipment",model:"",serialNo:r.serialNo||"",project:"",status:"Active",operator:"",certifications:[cert],invoices:[],insurance:[],permits:[]});
              unmatched++;
            }
          });
          showToast(`✓ Imported ${parsed.length} certs — ${matched} matched, ${unmatched} new equipment created`);
          return{...prev,equipment};
        });
      } catch(err){ showToast("Failed to read file","del"); console.error(err); }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={{maxWidth:"min(1400px,95vw)",margin:"0 auto",width:"100%"}}>
      {/* Show EquipmentDetail when equipment selected */}
      {eqFresh && <EquipmentDetail eq={eqFresh} projects={projects} onBack={()=>setSelEq(null)} onUpdate={updateEq} onDelete={()=>delEq(eqFresh.id)} onEdit={()=>setModal({mode:"edit",eq:eqFresh})} showToast={showToast}/>}
      {/* Show list when nothing selected */}
      {!eqFresh && <>
      <PageHeader title="EQUIPMENT" sub="Assets with certifications, invoices, insurance & permits" color={T.gold}>
        <select value={fProj} onChange={e=>setFProj(e.target.value)} style={{background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:T.textSub,outline:"none",colorScheme:"light"}}>
          <option value="">All Projects</option>
          {projects.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
        <select value={fStatus} onChange={e=>setFStatus(e.target.value)} style={{background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:T.textSub,outline:"none",colorScheme:"light"}}>
          <option value="">All Statuses</option>
          <option>Active</option><option>Under Maintenance</option><option>Inactive</option>
        </select>
        <input ref={eqBulkRef} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{if(e.target.files[0]){importBulkEqCerts(e.target.files[0]);e.target.value="";}}}/>
        <Btn color={T.gold} onClick={()=>eqBulkRef.current.click()}>⬆ Import Excel</Btn>
        <ExportBtn data={equipment.map(e=>({Name:e.name,Model:e.model,"Serial No":e.serialNo,Project:e.project,Status:e.status,Operator:e.operator,"Purchase Date":e.purchaseDate}))} filename="Equipment_List"/>
        <Btn color={T.gold} solid onClick={()=>setModal({mode:"add"})}>+ Add Equipment</Btn>
      </PageHeader>

      {/* Excel import banner */}
      <div style={{background:T.goldDim,border:`1px solid ${T.gold}33`,borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:T.gold}}>📂 Import Equipment Certifications from Excel</div>
          <div style={{fontSize:12,color:T.textSub,marginTop:2}}>Columns: <strong style={{color:T.textSub}}>ITEM TYPE, ITEM NAME/ID, REG/SERIAL NO, TUV PROVIDER, START DATE, EXPIRY DATE</strong> — auto-detects Sheet3, matches equipment by name or serial no.</div>
        </div>
        <button onClick={()=>eqBulkRef.current.click()} style={{background:T.gold,color:"#000",border:"none",borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:700,flexShrink:0}}>⬆ Upload Excel</button>
      </div>

      {visible.length===0
        ?<Empty icon="◎" label="No equipment found" sub="Add your first asset" color={T.gold} onAdd={()=>setModal({mode:"add"})}/>
        :<div style={{display:"grid",gap:10}}>
          {visible.map((eq,i)=>{
            const allExp=[...(eq.certifications||[]).map(c=>c.expiryDate),...(eq.insurance||[]).map(c=>c.expiryDate),...(eq.permits||[]).map(c=>c.expiryDate)];
            const alerts=allExp.filter(d=>{const x=daysUntil(d);return x!==null&&x<=90;}).length;
            const sCol=STATUS_COLORS[eq.status]||T.textMuted;
            return (
              <div key={eq.id} className="fade-up" onClick={()=>setSelEq(eq)}
                style={{background:T.card,border:`1px solid ${alerts>0?T.gold:T.border}`,borderLeft:`4px solid ${sCol}`,borderRadius:12,padding:"16px 18px",cursor:"pointer",animationDelay:`${i*.03}s`,transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.cardHover}
                onMouseLeave={e=>e.currentTarget.style.background=T.card}>
                <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.text}}>{eq.name}</span>
                      {eq.status&&<Tag color={sCol}>{eq.status}</Tag>}
                      {alerts>0&&<Tag color={T.gold}>{alerts} expiring</Tag>}
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {eq.model&&<Chip>{eq.model}</Chip>}
                      {eq.serialNo&&<Chip>S/N: {eq.serialNo}</Chip>}
                      {eq.project&&<Chip>{eq.project}</Chip>}
                      {eq.operator&&<Chip>Op: {eq.operator}</Chip>}
                    </div>
                    <div style={{marginTop:8,fontSize:12,color:T.textMuted,display:"flex",gap:12}}>
                      <span>📜 {(eq.certifications||[]).length} certs</span>
                      <span>🧾 {(eq.invoices||[]).length} invoices</span>
                      <span>🛡 {(eq.insurance||[]).length} insurance</span>
                      <span>⬡ {(eq.permits||[]).length} permits</span>
                      <span style={{color:T.blue}}>click to view →</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                    <ABtn color={T.blue} onClick={()=>setModal({mode:"edit",eq})}>✎</ABtn>
                    <ABtn color={T.red}  onClick={()=>{if(window.confirm("Delete this equipment?"))delEq(eq.id);}}>✕</ABtn>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      }

      {modal&&<EqModal mode={modal.mode} eq={modal.eq} projects={projects} onClose={()=>setModal(null)} onSave={saveEq}/>}
      </>}
    </div>
  );
}

/* ─── Equipment Detail ───────────────────────────────────────────────────── */
function EquipmentDetail({eq,projects,onBack,onUpdate,onDelete,onEdit,showToast}) {
  const [activeTab,setActiveTab]=useState("certifications");
  const [subModal, setSubModal] =useState(null);

  const EQ_SUBTABS=[
    {id:"certifications",label:"Certifications",icon:"📜",color:T.blue},
    {id:"invoices",      label:"Invoices",      icon:"🧾",color:T.green},
    {id:"insurance",     label:"Insurance",     icon:"🛡",color:T.purple},
    {id:"permits",       label:"Permits",       icon:"⬡",color:T.gold},
  ];

  const eqFileRef=useRef();
  const saveSubRecord=(type,rec,mode)=>{
    setSubModal(null);
    setTimeout(()=>{
      const list=[...(eq[type]||[])];
      if(mode==="add")list.push({...rec,id:uid()});
      else{const i=list.findIndex(r=>r.id===rec.id);if(i>=0)list[i]=rec;}
      onUpdate({...eq,[type]:list});
      showToast(mode==="add"?"Record added":"Record updated");
    },0);
  };

  const delSubRecord=(type,id)=>{
    const list=(eq[type]||[]).filter(r=>r.id!==id);
    onUpdate({...eq,[type]:list});
    showToast("Deleted","del");
  };

  // Import equipment certifications from Excel for THIS equipment
  // Columns: EQUIPMENT, SERIAL NO, CERT NO, ISSUED BY, INSPECTION DATE, EXPIRY DATE
  const importEqCerts = file => {
    const reader=new FileReader();
    reader.onload=e=>{
      try{
        // Headers on row 1 in Equipment_TUV_Tracker.xlsx (Sheet3)
        const wb=XLSX.read(e.target.result,{type:"array",cellDates:true});
        const sheetName=wb.SheetNames.includes("TUV MASTERSHEET")?"TUV MASTERSHEET":wb.SheetNames.includes("Sheet3")?"Sheet3":wb.SheetNames[0];
        const ws=wb.Sheets[sheetName];
        const rawRows=XLSX.utils.sheet_to_json(ws,{defval:""});
        const rows=rawRows.map(row=>{const n={};Object.entries(row).forEach(([k,v])=>{n[k.toUpperCase().trim()]=v;});return n;});
        const parsed=parseExcelRows(rows,EQ_CERT_MAP);
        if(!parsed.length){showToast(`No valid rows found in sheet: ${sheetName}`,"del");return;}
        const certs=parsed.map(r=>({
          id:uid(),
          equipmentName:r.eqName||eq.name||"",
          itemType:r.itemType||"",
          certNo:r.certNo||"",
          issuedBy:r.issuedBy||"",
          issueDate:r.issueDate||"",
          expiryDate:r.expiryDate||"",
          serialNo:r.serialNo||eq.serialNo||"",
          fileLink:"",
        }));
        onUpdate({...eq,certifications:[...(eq.certifications||[]),...certs]});
        showToast(`✓ Imported ${certs.length} certifications from ${sheetName}`);
      }catch(err){showToast("Failed to read file","del");console.error(err);}
    };
    reader.readAsArrayBuffer(file);
  };

  const curTab=EQ_SUBTABS.find(t=>t.id===activeTab);
  const records=eq[activeTab]||[];

  return (
    <div style={{maxWidth:"min(1200px,95vw)",margin:"0 auto",width:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={onBack} style={{background:T.card,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:600}}>← Back</button>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,color:T.text}}>{eq.name}</div>
          <div style={{fontSize:12,color:T.textMuted}}>{eq.model} · {eq.serialNo} · {eq.project}</div>
        </div>
        <Btn color={T.blue} onClick={onEdit}>✎ Edit</Btn>
        <Btn color={T.red}  onClick={()=>{if(window.confirm("Delete?"))onDelete();}}>✕ Delete</Btn>
      </div>

      {/* Info strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:22}}>
        {[["Status",eq.status,"—"],["Operator",eq.operator,"—"],["Project",eq.project,"—"],["Purchase Date",fmtDate(eq.purchaseDate),"—"]].map(([k,v])=>(
          <div key={k} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px"}}>
            <div style={{fontSize:10,color:T.textMuted,fontWeight:700,marginBottom:4,letterSpacing:".5px"}}>{k.toUpperCase()}</div>
            <div style={{fontSize:14,color:T.text,fontWeight:600}}>{v||"—"}</div>
          </div>
        ))}
      </div>

      {/* 90-day expiry alert banner */}
      {(()=>{
        const expiring=[...(eq.certifications||[]),...(eq.insurance||[]),...(eq.permits||[])].filter(r=>{const d=daysUntil(r.expiryDate);return d!==null&&d<=90;}).sort((a,b)=>daysUntil(a.expiryDate)-daysUntil(b.expiryDate));
        if(!expiring.length) return null;
        return (
          <div style={{background:T.redDim,border:`1px solid ${T.red}44`,borderRadius:12,padding:"12px 16px",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:14,fontWeight:700,color:T.red}}>⚠ EXPIRY ALERTS</span>
              <span style={{background:T.red,color:"#fff",borderRadius:999,padding:"1px 8px",fontSize:11,fontWeight:700}}>{expiring.length}</span>
            </div>
            <div style={{display:"grid",gap:6}}>
              {expiring.map((r,i)=>{
                const d=daysUntil(r.expiryDate);const s=getStatus(d);
                const lbl=r.equipmentName||r.itemType||r.certNo||r.policyNo||r.permitNo||"Item";
                return (
                  <div key={r.id||i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:T.bg,borderRadius:8,padding:"8px 12px",border:`1px solid ${s.color}33`}}>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lbl}</div>
                      <div style={{fontSize:12,color:T.textSub,marginTop:1}}>Expires: {fmtDate(r.expiryDate)}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20,color:s.color,lineHeight:1}}>{Math.abs(d)}</div>
                      <div style={{fontSize:9,color:T.textMuted,fontWeight:600}}>{d<0?"OVERDUE":"DAYS LEFT"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Sub-tabs */}
      <div style={{display:"flex",gap:8,marginBottom:18,overflowX:"auto",paddingBottom:4}}>
        {EQ_SUBTABS.map(t=>{
          const cnt=(eq[t.id]||[]).length;
          const active=activeTab===t.id;
          return (
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flexShrink:0,padding:"8px 16px",borderRadius:999,border:`1px solid ${active?t.color:T.border}`,background:active?`${t.color}18`:"transparent",color:active?t.color:T.textSub,fontSize:13,fontWeight:active?700:500,display:"flex",alignItems:"center",gap:6,transition:"all .15s"}}>
              {t.icon} {t.label} <span style={{background:active?t.color:T.border,color:active?"#000":T.textMuted,borderRadius:999,padding:"1px 7px",fontSize:11,fontWeight:700}}>{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* Excel import banner — only for certifications tab */}
      {activeTab==="certifications"&&(
        <div style={{background:T.blueDim,border:`1px solid ${T.blue}33`,borderRadius:12,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:T.blue}}>📂 Import Certifications from Excel</div>
            <div style={{fontSize:12,color:T.textSub,marginTop:2}}>Columns: <strong style={{color:T.textSub}}>ITEM TYPE, ITEM NAME/ID, REG/SERIAL NO, TUV PROVIDER, START DATE, EXPIRY DATE</strong> (Sheet3 auto-detected)</div>
          </div>
          <input ref={eqFileRef} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{if(e.target.files[0]){importEqCerts(e.target.files[0]);e.target.value="";}}}/>
          <button onClick={()=>eqFileRef.current.click()} style={{background:T.blue,color:"#000",border:"none",borderRadius:8,padding:"7px 16px",fontSize:12,fontWeight:700,flexShrink:0}}>⬆ Upload Excel</button>
        </div>
      )}
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <Btn color={curTab.color} solid onClick={()=>setSubModal({mode:"add",type:activeTab})}>+ Add {curTab.label.replace(/s$/,"")}</Btn>
      </div>

      {records.length===0
        ?<Empty icon={curTab.icon} label={`No ${curTab.label.toLowerCase()}`} sub={`Add the first record`} color={curTab.color} onAdd={()=>setSubModal({mode:"add",type:activeTab})}/>
        :<div style={{display:"grid",gap:10}}>
          {records.map((r,i)=><SubRecordCard key={r.id} r={r} type={activeTab} color={curTab.color} delay={i*.03} onEdit={()=>setSubModal({mode:"edit",type:activeTab,rec:r})} onDel={()=>delSubRecord(activeTab,r.id)}/>)}
        </div>
      }

      {subModal&&<SubRecordModal mode={subModal.mode} type={subModal.type} rec={subModal.rec} onClose={()=>setSubModal(null)} onSave={(rec,mode)=>saveSubRecord(subModal.type,rec,mode)}/>}
    </div>
  );
}

function SubRecordCard({r,type,color,delay,onEdit,onDel}) {
  const expDate=r.expiryDate;
  const days=daysUntil(expDate);
  const s=getStatus(days);
  // Build a meaningful title from whatever fields exist
  const title=r.equipmentName||r.itemType||r.certNo||r.invoiceNo||r.policyNo||r.permitNo||"Record";
  return (
    <div className="fade-up" style={{background:T.card,border:`1px solid ${expDate&&days!==null&&days<=90?s.color+"44":T.border}`,borderLeft:`4px solid ${expDate?s.color:color}`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,animationDelay:`${delay}s`}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.text}}>{title}</span>
          {expDate&&<Tag color={s.color}>{s.label}</Tag>}
          {expDate&&days!==null&&days<=90&&<Tag color={s.color}>{days<0?`${Math.abs(days)}d overdue`:`${days}d left`}</Tag>}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {r.itemType&&r.itemType!==title&&<Chip>{r.itemType}</Chip>}
          {r.serialNo&&<Chip>S/N: {r.serialNo}</Chip>}
          {r.certNo&&r.certNo!==title&&<Chip>Cert: {r.certNo}</Chip>}
          {r.issuedBy&&<Chip>{r.issuedBy}</Chip>}
          {r.supplier&&<Chip>{r.supplier}</Chip>}
          {r.insurer&&<Chip>{r.insurer}</Chip>}
          {r.type&&<Chip>{r.type}</Chip>}
          {r.amount&&<Chip color={T.green}>SAR {Number(r.amount).toLocaleString()}</Chip>}
          {r.issueDate&&<Chip>Start: {fmtDate(r.issueDate)}</Chip>}
          {r.date&&<Chip>Date: {fmtDate(r.date)}</Chip>}
          {expDate&&<Chip color={s.color}>Exp: {fmtDate(expDate)}</Chip>}
          {r.fileLink&&<FileLink href={r.fileLink}/>}
        </div>
        {r.description&&<div style={{marginTop:6,fontSize:12,color:T.textMuted,fontStyle:"italic"}}>{r.description}</div>}
      </div>
      <div style={{display:"flex",gap:6,flexShrink:0}}>
        <ABtn color={T.blue} onClick={onEdit}>✎</ABtn>
        <ABtn color={T.red}  onClick={onDel}>✕</ABtn>
      </div>
    </div>
  );
}

function SubRecordModal({mode,type,rec,onClose,onSave}) {
  const [f,setF]=useState(rec||{});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  const CONFIGS={
    certifications:{color:T.blue,  title:"CERTIFICATION",  fields:[["certNo","Certificate No."],["issuedBy","Issued By"],["issueDate","Issue Date","date"],["expiryDate","Expiry Date","date"],["fileLink","File Link","link"]]},
    invoices:      {color:T.green, title:"INVOICE",        fields:[["invoiceNo","Invoice No.","","req"],["supplier","Supplier","","req"],["amount","Amount (SAR)"],["date","Invoice Date","date"],["description","Description","textarea"],["fileLink","File Link","link"]]},
    insurance:     {color:T.purple,title:"INSURANCE",      fields:[["policyNo","Policy No.","","req"],["insurer","Insurer","","req"],["type","Policy Type"],["issueDate","Issue Date","date"],["expiryDate","Expiry Date","date"],["fileLink","File Link","link"]]},
    permits:       {color:T.gold,  title:"PERMIT",         fields:[["permitNo","Permit No.","","req"],["type","Permit Type"],["issuedBy","Issued By"],["issueDate","Issue Date","date"],["expiryDate","Expiry Date","date"],["fileLink","File Link","link"]]},
  };
  const cfg=CONFIGS[type]||CONFIGS.certifications;
  return (
    <FormModal title={`${mode==="add"?"ADD":"EDIT"} ${cfg.title}`} color={cfg.color} onClose={onClose}
      onSave={()=>{onSave(f,mode);}}>
      {cfg.fields.map(([k,label,ftype,req])=>(
        <FieldRow key={k} label={`${label}${req?" *":""}`}>
          {ftype==="textarea"
            ?<FTextarea value={f[k]||""} onChange={set(k)} color={cfg.color}/>
            :ftype==="link"
              ?<FLink value={f[k]||""} onChange={set(k)}/>
              :<FInput type={ftype||"text"} value={f[k]||""} onChange={set(k)} color={cfg.color}/>
          }
        </FieldRow>
      ))}
    </FormModal>
  );
}

function EqModal({mode,eq,projects,onClose,onSave}) {
  const [f,setF]=useState(eq||{});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return (
    <FormModal title={`${mode==="add"?"ADD":"EDIT"} EQUIPMENT`} color={T.gold} onClose={onClose}
      onSave={()=>{if(!f.name){alert("Equipment name required");return;}onSave(f,mode);}}>
      <FieldRow label="Equipment Name *"><FInput value={f.name||""} onChange={set("name")} color={T.gold}/></FieldRow>
      <FieldRow label="Model / Make"><FInput value={f.model||""} onChange={set("model")} color={T.gold}/></FieldRow>
      <FieldRow label="Serial Number"><FInput value={f.serialNo||""} onChange={set("serialNo")} color={T.gold}/></FieldRow>
      <FieldRow label="Project">
        <FSelect value={f.project||""} onChange={set("project")} color={T.gold}>
          <option value="">Select…</option>
          {projects.map(p=><option key={p} value={p}>{p}</option>)}
        </FSelect>
      </FieldRow>
      <FieldRow label="Status">
        <FSelect value={f.status||""} onChange={set("status")} color={T.gold}>
          <option value="">Select…</option>
          <option>Active</option><option>Under Maintenance</option><option>Inactive</option>
        </FSelect>
      </FieldRow>
      <FieldRow label="Operator / Responsible Person"><FInput value={f.operator||""} onChange={set("operator")} color={T.gold}/></FieldRow>
      <FieldRow label="Purchase Date"><FInput type="date" value={f.purchaseDate||""} onChange={set("purchaseDate")} color={T.gold}/></FieldRow>
      <FieldRow label="Notes"><FTextarea value={f.notes||""} onChange={set("notes")} color={T.gold}/></FieldRow>
    </FormModal>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SHARED COMPONENTS
════════════════════════════════════════════════════════════════════════════ */
function PageHeader({title,sub,color,children}) {
  return (
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:22}}>
      <div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:26,color:T.text}}>{title}</div>
        <div style={{fontSize:13,color:T.textMuted,marginTop:2}}>{sub}</div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>{children}</div>
    </div>
  );
}

function Empty({icon,label,sub,color,onAdd}) {
  return (
    <div style={{textAlign:"center",padding:"60px 20px",background:T.card,borderRadius:14,border:`1px dashed ${T.border}`}}>
      <div style={{fontSize:44,color,opacity:.2,marginBottom:14}}>{icon}</div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.textSub,marginBottom:6}}>{label}</div>
      <div style={{fontSize:13,color:T.textMuted,marginBottom:22}}>{sub}</div>
      <button onClick={onAdd} style={{background:color,color:"#000",border:"none",borderRadius:8,padding:"9px 22px",fontSize:13,fontWeight:700}}>+ Add Now</button>
    </div>
  );
}

function Overlay({ children, onClose }) {
  const { height: viewportHeight } = useViewport();

  // Smart centering logic
  const isShortScreen = viewportHeight < 700;

  return (
    <div
      className="fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 200,
        display: "flex",
        justifyContent: "center",

        // 👇 KEY CHANGE
        alignItems: isShortScreen ? "flex-start" : "center",

        // 👇 dynamic spacing
        padding: isShortScreen ? "20px 16px" : "32px 16px",

        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function FormModal({ title, color, children, onClose, onSave }) {
  return (
    <Overlay onClose={onClose}>
      <div
        className="slide-up"
        style={{
          background: T.sidebar,
          border: `1px solid ${T.border}`,
          borderRadius: 18,
          width: "100%",
          maxWidth: 560,
          maxHeight: "calc(100vh - 48px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontWeight: 800,
              fontSize: 20,
              color: T.text,
              letterSpacing: ".5px",
            }}
          >
            {title}
          </div>

          <button
            onClick={onClose}
            style={{
              background: T.bg,
              border: `1px solid ${T.border}`,
              color: T.textSub,
              borderRadius: 8,
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              flexShrink: 0,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            flex: 1,
            minHeight: 0,
          }}
        >
          {children}
        </div>

        <div
          style={{
            padding: "14px 24px 22px",
            display: "flex",
            gap: 10,
            borderTop: `1px solid ${T.border}`,
            flexShrink: 0,
            background: T.sidebar,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: T.bg,
              border: `1px solid ${T.border}`,
              color: T.textSub,
              borderRadius: 10,
              padding: "12px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            style={{
              flex: 2,
              background: color,
              border: "none",
              color: "#000",
              borderRadius: 10,
              padding: "12px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function CatManagerModal({title,cats,onSave,onClose}) {
  const [list,setList]=useState([...cats]);
  const [newCat,setNewCat]=useState("");
  const add=()=>{const n=newCat.trim();if(!n||list.includes(n))return;setList(l=>[...l,n]);setNewCat("");};
  return (
    <Overlay onClose={onClose}>
      <div className="slide-up" style={{background:T.sidebar,border:`1px solid ${T.border}`,borderRadius:18,width:"100%",maxWidth:440,maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"20px 22px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.text}}>{title.toUpperCase()}</div>
          <button onClick={onClose} style={{background:T.bg,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>×</button>
        </div>
        <div style={{padding:"14px 22px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          <div style={{display:"flex",gap:8}}>
            <input value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="New category name…"
              style={{flex:1,background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",colorScheme:"light"}}
              onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/>
            <button onClick={add} style={{background:T.green,color:"#000",border:"none",borderRadius:8,padding:"9px 16px",fontSize:13,fontWeight:700,flexShrink:0}}>+ Add</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"12px 22px"}}>
          {list.map((c,i)=>(
            <div key={c} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:T.bg,borderRadius:9,marginBottom:7,border:`1px solid ${T.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:T.blue}}/>
                <span style={{fontSize:14,color:T.text}}>{c}</span>
              </div>
              <button onClick={()=>setList(l=>l.filter(x=>x!==c))} style={{background:T.redDim,border:`1px solid ${T.red}33`,color:T.red,borderRadius:7,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700}}>✕</button>
            </div>
          ))}
        </div>
        <div style={{padding:"12px 22px 22px",flexShrink:0}}>
          <button onClick={()=>{onSave(list);onClose();}} style={{width:"100%",background:T.blue,border:"none",color:"#000",borderRadius:10,padding:"12px",fontSize:14,fontWeight:700}}>Save Categories</button>
        </div>
      </div>
    </Overlay>
  );
}

function FieldRow({label,children}) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:12,fontWeight:700,color:T.textSub,marginBottom:6,letterSpacing:".3px"}}>{label}</label>
      {children}
    </div>
  );
}

function SectionDivider({label}) {
  return <div style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"1.5px",marginTop:16,marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${T.border}`}}>{label}</div>;
}

function FInput({type,value,onChange,color,placeholder}) {
  return <input type={type||"text"} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 13px",fontSize:14,color:T.text,outline:"none",colorScheme:"light",transition:"border-color .15s"}}
    onFocus={e=>e.target.style.borderColor=color||T.blue} onBlur={e=>e.target.style.borderColor=T.border}/>;
}

function FTextarea({value,onChange,color}) {
  return <textarea value={value} onChange={e=>onChange(e.target.value)} rows={3}
    style={{width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 13px",fontSize:14,color:T.text,outline:"none",resize:"vertical",colorScheme:"light",transition:"border-color .15s"}}
    onFocus={e=>e.target.style.borderColor=color||T.blue} onBlur={e=>e.target.style.borderColor=T.border}/>;
}

function FSelect({value,onChange,color,children}) {
  return <select value={value} onChange={e=>onChange(e.target.value)}
    style={{width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 13px",fontSize:14,color:value?T.text:T.textMuted,outline:"none",colorScheme:"light",transition:"border-color .15s"}}
    onFocus={e=>e.target.style.borderColor=color||T.blue} onBlur={e=>e.target.style.borderColor=T.border}>
    {children}
  </select>;
}

function FLink({value,onChange,folder}) {
  const [uploading,setUploading] = useState(false);
  const [uploadErr,setUploadErr] = useState("");
  const fileRef = useRef();
  const configured = isSupabaseConfigured();

  const handleUpload = async e => {
    const file = e.target.files[0];
    if(!file) return;
    if(file.size > 50*1024*1024) { setUploadErr("File too large (max 50MB)"); return; }
    setUploading(true); setUploadErr("");
    try {
      const url = await uploadToSupabase(file, folder||"general");
      onChange(url);
      setUploadErr("");
    } catch(err) {
      setUploadErr("Upload failed: " + err.message);
    } finally { setUploading(false); }
    e.target.value="";
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <div style={{display:"flex",gap:6}}>
        <input type="url" value={value} onChange={e=>onChange(e.target.value)}
          placeholder="Paste link or upload file below…"
          style={{flex:1,background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:T.blue,outline:"none",colorScheme:"light"}}
          onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/>
        {value&&(
          <a href={value} target="_blank" rel="noreferrer"
            style={{background:T.blueDim,border:`1px solid ${T.blue}33`,color:T.blue,borderRadius:8,padding:"0 12px",fontSize:12,fontWeight:600,flexShrink:0,cursor:"pointer",textDecoration:"none",display:"flex",alignItems:"center",whiteSpace:"nowrap"}}>
            ↗ Open
          </a>
        )}
      </div>
      {configured && (
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <input ref={fileRef} type="file" style={{display:"none"}} onChange={handleUpload}/>
          <button type="button" onClick={()=>fileRef.current.click()} disabled={uploading}
            style={{background:T.greenDim,border:`1px solid ${T.green}44`,color:T.green,borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,opacity:uploading?0.6:1}}>
            {uploading ? "⏳ Uploading…" : "⬆ Upload File"}
          </button>
          <span style={{fontSize:11,color:T.textMuted}}>PDF, Word, Excel, images up to 50MB</span>
        </div>
      )}
      {!configured && (
        <div style={{fontSize:11,color:T.textMuted,padding:"5px 8px",background:T.goldDim,borderRadius:6,border:`1px solid ${T.gold}33`}}>
          💡 Add your Supabase keys to enable direct file upload
        </div>
      )}
      {uploadErr && <div style={{fontSize:11,color:T.red}}>{uploadErr}</div>}

    </div>
  );
}


/* ════════════════════════════════════════════════════════════════════════════
   FILE PREVIEW MODAL
════════════════════════════════════════════════════════════════════════════ */
function FilePreviewModal({url,onClose}) {
  // Detect file type from URL
  const clean   = url.split("?")[0].toLowerCase();
  const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/.test(clean);
  const isPdf   = /\.pdf$/.test(clean);
  const isOffice= /\.(doc|docx|xls|xlsx|ppt|pptx)$/.test(clean);
  const isSupabase   = url.includes("supabase.co/storage");
  const isGDrive     = url.includes("drive.google.com");
  const isOneDrive   = url.includes("1drv.ms") || url.includes("onedrive.live.com");
  const isSharePoint = url.includes("sharepoint.com");

  // Build the best embed URL for each case
  const embedUrl = (() => {
    if (isImage) return url;
    // PDFs from Supabase — use Google PDF viewer as proxy (avoids X-Frame-Options)
    if (isPdf || isSupabase) return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    // Office files — Microsoft Office Online viewer
    if (isOffice) return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    // Google Drive — convert to preview embed
    if (isGDrive) {
      const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
    }
    // OneDrive
    if (isOneDrive) return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    // SharePoint
    if (isSharePoint) return url + (url.includes("?") ? "&action=embedview" : "?action=embedview");
    return url;
  })();

  const filename = url.split("/").pop().split("?")[0] || "File";

  return (
    <div className="fade-in" onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:9000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px"}}>
      <div className="slide-up" style={{background:T.sidebar,border:`1px solid ${T.border}`,borderRadius:16,width:"min(96vw,1000px)",height:"min(92vh,800px)",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 64px rgba(0,0,0,0.6)"}}>

        {/* ── Header ── */}
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <span style={{fontSize:18}}>{isImage?"🖼️":isPdf||isSupabase?"📄":isOffice?"📊":"📎"}</span>
          <div style={{flex:1,fontSize:13,fontWeight:600,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{decodeURIComponent(filename)}</div>
          <a href={url} download target="_blank" rel="noreferrer"
            style={{background:T.greenDim,border:`1px solid ${T.green}44`,color:T.green,borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
            ⬇ Download
          </a>
          <a href={url} target="_blank" rel="noreferrer"
            style={{background:T.blueDim,border:`1px solid ${T.blue}44`,color:T.blue,borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
            ↗ New Tab
          </a>
          <button onClick={onClose}
            style={{background:T.redDim,border:`1px solid ${T.red}44`,color:T.red,borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,cursor:"pointer",flexShrink:0}}>
            ✕
          </button>
        </div>

        {/* ── Preview ── */}
        <div style={{flex:1,overflow:"hidden",background:T.bg,position:"relative"}}>
          {isImage ? (
            <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
              <img src={url} alt="Preview"
                style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain",borderRadius:8,boxShadow:"0 4px 24px rgba(0,0,0,0.3)"}}/>
            </div>
          ) : (
            <iframe
              key={embedUrl}
              src={embedUrl}
              style={{width:"100%",height:"100%",border:"none"}}
              title="File Preview"
              allow="autoplay; fullscreen"
            />
          )}
        </div>

        {/* ── Footer tip for Google Viewer ── */}
        {(isPdf||isSupabase)&&!isImage&&(
          <div style={{padding:"8px 16px",background:T.goldDim,borderTop:`1px solid ${T.gold}33`,fontSize:11,color:T.gold,display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
            💡 If preview doesn't load, click <strong>↗ New Tab</strong> to open directly — or <strong>⬇ Download</strong> to save the file.
          </div>
        )}
      </div>
    </div>
  );
}

const Chip     = ({children,color}) => <span style={{background:T.bg,border:`1px solid ${T.borderLight}`,borderRadius:6,padding:"2px 9px",fontSize:12,color:color||T.textSub,fontWeight:500}}>{children}</span>;
const Tag      = ({children,color}) => <span style={{background:`${color}18`,border:`1px solid ${color}33`,borderRadius:5,padding:"2px 8px",fontSize:11,color,fontWeight:700}}>{children}</span>;
const ABtn     = ({onClick,color,children}) => <button onClick={onClick} style={{width:30,height:30,borderRadius:7,border:`1px solid ${color}33`,background:`${color}18`,color,fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</button>;
const FileLink = ({href}) => {
  if(!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
      style={{background:T.blueDim,border:`1px solid ${T.blue}33`,borderRadius:6,padding:"3px 10px",fontSize:12,color:T.blue,fontWeight:600,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4}}>
      📎 View File
    </a>
  );
};
function BulkUploadModal({ subTab, projects, onClose, onImport }) {
  const [rows, setRows]       = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [step, setStep]       = useState(1); // 1=upload, 2=map, 3=preview
  const [fileName, setFileName] = useState("");
  const [error, setError]     = useState("");
  const fileRef               = useRef();

  const FIELD_DEFS = {
    invoices:     [
      {key:"name",           label:"Invoice Title *", required:true},
      {key:"project",        label:"Project"},
      {key:"invoiceType",    label:"Invoice Type (Income / Advance)"},
      {key:"refNo",          label:"Invoice No."},
      {key:"dueDate",        label:"Due Date"},
      {key:"amount",         label:"Amount (SAR)"},
      {key:"paymentStatus",  label:"Payment Status"},
      {key:"remainingAmount",label:"Remaining Amount (SAR)"},
      {key:"notes",          label:"Notes"},
    ],
    certificates: [
      {key:"project",        label:"Project"},
      {key:"jobNo",          label:"Job Number"},
      {key:"refNo",          label:"Certificate No."},
      {key:"startDate",      label:"Start Date"},
      {key:"completionDate", label:"Completion Date"},
      {key:"amount",         label:"Invoice Value (SAR)"},
      {key:"notes",          label:"Notes"},
    ],
    workorders: [
      {key:"name",       label:"Title *", required:true},
      {key:"project",    label:"Project"},
      {key:"refNo",      label:"Reference No."},
      {key:"supplier",   label:"Client / Counterparty"},
      {key:"amount",     label:"Contract Value (SAR)"},
      {key:"date",       label:"Date Signed"},
      {key:"expiryDate", label:"Expiry / End Date"},
      {key:"notes",      label:"Notes"},
    ],
  };

  const fields = FIELD_DEFS[subTab] || FIELD_DEFS.invoices;

  const TAB_COLORS = { invoices: T.green, certificates: T.blue, workorders: T.purple };
  const color = TAB_COLORS[subTab] || T.blue;

  // Auto-map: match header to field by fuzzy name comparison
  const autoMap = (hdrs) => {
    const m = {};
    fields.forEach(f => {
      const match = hdrs.find(h => {
        const hn = h.toLowerCase().replace(/[^a-z]/g,"");
        const fn = f.label.toLowerCase().replace(/[^a-z]/g,"");
        const fk = f.key.toLowerCase();
        return hn.includes(fk) || fk.includes(hn) || hn.includes(fn.slice(0,5)) || fn.includes(hn.slice(0,5));
      });
      if (match) m[f.key] = match;
    });
    return m;
  };

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "csv") {
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const lines = ev.target.result.split(/\r?\n/).filter(l => l.trim());
          if (!lines.length) { setError("Empty CSV file"); return; }
          const hdrs = lines[0].split(",").map(h => h.replace(/^"|"$/g,"").trim());
          const data = lines.slice(1).filter(l=>l.trim()).map(line => {
            const vals = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) || line.split(",");
            const row = {};
            hdrs.forEach((h,i) => { row[h] = (vals[i]||"").replace(/^"|"$/g,"").trim(); });
            return row;
          }).filter(r => Object.values(r).some(v=>v));
          setHeaders(hdrs);
          setRows(data);
          setMapping(autoMap(hdrs));
          setStep(2);
        } catch(err) { setError("Failed to parse CSV: " + err.message); }
      };
      reader.readAsText(file);
    } else {
      // Excel
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const wb = XLSX.read(ev.target.result, { type:"array", cellDates:true });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rawRows = XLSX.utils.sheet_to_json(ws, { defval:"" });
          if (!rawRows.length) { setError("No data rows found in Excel file"); return; }
          const hdrs = Object.keys(rawRows[0]);
          const data = rawRows.filter(r => Object.values(r).some(v=>v!==null&&v!==""));
          setHeaders(hdrs);
          setRows(data);
          setMapping(autoMap(hdrs));
          setStep(2);
        } catch(err) { setError("Failed to parse Excel: " + err.message); }
      };
      reader.readAsArrayBuffer(file);
    }
    e.target.value = "";
  };

  const buildPreviewRows = () => {
    return rows.map(row => {
      const rec = {};
      fields.forEach(f => {
        const srcCol = mapping[f.key];
        if (srcCol && row[srcCol] !== undefined) {
          let val = String(row[srcCol]).trim();
          // Normalize date values
          if (["dueDate","date","expiryDate","startDate","completionDate","issueDate"].includes(f.key)) {
            val = excelDateToStr(row[srcCol]) || val;
          }
          rec[f.key] = val;
        }
      });
      // Auto-fill project if only one option
      if (!rec.project && projects.length === 1) rec.project = projects[0];
      return rec;
    }).filter(r => fields.filter(f=>f.required).every(f => r[f.key]));
  };

  const previewRows = step >= 3 ? buildPreviewRows() : [];
  const skippedCount = rows.length - previewRows.length;

  const STEP_LABELS = ["Upload File", "Map Columns", "Review & Import"];

  return (
    <Overlay onClose={onClose}>
      <div className="slide-up" style={{
        background: T.sidebar, border:`1px solid ${T.border}`, borderRadius:18,
        width:"100%", maxWidth:680, maxHeight:"calc(100vh - 48px)",
        display:"flex", flexDirection:"column", overflow:"hidden",
        boxShadow:"0 24px 64px rgba(0,0,0,0.6)",
      }}>

        {/* Header */}
        <div style={{padding:"20px 24px 16px", borderBottom:`1px solid ${T.border}`, flexShrink:0}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:20, color:T.text}}>
                BULK UPLOAD — {subTab.toUpperCase()}
              </div>
              <div style={{fontSize:12, color:T.textMuted, marginTop:3}}>
                Import multiple records from CSV or Excel
              </div>
            </div>
            <button onClick={onClose} style={{background:T.bg, border:`1px solid ${T.border}`, color:T.textSub, borderRadius:8, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, cursor:"pointer"}}>×</button>
          </div>

          {/* Step indicator */}
          <div style={{display:"flex", alignItems:"center", gap:0, marginTop:16}}>
            {STEP_LABELS.map((label, i) => {
              const sNum = i + 1;
              const active = step === sNum;
              const done = step > sNum;
              return (
                <div key={i} style={{display:"flex", alignItems:"center", flex: i < 2 ? 1 : "none"}}>
                  <div style={{display:"flex", alignItems:"center", gap:8}}>
                    <div style={{
                      width:28, height:28, borderRadius:"50%",
                      background: done ? color : active ? `${color}33` : T.bg,
                      border: `2px solid ${done||active ? color : T.border}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, fontWeight:800,
                      color: done ? "#000" : active ? color : T.textMuted,
                      flexShrink:0,
                    }}>
                      {done ? "✓" : sNum}
                    </div>
                    <span style={{fontSize:12, fontWeight:active?700:500, color:active?color:T.textMuted, whiteSpace:"nowrap"}}>
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div style={{flex:1, height:2, background: done ? color : T.border, margin:"0 12px"}}/>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{flex:1, overflowY:"auto", padding:"20px 24px"}}>

          {/* ── STEP 1: Upload ── */}
          {step === 1 && (
            <div>
              {/* Template download hint */}
              <div style={{background:T.blueDim, border:`1px solid ${T.blue}33`, borderRadius:12, padding:"14px 16px", marginBottom:20}}>
                <div style={{fontSize:13, fontWeight:700, color:T.blue, marginBottom:6}}>📋 Expected Columns</div>
                <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                  {fields.map(f => (
                    <span key={f.key} style={{background:T.bg, border:`1px solid ${T.border}`, borderRadius:6, padding:"3px 10px", fontSize:12, color:f.required ? color : T.textSub, fontWeight:f.required?700:400}}>
                      {f.label}{f.required?" *":""}
                    </span>
                  ))}
                </div>
                <div style={{fontSize:11, color:T.textMuted, marginTop:8}}>
                  * Required fields. Column names are auto-detected — fuzzy matching will map them automatically.
                </div>
              </div>

              {/* Drop zone */}
              <div
                onClick={() => fileRef.current.click()}
                style={{
                  border:`2px dashed ${color}44`, borderRadius:14,
                  padding:"48px 24px", textAlign:"center",
                  cursor:"pointer", transition:"all .2s",
                  background:`${color}08`,
                }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=color;e.currentTarget.style.background=`${color}14`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=`${color}44`;e.currentTarget.style.background=`${color}08`;}}
              >
                <div style={{fontSize:44, marginBottom:12}}>📂</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:18, color:T.text, marginBottom:6}}>
                  Click to Select File
                </div>
                <div style={{fontSize:13, color:T.textMuted}}>Supports CSV and Excel (.xlsx, .xls)</div>
              </div>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{display:"none"}} onChange={handleFile}/>

              {error && (
                <div style={{marginTop:12, padding:"10px 14px", background:T.redDim, border:`1px solid ${T.red}44`, borderRadius:8, fontSize:13, color:T.red}}>
                  ⚠ {error}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Map Columns ── */}
          {step === 2 && (
            <div>
              <div style={{fontSize:13, color:T.textMuted, marginBottom:16}}>
                📄 <strong style={{color:T.text}}>{fileName}</strong> — {rows.length} rows detected. Map your spreadsheet columns to the correct fields.
              </div>

              <div style={{display:"grid", gap:10}}>
                {fields.map(f => (
                  <div key={f.key} style={{display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:T.bg, borderRadius:10, border:`1px solid ${T.border}`}}>
                    <div style={{width:180, flexShrink:0}}>
                      <div style={{fontSize:13, fontWeight:600, color:f.required?color:T.text}}>{f.label}</div>
                      <div style={{fontSize:11, color:T.textMuted, marginTop:2}}>App field</div>
                    </div>
                    <div style={{fontSize:16, color:T.border, flexShrink:0}}>→</div>
                    <select
                      value={mapping[f.key] || ""}
                      onChange={e => setMapping(m => ({...m, [f.key]: e.target.value || undefined}))}
                      style={{flex:1, background:T.inputBg, border:`1px solid ${mapping[f.key] ? color+"66" : T.border}`, borderRadius:8, padding:"8px 12px", fontSize:13, color:mapping[f.key]?T.text:T.textMuted, outline:"none", colorScheme:"light"}}
                    >
                      <option value="">— Skip this field —</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    {mapping[f.key] && (
                      <div style={{fontSize:11, color:T.green, flexShrink:0, fontWeight:700}}>✓ Mapped</div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{marginTop:16, padding:"10px 14px", background:T.goldDim, border:`1px solid ${T.gold}33`, borderRadius:8, fontSize:12, color:T.gold}}>
                💡 Fields marked with * are required. Rows missing required fields will be skipped during import.
              </div>
            </div>
          )}

          {/* ── STEP 3: Preview ── */}
          {step === 3 && (
            <div>
              <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:16}}>
                <div style={{background:T.greenDim, border:`1px solid ${T.green}33`, borderRadius:8, padding:"8px 14px"}}>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:22, color:T.green}}>{previewRows.length}</span>
                  <span style={{fontSize:12, color:T.textMuted, marginLeft:6}}>ready to import</span>
                </div>
                {skippedCount > 0 && (
                  <div style={{background:T.redDim, border:`1px solid ${T.red}33`, borderRadius:8, padding:"8px 14px"}}>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:22, color:T.red}}>{skippedCount}</span>
                    <span style={{fontSize:12, color:T.textMuted, marginLeft:6}}>skipped (missing required)</span>
                  </div>
                )}
              </div>

              {previewRows.length === 0 ? (
                <div style={{textAlign:"center", padding:"40px", color:T.red, fontSize:14}}>
                  ⚠ No valid rows to import. Go back and check your column mapping.
                </div>
              ) : (
                <div style={{display:"grid", gap:8}}>
                  {previewRows.slice(0, 20).map((row, i) => (
                    <div key={i} style={{background:T.bg, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 14px"}}>
                      <div style={{fontWeight:700, fontSize:14, color:T.text, marginBottom:6}}>
                        {row.name || row.jobNo || `Row ${i+1}`}
                      </div>
                      <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                        {fields.filter(f=>f.key!=="name"&&row[f.key]).map(f => (
                          <span key={f.key} style={{background:T.card, border:`1px solid ${T.borderLight}`, borderRadius:5, padding:"2px 8px", fontSize:11, color:T.textSub}}>
                            {f.label.replace(" *","")}: <strong style={{color:T.text}}>{row[f.key]}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {previewRows.length > 20 && (
                    <div style={{textAlign:"center", fontSize:13, color:T.textMuted, padding:"10px"}}>
                      … and {previewRows.length - 20} more rows
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{padding:"14px 24px 22px", borderTop:`1px solid ${T.border}`, display:"flex", gap:10, flexShrink:0}}>
          {step > 1 && (
            <button onClick={()=>setStep(s=>s-1)} style={{background:T.bg, border:`1px solid ${T.border}`, color:T.textSub, borderRadius:10, padding:"12px 20px", fontSize:14, fontWeight:600, cursor:"pointer"}}>
              ← Back
            </button>
          )}
          <button onClick={onClose} style={{background:T.bg, border:`1px solid ${T.border}`, color:T.textSub, borderRadius:10, padding:"12px 20px", fontSize:14, fontWeight:600, cursor:"pointer"}}>
            Cancel
          </button>
          <div style={{flex:1}}/>
          {step === 1 && (
            <button onClick={()=>fileRef.current.click()} style={{background:color, border:"none", color:"#000", borderRadius:10, padding:"12px 28px", fontSize:14, fontWeight:700, cursor:"pointer"}}>
              Select File
            </button>
          )}
          {step === 2 && (
            <button onClick={()=>setStep(3)} style={{background:color, border:"none", color:"#000", borderRadius:10, padding:"12px 28px", fontSize:14, fontWeight:700, cursor:"pointer"}}>
              Preview Import →
            </button>
          )}
          {step === 3 && previewRows.length > 0 && (
            <button onClick={()=>onImport(previewRows)} style={{background:T.green, border:"none", color:"#000", borderRadius:10, padding:"12px 28px", fontSize:15, fontWeight:800, cursor:"pointer"}}>
              ✓ Import {previewRows.length} Records
            </button>
          )}
        </div>
      </div>
    </Overlay>
  );
}

// ═══════════════════════════════════════════════════════════════════
// NEW COMPONENT — ScorpionBulkModal (for Scorpion Documents bulk upload)
// ═══════════════════════════════════════════════════════════════════

function ScorpionBulkModal({ cats, onClose, onImport }) {
  const [rows, setRows]     = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [step, setStep]     = useState(1);
  const [fileName, setFileName] = useState("");
  const [error, setError]   = useState("");
  const fileRef             = useRef();

  const fields = [
    {key:"name",       label:"Document Name *", required:true},
    {key:"category",   label:"Category"},
    {key:"docNo",      label:"Reference / Doc No."},
    {key:"issueDate",  label:"Issue Date"},
    {key:"expiryDate", label:"Expiry Date"},
    {key:"fileLink",   label:"File Link"},
    {key:"notes",      label:"Notes"},
  ];

  const autoMap = hdrs => {
    const m = {};
    fields.forEach(f => {
      const match = hdrs.find(h => {
        const hn = h.toLowerCase().replace(/[^a-z]/g,"");
        const fk = f.key.toLowerCase();
        return hn.includes(fk) || fk.includes(hn);
      });
      if (match) m[f.key] = match;
    });
    return m;
  };

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    const ext = file.name.split(".").pop().toLowerCase();
    const reader = new FileReader();
    if (ext === "csv") {
      reader.onload = ev => {
        try {
          const lines = ev.target.result.split(/\r?\n/).filter(l=>l.trim());
          const hdrs = lines[0].split(",").map(h=>h.replace(/^"|"$/g,"").trim());
          const data = lines.slice(1).filter(l=>l.trim()).map(line => {
            const vals = line.split(",");
            const row = {};
            hdrs.forEach((h,i)=>{ row[h]=(vals[i]||"").replace(/^"|"$/g,"").trim(); });
            return row;
          }).filter(r=>Object.values(r).some(v=>v));
          setHeaders(hdrs); setRows(data); setMapping(autoMap(hdrs)); setStep(2);
        } catch(err) { setError("Failed to parse CSV"); }
      };
      reader.readAsText(file);
    } else {
      reader.onload = ev => {
        try {
          const wb = XLSX.read(ev.target.result,{type:"array",cellDates:true});
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rawRows = XLSX.utils.sheet_to_json(ws,{defval:""});
          const hdrs = Object.keys(rawRows[0]||{});
          setHeaders(hdrs); setRows(rawRows.filter(r=>Object.values(r).some(v=>v))); setMapping(autoMap(hdrs)); setStep(2);
        } catch(err) { setError("Failed to parse Excel"); }
      };
      reader.readAsArrayBuffer(file);
    }
    e.target.value="";
  };

  const buildPreview = () => rows.map(row => {
    const rec = {};
    fields.forEach(f => {
      const src = mapping[f.key];
      if (src && row[src] !== undefined) {
        let val = String(row[src]).trim();
        if (["issueDate","expiryDate"].includes(f.key)) val = excelDateToStr(row[src]) || val;
        rec[f.key] = val;
      }
    });
    return rec;
  }).filter(r => r.name);

  const previewRows = step === 3 ? buildPreview() : [];

  const STEP_LABELS = ["Upload File","Map Columns","Review & Import"];

  return (
    <Overlay onClose={onClose}>
      <div className="slide-up" style={{background:T.sidebar, border:`1px solid ${T.border}`, borderRadius:18, width:"100%", maxWidth:640, maxHeight:"calc(100vh - 48px)", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 64px rgba(0,0,0,0.6)"}}>
        <div style={{padding:"20px 24px 16px", borderBottom:`1px solid ${T.border}`, flexShrink:0}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:20, color:T.text}}>BULK UPLOAD — COMPANY DOCUMENTS</div>
              <div style={{fontSize:12, color:T.textMuted, marginTop:3}}>Import multiple documents from CSV or Excel</div>
            </div>
            <button onClick={onClose} style={{background:T.bg,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:8,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer"}}>×</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:0,marginTop:16}}>
            {STEP_LABELS.map((label,i)=>{
              const sNum=i+1; const active=step===sNum; const done=step>sNum;
              return (
                <div key={i} style={{display:"flex",alignItems:"center",flex:i<2?1:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:done?T.blue:active?`${T.blue}33`:T.bg,border:`2px solid ${done||active?T.blue:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:done?"#000":active?T.blue:T.textMuted,flexShrink:0}}>
                      {done?"✓":sNum}
                    </div>
                    <span style={{fontSize:12,fontWeight:active?700:500,color:active?T.blue:T.textMuted,whiteSpace:"nowrap"}}>{label}</span>
                  </div>
                  {i<2&&<div style={{flex:1,height:2,background:done?T.blue:T.border,margin:"0 12px"}}/>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
          {step===1&&(
            <div>
              <div style={{background:T.blueDim,border:`1px solid ${T.blue}33`,borderRadius:12,padding:"14px 16px",marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:700,color:T.blue,marginBottom:6}}>📋 Expected Columns</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {fields.map(f=>(
                    <span key={f.key} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,padding:"3px 10px",fontSize:12,color:f.required?T.blue:T.textSub,fontWeight:f.required?700:400}}>{f.label}</span>
                  ))}
                </div>
              </div>
              <div onClick={()=>fileRef.current.click()} style={{border:`2px dashed ${T.blue}44`,borderRadius:14,padding:"48px 24px",textAlign:"center",cursor:"pointer",background:`${T.blue}08`}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.blue;e.currentTarget.style.background=`${T.blue}14`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=`${T.blue}44`;e.currentTarget.style.background=`${T.blue}08`;}}>
                <div style={{fontSize:44,marginBottom:12}}>📂</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:18,color:T.text,marginBottom:6}}>Click to Select File</div>
                <div style={{fontSize:13,color:T.textMuted}}>Supports CSV and Excel (.xlsx, .xls)</div>
              </div>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{display:"none"}} onChange={handleFile}/>
              {error&&<div style={{marginTop:12,padding:"10px 14px",background:T.redDim,border:`1px solid ${T.red}44`,borderRadius:8,fontSize:13,color:T.red}}>⚠ {error}</div>}
            </div>
          )}

          {step===2&&(
            <div>
              <div style={{fontSize:13,color:T.textMuted,marginBottom:16}}>
                📄 <strong style={{color:T.text}}>{fileName}</strong> — {rows.length} rows. Map columns to fields.
              </div>
              <div style={{display:"grid",gap:10}}>
                {fields.map(f=>(
                  <div key={f.key} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:T.bg,borderRadius:10,border:`1px solid ${T.border}`}}>
                    <div style={{width:180,flexShrink:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:f.required?T.blue:T.text}}>{f.label}</div>
                    </div>
                    <div style={{fontSize:16,color:T.border,flexShrink:0}}>→</div>
                    <select value={mapping[f.key]||""} onChange={e=>setMapping(m=>({...m,[f.key]:e.target.value||undefined}))}
                      style={{flex:1,background:T.inputBg,border:`1px solid ${mapping[f.key]?T.blue+"66":T.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:mapping[f.key]?T.text:T.textMuted,outline:"none",colorScheme:"light"}}>
                      <option value="">— Skip —</option>
                      {headers.map(h=><option key={h} value={h}>{h}</option>)}
                    </select>
                    {mapping[f.key]&&<div style={{fontSize:11,color:T.green,flexShrink:0,fontWeight:700}}>✓</div>}
                  </div>
                ))}
              </div>
              {/* Category preview */}
              <div style={{marginTop:14,padding:"10px 14px",background:T.goldDim,border:`1px solid ${T.gold}33`,borderRadius:8,fontSize:12,color:T.gold}}>
                💡 Available categories: {cats.join(", ")}. If "Category" column doesn't match exactly, you can edit after import.
              </div>
            </div>
          )}

          {step===3&&(
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <div style={{background:T.greenDim,border:`1px solid ${T.green}33`,borderRadius:8,padding:"8px 14px"}}>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.green}}>{previewRows.length}</span>
                  <span style={{fontSize:12,color:T.textMuted,marginLeft:6}}>ready to import</span>
                </div>
                {rows.length - previewRows.length > 0 && (
                  <div style={{background:T.redDim,border:`1px solid ${T.red}33`,borderRadius:8,padding:"8px 14px"}}>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.red}}>{rows.length-previewRows.length}</span>
                    <span style={{fontSize:12,color:T.textMuted,marginLeft:6}}>skipped</span>
                  </div>
                )}
              </div>
              {previewRows.length===0
                ?<div style={{textAlign:"center",padding:"40px",color:T.red,fontSize:14}}>⚠ No valid rows. Check column mapping.</div>
                :<div style={{display:"grid",gap:8}}>
                  {previewRows.slice(0,15).map((row,i)=>(
                    <div key={i} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:6}}>{row.name}</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {row.category&&<span style={{background:`${T.blue}18`,borderRadius:5,padding:"2px 8px",fontSize:11,color:T.blue,fontWeight:700}}>{row.category}</span>}
                        {row.docNo&&<Chip>Ref: {row.docNo}</Chip>}
                        {row.issueDate&&<Chip>Issued: {row.issueDate}</Chip>}
                        {row.expiryDate&&<Chip>Expires: {row.expiryDate}</Chip>}
                      </div>
                    </div>
                  ))}
                  {previewRows.length>15&&<div style={{textAlign:"center",fontSize:13,color:T.textMuted,padding:"10px"}}>… and {previewRows.length-15} more</div>}
                </div>
              }
            </div>
          )}
        </div>

        <div style={{padding:"14px 24px 22px",borderTop:`1px solid ${T.border}`,display:"flex",gap:10,flexShrink:0}}>
          {step>1&&<button onClick={()=>setStep(s=>s-1)} style={{background:T.bg,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:10,padding:"12px 20px",fontSize:14,fontWeight:600,cursor:"pointer"}}>← Back</button>}
          <button onClick={onClose} style={{background:T.bg,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:10,padding:"12px 20px",fontSize:14,fontWeight:600,cursor:"pointer"}}>Cancel</button>
          <div style={{flex:1}}/>
          {step===1&&<button onClick={()=>fileRef.current.click()} style={{background:T.blue,border:"none",color:"#000",borderRadius:10,padding:"12px 28px",fontSize:14,fontWeight:700,cursor:"pointer"}}>Select File</button>}
          {step===2&&<button onClick={()=>setStep(3)} style={{background:T.blue,border:"none",color:"#000",borderRadius:10,padding:"12px 28px",fontSize:14,fontWeight:700,cursor:"pointer"}}>Preview →</button>}
          {step===3&&previewRows.length>0&&<button onClick={()=>onImport(previewRows)} style={{background:T.green,border:"none",color:"#000",borderRadius:10,padding:"12px 28px",fontSize:15,fontWeight:800,cursor:"pointer"}}>✓ Import {previewRows.length} Documents</button>}
        </div>
      </div>
    </Overlay>
  );
}
function MultiPdfCertUpload({ project, projects, onClose, onImport }) {
  const [files,       setFiles]       = useState([]); // [{file, name, jobNo, refNo, amount, startDate, completionDate, notes, status}]
  const [uploading,   setUploading]   = useState(false);
  const [progress,    setProgress]    = useState({}); // {filename: "pending"|"uploading"|"done"|"error"}
  const [selProj,     setSelProj]     = useState(project || "");
  const [globalJobNo, setGlobalJobNo] = useState("");
  const dropRef                       = useRef();
  const fileInputRef                  = useRef();

  const STATUS_COLOR = {
    pending:   T.textMuted,
    uploading: T.blue,
    done:      T.green,
    error:     T.red,
  };
  const STATUS_ICON = {
    pending:   "⏳",
    uploading: "↑",
    done:      "✓",
    error:     "✕",
  };

  // Derive a clean display name from filename
  const cleanName = filename => {
    return filename
      .replace(/\.[^.]+$/, "")           // remove extension
      .replace(/[_-]+/g, " ")            // underscores/dashes → spaces
      .replace(/\b\w/g, c => c.toUpperCase()); // title case
  };

  const addFiles = newFiles => {
    const pdfs = Array.from(newFiles).filter(f =>
      /\.(pdf|png|jpg|jpeg|webp|doc|docx)$/i.test(f.name)
    );
    if (!pdfs.length) return;
    const entries = pdfs.map(f => ({
      id:              uid(),
      file:            f,
      displayName:     cleanName(f.name),
      jobNo:           "",
      refNo:           "",
      amount:          "",
      startDate:       "",
      completionDate:  "",
      notes:           "",
    }));
    setFiles(prev => [...prev, ...entries]);
    setProgress(prev => {
      const next = {...prev};
      entries.forEach(e => { next[e.id] = "pending"; });
      return next;
    });
  };

  const removeFile = id => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setProgress(prev => { const n={...prev}; delete n[id]; return n; });
  };

  const updateField = (id, key, val) => {
    setFiles(prev => prev.map(f => f.id === id ? {...f, [key]: val} : f));
  };

  // Drag & drop
  const onDragOver  = e => { e.preventDefault(); dropRef.current.style.borderColor = T.blue; };
  const onDragLeave = e => { dropRef.current.style.borderColor = `${T.blue}44`; };
  const onDrop      = e => {
    e.preventDefault();
    dropRef.current.style.borderColor = `${T.blue}44`;
    addFiles(e.dataTransfer.files);
  };

  const handleUploadAll = async () => {
    if (!selProj) { alert("Please select a project first."); return; }
    if (!files.length) { alert("No files selected."); return; }
    setUploading(true);

    const results = [];

    for (const entry of files) {
      setProgress(prev => ({...prev, [entry.id]: "uploading"}));
      try {
        const url = await uploadToSupabase(entry.file, `certificates/${selProj.replace(/\s+/g,"_")}`);
        setProgress(prev => ({...prev, [entry.id]: "done"}));
        results.push({
          project:        selProj,
          jobNo:          entry.jobNo || globalJobNo || "",
          refNo:          entry.refNo || "",
          amount:         entry.amount || "",
          startDate:      entry.startDate || "",
          completionDate: entry.completionDate || "",
          notes:          entry.notes || "",
          fileLink:       url,
          // name used for display (not a required field in CertificateModal)
          _fileName:      entry.displayName,
        });
      } catch (err) {
        setProgress(prev => ({...prev, [entry.id]: "error"}));
        console.error("Upload failed for", entry.file.name, err);
      }
    }

    setUploading(false);

    if (results.length) {
      onImport(results);
    } else {
      alert("All uploads failed. Check your Supabase configuration.");
    }
  };

  const doneCount    = Object.values(progress).filter(s => s === "done").length;
  const errorCount   = Object.values(progress).filter(s => s === "error").length;
  const pendingCount = Object.values(progress).filter(s => s === "pending").length;
  const allDone      = uploading && doneCount + errorCount === files.length && files.length > 0;

  return (
    <Overlay onClose={onClose}>
      <div
        className="slide-up"
        style={{
          background:     T.sidebar,
          border:         `1px solid ${T.border}`,
          borderRadius:   18,
          width:          "100%",
          maxWidth:       680,
          maxHeight:      "calc(100vh - 48px)",
          display:        "flex",
          flexDirection:  "column",
          overflow:       "hidden",
          boxShadow:      "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* ── Header ── */}
        <div style={{padding:"20px 24px 16px", borderBottom:`1px solid ${T.border}`, flexShrink:0}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:20, color:T.text}}>
                UPLOAD JOB COMPLETION CERTIFICATES
              </div>
              <div style={{fontSize:12, color:T.textMuted, marginTop:3}}>
                Select multiple PDFs — one certificate record will be created per file
              </div>
            </div>
            <button
              onClick={onClose}
              style={{background:T.bg, border:`1px solid ${T.border}`, color:T.textSub, borderRadius:8, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, cursor:"pointer"}}
            >×</button>
          </div>

          {/* Project selector */}
          <div style={{marginTop:14, display:"flex", gap:10, alignItems:"center", flexWrap:"wrap"}}>
            <div style={{flex:1, minWidth:200}}>
              <label style={{display:"block", fontSize:11, fontWeight:700, color:T.textMuted, marginBottom:5, letterSpacing:".5px"}}>PROJECT *</label>
              <select
                value={selectedProject}
                onChange={e => setSelProj(e.target.value)}
                style={{width:"100%", background:T.inputBg, border:`1px solid ${selProj ? T.blue+"66" : T.border}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:selProj ? T.text : T.textMuted, outline:"none", colorScheme:"light"}}
              >
                <option value="">Select project…</option>
                {projects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{flex:1, minWidth:160}}>
              <label style={{display:"block", fontSize:11, fontWeight:700, color:T.textMuted, marginBottom:5, letterSpacing:".5px"}}>JOB NO. (apply to all)</label>
              <input
                value={globalJobNo}
                onChange={e => setGlobalJobNo(e.target.value)}
                placeholder="e.g. JOB-2025-001"
                style={{width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:T.text, outline:"none", colorScheme:"light"}}
                onFocus={e=>e.target.style.borderColor=T.blue}
                onBlur={e=>e.target.style.borderColor=T.border}
              />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{flex:1, overflowY:"auto", padding:"16px 24px"}}>

          {/* Drop zone */}
          <div
            ref={dropRef}
            onClick={() => !uploading && fileInputRef.current.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={!uploading ? onDrop : undefined}
            style={{
              border:        `2px dashed ${T.blue}44`,
              borderRadius:  12,
              padding:       files.length ? "16px" : "36px 24px",
              textAlign:     "center",
              cursor:        uploading ? "not-allowed" : "pointer",
              transition:    "all .2s",
              background:    `${T.blue}06`,
              marginBottom:  14,
            }}
            onMouseEnter={e => { if (!uploading) { e.currentTarget.style.borderColor=T.blue; e.currentTarget.style.background=`${T.blue}12`; }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor=`${T.blue}44`; e.currentTarget.style.background=`${T.blue}06`; }}
          >
            {files.length === 0 ? (
              <>
                <div style={{fontSize:40, marginBottom:8}}>📂</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:17, color:T.text, marginBottom:4}}>
                  Drag & drop PDFs here, or click to browse
                </div>
                <div style={{fontSize:12, color:T.textMuted}}>
                  PDF, Word, PNG, JPG — select as many as you need
                </div>
              </>
            ) : (
              <div style={{fontSize:13, color:T.blue, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
                <span>+</span> Click or drop more files to add ({files.length} selected)
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
            style={{display:"none"}}
            onChange={e => { addFiles(e.target.files); e.target.value=""; }}
          />

          {/* Progress summary bar — shown during upload */}
          {uploading && (
            <div style={{background:T.bg, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 16px", marginBottom:14}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
                <span style={{fontSize:13, fontWeight:700, color:T.text}}>Uploading…</span>
                <span style={{fontSize:13, color:T.textMuted}}>{doneCount + errorCount} / {files.length}</span>
              </div>
              <div style={{height:6, background:T.border, borderRadius:999, overflow:"hidden"}}>
                <div style={{
                  height:"100%",
                  width: `${files.length ? ((doneCount + errorCount) / files.length * 100) : 0}%`,
                  background: `linear-gradient(90deg, ${T.green}, ${T.blue})`,
                  borderRadius:999,
                  transition:"width .3s ease",
                }}/>
              </div>
              <div style={{display:"flex", gap:14, marginTop:8, fontSize:12}}>
                <span style={{color:T.green}}>✓ {doneCount} done</span>
                {errorCount > 0 && <span style={{color:T.red}}>✕ {errorCount} failed</span>}
                <span style={{color:T.textMuted}}>{pendingCount} remaining</span>
              </div>
            </div>
          )}

          {/* File list */}
          {files.length > 0 && (
            <div style={{display:"grid", gap:10}}>
              {files.map((entry, i) => {
                const st = progress[entry.id] || "pending";
                const stColor = STATUS_COLOR[st];
                const stIcon  = STATUS_ICON[st];
                const isExpanded = st === "pending" || st === "error";

                return (
                  <div
                    key={entry.id}
                    className="fade-up"
                    style={{
                      background:   T.bg,
                      border:       `1px solid ${st==="done" ? T.green+"44" : st==="error" ? T.red+"44" : T.border}`,
                      borderLeft:   `4px solid ${stColor}`,
                      borderRadius: 10,
                      padding:      "12px 14px",
                      animationDelay: `${i * 0.03}s`,
                    }}
                  >
                    {/* File header row */}
                    <div style={{display:"flex", alignItems:"center", gap:10, marginBottom: isExpanded ? 10 : 0}}>
                      <span style={{fontSize:18, flexShrink:0}}>
                        {/\.pdf$/i.test(entry.file.name) ? "📄" : /\.(png|jpg|jpeg|webp)$/i.test(entry.file.name) ? "🖼️" : "📝"}
                      </span>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontSize:13, fontWeight:700, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                          {entry.displayName}
                        </div>
                        <div style={{fontSize:11, color:T.textMuted, marginTop:1}}>
                          {(entry.file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      {/* Status badge */}
                      <div style={{background:`${stColor}18`, border:`1px solid ${stColor}44`, borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:700, color:stColor, flexShrink:0, display:"flex", alignItems:"center", gap:5}}>
                        <span>{stIcon}</span>
                        <span style={{textTransform:"capitalize"}}>{st}</span>
                      </div>
                      {/* Remove button — only if not uploading */}
                      {!uploading && (
                        <button
                          onClick={() => removeFile(entry.id)}
                          style={{background:T.redDim, border:`1px solid ${T.red}33`, color:T.red, borderRadius:6, width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, cursor:"pointer", flexShrink:0}}
                        >✕</button>
                      )}
                    </div>

                    {/* Editable detail fields — shown when pending */}
                    {isExpanded && !uploading && (
                      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, paddingTop:8, borderTop:`1px solid ${T.border}`}}>
                        <div>
                          <label style={{display:"block", fontSize:10, fontWeight:700, color:T.textMuted, marginBottom:4, letterSpacing:".5px"}}>JOB NO.</label>
                          <input
                            value={entry.jobNo}
                            onChange={e => updateField(entry.id, "jobNo", e.target.value)}
                            placeholder={globalJobNo || "JOB-001"}
                            style={{width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:7, padding:"7px 10px", fontSize:12, color:T.text, outline:"none", colorScheme:"light"}}
                            onFocus={e=>e.target.style.borderColor=T.blue}
                            onBlur={e=>e.target.style.borderColor=T.border}
                          />
                        </div>
                        <div>
                          <label style={{display:"block", fontSize:10, fontWeight:700, color:T.textMuted, marginBottom:4, letterSpacing:".5px"}}>CERT / REF NO.</label>
                          <input
                            value={entry.refNo}
                            onChange={e => updateField(entry.id, "refNo", e.target.value)}
                            placeholder="e.g. CERT-2025-01"
                            style={{width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:7, padding:"7px 10px", fontSize:12, color:T.text, outline:"none", colorScheme:"light"}}
                            onFocus={e=>e.target.style.borderColor=T.blue}
                            onBlur={e=>e.target.style.borderColor=T.border}
                          />
                        </div>
                        <div>
                          <label style={{display:"block", fontSize:10, fontWeight:700, color:T.textMuted, marginBottom:4, letterSpacing:".5px"}}>AMOUNT (SAR)</label>
                          <input
                            type="number"
                            value={entry.amount}
                            onChange={e => updateField(entry.id, "amount", e.target.value)}
                            placeholder="0"
                            style={{width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:7, padding:"7px 10px", fontSize:12, color:T.text, outline:"none", colorScheme:"light"}}
                            onFocus={e=>e.target.style.borderColor=T.blue}
                            onBlur={e=>e.target.style.borderColor=T.border}
                          />
                        </div>
                        <div>
                          <label style={{display:"block", fontSize:10, fontWeight:700, color:T.textMuted, marginBottom:4, letterSpacing:".5px"}}>COMPLETION DATE</label>
                          <input
                            type="date"
                            value={entry.completionDate}
                            onChange={e => updateField(entry.id, "completionDate", e.target.value)}
                            style={{width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:7, padding:"7px 10px", fontSize:12, color:T.text, outline:"none", colorScheme:"light"}}
                            onFocus={e=>e.target.style.borderColor=T.blue}
                            onBlur={e=>e.target.style.borderColor=T.border}
                          />
                        </div>
                        <div style={{gridColumn:"1 / -1"}}>
                          <label style={{display:"block", fontSize:10, fontWeight:700, color:T.textMuted, marginBottom:4, letterSpacing:".5px"}}>NOTES</label>
                          <input
                            value={entry.notes}
                            onChange={e => updateField(entry.id, "notes", e.target.value)}
                            placeholder="Optional notes…"
                            style={{width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:7, padding:"7px 10px", fontSize:12, color:T.text, outline:"none", colorScheme:"light"}}
                            onFocus={e=>e.target.style.borderColor=T.blue}
                            onBlur={e=>e.target.style.borderColor=T.border}
                          />
                        </div>
                      </div>
                    )}

                    {/* Uploaded URL preview */}
                    {st === "done" && (
                      <div style={{marginTop:6, fontSize:11, color:T.green, display:"flex", alignItems:"center", gap:6}}>
                        <span>✓ Uploaded successfully</span>
                      </div>
                    )}
                    {st === "error" && (
                      <div style={{marginTop:6, fontSize:11, color:T.red}}>
                        ✕ Upload failed — check Supabase config or file size
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{padding:"14px 24px 22px", borderTop:`1px solid ${T.border}`, flexShrink:0, display:"flex", gap:10, alignItems:"center"}}>
          <div style={{flex:1, fontSize:12, color:T.textMuted}}>
            {files.length > 0
              ? `${files.length} file${files.length!==1?"s":""} selected — each becomes one certificate record`
              : "No files selected yet"}
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            style={{background:T.bg, border:`1px solid ${T.border}`, color:T.textSub, borderRadius:10, padding:"11px 20px", fontSize:14, fontWeight:600, cursor:uploading?"not-allowed":"pointer", opacity:uploading?0.5:1}}
          >
            {allDone ? "Close" : "Cancel"}
          </button>
          {!uploading && files.length > 0 && (
            <button
              onClick={handleUploadAll}
              style={{
                background:   `linear-gradient(135deg, ${T.blue}, #2563eb)`,
                border:       "none",
                color:        "#fff",
                borderRadius: 10,
                padding:      "11px 28px",
                fontSize:     14,
                fontWeight:   800,
                cursor:       "pointer",
                display:      "flex",
                alignItems:   "center",
                gap:          8,
                boxShadow:    `0 4px 16px ${T.blue}44`,
              }}
            >
              ⬆ Upload {files.length} File{files.length!==1?"s":""}
            </button>
          )}
        </div>
      </div>
    </Overlay>
  );
}
const Btn      = ({children,onClick,color,solid}) => <button onClick={onClick} style={{background:solid?color:T.bg,border:`1px solid ${solid?color:T.border}`,color:solid?"#000":color||T.textSub,borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:600,transition:"all .15s"}}>{children}</button>;
