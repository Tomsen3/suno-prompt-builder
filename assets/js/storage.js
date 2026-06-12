function plUid(){return 'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function plEsc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function plLoad(){
  try{
    const raw=localStorage.getItem(PL_KEY);
    if(raw){const d=JSON.parse(raw); if(d&&Array.isArray(d.plans)){plState=d;}}
  }catch(e){ /* localStorage nicht verfügbar oder defekt: leer starten */ }
  if(!plState.plans) plState.plans=[];
  // Migration aus Version 3.0: vorhandene Einträge ohne kind sind reguläre Behandlungsverläufe.
  plState.plans.forEach(p=>{ 
    if(!p.kind) p.kind='plan'; 
    if(!Array.isArray(p.sessions)) p.sessions=[];
    p.sessions.forEach(plEnsureSessionFrame);
  });
}
function plSave(){
  try{ localStorage.setItem(PL_KEY,JSON.stringify(plState)); }
  catch(e){ alert('Speichern im Browser nicht möglich (localStorage gesperrt oder voll). Bitte über Export sichern.'); }
}

/* ---- Export / Import ---- */
function plExport(){
  const blob=new Blob([JSON.stringify(plState,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const stamp=new Date().toISOString().slice(0,10);
  a.href=url; a.download=`mt-planung_${stamp}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function plImport(input){
  const file=input.files&&input.files[0]; if(!file) return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const d=JSON.parse(r.result);
      if(!d||!Array.isArray(d.plans)) throw new Error('Format');
      if(!confirm('Import ersetzt den aktuellen Planungsstand in diesem Browser. Fortfahren?')) {input.value='';return;}
      plState=d; if(!plState.plans) plState.plans=[];
      plState.plans.forEach(p=>{
        if(!p.kind) p.kind='plan';
        if(!Array.isArray(p.sessions)) p.sessions=[];
        p.sessions.forEach(plEnsureSessionFrame);
      });
      if(!plState.activePlanId && plState.plans.length) plState.activePlanId=plState.plans[0].id;
      plSave(); plRender();
    }catch(e){ alert('Datei konnte nicht gelesen werden – ist es eine gültige Planungs-JSON?'); }
    input.value='';
  };
  r.readAsText(file);
}
