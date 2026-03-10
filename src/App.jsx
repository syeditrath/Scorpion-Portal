import { useState, useEffect } from "react";

/* ─── Global styles ────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Epilogue:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'Epilogue', sans-serif; background: #0a0c10; color: #e2e8f0; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #0a0c10; }
  ::-webkit-scrollbar-thumb { background: #1e2533; border-radius: 3px; }
  input, select, textarea, button { font-family: 'Epilogue', sans-serif; }
  button { cursor: pointer; }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  .fade-up  { animation: fadeUp  0.35s ease both; }
  .slide-up { animation: slideUp 0.4s cubic-bezier(0.34,1.4,0.64,1) both; }
  .fade-in  { animation: fadeIn  0.25s ease both; }
`;

/* ─── Config ───────────────────────────────────────────────────────────────── */
const CATS = ["TUV", "Manpower", "Equipment"];

const CAT = {
  TUV:       { color:"#3b82f6", dim:"rgba(59,130,246,0.1)",  border:"rgba(59,130,246,0.25)",  icon:"◈" },
  Manpower:  { color:"#10b981", dim:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.25)",  icon:"◉" },
  Equipment: { color:"#f59e0b", dim:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.25)",  icon:"◎" },
};

const FIELDS = {
  TUV: [
    { key:"project",        label:"Project",          req:true },
    { key:"equipment",      label:"Equipment / Unit", req:true },
    { key:"serialId",       label:"Serial / ID",      req:true },
    { key:"certNo",         label:"Certificate No." },
    { key:"inspectionDate", label:"Inspection Date",  type:"date" },
    { key:"expiryDate",     label:"Expiry Date",      type:"date", req:true },
    { key:"remarks",        label:"Remarks",          type:"textarea" },
  ],
  Manpower: [
    { key:"project",     label:"Project",           req:true },
    { key:"name",        label:"Employee Name",     req:true },
    { key:"idPassport",  label:"ID / Passport No.", req:true },
    { key:"designation", label:"Designation" },
    { key:"certType",    label:"Certificate Type" },
    { key:"issueDate",   label:"Issue Date",        type:"date" },
    { key:"expiryDate",  label:"Expiry Date",       type:"date", req:true },
    { key:"remarks",     label:"Remarks",           type:"textarea" },
  ],
  Equipment: [
    { key:"project",        label:"Project",         req:true },
    { key:"equipmentName",  label:"Equipment Name",  req:true },
    { key:"modelMake",      label:"Model / Make" },
    { key:"serialNumber",   label:"Serial Number",   req:true },
    { key:"certNo",         label:"Certificate No." },
    { key:"inspectionDate", label:"Inspection Date", type:"date" },
    { key:"expiryDate",     label:"Expiry Date",     type:"date", req:true },
    { key:"remarks",        label:"Remarks",         type:"textarea" },
  ],
};

const SEED = {
  TUV: [
    { id:"t1", project:"NEOM Phase 1", equipment:"MUD TANK",           serialId:"SSD-MD-101",        certNo:"TUV-001", inspectionDate:"2025-04-09", expiryDate:"2026-03-03", remarks:"" },
    { id:"t2", project:"NEOM Phase 1", equipment:"MAIN DB",            serialId:"ASC-600/2/1",       certNo:"TUV-002", inspectionDate:"2025-04-09", expiryDate:"2026-03-03", remarks:"" },
    { id:"t3", project:"NEOM Phase 2", equipment:"PRV MUD PUMP 2000",  serialId:"1240411588",        certNo:"TUV-003", inspectionDate:"2025-09-13", expiryDate:"2026-03-12", remarks:"" },
    { id:"t4", project:"NEOM Phase 2", equipment:"HIGH PRESSURE HOSE", serialId:"SA-HPH-8-01",       certNo:"TUV-004", inspectionDate:"2025-08-27", expiryDate:"2026-02-26", remarks:"" },
    { id:"t5", project:"Riyadh Metro", equipment:"RECYCLE UNIT",       serialId:"KEM-TRON-279",      certNo:"TUV-005", inspectionDate:"2025-04-08", expiryDate:"2025-01-02", remarks:"Needs renewal" },
    { id:"t6", project:"Riyadh Metro", equipment:"HDD RIG MACHINE",    serialId:"XUG5060ZKSHH00003", certNo:"TUV-006", inspectionDate:"2025-04-08", expiryDate:"2026-04-08", remarks:"" },
    { id:"t7", project:"NEOM Phase 1", equipment:"WATER TANK",         serialId:"SSE-WTU-001",       certNo:"TUV-007", inspectionDate:"2025-04-09", expiryDate:"2026-03-03", remarks:"" },
  ],
  Manpower: [
    { id:"m1", project:"NEOM Phase 1", name:"Ahmed Al-Rashid",   idPassport:"SA-1234567", designation:"Drilling Engineer",   certType:"IADC WellSharp", issueDate:"2024-06-01", expiryDate:"2026-06-01", remarks:"" },
    { id:"m2", project:"NEOM Phase 1", name:"Mohammed Hassan",   idPassport:"SA-2345678", designation:"Site Supervisor",    certType:"NEBOSH IGC",     issueDate:"2024-01-15", expiryDate:"2026-01-15", remarks:"" },
    { id:"m3", project:"Riyadh Metro", name:"Khalid Al-Otaibi",  idPassport:"SA-3456789", designation:"Safety Officer",     certType:"First Aid",      issueDate:"2025-01-10", expiryDate:"2026-01-10", remarks:"" },
    { id:"m4", project:"NEOM Phase 2", name:"Faisal Al-Zahrani", idPassport:"SA-4567890", designation:"Equipment Operator", certType:"Rigger Level 2", issueDate:"2023-03-01", expiryDate:"2025-02-01", remarks:"Expired – renewal in progress" },
    { id:"m5", project:"NEOM Phase 2", name:"Omar Al-Sayed",     idPassport:"SA-5678901", designation:"Welding Inspector",  certType:"AWS CWI",        issueDate:"2024-11-01", expiryDate:"2026-01-10", remarks:"" },
  ],
  Equipment: [
    { id:"e1", project:"NEOM Phase 1", equipmentName:"HDD RIG MACHINE",   modelMake:"XZ5060",    serialNumber:"XUG5060ZKSHH00003", certNo:"EQ-001", inspectionDate:"2025-04-08", expiryDate:"2026-03-02", remarks:"" },
    { id:"e2", project:"NEOM Phase 1", equipmentName:"MUD PUMP ZLCONN",   modelMake:"ZLCONN",    serialNumber:"LT01-2024-020",     certNo:"EQ-002", inspectionDate:"2025-04-08", expiryDate:"2026-03-02", remarks:"" },
    { id:"e3", project:"Riyadh Metro", equipmentName:"ANGLE GRINDER",     modelMake:"Bosch GWS", serialNumber:"3220514432023",     certNo:"EQ-003", inspectionDate:"2025-08-27", expiryDate:"2026-02-26", remarks:"" },
    { id:"e4", project:"NEOM Phase 2", equipmentName:"FIRE EXTINGUISHER", modelMake:"Amerex",    serialNumber:"SAF-INS-005",       certNo:"EQ-004", inspectionDate:"2025-08-27", expiryDate:"2025-02-10", remarks:"" },
    { id:"e5", project:"NEOM Phase 1", equipmentName:"PIPE HOLDER 1TON",  modelMake:"Generic",   serialNumber:"SA-PH-1T-01",       certNo:"EQ-005", inspectionDate:"2025-10-15", expiryDate:"2026-04-14", remarks:"" },
  ],
};

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const daysUntil   = d => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null;
const fmtDate     = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const uid         = () => Math.random().toString(36).slice(2,9);
const primaryOf   = (cat,r) => ({TUV:r.equipment, Manpower:r.name, Equipment:r.equipmentName}[cat]||"—");
const secondaryOf = (cat,r) => ({TUV:r.serialId,  Manpower:r.designation, Equipment:r.serialNumber}[cat]||"");

function getStatus(days) {
  if (days === null) return { label:"Unknown",       color:"#64748b", bg:"rgba(100,116,139,.12)" };
  if (days < 0)      return { label:"Expired",       color:"#ef4444", bg:"rgba(239,68,68,.12)" };
  if (days <= 90)    return { label:"Expiring Soon", color:"#f59e0b", bg:"rgba(245,158,11,.12)" };
  return               { label:"Valid",            color:"#10b981", bg:"rgba(16,185,129,.12)" };
}

function loadRecords() {
  try { const r = localStorage.getItem("ct_records_v3"); return r ? JSON.parse(r) : SEED; }
  catch { return SEED; }
}
function persist(data) {
  try { localStorage.setItem("ct_records_v3", JSON.stringify(data)); } catch {}
}

/* ════════════════════════════════════════════════════════════════════════════
   ROOT APP
════════════════════════════════════════════════════════════════════════════ */
export default function App() {
  useEffect(() => {
    if (!document.getElementById("ct-global")) {
      const s = document.createElement("style");
      s.id = "ct-global";
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
  }, []);

  const [tab,       setTab]       = useState("dashboard");
  const [cat,       setCat]       = useState("TUV");
  const [recs,      setRecs]      = useState(loadRecords);
  const [search,    setSearch]    = useState("");
  const [fProj,     setFProj]     = useState("");
  const [fStat,     setFStat]     = useState("");
  const [modal,     setModal]     = useState(null);
  const [detail,    setDetail]    = useState(null);
  const [alertMod,  setAlertMod]  = useState(false);
  const [toast,     setToast]     = useState(null);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => { persist(recs); }, [recs]);

  const showToast = (msg, type="ok") => {
    setToast({msg,type});
    setTimeout(() => setToast(null), 3000);
  };

  /* ── derived data ── */
  const allRecs = CATS.flatMap(c =>
    (recs[c]||[]).map(r => ({...r, cat:c, days:daysUntil(r.expiryDate)}))
  );

  const stats = CATS.reduce((a,c) => {
    const ds = (recs[c]||[]).map(r => daysUntil(r.expiryDate));
    a[c] = {
      total:    ds.length,
      valid:    ds.filter(d => d !== null && d > 90).length,
      expiring: ds.filter(d => d !== null && d >= 0 && d <= 90).length,
      expired:  ds.filter(d => d !== null && d < 0).length,
    };
    return a;
  }, {});

  const attention  = allRecs.filter(r => r.days !== null && r.days <= 90).sort((a,b) => a.days - b.days);
  const allProjects = [...new Set(allRecs.map(r=>r.project).filter(Boolean))].sort();

  const filtered = (recs[cat]||[])
    .map(r => ({...r, days:daysUntil(r.expiryDate)}))
    .filter(r => {
      const sl = getStatus(r.days).label;
      const q  = search.toLowerCase();
      return (
        (!search || Object.values(r).some(v => String(v).toLowerCase().includes(q))) &&
        (!fProj || r.project === fProj) &&
        (!fStat || sl === fStat)
      );
    });

  /* ── CRUD ── */
  const saveRec = (category, data, mode) => {
    setRecs(prev => {
      const list = [...(prev[category]||[])];
      if (mode === "add") list.push({...data, id:uid()});
      else { const i = list.findIndex(r => r.id === data.id); if (i >= 0) list[i] = data; }
      return {...prev, [category]:list};
    });
    showToast(mode === "add" ? "Record added" : "Record updated");
    setModal(null);
    setDetail(null);
  };

  const delRec = (category, id) => {
    setRecs(prev => ({...prev, [category]: prev[category].filter(r => r.id !== id)}));
    showToast("Record deleted", "del");
    setDetail(null);
  };

  const go = t => { setTab(t); setMobileNav(false); };

  return (
    <div style={{display:"flex", height:"100vh", overflow:"hidden"}}>

      {/* mobile overlay */}
      {mobileNav && (
        <div className="fade-in" onClick={() => setMobileNav(false)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:49}} />
      )}

      {/* ══ SIDEBAR ══ */}
      <Sidebar tab={tab} go={go} stats={stats} attention={attention} mobileNav={mobileNav} />

      {/* ══ MAIN ══ */}
      <div style={{flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0}}>

        {/* top bar */}
        <TopBar
          tab={tab} cat={cat} allProjects={allProjects}
          search={search} setSearch={setSearch}
          fProj={fProj} setFProj={setFProj}
          fStat={fStat} setFStat={setFStat}
          attention={attention}
          onAdd={() => setModal({mode:"add", category:cat})}
          onAlertCfg={() => setAlertMod(true)}
          onHamburger={() => setMobileNav(true)}
        />

        {/* content */}
        <main style={{flex:1, overflowY:"auto", padding:"24px 20px"}}>
          {tab === "dashboard" && (
            <Dashboard
              stats={stats} attention={attention} allRecs={allRecs}
              setTab={setTab} setCat={setCat} setDetail={setDetail}
            />
          )}
          {tab === "tracker" && (
            <Tracker
              cat={cat} setCat={setCat} filtered={filtered} stats={stats}
              onAdd={() => setModal({mode:"add", category:cat})}
              onEdit={r => setModal({mode:"edit", category:cat, record:r})}
              onDel={id => delRec(cat, id)}
              onDetail={r => setDetail({...r, cat})}
            />
          )}
          {tab === "alerts" && (
            <Alerts attention={attention} onCfg={() => setAlertMod(true)} onDetail={r => setDetail(r)} />
          )}
        </main>
      </div>

      {/* ══ MODALS ══ */}
      {modal     && <RecordModal modal={modal} onClose={() => setModal(null)} onSave={saveRec} />}
      {detail    && <DetailPanel rec={detail}  onClose={() => setDetail(null)} onEdit={() => { setModal({mode:"edit", category:detail.cat, record:detail}); setDetail(null); }} onDel={() => delRec(detail.cat, detail.id)} />}
      {alertMod  && <AlertConfig onClose={() => setAlertMod(false)} showToast={showToast} />}

      {/* toast */}
      {toast && (
        <div className="fade-up" style={{
          position:"fixed", bottom:24, right:24, zIndex:999,
          background: toast.type === "del" ? "#130505" : "#051310",
          border:`1px solid ${toast.type === "del" ? "#ef4444" : "#10b981"}`,
          color: toast.type === "del" ? "#ef4444" : "#10b981",
          borderRadius:10, padding:"11px 18px", fontSize:13, fontWeight:600,
          boxShadow:"0 8px 32px rgba(0,0,0,.5)", display:"flex", alignItems:"center", gap:10,
        }}>
          {toast.type === "del" ? "✕" : "✓"} {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════════════════════════════════════════ */
function Sidebar({ tab, go, stats, attention, mobileNav }) {
  const isMobile = window.innerWidth < 768;
  return (
    <aside style={{
      width:230, flexShrink:0, background:"#0d1117", borderRight:"1px solid #1a2235",
      display:"flex", flexDirection:"column", zIndex:50,
      position: isMobile ? "fixed" : "relative",
      top:0, left:0, height:"100%",
      transform: isMobile ? (mobileNav ? "translateX(0)" : "translateX(-100%)") : "none",
      transition:"transform .3s ease",
    }}>
      {/* logo */}
      <div style={{padding:"22px 20px 18px", borderBottom:"1px solid #1a2235"}}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{width:36,height:36,background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18}}>C</div>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#f1f5f9",letterSpacing:"-.3px"}}>CertTrack</div>
            <div style={{fontSize:9,color:"#334155",fontWeight:600,letterSpacing:"1px"}}>CERT. MANAGER</div>
          </div>
        </div>
      </div>

      {/* nav links */}
      <nav style={{padding:"14px 10px", flex:1}}>
        {[
          {id:"dashboard", label:"Dashboard", icon:"⬡"},
          {id:"tracker",   label:"Tracker",   icon:"⊞"},
          {id:"alerts",    label:"Alerts",    icon:"◬", badge: attention.length},
        ].map(n => (
          <button key={n.id} onClick={() => go(n.id)} style={{
            width:"100%", display:"flex", alignItems:"center", gap:10,
            padding:"9px 12px", borderRadius:8, border:"none", marginBottom:3,
            textAlign:"left",
            background: tab === n.id ? "rgba(59,130,246,.12)" : "transparent",
            color:      tab === n.id ? "#60a5fa" : "#475569",
            fontSize:13, fontWeight: tab === n.id ? 600 : 400,
            borderLeft: tab === n.id ? "2px solid #3b82f6" : "2px solid transparent",
            transition:"all .15s",
          }}>
            <span style={{fontSize:16}}>{n.icon}</span>
            <span style={{flex:1}}>{n.label}</span>
            {n.badge > 0 && (
              <span style={{background:"#ef4444",color:"#fff",borderRadius:999,padding:"1px 6px",fontSize:10,fontWeight:700}}>{n.badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* quick stats */}
      <div style={{padding:"14px 14px 24px", borderTop:"1px solid #1a2235"}}>
        <div style={{fontSize:9,color:"#1e2d45",fontWeight:700,letterSpacing:"1px",marginBottom:10}}>QUICK STATS</div>
        {CATS.map(c => (
          <div key={c} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #0f1420"}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:CAT[c].color}} />
              <span style={{fontSize:11,color:"#475569"}}>{c}</span>
            </div>
            <div style={{display:"flex",gap:5,fontSize:11}}>
              <span style={{color:"#10b981",fontWeight:600}}>{stats[c]?.valid}</span>
              <span style={{color:"#1e2d45"}}>/</span>
              <span style={{color:"#334155"}}>{stats[c]?.total}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   TOP BAR
════════════════════════════════════════════════════════════════════════════ */
function TopBar({ tab, cat, allProjects, search, setSearch, fProj, setFProj, fStat, setFStat, attention, onAdd, onAlertCfg, onHamburger }) {
  const titles = { dashboard:"Dashboard", tracker:`${cat} Certifications`, alerts:"Alerts & Notifications" };
  return (
    <header style={{background:"#0d1117", borderBottom:"1px solid #1a2235", padding:"0 20px", flexShrink:0}}>
      <div style={{display:"flex", alignItems:"center", gap:12, height:54}}>
        <button onClick={onHamburger} style={{background:"none",border:"none",color:"#475569",fontSize:20,padding:"4px",display:"flex"}}>☰</button>
        <div style={{flex:1,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#f1f5f9"}}>{titles[tab]}</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {attention.length > 0 && (
            <button onClick={onAlertCfg} style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",color:"#ef4444",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
              ◬ <span style={{background:"#ef4444",color:"#fff",borderRadius:999,padding:"0 5px",fontSize:10,fontWeight:700}}>{attention.length}</span>
            </button>
          )}
          {tab === "tracker" && (
            <button onClick={onAdd} style={{background:CAT[cat].color,color:"#fff",border:"none",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:700}}>
              + Add
            </button>
          )}
        </div>
      </div>

      {/* search bar — tracker only */}
      {tab === "tracker" && (
        <div style={{paddingBottom:12,display:"flex",gap:8,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:140,position:"relative"}}>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#334155",fontSize:14}}>⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              style={{width:"100%",background:"#0a0c10",border:"1px solid #1a2235",borderRadius:8,padding:"7px 10px 7px 30px",fontSize:12,color:"#94a3b8",outline:"none"}} />
          </div>
          <select value={fProj} onChange={e => setFProj(e.target.value)}
            style={{background:"#0a0c10",border:"1px solid #1a2235",borderRadius:8,padding:"7px 10px",fontSize:12,color:"#64748b",outline:"none"}}>
            <option value="">All Projects</option>
            {allProjects.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={fStat} onChange={e => setFStat(e.target.value)}
            style={{background:"#0a0c10",border:"1px solid #1a2235",borderRadius:8,padding:"7px 10px",fontSize:12,color:"#64748b",outline:"none"}}>
            <option value="">All Statuses</option>
            <option>Valid</option>
            <option>Expiring Soon</option>
            <option>Expired</option>
          </select>
        </div>
      )}
    </header>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════════════════════════════ */
function Dashboard({ stats, attention, allRecs, setTab, setCat, setDetail }) {
  const total    = allRecs.length;
  const valid    = allRecs.filter(r => daysUntil(r.expiryDate) > 90).length;
  const expiring = allRecs.filter(r => { const d=daysUntil(r.expiryDate); return d!==null&&d>=0&&d<=90; }).length;
  const expired  = allRecs.filter(r => { const d=daysUntil(r.expiryDate); return d!==null&&d<0; }).length;
  const pct      = total ? Math.round(valid/total*100) : 0;

  return (
    <div style={{maxWidth:1060, margin:"0 auto"}}>

      {/* metric cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14,marginBottom:24}}>
        {[
          {label:"Total",    val:total,    color:"#3b82f6"},
          {label:"Valid",    val:valid,    color:"#10b981"},
          {label:"Expiring", val:expiring, color:"#f59e0b"},
          {label:"Expired",  val:expired,  color:"#ef4444"},
        ].map((m,i) => (
          <div key={m.label} className="fade-up"
            style={{background:"#0d1117",border:"1px solid #1a2235",borderRadius:14,padding:"20px",animationDelay:`${i*.06}s`,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:14,right:16,fontSize:28,color:m.color,opacity:.07,fontWeight:800,fontFamily:"'Syne',sans-serif"}}>{m.val}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:34,fontWeight:800,color:m.color,lineHeight:1}}>{m.val}</div>
            <div style={{fontSize:12,color:"#334155",marginTop:6,fontWeight:500}}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* compliance bar */}
      <div className="fade-up" style={{background:"#0d1117",border:"1px solid #1a2235",borderRadius:14,padding:"20px 24px",marginBottom:22,animationDelay:".25s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,color:"#475569"}}>OVERALL COMPLIANCE</span>
          <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:pct>=80?"#10b981":pct>=60?"#f59e0b":"#ef4444"}}>{pct}%</span>
        </div>
        <div style={{height:6,background:"#1a2235",borderRadius:999}}>
          <div style={{height:"100%",width:`${pct}%`,background:pct>=80?"linear-gradient(90deg,#10b981,#059669)":pct>=60?"linear-gradient(90deg,#f59e0b,#d97706)":"linear-gradient(90deg,#ef4444,#dc2626)",borderRadius:999,transition:"width .8s ease"}} />
        </div>
      </div>

      {/* category cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14,marginBottom:26}}>
        {CATS.map((c,i) => {
          const s=stats[c]; const cfg=CAT[c];
          const p=s.total?Math.round(s.valid/s.total*100):0;
          return (
            <div key={c} className="fade-up"
              onClick={() => { setTab("tracker"); setCat(c); }}
              style={{background:"#0d1117",border:"1px solid #1a2235",borderRadius:14,padding:"18px",cursor:"pointer",animationDelay:`${.3+i*.06}s`,transition:"border-color .2s,transform .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=cfg.color;e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#1a2235";e.currentTarget.style.transform="none";}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <div style={{width:32,height:32,background:cfg.dim,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:cfg.color}}>{cfg.icon}</div>
                  <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:"#f1f5f9"}}>{c}</span>
                </div>
                <span style={{fontSize:11,color:cfg.color,background:cfg.dim,padding:"2px 10px",borderRadius:999,fontWeight:600}}>{s.total} total</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                {[["Valid",s.valid,"#10b981"],["Expiring",s.expiring,"#f59e0b"],["Expired",s.expired,"#ef4444"]].map(([l,v,col])=>(
                  <div key={l} style={{textAlign:"center",background:"#0a0c10",borderRadius:8,padding:"8px 4px"}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:col}}>{v}</div>
                    <div style={{fontSize:10,color:"#334155",fontWeight:500}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{height:3,background:"#1a2235",borderRadius:999}}>
                <div style={{height:"100%",width:`${p}%`,background:cfg.color,borderRadius:999}} />
              </div>
              <div style={{fontSize:10,color:"#334155",marginTop:5,textAlign:"right"}}>{p}% compliant</div>
            </div>
          );
        })}
      </div>

      {/* attention list */}
      {attention.length > 0 && (
        <div className="fade-up" style={{background:"#0d1117",border:"1px solid #1a2235",borderRadius:14,padding:"20px 22px",animationDelay:".45s"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,color:"#475569",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            ◬ NEEDS ATTENTION
            <span style={{background:"rgba(239,68,68,.15)",color:"#ef4444",borderRadius:999,padding:"1px 8px",fontSize:11,fontWeight:700}}>{attention.length}</span>
          </div>
          <div style={{display:"grid",gap:8}}>
            {attention.slice(0,8).map(r => {
              const s=getStatus(r.days); const name=primaryOf(r.cat,r);
              return (
                <div key={r.id} onClick={() => setDetail(r)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:"#0a0c10",borderRadius:10,cursor:"pointer",border:"1px solid #1a2235",transition:"border-color .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=s.color}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="#1a2235"}>
                  <div style={{width:3,height:34,borderRadius:2,background:s.color,flexShrink:0}} />
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name}</div>
                    <div style={{fontSize:11,color:"#334155",marginTop:2}}>{r.cat} · {r.project}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,color:s.color,lineHeight:1}}>{Math.abs(r.days)}</div>
                    <div style={{fontSize:9,color:"#334155",fontWeight:700,letterSpacing:".5px"}}>{r.days<0?"OVERDUE":"DAYS LEFT"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   TRACKER
════════════════════════════════════════════════════════════════════════════ */
function Tracker({ cat, setCat, filtered, stats, onAdd, onEdit, onDel, onDetail }) {
  return (
    <div style={{maxWidth:1060, margin:"0 auto"}}>
      {/* category tabs */}
      <div style={{display:"flex",gap:8,marginBottom:18,overflowX:"auto",paddingBottom:4}}>
        {CATS.map(c => {
          const cfg=CAT[c]; const active=cat===c;
          return (
            <button key={c} onClick={() => setCat(c)} style={{
              flexShrink:0, padding:"7px 16px", borderRadius:999,
              border:`1px solid ${active?cfg.color:"#1a2235"}`,
              background: active?cfg.dim:"transparent",
              color: active?cfg.color:"#475569",
              fontSize:12, fontWeight:active?700:500,
              display:"flex", alignItems:"center", gap:7, transition:"all .2s",
            }}>
              {cfg.icon} {c}
              <span style={{background:active?cfg.color:"#1a2235",color:active?"#fff":"#475569",borderRadius:999,padding:"1px 7px",fontSize:10,fontWeight:700}}>{stats[c]?.total}</span>
            </button>
          );
        })}
      </div>

      <div style={{fontSize:12,color:"#334155",marginBottom:12,fontWeight:500}}>
        {filtered.length} record{filtered.length !== 1 ? "s" : ""}
      </div>

      {filtered.length === 0
        ? <EmptyState onAdd={onAdd} cat={cat} />
        : (
          <div style={{display:"grid", gap:10}}>
            {filtered.map((r,i) => (
              <RecordCard key={r.id} r={r} cat={cat} delay={i*.03}
                onEdit={() => onEdit(r)}
                onDel={() => onDel(r.id)}
                onDetail={() => onDetail(r)} />
            ))}
          </div>
        )
      }
    </div>
  );
}

function RecordCard({ r, cat, delay, onEdit, onDel, onDetail }) {
  const s    = getStatus(r.days);
  const name = primaryOf(cat, r);
  const sub  = secondaryOf(cat, r);
  return (
    <div className="fade-up" onClick={onDetail}
      style={{background:"#0d1117",border:"1px solid #1a2235",borderRadius:12,padding:"14px 16px",cursor:"pointer",animationDelay:`${delay}s`,transition:"border-color .15s"}}
      onMouseEnter={e => e.currentTarget.style.borderColor="#2d3748"}
      onMouseLeave={e => e.currentTarget.style.borderColor="#1a2235"}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
        <div style={{width:3,borderRadius:2,alignSelf:"stretch",background:s.color,flexShrink:0}} />
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:5}}>
            <div style={{fontWeight:600,fontSize:14,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name}</div>
            <span style={{flexShrink:0,background:s.bg,color:s.color,borderRadius:999,padding:"2px 10px",fontSize:11,fontWeight:700}}>{s.label}</span>
          </div>
          {sub && <div style={{fontSize:12,color:"#475569",marginBottom:7}}>{sub}</div>}
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {r.project        && <Chip>{r.project}</Chip>}
            {(r.certNo||r.certType) && <Chip>{r.certNo||r.certType}</Chip>}
            {r.inspectionDate && <Chip>Insp: {fmtDate(r.inspectionDate)}</Chip>}
            <Chip color={s.color}>Exp: {fmtDate(r.expiryDate)}</Chip>
            {r.days !== null  && <Chip color={s.color}>{r.days>=0?`${r.days}d left`:`${Math.abs(r.days)}d overdue`}</Chip>}
          </div>
          {r.remarks && <div style={{marginTop:8,fontSize:11,color:"#334155",fontStyle:"italic"}}>{r.remarks}</div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:5,flexShrink:0}} onClick={e => e.stopPropagation()}>
          <ActionBtn onClick={onEdit} color="#3b82f6">✎</ActionBtn>
          <ActionBtn onClick={onDel}  color="#ef4444">✕</ActionBtn>
        </div>
      </div>
    </div>
  );
}

const Chip = ({children,color}) => (
  <span style={{background:"#0a0c10",border:"1px solid #1a2235",borderRadius:6,padding:"2px 8px",fontSize:11,color:color||"#475569",fontWeight:500}}>{children}</span>
);

const ActionBtn = ({onClick,color,children}) => (
  <button onClick={onClick} style={{
    width:28,height:28,borderRadius:6,border:`1px solid ${color}33`,
    background:`${color}1a`,color,fontSize:12,fontWeight:700,
    display:"flex",alignItems:"center",justifyContent:"center",
  }}>{children}</button>
);

function EmptyState({ onAdd, cat }) {
  const cfg = CAT[cat];
  return (
    <div style={{textAlign:"center",padding:"60px 20px",background:"#0d1117",borderRadius:14,border:"1px dashed #1a2235"}}>
      <div style={{fontSize:40,color:cfg.color,opacity:.3,marginBottom:12}}>{cfg.icon}</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#334155",marginBottom:6}}>No records found</div>
      <div style={{fontSize:13,color:"#1e2d45",marginBottom:20}}>Add your first {cat} certification</div>
      <button onClick={onAdd} style={{background:cfg.color,color:"#fff",border:"none",borderRadius:8,padding:"9px 20px",fontSize:13,fontWeight:600}}>+ Add Record</button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   ALERTS
════════════════════════════════════════════════════════════════════════════ */
function Alerts({ attention, onCfg, onDetail }) {
  const expired  = attention.filter(r => r.days < 0).sort((a,b) => a.days - b.days);
  const expiring = attention.filter(r => r.days >= 0).sort((a,b) => a.days - b.days);

  return (
    <div style={{maxWidth:780, margin:"0 auto"}}>
      {/* config banner */}
      <div className="fade-up" style={{background:"linear-gradient(135deg,#0d1f3c,#0d2d5c)",border:"1px solid #1d3461",borderRadius:14,padding:"18px 22px",marginBottom:22}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:"#93c5fd",marginBottom:4}}>📧 Email Notifications</div>
            <div style={{fontSize:12,color:"#334155"}}>Automatic alerts sent 90 days before expiry via your SMTP server.</div>
          </div>
          <button onClick={onCfg} style={{background:"rgba(59,130,246,.2)",border:"1px solid rgba(59,130,246,.3)",color:"#60a5fa",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:600}}>⚙ Configure</button>
        </div>
      </div>

      {attention.length === 0 ? (
        <div style={{textAlign:"center",padding:"80px 20px",background:"#0d1117",borderRadius:14,border:"1px solid #1a2235"}}>
          <div style={{fontSize:48,marginBottom:14}}>✓</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,color:"#10b981",marginBottom:8}}>All Clear</div>
          <div style={{fontSize:13,color:"#334155"}}>No certifications require attention</div>
        </div>
      ) : (
        <>
          {expired.length  > 0 && <AlertSection title="Expired"                color="#ef4444" records={expired}  onDetail={onDetail} />}
          {expiring.length > 0 && <AlertSection title="Expiring Within 90 Days" color="#f59e0b" records={expiring} onDetail={onDetail} />}
        </>
      )}
    </div>
  );
}

function AlertSection({ title, color, records, onDetail }) {
  return (
    <div className="fade-up" style={{marginBottom:22}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:3,height:16,borderRadius:2,background:color}} />
        <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#475569",letterSpacing:".5px"}}>{title.toUpperCase()}</span>
        <span style={{background:`${color}26`,color,borderRadius:999,padding:"1px 8px",fontSize:11,fontWeight:700}}>{records.length}</span>
      </div>
      <div style={{display:"grid",gap:8}}>
        {records.map(r => {
          const s=getStatus(r.days); const name=primaryOf(r.cat,r); const cfg=CAT[r.cat];
          return (
            <div key={r.id} onClick={() => onDetail(r)}
              style={{background:"#0d1117",border:"1px solid #1a2235",borderRadius:12,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,transition:"border-color .15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=color}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#1a2235"}>
              <div style={{width:3,alignSelf:"stretch",borderRadius:2,background:s.color,flexShrink:0}} />
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:14,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name}</div>
                <div style={{fontSize:11,color:"#334155",marginTop:3,display:"flex",gap:6}}>
                  <span style={{background:cfg.dim,color:cfg.color,borderRadius:4,padding:"1px 6px",fontWeight:600}}>{r.cat}</span>
                  <span>{r.project}</span>
                </div>
                <div style={{fontSize:11,color:"#475569",marginTop:4}}>Expires: {fmtDate(r.expiryDate)}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:28,color:s.color,lineHeight:1}}>{Math.abs(r.days)}</div>
                <div style={{fontSize:9,color:"#334155",fontWeight:700,letterSpacing:".5px"}}>{r.days<0?"DAYS AGO":"DAYS LEFT"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MODALS
════════════════════════════════════════════════════════════════════════════ */
function Overlay({ children, onClose }) {
  return (
    <div className="fade-in" onClick={e => e.target === e.currentTarget && onClose()}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.78)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      {children}
    </div>
  );
}

function RecordModal({ modal, onClose, onSave }) {
  const { mode, category, record } = modal;
  const [form, setForm] = useState(record || {});
  const flds = FIELDS[category];
  const cfg  = CAT[category];

  const submit = () => {
    const missing = flds.filter(f => f.req && !form[f.key]);
    if (missing.length) { alert(`Required fields: ${missing.map(f=>f.label).join(", ")}`); return; }
    onSave(category, form, mode);
  };

  return (
    <Overlay onClose={onClose}>
      <div className="slide-up" style={{background:"#0d1117",border:"1px solid #1a2235",borderRadius:18,width:"100%",maxWidth:480,maxHeight:"90vh",overflow:"auto"}}>
        <div style={{padding:"20px 22px 16px",borderBottom:"1px solid #1a2235",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#0d1117",zIndex:1}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:"#f1f5f9"}}>{mode==="add"?"New":"Edit"} {category} Record</div>
            <div style={{fontSize:11,color:"#334155",marginTop:2}}>{mode==="add"?"Fill in the certification details":"Update the record"}</div>
          </div>
          <button onClick={onClose} style={{background:"#0a0c10",border:"1px solid #1a2235",color:"#475569",borderRadius:8,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>×</button>
        </div>

        <div style={{padding:"18px 22px"}}>
          {flds.map(f => (
            <div key={f.key} style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:"#334155",marginBottom:5,letterSpacing:".5px"}}>
                {f.label.toUpperCase()}{f.req && <span style={{color:cfg.color}}> *</span>}
              </label>
              {f.type === "textarea"
                ? <textarea value={form[f.key]||""} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} rows={2}
                    style={{width:"100%",background:"#0a0c10",border:"1px solid #1a2235",borderRadius:8,padding:"9px 12px",fontSize:13,color:"#e2e8f0",outline:"none",resize:"vertical"}}
                    onFocus={e=>e.target.style.borderColor=cfg.color} onBlur={e=>e.target.style.borderColor="#1a2235"} />
                : <input type={f.type||"text"} value={form[f.key]||""} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                    style={{width:"100%",background:"#0a0c10",border:"1px solid #1a2235",borderRadius:8,padding:"9px 12px",fontSize:13,color:"#e2e8f0",outline:"none",colorScheme:"dark"}}
                    onFocus={e=>e.target.style.borderColor=cfg.color} onBlur={e=>e.target.style.borderColor="#1a2235"} />
              }
            </div>
          ))}
        </div>

        <div style={{padding:"0 22px 22px",display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:"#0a0c10",border:"1px solid #1a2235",color:"#475569",borderRadius:10,padding:"11px",fontSize:13,fontWeight:600}}>Cancel</button>
          <button onClick={submit}  style={{flex:2,background:cfg.color,border:"none",color:"#fff",borderRadius:10,padding:"11px",fontSize:13,fontWeight:700}}>
            {mode==="add"?"Add Record":"Save Changes"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function DetailPanel({ rec, onClose, onEdit, onDel }) {
  const { cat } = rec;
  const flds = FIELDS[cat];
  const cfg  = CAT[cat];
  const days = daysUntil(rec.expiryDate);
  const s    = getStatus(days);
  const name = primaryOf(cat, rec);

  return (
    <Overlay onClose={onClose}>
      <div className="slide-up" style={{background:"#0d1117",border:"1px solid #1a2235",borderRadius:18,width:"100%",maxWidth:440,maxHeight:"90vh",overflow:"auto"}}>
        <div style={{background:cfg.dim,borderRadius:"18px 18px 0 0",padding:"22px 22px 18px",borderBottom:`1px solid ${cfg.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:9,color:cfg.color,fontWeight:700,letterSpacing:"1px",marginBottom:6}}>{cat.toUpperCase()} CERTIFICATION</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:"#f1f5f9",lineHeight:1.2}}>{name}</div>
              <span style={{display:"inline-block",marginTop:8,background:s.bg,color:s.color,borderRadius:999,padding:"3px 12px",fontSize:11,fontWeight:700}}>{s.label}</span>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,.07)",border:"none",color:"#94a3b8",borderRadius:8,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
          {days !== null && (
            <div style={{marginTop:14,display:"flex",alignItems:"baseline",gap:6}}>
              <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:40,color:s.color,lineHeight:1}}>{Math.abs(days)}</span>
              <span style={{fontSize:13,color:"#475569"}}>{days<0?"days overdue":"days remaining"}</span>
            </div>
          )}
        </div>

        <div style={{padding:"18px 22px"}}>
          {flds.filter(f => rec[f.key]).map(f => (
            <div key={f.key} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #0f1420"}}>
              <span style={{fontSize:12,color:"#334155",fontWeight:500}}>{f.label}</span>
              <span style={{fontSize:12,color:"#94a3b8",fontWeight:500,textAlign:"right",maxWidth:"60%"}}>{f.type==="date"?fmtDate(rec[f.key]):rec[f.key]}</span>
            </div>
          ))}
        </div>

        <div style={{padding:"0 22px 22px",display:"flex",gap:10}}>
          <button onClick={onDel}  style={{flex:1,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",color:"#ef4444",borderRadius:10,padding:"10px",fontSize:13,fontWeight:600}}>Delete</button>
          <button onClick={onEdit} style={{flex:2,background:cfg.color,border:"none",color:"#fff",borderRadius:10,padding:"10px",fontSize:13,fontWeight:700}}>Edit Record</button>
        </div>
      </div>
    </Overlay>
  );
}

function AlertConfig({ onClose, showToast }) {
  const [cfg, setCfg] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ct_alertcfg") || "{}"); }
    catch { return {}; }
  });

  const set = k => e => setCfg(p => ({...p, [k]: e.target.value}));

  const save = () => {
    localStorage.setItem("ct_alertcfg", JSON.stringify(cfg));
    showToast("Alert settings saved");
    onClose();
  };

  const fields = [
    {k:"emails",   label:"Recipient Emails",    ph:"user@company.com, manager@company.com"},
    {k:"smtpHost", label:"SMTP Host",            ph:"mail.company.com"},
    {k:"smtpPort", label:"SMTP Port",            ph:"587"},
    {k:"smtpUser", label:"SMTP Sender Username", ph:"noreply@company.com"},
  ];

  return (
    <Overlay onClose={onClose}>
      <div className="slide-up" style={{background:"#0d1117",border:"1px solid #1a2235",borderRadius:18,width:"100%",maxWidth:440}}>
        <div style={{padding:"20px 22px 16px",borderBottom:"1px solid #1a2235",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:"#f1f5f9"}}>Email Alert Configuration</div>
          <button onClick={onClose} style={{background:"#0a0c10",border:"1px solid #1a2235",color:"#475569",borderRadius:8,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{padding:"18px 22px"}}>
          <div style={{background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.15)",borderRadius:10,padding:"11px 13px",marginBottom:18,fontSize:12,color:"#60a5fa"}}>
            ℹ Alerts fire 90 days before expiry. Your backend must have SMTP configured to deliver emails.
          </div>
          {fields.map(f => (
            <div key={f.k} style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:"#334155",marginBottom:5,letterSpacing:".5px"}}>{f.label.toUpperCase()}</label>
              <input value={cfg[f.k]||""} onChange={set(f.k)} placeholder={f.ph}
                style={{width:"100%",background:"#0a0c10",border:"1px solid #1a2235",borderRadius:8,padding:"9px 12px",fontSize:13,color:"#e2e8f0",outline:"none"}}
                onFocus={e=>e.target.style.borderColor="#3b82f6"} onBlur={e=>e.target.style.borderColor="#1a2235"} />
            </div>
          ))}
        </div>
        <div style={{padding:"0 22px 22px",display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:"#0a0c10",border:"1px solid #1a2235",color:"#475569",borderRadius:10,padding:"11px",fontSize:13,fontWeight:600}}>Cancel</button>
          <button onClick={save}    style={{flex:2,background:"#3b82f6",border:"none",color:"#fff",borderRadius:10,padding:"11px",fontSize:13,fontWeight:700}}>Save Settings</button>
        </div>
      </div>
    </Overlay>
  );
}
