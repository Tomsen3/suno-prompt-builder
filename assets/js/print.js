/* ---- Druck ---- */
function plBlockPrintHtml(plan,b){
  const meta=M[b.moduleId]||{n:b.moduleId};
  const warn=plSettingWarn(b.moduleId,plan.setting);
  const status={planned:'geplant',performed:'durchgeführt',adapted:'angepasst durchgeführt',omitted:'entfallen'}[b.status||'planned'];
  let h=`<div class="pr-block"><h3>${plEsc(b.role?b.role+': ':'')}${plEsc(b.moduleId)} – ${plEsc(meta.n)} · ${Number(b.duration)||0} Min. · ${plEsc(status)}</h3>`;
  if(warn) h+=`<div class="pr-warn">⚠ ${plEsc(warn.text)}</div>`;
  if(b.phases) h+=`<div class="pr-phases">${plEsc(b.phases)}</div>`;
  if(b.note) h+=`<div class="pr-phases" style="border-left-color:#888"><em>Notiz:</em> ${plEsc(b.note)}</div>`;
  h+='</div>';
  return h;
}
function plSessionPrintHtml(plan,s,idx){
  let h=`<h2>${plan.kind==='single'?'Einzelstunde':'Einheit '+(idx+1)}${s.label?': '+plEsc(s.label):''}</h2>`;
  const meta=[];
  meta.push(`Setting: ${PL_SETTING_LABEL[plan.setting]}`);
  if(s.date) meta.push(`Termin: ${plEsc(s.date)}`);
  if(s.group) meta.push(`Gruppe: ${plEsc(s.group)}`);
  if(s.wirkdim) meta.push(`Geplanter anfänglicher Fokus: ${plEsc(s.wirkdim)}`);
  h+=`<div class="pr-meta">${meta.join(' · ')}</div>`;
  plEnsureSessionFrame(s);
  const modeLabel=plFrameModeEffective(s,plan.setting)==='geronto'?'Geronto: direkter musikalischer Beginn':(plFrameModeEffective(s,plan.setting)==='crisis'?'Krise/Akut: kurze Stabilisierung':'reguläre Eingangsrunde');
  const orientRows=[];
  orientRows.push(['Einstiegslogik',modeLabel]);
  if(s.orientGreeting) orientRows.push([s.orientGreetingConfirmed?(plFrameModeEffective(s,plan.setting)==='geronto'?'Durchgeführter musikalischer Beginn / Ritual':'Durchgeführter Einstieg / Ankommen'):(plFrameModeEffective(s,plan.setting)==='geronto'?'Geplanter musikalischer Beginn / Ritual':'Geplanter Einstieg / Ankommen'),s.orientGreeting]);
  if(s.orientThemes) orientRows.push(['Beobachtete Ausgangslage',s.orientThemes]);
  if(s.orientCourse) orientRows.push(['Tatsächlicher Verlauf',s.orientCourse]);
  if(s.orientDecision) orientRows.push(['Geplante therapeutische Ausrichtung',s.orientDecision]);
  if(s.orientDoc) orientRows.push(['Beobachtete Wirkung / Dokumentationskern',s.orientDoc]);
  if(s.docClosing) orientRows.push(['Schlusssatz der Dokumentation',s.docClosing]);
  if(orientRows.length){
    h+='<table><tbody>'+orientRows.map(r=>`<tr><th>${plEsc(r[0])}</th><td>${plEsc(r[1])}</td></tr>`).join('')+'</tbody></table>';
  }
  if(s.notes) h+=`<div class="pr-meta"><em>${plEsc(s.notes)}</em></div>`;
  (s.blocks||[]).forEach(b=>{ h+=plBlockPrintHtml(plan,b); });
  const vc=plVerlaufCheck(s);
  if(vc.seq) h+=`<div class="pr-meta">Planungsfolge nach primärer Modulzuordnung: ${plEsc(vc.seq)}</div>`;
  h+=`<h3>${plHasObservedDocumentation(s)?'Automatische Kurzdokumentation':'Dokumentationsentwurf'}</h3><div class="pr-phases">${plEsc(plSessionDocText(plan,s,idx))}</div>`;
  h+=`<div class="pr-total">Gesamtdauer: ${plSessionTotal(s)} Min.</div>`;
  return h;
}
function plDoPrint(html){
  const area=document.getElementById('printArea');
  area.innerHTML=html;
  document.body.classList.add('pl-printing');
  window.print();
  setTimeout(()=>{ document.body.classList.remove('pl-printing'); area.innerHTML=''; },400);
}
function plPrintSession(sid){
  const s=plFindSession(sid); const plan=plFindSessionPlan(sid); if(!s||!plan) return;
  const idx=plan.sessions.findIndex(x=>x.id===sid);
  let h=`<h1>${plEsc(plan.name)} – ${plan.kind==='single'?'Einzelstunde':'Stundenverlauf'}</h1>`;
  h+=plSessionPrintHtml(plan,s,idx);
  plDoPrint(h);
}
function plPrintPlan(planId){
  const plan=plState.plans.find(x=>x.id===planId); if(!plan) return;
  let h=`<h1>${plEsc(plan.name)} – ${plan.kind==='single'?'Einzelstunde':'Behandlungsverlauf'}</h1>`;
  h+=`<div class="pr-meta">Setting: ${PL_SETTING_LABEL[plan.setting]} · ${plan.sessions.length} ${plan.kind==='single'?'Stunde':'Einheit(en)'}</div>`;
  plan.sessions.forEach((s,i)=>{ h+=plSessionPrintHtml(plan,s,i); });
  plDoPrint(h);
}
function plSessionDocPrintHtml(plan,s,idx){
  const title=s.label?plEsc(s.label):(plan.kind==='single'?'Einzelstunde':'Einheit '+(idx+1));
  return `<h2>${title}</h2><div class="pr-meta">${plEsc(PL_SETTING_LABEL[plan.setting]||'')}${s.date?' · '+plEsc(s.date):''}${s.group?' · '+plEsc(s.group):''}</div><div class="pr-phases">${plEsc(plSessionDocText(plan,s,idx,s.docStyle||'kurz'))}</div>`;
}
function plPrintSessionDoc(sid){
  const s=plFindSession(sid); const plan=plFindSessionPlan(sid); if(!s||!plan) return;
  const idx=plan.sessions.findIndex(x=>x.id===sid);
  plDoPrint(`<h1>${plEsc(plan.name)} – Dokumentation</h1>`+plSessionDocPrintHtml(plan,s,idx));
}
function plPrintPlanDocs(planId){
  const plan=plState.plans.find(x=>x.id===planId); if(!plan) return;
  let h=`<h1>${plEsc(plan.name)} – Dokumentationen</h1><div class="pr-meta">Setting: ${plEsc(PL_SETTING_LABEL[plan.setting]||'')}</div>`;
  plan.sessions.forEach((s,i)=>{ h+=plSessionDocPrintHtml(plan,s,i); });
  plDoPrint(h);
}
function plPrintCurrentModuleList(){
  const ids=Object.keys(M).filter(modulePassesCurrentFilter).sort((a,b)=>a.localeCompare(b,'de',{numeric:true}));
  let h='<h1>Modulliste nach aktuellem Filter</h1>';
  if(AF.size) h+=`<div class="pr-meta">Filter: ${plEsc([...AF].join(', '))}</div>`;
  if(ML_ACUTE_SAFE_ONLY) h+=`<div class="pr-meta">Akut-Modus: nur sichere Kurzformen</div>`;
  h+='<table><thead><tr><th>Modul</th><th>Wirkung</th><th>Setting</th><th>Einsatzlogik</th></tr></thead><tbody>';
  ids.forEach(id=>{ const meta=M[id]; h+=`<tr><td><strong>${plEsc(id)}</strong><br>${plEsc(meta.n)}</td><td>${plEsc(moduleMainWirk(id))}</td><td>${plEsc(settingSuitabilityText(meta))}</td><td>${plEsc(moduleBadgesText(id))}</td></tr>`; });
  h+='</tbody></table>';
  plDoPrint(h);
}
