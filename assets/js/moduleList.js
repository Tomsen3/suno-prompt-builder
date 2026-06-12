let moduleViewMode='map';
function setModuleView(mode){
  moduleViewMode = mode==='list'?'list':'map';
  const map=document.getElementById('mlb'), list=document.getElementById('moduleList');
  const bMap=document.getElementById('mlModeMap'), bList=document.getElementById('mlModeList');
  if(map) map.classList.toggle('off', moduleViewMode==='list');
  if(list) list.classList.toggle('on', moduleViewMode==='list');
  if(bMap) bMap.classList.toggle('on', moduleViewMode==='map');
  if(bList) bList.classList.toggle('on', moduleViewMode==='list');
  renderModuleList();
}
function modulePassesCurrentFilter(id){
  const meta=M[id]; if(!meta) return false;
  const q=(document.getElementById('search')?.value||'').trim().toLowerCase();
  const keys=[...AF], methods=[...AM];
  const bits=['p','s','g','a'].filter(k=>meta[k]>0||meta[k]===-1);
  if(meta.star) bits.push('kern');
  if(meta.note&&meta.note.includes('⊕')) bits.push('integ');
  if(VERTIEFUNG.has(id)) bits.push('vertief');
  if(VOK.has(id)) bits.push('vok');
  if(VEXP.has(id)) bits.push('vexp');
  if(VRAHM.has(id)) bits.push('vrahm');
  bits.push(meta.m);
  const passFilter=keys.length===0 || keys.every(k=>bits.includes(k));
  const passMethod=methods.length===0 || methods.some(m=>bits.includes(m));
  const passSearch=!q || (id+' '+meta.n).toLowerCase().includes(q);
  const passAcute=!ML_ACUTE_SAFE_ONLY || ML_ACUTE_SAFE_IDS.includes(id);
  return passFilter && passMethod && passSearch && passAcute;
}
function renderModuleList(){
  const host=document.getElementById('moduleList'); if(!host) return;
  const ids=Object.keys(M).filter(modulePassesCurrentFilter).sort((a,b)=>a.localeCompare(b,'de',{numeric:true}));
  if(!ids.length){host.innerHTML='<div style="padding:14px;color:var(--color-text-secondary);font-size:13px">Keine Module für diese Filterkombination.</div>';return;}
  host.innerHTML=`<table><thead><tr><th>Modul</th><th>Wirkung</th><th>Setting</th><th>Einsatzlogik</th><th></th></tr></thead><tbody>${ids.map(id=>{
    const meta=M[id], mc=MC[meta.m]||{};
    const extra=AF.has('g')&&ML_GERONTO_FOCUS_IDS.includes(id)?' · Geronto-Fokus: ritualisiert, vertraut oder niedrig komplex':(ML_ACUTE_SAFE_ONLY?' · Akut-Kurzform: reizarm und abbrechbar':'');
    return `<tr><td><strong style="color:${mc.fg||'inherit'}">${plEsc(id)}</strong><br>${plEsc(meta.n)}</td><td>${plEsc(moduleMainWirk(id))}</td><td>${plEsc(settingSuitabilityText(meta))}</td><td>${plEsc(moduleBadgesText(id)+extra)}</td><td><button onclick="openModule('${id}')">Profil</button></td></tr>`;
  }).join('')}</tbody></table>`;
}
