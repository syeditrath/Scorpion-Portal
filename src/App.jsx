import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'Barlow', sans-serif; background: #080b10; color: #e8edf5; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #080b10; }
  ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
  input, select, textarea, button { font-family: 'Barlow', sans-serif; }
  button { cursor: pointer; }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  .fade-up  { animation: fadeUp  0.3s ease both; }
  .slide-up { animation: slideUp 0.35s cubic-bezier(0.34,1.3,0.64,1) both; }
  .fade-in  { animation: fadeIn  0.2s ease both; }
`;

const T = {
  bg:"#080b10", sidebar:"#0e1117", card:"#0e1117", cardHover:"#131820",
  border:"#1e293b", borderLight:"#253147",
  text:"#f1f5fb", textSub:"#8899b0", textMuted:"#3d5068",
  blue:"#38bdf8", green:"#34d399", gold:"#fbbf24", red:"#f87171",
  blueDim:"rgba(56,189,248,0.1)", greenDim:"rgba(52,211,153,0.1)",
  goldDim:"rgba(251,191,36,0.1)", redDim:"rgba(248,113,113,0.1)",
  inputBg:"#080b10", shadow:"0 2px 12px rgba(0,0,0,0.4)",
};

const CATS = ["TUV","Manpower","Equipment"];
const CAT = {
  TUV:       { color:T.blue,  dim:T.blueDim,  icon:"◈" },
  Manpower:  { color:T.green, dim:T.greenDim, icon:"◉" },
  Equipment: { color:T.gold,  dim:T.goldDim,  icon:"◎" },
};

const FIELDS = {
  TUV: [
    { key:"project",        label:"Project",          req:true,  type:"project" },
    { key:"equipment",      label:"Equipment / Unit", req:true },
    { key:"serialId",       label:"Serial / ID",      req:true },
    { key:"certNo",         label:"Certificate No." },
    { key:"inspectionDate", label:"Inspection Date",  type:"date" },
    { key:"expiryDate",     label:"Expiry Date",      type:"date", req:true },
    { key:"remarks",        label:"Remarks",          type:"textarea" },
  ],
  Manpower: [
    { key:"project",     label:"Project",           req:true, type:"project" },
    { key:"name",        label:"Employee Name",     req:true },
    { key:"idPassport",  label:"ID / Passport No.", req:true },
    { key:"designation", label:"Designation" },
    { key:"certType",    label:"Certificate Type" },
    { key:"issueDate",   label:"Issue Date",        type:"date" },
    { key:"expiryDate",  label:"Expiry Date",       type:"date", req:true },
    { key:"remarks",     label:"Remarks",           type:"textarea" },
  ],
  Equipment: [
    { key:"project",        label:"Project",         req:true, type:"project" },
    { key:"equipmentName",  label:"Equipment Name",  req:true },
    { key:"modelMake",      label:"Model / Make" },
    { key:"serialNumber",   label:"Serial Number",   req:true },
    { key:"certNo",         label:"Certificate No." },
    { key:"inspectionDate", label:"Inspection Date", type:"date" },
    { key:"expiryDate",     label:"Expiry Date",     type:"date", req:true },
    { key:"remarks",        label:"Remarks",         type:"textarea" },
  ],
};

const EXCEL_MAP = {
  TUV: {
    "EQUIPMENT/UNIT":"equipment","EQUIPMENT ID /SERIAL NUMBER":"serialId",
    "INSPECTION DATE":"inspectionDate","EXPIRE DATE":"expiryDate",
    "PROJECT":"project","CERTIFICATE NO":"certNo","REMARKS":"remarks",
  },
  Manpower: {
    "PROJECT":"project","EMPLOYEE NAME":"name","ID NO":"idPassport",
    "PASSPORT NO":"idPassport","DESIGNATION":"designation",
    "CERTIFICATE TYPE":"certType","ISSUE DATE":"issueDate",
    "EXPIRY DATE":"expiryDate","EXPIRE DATE":"expiryDate","REMARKS":"remarks",
  },
  Equipment: {
    "PROJECT":"project","EQUIPMENT NAME":"equipmentName","MODEL":"modelMake",
    "MAKE":"modelMake","SERIAL NUMBER":"serialNumber","SERIAL NO":"serialNumber",
    "CERTIFICATE NO":"certNo","INSPECTION DATE":"inspectionDate",
    "EXPIRY DATE":"expiryDate","EXPIRE DATE":"expiryDate","REMARKS":"remarks",
  },
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

const DEFAULT_PROJECTS = ["NEOM Phase 1","NEOM Phase 2","Riyadh Metro"];

const daysUntil   = d => d ? Math.ceil((new Date(d)-new Date())/86400000) : null;
const fmtDate     = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const uid         = () => Math.random().toString(36).slice(2,9);
const primaryOf   = (cat,r) => ({TUV:r.equipment,Manpower:r.name,Equipment:r.equipmentName}[cat]||"—");
const secondaryOf = (cat,r) => ({TUV:r.serialId,Manpower:r.designation,Equipment:r.serialNumber}[cat]||"");

function getStatus(days) {
  if (days===null) return {label:"Unknown",       color:T.textMuted, bg:"rgba(61,80,104,.15)"};
  if (days<0)      return {label:"Expired",       color:T.red,       bg:T.redDim};
  if (days<=90)    return {label:"Expiring Soon", color:T.gold,      bg:T.goldDim};
  return             {label:"Valid",            color:T.green,     bg:T.greenDim};
}

function excelDateToString(val) {
  if (!val) return "";
  if (typeof val==="number") { const d=new Date(Math.round((val-25569)*86400*1000)); return d.toISOString().slice(0,10); }
  if (typeof val==="string") { const d=new Date(val); if(!isNaN(d)) return d.toISOString().slice(0,10); }
  return String(val);
}

function parseExcelForCategory(data, category) {
  const map=EXCEL_MAP[category];
  return data
    .filter(row=>Object.values(row).some(v=>v!==null&&v!==""))
    .map(row=>{
      const rec={id:uid()}, upperRow={};
      Object.entries(row).forEach(([k,v])=>{upperRow[k.toUpperCase().trim()]=v;});
      Object.entries(map).forEach(([excelCol,appKey])=>{
        if(!appKey) return;
        const val=upperRow[excelCol.toUpperCase()];
        if(val!==undefined&&val!==null&&val!=="") {
          if(["expiryDate","inspectionDate","issueDate"].includes(appKey)) rec[appKey]=excelDateToString(val);
          else rec[appKey]=String(val).trim();
        }
      });
      return rec;
    })
    .filter(r=>{const p=primaryOf(category,r);return p&&p!=="—";});
}

function loadRecords() { try{const r=localStorage.getItem("ct_v4");return r?JSON.parse(r):SEED;}catch{return SEED;} }
function persist(data) { try{localStorage.setItem("ct_v4",JSON.stringify(data));}catch{} }

/* ════════════════════════════ ROOT ════════════════════════════════════════ */
export default function App() {
  useEffect(()=>{
    if(!document.getElementById("ct-g")){
      const s=document.createElement("style");s.id="ct-g";s.textContent=GLOBAL_CSS;document.head.appendChild(s);
    }
  },[]);

  const [tab,      setTab]      = useState("dashboard");
  const [cat,      setCat]      = useState("TUV");
  const [recs,     setRecs]     = useState(loadRecords);
  const [search,   setSearch]   = useState("");
  const [fProj,    setFProj]    = useState("");
  const [fStat,    setFStat]    = useState("");
  const [modal,    setModal]    = useState(null);
  const [detail,   setDetail]   = useState(null);
  const [alertMod, setAlertMod] = useState(false);
  const [toast,    setToast]    = useState(null);
  const [sideOpen, setSideOpen] = useState(false);
  const [projMod,  setProjMod]  = useState(false);
  const [projects, setProjects] = useState(()=>{
    try{return JSON.parse(localStorage.getItem("ct_projects")||"null")||DEFAULT_PROJECTS;}
    catch{return DEFAULT_PROJECTS;}
  });

  useEffect(()=>{persist(recs);},[recs]);
  useEffect(()=>{try{localStorage.setItem("ct_projects",JSON.stringify(projects));}catch{}},[projects]);

  const showToast = (msg,type="ok") => {setToast({msg,type});setTimeout(()=>setToast(null),3500);};
  const addProject = name => {const n=name.trim();if(!n||projects.includes(n))return;setProjects(p=>[...p,n]);};
  const delProject = name => {setProjects(p=>p.filter(x=>x!==name));};

  const allRecs = CATS.flatMap(c=>(recs[c]||[]).map(r=>({...r,cat:c,days:daysUntil(r.expiryDate)})));
  const stats   = CATS.reduce((a,c)=>{
    const ds=(recs[c]||[]).map(r=>daysUntil(r.expiryDate));
    a[c]={total:ds.length,valid:ds.filter(d=>d!==null&&d>90).length,expiring:ds.filter(d=>d!==null&&d>=0&&d<=90).length,expired:ds.filter(d=>d!==null&&d<0).length};
    return a;
  },{});
  const attention = allRecs.filter(r=>r.days!==null&&r.days<=90).sort((a,b)=>a.days-b.days);
  const filtered  = (recs[cat]||[])
    .map(r=>({...r,days:daysUntil(r.expiryDate)}))
    .filter(r=>{
      const sl=getStatus(r.days).label,q=search.toLowerCase();
      return (!search||Object.values(r).some(v=>String(v).toLowerCase().includes(q)))&&(!fProj||r.project===fProj)&&(!fStat||sl===fStat);
    });

  const saveRec = (category,data,mode) => {
    setRecs(prev=>{const list=[...(prev[category]||[])];if(mode==="add")list.push({...data,id:uid()});else{const i=list.findIndex(r=>r.id===data.id);if(i>=0)list[i]=data;}return{...prev,[category]:list};});
    showToast(mode==="add"?"Record added":"Record updated");
    setModal(null);setDetail(null);
  };
  const delRec = (category,id) => {setRecs(prev=>({...prev,[category]:prev[category].filter(r=>r.id!==id)}));showToast("Record deleted","del");setDetail(null);};
  const importExcel = (category,file) => {
    const reader=new FileReader();
    reader.onload=e=>{
      try{
        const wb=XLSX.read(e.target.result,{type:"array"}),ws=wb.Sheets[wb.SheetNames[0]],data=XLSX.utils.sheet_to_json(ws,{defval:""});
        const parsed=parseExcelForCategory(data,category);
        if(!parsed.length){showToast("No valid rows found","del");return;}
        setRecs(prev=>({...prev,[category]:parsed}));
        showToast(`✓ Imported ${parsed.length} records into ${category}`);
      }catch{showToast("Failed to read Excel file","del");}
    };
    reader.readAsArrayBuffer(file);
  };

  const go = t => {setTab(t);setSideOpen(false);};

  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:T.bg}}>
      {sideOpen&&<div className="fade-in" onClick={()=>setSideOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:49}}/>}

      <Sidebar tab={tab} go={go} stats={stats} attention={attention} sideOpen={sideOpen} onManageProjects={()=>{setSideOpen(false);setProjMod(true);}}/>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        <TopBar tab={tab} cat={cat} projects={projects} search={search} setSearch={setSearch} fProj={fProj} setFProj={setFProj} fStat={fStat} setFStat={setFStat} attention={attention} onAdd={()=>setModal({mode:"add",category:cat})} onAlertCfg={()=>setAlertMod(true)} onHamburger={()=>setSideOpen(true)} onImport={importExcel} currentCat={cat}/>
        <main style={{flex:1,overflowY:"auto",padding:"24px 20px"}}>
          {tab==="dashboard"&&<Dashboard stats={stats} attention={attention} allRecs={allRecs} setTab={setTab} setCat={setCat} setDetail={r=>setDetail(r)}/>}
          {tab==="tracker"  &&<Tracker cat={cat} setCat={setCat} filtered={filtered} stats={stats} projects={projects} onAdd={()=>setModal({mode:"add",category:cat})} onEdit={r=>setModal({mode:"edit",category:cat,record:r})} onDel={id=>delRec(cat,id)} onDetail={r=>setDetail({...r,cat})} onImport={importExcel}/>}
          {tab==="alerts"   &&<Alerts attention={attention} onCfg={()=>setAlertMod(true)} onDetail={r=>setDetail(r)}/>}
        </main>
      </div>

      {modal   &&<RecordModal modal={modal} onClose={()=>setModal(null)} onSave={saveRec} projects={projects}/>}
      {detail  &&<DetailPanel rec={detail} onClose={()=>setDetail(null)} onEdit={()=>{setModal({mode:"edit",category:detail.cat,record:detail});setDetail(null);}} onDel={()=>delRec(detail.cat,detail.id)}/>}
      {alertMod&&<AlertConfig onClose={()=>setAlertMod(false)} showToast={showToast}/>}
      {projMod &&<ProjectsModal projects={projects} onAdd={addProject} onDel={delProject} onClose={()=>setProjMod(false)}/>}

      {toast&&(
        <div className="fade-up" style={{position:"fixed",bottom:24,right:24,zIndex:999,background:toast.type==="del"?"#130a0a":"#081310",border:`1px solid ${toast.type==="del"?T.red:T.green}`,color:toast.type==="del"?T.red:T.green,borderRadius:10,padding:"12px 20px",fontSize:14,fontWeight:600,boxShadow:T.shadow,display:"flex",alignItems:"center",gap:10}}>
          {toast.type==="del"?"✕":"✓"} {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════ SIDEBAR ════════════════════════════════════ */
function Sidebar({ tab, go, stats, attention, sideOpen, onManageProjects }) {
  const isMobile=window.innerWidth<900;
  return (
    <aside style={{width:255,flexShrink:0,background:T.sidebar,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",zIndex:50,position:isMobile?"fixed":"relative",top:0,left:0,height:"100%",transform:isMobile?(sideOpen?"translateX(0)":"translateX(-100%)"):"none",transition:"transform .28s ease"}}>

      {/* Logo — larger */}
      <div style={{padding:"22px 20px 18px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <img src="logo.png" alt="Scorpion Arabia" style={{width:56,height:56,borderRadius:10,objectFit:"cover",background:"#000",flexShrink:0}}/>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text,letterSpacing:".5px",lineHeight:1.1}}>SCORPION ARABIA</div>
            <div style={{fontSize:11,color:T.textMuted,fontWeight:600,letterSpacing:"1.4px",marginTop:3}}>CERT TRACKER</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{padding:"14px 10px",flex:1,overflowY:"auto"}}>
        <div style={{fontSize:9,color:T.textMuted,fontWeight:700,letterSpacing:"1.2px",padding:"0 8px 8px"}}>NAVIGATION</div>
        {[
          {id:"dashboard",label:"Dashboard", icon:"▦",desc:"Overview & metrics"},
          {id:"tracker",  label:"Tracker",   icon:"▤",desc:"Manage certifications"},
          {id:"alerts",   label:"Alerts",    icon:"▲",badge:attention.length,desc:"Expiry notifications"},
        ].map(n=>(
          <button key={n.id} onClick={()=>go(n.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:"none",marginBottom:2,textAlign:"left",background:tab===n.id?T.blueDim:"transparent",borderLeft:`2px solid ${tab===n.id?T.blue:"transparent"}`,transition:"all .15s"}}>
            <span style={{fontSize:18,color:tab===n.id?T.blue:T.textMuted}}>{n.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:tab===n.id?T.blue:T.text}}>{n.label}</div>
              <div style={{fontSize:10,color:T.textMuted,marginTop:1}}>{n.desc}</div>
            </div>
            {n.badge>0&&<span style={{background:T.red,color:"#fff",borderRadius:999,padding:"1px 7px",fontSize:10,fontWeight:700,flexShrink:0}}>{n.badge}</span>}
          </button>
        ))}

        <div style={{fontSize:9,color:T.textMuted,fontWeight:700,letterSpacing:"1.2px",padding:"14px 8px 8px"}}>CATEGORIES</div>
        {CATS.map(c=>{
          const cfg=CAT[c];
          return (
            <button key={c} onClick={()=>go("tracker")} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,border:"none",marginBottom:2,background:"transparent",textAlign:"left",transition:"background .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.cardHover}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{width:8,height:8,borderRadius:"50%",background:cfg.color,flexShrink:0}}/>
              <span style={{fontSize:12,color:T.textSub,flex:1}}>{c}</span>
              <div style={{display:"flex",gap:5,fontSize:11}}>
                <span style={{color:T.green,fontWeight:600}}>{stats[c]?.valid}</span>
                <span style={{color:T.textMuted}}>/</span>
                <span style={{color:T.textSub}}>{stats[c]?.total}</span>
              </div>
            </button>
          );
        })}

        <div style={{fontSize:9,color:T.textMuted,fontWeight:700,letterSpacing:"1.2px",padding:"14px 8px 8px"}}>SETTINGS</div>
        <button onClick={onManageProjects} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",textAlign:"left",transition:"all .15s"}}
          onMouseEnter={e=>{e.currentTarget.style.background=T.cardHover;e.currentTarget.style.borderColor=T.blue;}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor=T.border;}}>
          <span style={{fontSize:18,color:T.blue}}>⊕</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:T.text}}>Manage Projects</div>
            <div style={{fontSize:10,color:T.textMuted,marginTop:1}}>Add or remove projects</div>
          </div>
        </button>
      </nav>

      <div style={{padding:"12px 18px 20px",borderTop:`1px solid ${T.border}`}}>
        <div style={{fontSize:10,color:T.textMuted,textAlign:"center"}}>Scorpion Arabia © 2025</div>
      </div>
    </aside>
  );
}

/* ════════════════════════════ TOP BAR ════════════════════════════════════ */
function TopBar({ tab, cat, projects, search, setSearch, fProj, setFProj, fStat, setFStat, attention, onAdd, onAlertCfg, onHamburger, onImport, currentCat }) {
  const fileRef=useRef();
  return (
    <header style={{background:T.sidebar,borderBottom:`1px solid ${T.border}`,padding:"0 20px",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",height:68,position:"relative"}}>

        {/* Left: hamburger */}
        <button onClick={onHamburger} style={{background:T.card,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:8,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,zIndex:1}}>☰</button>

        {/* CENTER: title absolutely centered */}
        <div style={{position:"absolute",left:0,right:0,textAlign:"center",pointerEvents:"none"}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,color:T.text,letterSpacing:"3px"}}>CERTIFICATION TRACKER</div>
          <div style={{fontSize:11,color:T.textMuted,letterSpacing:"1px",marginTop:1}}>
            {tab==="tracker"?`${cat} · Manage Records`:tab==="alerts"?"Alerts & Notifications":"Overview & Metrics"}
          </div>
        </div>

        {/* Right: action buttons */}
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center",zIndex:1}}>
          {tab==="tracker"&&(
            <>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{if(e.target.files[0]){onImport(currentCat,e.target.files[0]);e.target.value="";}}}/>
              <button onClick={()=>fileRef.current.click()} style={{background:T.goldDim,border:`1px solid ${T.gold}44`,color:T.gold,borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>⬆ Import Excel</button>
              <button onClick={onAdd} style={{background:CAT[currentCat].color,color:"#000",border:"none",borderRadius:8,padding:"7px 16px",fontSize:13,fontWeight:700}}>+ Add</button>
            </>
          )}
          {attention.length>0&&(
            <button onClick={onAlertCfg} style={{background:T.redDim,border:`1px solid ${T.red}44`,color:T.red,borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
              ▲<span style={{background:T.red,color:"#fff",borderRadius:999,padding:"1px 6px",fontSize:10,fontWeight:700}}>{attention.length}</span>
            </button>
          )}
        </div>
      </div>

      {tab==="tracker"&&(
        <div style={{paddingBottom:12,display:"flex",gap:8,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:160,position:"relative"}}>
            <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:T.textMuted,fontSize:15}}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search records…"
              style={{width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px 8px 32px",fontSize:13,color:T.text,outline:"none"}}
              onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/>
          </div>
          <select value={fProj} onChange={e=>setFProj(e.target.value)} style={{background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:T.textSub,outline:"none",colorScheme:"dark"}}>
            <option value="">All Projects</option>
            {projects.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          <select value={fStat} onChange={e=>setFStat(e.target.value)} style={{background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:T.textSub,outline:"none",colorScheme:"dark"}}>
            <option value="">All Statuses</option>
            <option>Valid</option><option>Expiring Soon</option><option>Expired</option>
          </select>
        </div>
      )}
    </header>
  );
}

/* ═══════════════════════ PROJECTS MODAL ══════════════════════════════════ */
function ProjectsModal({ projects, onAdd, onDel, onClose }) {
  const [newName,setNewName]=useState("");
  const handleAdd=()=>{if(newName.trim()){onAdd(newName);setNewName("");}};
  return (
    <Overlay onClose={onClose}>
      <div className="slide-up" style={{background:T.sidebar,border:`1px solid ${T.border}`,borderRadius:18,width:"100%",maxWidth:460,maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"20px 22px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20,color:T.text}}>MANAGE PROJECTS</div>
            <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>Add or remove projects across all categories</div>
          </div>
          <button onClick={onClose} style={{background:T.bg,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>×</button>
        </div>

        <div style={{padding:"16px 22px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          <div style={{fontSize:11,fontWeight:700,color:T.textMuted,marginBottom:8,letterSpacing:".5px"}}>ADD NEW PROJECT</div>
          <div style={{display:"flex",gap:8}}>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Jeddah Highway Phase 3"
              onKeyDown={e=>e.key==="Enter"&&handleAdd()}
              style={{flex:1,background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",colorScheme:"dark"}}
              onFocus={e=>e.target.style.borderColor=T.green} onBlur={e=>e.target.style.borderColor=T.border}/>
            <button onClick={handleAdd} style={{background:T.green,color:"#000",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:700,flexShrink:0}}>+ Add</button>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"14px 22px"}}>
          <div style={{fontSize:11,fontWeight:700,color:T.textMuted,marginBottom:10,letterSpacing:".5px"}}>EXISTING PROJECTS ({projects.length})</div>
          {projects.length===0&&<div style={{textAlign:"center",padding:"30px",color:T.textMuted,fontSize:13}}>No projects yet. Add one above.</div>}
          {projects.map((p,i)=>(
            <div key={p} className="fade-up" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",background:T.bg,borderRadius:10,marginBottom:8,border:`1px solid ${T.border}`,animationDelay:`${i*.04}s`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:T.blue,flexShrink:0}}/>
                <span style={{fontSize:14,color:T.text,fontWeight:500}}>{p}</span>
              </div>
              <button onClick={()=>onDel(p)} style={{background:T.redDim,border:`1px solid ${T.red}33`,color:T.red,borderRadius:7,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700}}>✕</button>
            </div>
          ))}
        </div>

        <div style={{padding:"12px 22px 22px",flexShrink:0}}>
          <button onClick={onClose} style={{width:"100%",background:T.blue,border:"none",color:"#000",borderRadius:10,padding:"12px",fontSize:14,fontWeight:700}}>Done</button>
        </div>
      </div>
    </Overlay>
  );
}

/* ═══════════════════════ DASHBOARD ═══════════════════════════════════════ */
function Dashboard({ stats, attention, allRecs, setTab, setCat, setDetail }) {
  const total=allRecs.length,valid=allRecs.filter(r=>daysUntil(r.expiryDate)>90).length;
  const expiring=allRecs.filter(r=>{const d=daysUntil(r.expiryDate);return d!==null&&d>=0&&d<=90;}).length;
  const expired=allRecs.filter(r=>{const d=daysUntil(r.expiryDate);return d!==null&&d<0;}).length;
  const pct=total?Math.round(valid/total*100):0;
  return (
    <div style={{maxWidth:1100,margin:"0 auto"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:22}}>
        {[{label:"Total Certifications",val:total,color:T.blue},{label:"Valid",val:valid,color:T.green},{label:"Expiring in 90 Days",val:expiring,color:T.gold},{label:"Expired",val:expired,color:T.red}].map((m,i)=>(
          <div key={m.label} className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"20px 22px",animationDelay:`${i*.06}s`,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:16,right:18,fontSize:32,color:m.color,opacity:.07,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800}}>{m.val}</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:38,fontWeight:800,color:m.color,lineHeight:1}}>{m.val}</div>
            <div style={{fontSize:13,color:T.textSub,marginTop:6,fontWeight:500}}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 22px",marginBottom:20,animationDelay:".26s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.textSub,letterSpacing:".5px"}}>OVERALL COMPLIANCE</span>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:26,color:pct>=80?T.green:pct>=60?T.gold:T.red}}>{pct}%</span>
        </div>
        <div style={{height:8,background:T.border,borderRadius:999}}>
          <div style={{height:"100%",width:`${pct}%`,borderRadius:999,transition:"width .8s ease",background:pct>=80?`linear-gradient(90deg,${T.green},#059669)`:pct>=60?`linear-gradient(90deg,${T.gold},#d97706)`:`linear-gradient(90deg,${T.red},#dc2626)`}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:12,color:T.textMuted}}>
          <span>{valid} valid of {total} total</span>
          <span>{expired>0?`${expired} expired`:"No expired certs"}</span>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14,marginBottom:22}}>
        {CATS.map((c,i)=>{
          const s=stats[c],cfg=CAT[c],p=s.total?Math.round(s.valid/s.total*100):0;
          return (
            <div key={c} className="fade-up" onClick={()=>{setTab("tracker");setCat(c);}}
              style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px",cursor:"pointer",animationDelay:`${.3+i*.07}s`,transition:"border-color .2s,transform .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=cfg.color;e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="none";}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:34,height:34,background:cfg.dim,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:cfg.color}}>{cfg.icon}</div>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.text}}>{c}</span>
                </div>
                <span style={{fontSize:12,color:cfg.color,background:cfg.dim,padding:"3px 10px",borderRadius:999,fontWeight:600}}>{s.total} records</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                {[["Valid",s.valid,T.green],["Expiring",s.expiring,T.gold],["Expired",s.expired,T.red]].map(([l,v,col])=>(
                  <div key={l} style={{textAlign:"center",background:T.bg,borderRadius:8,padding:"10px 4px"}}>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:col,lineHeight:1}}>{v}</div>
                    <div style={{fontSize:11,color:T.textMuted,fontWeight:500,marginTop:2}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{height:4,background:T.border,borderRadius:999}}>
                <div style={{height:"100%",width:`${p}%`,background:cfg.color,borderRadius:999}}/>
              </div>
              <div style={{fontSize:11,color:T.textMuted,marginTop:6,textAlign:"right"}}>{p}% compliant → click to view</div>
            </div>
          );
        })}
      </div>

      {attention.length>0&&(
        <div className="fade-up" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px",animationDelay:".48s"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.textSub,letterSpacing:".5px"}}>NEEDS ATTENTION</span>
            <span style={{background:T.redDim,color:T.red,borderRadius:999,padding:"2px 9px",fontSize:12,fontWeight:700}}>{attention.length}</span>
          </div>
          <div style={{display:"grid",gap:8}}>
            {attention.slice(0,8).map(r=>{
              const s=getStatus(r.days),name=primaryOf(r.cat,r),cfg=CAT[r.cat];
              return (
                <div key={r.id} onClick={()=>setDetail(r)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:T.bg,borderRadius:10,cursor:"pointer",border:`1px solid ${T.border}`,transition:"border-color .15s,background .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=s.color;e.currentTarget.style.background=T.cardHover;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.bg;}}>
                  <div style={{width:4,height:38,borderRadius:2,background:s.color,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name}</div>
                    <div style={{fontSize:11,color:T.textMuted,marginTop:2,display:"flex",gap:6,alignItems:"center"}}>
                      <span style={{background:cfg.dim,color:cfg.color,borderRadius:4,padding:"1px 7px",fontSize:10,fontWeight:700}}>{r.cat}</span>
                      <span>{r.project}</span>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,color:s.color,lineHeight:1}}>{Math.abs(r.days)}</div>
                    <div style={{fontSize:10,color:T.textMuted,fontWeight:600,letterSpacing:".5px"}}>{r.days<0?"DAYS OVERDUE":"DAYS LEFT"}</div>
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

/* ═══════════════════════ TRACKER ═════════════════════════════════════════ */
function Tracker({ cat, setCat, filtered, stats, projects, onAdd, onEdit, onDel, onDetail, onImport }) {
  const fileRef=useRef();
  return (
    <div style={{maxWidth:1100,margin:"0 auto"}}>
      <div style={{display:"flex",gap:8,marginBottom:18,overflowX:"auto",paddingBottom:4}}>
        {CATS.map(c=>{
          const cfg=CAT[c],active=cat===c;
          return (
            <button key={c} onClick={()=>setCat(c)} style={{flexShrink:0,padding:"8px 18px",borderRadius:999,border:`1px solid ${active?cfg.color:T.border}`,background:active?cfg.dim:"transparent",color:active?cfg.color:T.textSub,fontSize:13,fontWeight:active?700:500,display:"flex",alignItems:"center",gap:8,transition:"all .2s"}}>
              <span style={{fontSize:16}}>{cfg.icon}</span>{c}
              <span style={{background:active?cfg.color:T.border,color:active?"#000":T.textMuted,borderRadius:999,padding:"1px 8px",fontSize:11,fontWeight:700}}>{stats[c]?.total}</span>
            </button>
          );
        })}
      </div>

      <div style={{background:T.goldDim,border:`1px solid ${T.gold}33`,borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:T.gold}}>📂 Import from Excel</div>
          <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>Upload your {cat} Excel file — existing records will be replaced</div>
        </div>
        <div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{if(e.target.files[0]){onImport(cat,e.target.files[0]);e.target.value="";}}}/>
          <button onClick={()=>fileRef.current.click()} style={{background:T.gold,color:"#000",border:"none",borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:700}}>⬆ Upload {cat} Excel</button>
        </div>
      </div>

      <div style={{fontSize:13,color:T.textMuted,marginBottom:12}}>{filtered.length} record{filtered.length!==1?"s":""}</div>
      {filtered.length===0
        ?<EmptyState onAdd={onAdd} onImport={()=>fileRef.current.click()} cat={cat}/>
        :<div style={{display:"grid",gap:10}}>
          {filtered.map((r,i)=><RecordCard key={r.id} r={r} cat={cat} delay={i*.025} onEdit={()=>onEdit(r)} onDel={()=>onDel(r.id)} onDetail={()=>onDetail(r)}/>)}
        </div>
      }
    </div>
  );
}

function RecordCard({ r, cat, delay, onEdit, onDel, onDetail }) {
  const s=getStatus(r.days),name=primaryOf(cat,r),sub=secondaryOf(cat,r);
  return (
    <div className="fade-up" onClick={onDetail}
      style={{background:T.card,border:`1px solid ${T.border}`,borderLeft:`4px solid ${s.color}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",animationDelay:`${delay}s`,transition:"background .15s"}}
      onMouseEnter={e=>e.currentTarget.style.background=T.cardHover}
      onMouseLeave={e=>e.currentTarget.style.background=T.card}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:4}}>
            <div style={{fontSize:15,fontWeight:600,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name}</div>
            <span style={{flexShrink:0,background:s.bg,color:s.color,borderRadius:999,padding:"3px 12px",fontSize:12,fontWeight:700}}>{s.label}</span>
          </div>
          {sub&&<div style={{fontSize:12,color:T.textSub,marginBottom:8}}>{sub}</div>}
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {r.project&&<Chip>{r.project}</Chip>}
            {(r.certNo||r.certType)&&<Chip>{r.certNo||r.certType}</Chip>}
            {r.inspectionDate&&<Chip>Insp: {fmtDate(r.inspectionDate)}</Chip>}
            <Chip color={s.color}>Exp: {fmtDate(r.expiryDate)}</Chip>
            {r.days!==null&&<Chip color={s.color}>{r.days>=0?`${r.days}d left`:`${Math.abs(r.days)}d overdue`}</Chip>}
          </div>
          {r.remarks&&<div style={{marginTop:8,fontSize:12,color:T.textMuted,fontStyle:"italic"}}>{r.remarks}</div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
          <ABtn onClick={onEdit} color={T.blue}>✎</ABtn>
          <ABtn onClick={onDel}  color={T.red}>✕</ABtn>
        </div>
      </div>
    </div>
  );
}

const Chip=({children,color})=><span style={{background:T.bg,border:`1px solid ${T.borderLight}`,borderRadius:6,padding:"2px 9px",fontSize:12,color:color||T.textSub,fontWeight:500}}>{children}</span>;
const ABtn=({onClick,color,children})=><button onClick={onClick} style={{width:30,height:30,borderRadius:7,border:`1px solid ${color}33`,background:`${color}18`,color,fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</button>;

function EmptyState({ onAdd, onImport, cat }) {
  const cfg=CAT[cat];
  return (
    <div style={{textAlign:"center",padding:"60px 20px",background:T.card,borderRadius:14,border:`1px dashed ${T.border}`}}>
      <div style={{fontSize:44,color:cfg.color,opacity:.25,marginBottom:14}}>{cfg.icon}</div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.textSub,marginBottom:6}}>No records found</div>
      <div style={{fontSize:13,color:T.textMuted,marginBottom:22}}>Add records manually or import from Excel</div>
      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
        <button onClick={onImport} style={{background:T.goldDim,border:`1px solid ${T.gold}44`,color:T.gold,borderRadius:8,padding:"9px 20px",fontSize:13,fontWeight:600}}>⬆ Import Excel</button>
        <button onClick={onAdd} style={{background:cfg.color,color:"#000",border:"none",borderRadius:8,padding:"9px 20px",fontSize:13,fontWeight:700}}>+ Add Manually</button>
      </div>
    </div>
  );
}

/* ═══════════════════════ ALERTS ══════════════════════════════════════════ */
function Alerts({ attention, onCfg, onDetail }) {
  const expired=attention.filter(r=>r.days<0).sort((a,b)=>a.days-b.days);
  const expiring=attention.filter(r=>r.days>=0).sort((a,b)=>a.days-b.days);
  return (
    <div style={{maxWidth:820,margin:"0 auto"}}>
      <div className="fade-up" style={{background:"linear-gradient(135deg,#0a1628,#0d2350)",border:"1px solid #1d3461",borderRadius:14,padding:"18px 22px",marginBottom:22}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:16,color:T.blue,marginBottom:4}}>📧 EMAIL NOTIFICATIONS</div>
            <div style={{fontSize:13,color:T.textMuted}}>Automatic alerts sent 90 days before expiry via your company SMTP server.</div>
          </div>
          <button onClick={onCfg} style={{background:"rgba(56,189,248,.15)",border:`1px solid ${T.blue}44`,color:T.blue,borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:600}}>⚙ Configure</button>
        </div>
      </div>
      {attention.length===0
        ?<div style={{textAlign:"center",padding:"80px 20px",background:T.card,borderRadius:14,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:52,marginBottom:16}}>✓</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,color:T.green,marginBottom:8}}>ALL CLEAR</div>
          <div style={{fontSize:14,color:T.textMuted}}>No certifications require attention</div>
        </div>
        :<>
          {expired.length>0&&<AlertSection title="EXPIRED" color={T.red} records={expired} onDetail={onDetail}/>}
          {expiring.length>0&&<AlertSection title="EXPIRING WITHIN 90 DAYS" color={T.gold} records={expiring} onDetail={onDetail}/>}
        </>
      }
    </div>
  );
}

function AlertSection({ title, color, records, onDetail }) {
  return (
    <div className="fade-up" style={{marginBottom:24}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:3,height:18,borderRadius:2,background:color}}/>
        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.textSub,letterSpacing:".8px"}}>{title}</span>
        <span style={{background:`${color}20`,color,borderRadius:999,padding:"2px 9px",fontSize:12,fontWeight:700}}>{records.length}</span>
      </div>
      <div style={{display:"grid",gap:8}}>
        {records.map(r=>{
          const s=getStatus(r.days),name=primaryOf(r.cat,r),cfg=CAT[r.cat];
          return (
            <div key={r.id} onClick={()=>onDetail(r)}
              style={{background:T.card,border:`1px solid ${T.border}`,borderLeft:`4px solid ${s.color}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,transition:"background .15s,border-color .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=T.cardHover;e.currentTarget.style.borderColor=color;}}
              onMouseLeave={e=>{e.currentTarget.style.background=T.card;e.currentTarget.style.borderColor=T.border;}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:600,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name}</div>
                <div style={{fontSize:12,color:T.textMuted,marginTop:3,display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{background:cfg.dim,color:cfg.color,borderRadius:4,padding:"1px 7px",fontSize:11,fontWeight:600}}>{r.cat}</span>
                  <span>{r.project}</span>
                </div>
                <div style={{fontSize:12,color:T.textSub,marginTop:4}}>Expires: {fmtDate(r.expiryDate)}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:30,color:s.color,lineHeight:1}}>{Math.abs(r.days)}</div>
                <div style={{fontSize:10,color:T.textMuted,fontWeight:600,letterSpacing:".5px"}}>{r.days<0?"DAYS AGO":"DAYS LEFT"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════ MODALS ══════════════════════════════════════════ */
function Overlay({ children, onClose }) {
  return (
    <div className="fade-in" onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.82)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      {children}
    </div>
  );
}

function RecordModal({ modal, onClose, onSave, projects }) {
  const {mode,category,record}=modal;
  const [form,setForm]=useState(record||{});
  const flds=FIELDS[category],cfg=CAT[category];
  const submit=()=>{
    const missing=flds.filter(f=>f.req&&!form[f.key]);
    if(missing.length){alert(`Required: ${missing.map(f=>f.label).join(", ")}`);return;}
    onSave(category,form,mode);
  };
  return (
    <Overlay onClose={onClose}>
      <div className="slide-up" style={{background:T.sidebar,border:`1px solid ${T.border}`,borderRadius:18,width:"100%",maxWidth:500,maxHeight:"90vh",overflow:"auto"}}>
        <div style={{padding:"20px 22px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:T.sidebar,zIndex:1}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.text}}>{mode==="add"?"NEW":"EDIT"} {category.toUpperCase()} RECORD</div>
            <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>{mode==="add"?"Fill in the certification details":"Update the record details"}</div>
          </div>
          <button onClick={onClose} style={{background:T.bg,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>×</button>
        </div>
        <div style={{padding:"18px 22px"}}>
          {flds.map(f=>(
            <div key={f.key} style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:T.textMuted,marginBottom:5,letterSpacing:".5px"}}>
                {f.label.toUpperCase()}{f.req&&<span style={{color:cfg.color}}> *</span>}
              </label>
              {f.type==="project"
                ?<select value={form[f.key]||""} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                    style={{width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:form[f.key]?T.text:T.textMuted,outline:"none",colorScheme:"dark"}}
                    onFocus={e=>e.target.style.borderColor=cfg.color} onBlur={e=>e.target.style.borderColor=T.border}>
                    <option value="">Select a project…</option>
                    {projects.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                :f.type==="textarea"
                  ?<textarea value={form[f.key]||""} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} rows={2}
                      style={{width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",resize:"vertical",colorScheme:"dark"}}
                      onFocus={e=>e.target.style.borderColor=cfg.color} onBlur={e=>e.target.style.borderColor=T.border}/>
                  :<input type={f.type||"text"} value={form[f.key]||""} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                      style={{width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",colorScheme:"dark"}}
                      onFocus={e=>e.target.style.borderColor=cfg.color} onBlur={e=>e.target.style.borderColor=T.border}/>
              }
            </div>
          ))}
        </div>
        <div style={{padding:"0 22px 22px",display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:10,padding:"11px",fontSize:13,fontWeight:600}}>Cancel</button>
          <button onClick={submit}  style={{flex:2,background:cfg.color,border:"none",color:"#000",borderRadius:10,padding:"11px",fontSize:14,fontWeight:700}}>{mode==="add"?"Add Record":"Save Changes"}</button>
        </div>
      </div>
    </Overlay>
  );
}

function DetailPanel({ rec, onClose, onEdit, onDel }) {
  const {cat}=rec,flds=FIELDS[cat],cfg=CAT[cat];
  const days=daysUntil(rec.expiryDate),s=getStatus(days),name=primaryOf(cat,rec);
  return (
    <Overlay onClose={onClose}>
      <div className="slide-up" style={{background:T.sidebar,border:`1px solid ${T.border}`,borderRadius:18,width:"100%",maxWidth:460,maxHeight:"90vh",overflow:"auto"}}>
        <div style={{background:cfg.dim,borderRadius:"18px 18px 0 0",padding:"22px 22px 18px",borderBottom:`1px solid ${cfg.color}33`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,color:cfg.color,fontWeight:700,letterSpacing:"1.2px",marginBottom:6}}>{cat} CERTIFICATION</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20,color:T.text,lineHeight:1.2}}>{name}</div>
              <span style={{display:"inline-block",marginTop:8,background:s.bg,color:s.color,borderRadius:999,padding:"3px 14px",fontSize:12,fontWeight:700}}>{s.label}</span>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,.06)",border:"none",color:T.textSub,borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>×</button>
          </div>
          {days!==null&&(
            <div style={{marginTop:14,display:"flex",alignItems:"baseline",gap:8}}>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:46,color:s.color,lineHeight:1}}>{Math.abs(days)}</span>
              <span style={{fontSize:14,color:T.textMuted}}>{days<0?"days overdue":"days remaining"}</span>
            </div>
          )}
        </div>
        <div style={{padding:"18px 22px"}}>
          {flds.filter(f=>rec[f.key]).map(f=>(
            <div key={f.key} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:13,color:T.textMuted,fontWeight:500}}>{f.label}</span>
              <span style={{fontSize:13,color:T.textSub,fontWeight:500,textAlign:"right",maxWidth:"60%"}}>{f.type==="date"?fmtDate(rec[f.key]):rec[f.key]}</span>
            </div>
          ))}
        </div>
        <div style={{padding:"0 22px 22px",display:"flex",gap:10}}>
          <button onClick={onDel}  style={{flex:1,background:T.redDim,border:`1px solid ${T.red}33`,color:T.red,borderRadius:10,padding:"11px",fontSize:13,fontWeight:600}}>Delete</button>
          <button onClick={onEdit} style={{flex:2,background:cfg.color,border:"none",color:"#000",borderRadius:10,padding:"11px",fontSize:14,fontWeight:700}}>Edit Record</button>
        </div>
      </div>
    </Overlay>
  );
}

function AlertConfig({ onClose, showToast }) {
  const [cfg,setCfg]=useState(()=>{try{return JSON.parse(localStorage.getItem("ct_alertcfg")||"{}");}catch{return{};}});
  const set=k=>e=>setCfg(p=>({...p,[k]:e.target.value}));
  const save=()=>{localStorage.setItem("ct_alertcfg",JSON.stringify(cfg));showToast("Alert settings saved");onClose();};
  return (
    <Overlay onClose={onClose}>
      <div className="slide-up" style={{background:T.sidebar,border:`1px solid ${T.border}`,borderRadius:18,width:"100%",maxWidth:460}}>
        <div style={{padding:"20px 22px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.text}}>EMAIL ALERT CONFIGURATION</div>
          <button onClick={onClose} style={{background:T.bg,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{padding:"18px 22px"}}>
          <div style={{background:T.blueDim,border:`1px solid ${T.blue}33`,borderRadius:10,padding:"12px 14px",marginBottom:18,fontSize:13,color:T.blue}}>
            ℹ Alerts fire 90 days before expiry. Your backend must have SMTP configured.
          </div>
          {[{k:"emails",label:"Recipient Emails",ph:"user@company.com, manager@company.com"},{k:"smtpHost",label:"SMTP Host",ph:"mail.company.com"},{k:"smtpPort",label:"SMTP Port",ph:"587"},{k:"smtpUser",label:"SMTP Sender Username",ph:"noreply@company.com"}].map(f=>(
            <div key={f.k} style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:T.textMuted,marginBottom:5,letterSpacing:".5px"}}>{f.label.toUpperCase()}</label>
              <input value={cfg[f.k]||""} onChange={set(f.k)} placeholder={f.ph}
                style={{width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",colorScheme:"dark"}}
                onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/>
            </div>
          ))}
        </div>
        <div style={{padding:"0 22px 22px",display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,color:T.textSub,borderRadius:10,padding:"11px",fontSize:13,fontWeight:600}}>Cancel</button>
          <button onClick={save}    style={{flex:2,background:T.blue,border:"none",color:"#000",borderRadius:10,padding:"11px",fontSize:14,fontWeight:700}}>Save Settings</button>
        </div>
      </div>
    </Overlay>
  );
}
