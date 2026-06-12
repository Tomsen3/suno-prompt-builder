/* ---------- Filter (aus v10.7, plus Sichtbarkeit für Suche) ---------- */
const AF=new Set();
const AM=new Set();
let ML_ACUTE_SAFE_ONLY=false;
const ML_ACUTE_SAFE_IDS=['KM-1','RZ-4','RN-1','KM-9'];
const ML_GERONTO_FOCUS_IDS=['KM-9','KM-4','RZ-4','RN-2','KM-1','RZ-6'];
function mlUpdateClinicalModeBox(){
  const box=document.getElementById('mlClinicalModeBox');
  if(!box) return;
  const parts=[];
  if(AF.has('g')){
    parts.push(`<h3>Geronto-Modus</h3><p>Musikalisches Ankommen vor Gespräch: Ritual, Wiederholung, Beobachtung und schrittweise Kontaktaufnahme stehen vor Reflexion. Geeignete Module werden in der Liste zusätzlich fachlich eingeordnet.</p><div class="ml-mode-actions">${ML_GERONTO_FOCUS_IDS.filter(id=>M[id]).map(id=>`<button class="pl-btn tiny" onclick="openModule('${id}')">${plEsc(plDocModuleTitle(id))}</button>`).join('')}</div>`);
  }
  if(ML_ACUTE_SAFE_ONLY){
    parts.push(`<h3>Akut-Modus: nur sichere Kurzformen</h3><p>Angezeigt werden nur kurze, reizarme und jederzeit abbrechbare Module ohne Reflexionsdruck. Bei Delirrisiko, Intoxikationsnähe, psychotischer Symptomatik, akuter Suizidalität oder massiver Instabilität bleibt Rücksprache mit dem Behandlungsteam vorrangig.</p><div class="ml-mode-actions"><button class="pl-btn tiny" onclick="hbJumpContains('Akut-Sicherheitscheck')">Akut-Sicherheitscheck öffnen</button><button class="pl-btn tiny" onclick="mlToggleAcuteSafe()">Akut-Modus lösen</button></div>`);
  }
  box.innerHTML=parts.join('');
  box.classList.toggle('on',parts.length>0);
  const gb=document.getElementById('gerontoModeBtn'); if(gb) gb.classList.toggle('on',AF.has('g'));
  const ab=document.getElementById('acuteSafeBtn'); if(ab) ab.classList.toggle('on',ML_ACUTE_SAFE_ONLY);
}
function mlToggleGerontoMode(){
  if(AF.has('g')) AF.delete('g'); else AF.add('g');
  const all=document.querySelector('.fb[data-k="all"]'); if(all) all.classList.toggle('on',AF.size===0);
  document.querySelectorAll('.fb').forEach(b=>{ if(b.dataset.k==='g') b.classList.toggle('on',AF.has('g')); });
  applyFilterAndSearch();
}
function mlToggleAcuteSafe(){
  ML_ACUTE_SAFE_ONLY=!ML_ACUTE_SAFE_ONLY;
  if(ML_ACUTE_SAFE_ONLY){ AF.add('a'); }
  document.querySelectorAll('.fb').forEach(b=>{ if(b.dataset.k==='a') b.classList.toggle('on',AF.has('a')); if(b.dataset.k==='all') b.classList.toggle('on',AF.size===0); });
  applyFilterAndSearch();
}
function applyFilterAndSearch(){
  const keys=[...AF];
  const methods=[...AM];
  const q=(document.getElementById('search').value||'').trim().toLowerCase();
  let hits=0;
  document.querySelectorAll('.chip').forEach(c=>{
    const s=c.dataset.s.split(',');
    const passFilter = keys.length===0 || keys.every(k=>s.includes(k));
    const passMethod = methods.length===0 || methods.some(m=>s.includes(m));
    const passSearch = !q || c.dataset.search.includes(q);
    const passAcute = !ML_ACUTE_SAFE_ONLY || ML_ACUTE_SAFE_IDS.includes(c.dataset.id);
    c.classList.toggle('faded', passSearch && !(passFilter && passMethod && passAcute));
    c.classList.toggle('hide', !passSearch || !passAcute);
    if(passSearch && passFilter && passMethod && passAcute) hits++;
  });
  // Wirkdimensions-Zeilen ohne sichtbare Treffer bei aktiver Suche ausblenden
  document.querySelectorAll('.wrow').forEach(row=>{
    const visible=[...row.querySelectorAll('.chip')].some(c=>!c.classList.contains('hide'));
    row.style.display = (q && !visible) ? 'none' : '';
  });
  document.getElementById('noHits').style.display = (hits===0)?'block':'none';
  mlUpdateClinicalModeBox();
  renderModuleList();
}

function fs(k,btn){
  if(k==='all'){
    AF.clear();
    ML_ACUTE_SAFE_ONLY=false;
    document.querySelectorAll('.fb').forEach(b=>b.classList.remove('on'));
    document.querySelector('.fb[data-k="all"]').classList.add('on');
  } else {
    document.querySelector('.fb[data-k="all"]').classList.remove('on');
    if(AF.has(k)){AF.delete(k);btn.classList.remove('on'); if(k==='a') ML_ACUTE_SAFE_ONLY=false;}
    else{AF.add(k);btn.classList.add('on');}
    if(AF.size===0) document.querySelector('.fb[data-k="all"]').classList.add('on');
  }
  applyFilterAndSearch();
}
function fm(k,btn){
  if(k==='all'){
    AM.clear();
    document.querySelectorAll('.fb-m').forEach(b=>b.classList.remove('on'));
    document.querySelector('.fb-m[data-m="all"]').classList.add('on');
  } else {
    document.querySelector('.fb-m[data-m="all"]').classList.remove('on');
    if(AM.has(k)){AM.delete(k);btn.classList.remove('on');}
    else{AM.add(k);btn.classList.add('on');}
    if(AM.size===0) document.querySelector('.fb-m[data-m="all"]').classList.add('on');
  }
  applyFilterAndSearch();
}

/* ---------- Suche ---------- */
const searchEl=document.getElementById('search');
searchEl.addEventListener('input',()=>{
  document.getElementById('searchClear').style.display = searchEl.value ? 'block' : 'none';
  applyFilterAndSearch();
});
function clearSearch(){ searchEl.value=''; document.getElementById('searchClear').style.display='none'; applyFilterAndSearch(); searchEl.focus(); }
