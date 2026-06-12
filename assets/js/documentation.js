function plCleanLine(s){return String(s||'').replace(/\s+/g,' ').trim();}
function plDocReadableText(s){
  let t=plCleanLine(s);
  if(!t) return '';
  // Modulcodes in frei eingegebenen Notizen in lesbare Modultitel übersetzen.
  Object.keys(M).sort((a,b)=>b.length-a.length).forEach(id=>{
    const title=plDocModuleTitle(id);
    t=t.replace(new RegExp('\\b'+id.replace('-', '\\-')+'\\b','g'), title);
  });
  // Wirkdimensionen nicht als Kürzel, sondern als klinische Begriffe ausgeben.
  Object.keys(PL_WDOC).forEach(code=>{
    t=t.replace(new RegExp('\\b'+code+'\\b\\s*[:\\-–]?\\s*','g'), PL_WDOC[code]+' ');
  });
  // übrig gebliebene Methodenkürzel am Satzanfang oder nach Trennzeichen entfernen
  t=t.replace(/\b(KM|RZ|IM|RN|TR|HS|LK)\s*[-–:]?\s*/g,'');
  return plCleanLine(t);
}

/* ---- Fachsprachliche Dokumentation statt interner Codes ----
   Die Planungsansicht darf mit Kürzeln arbeiten (KM-1, W2, RN usw.).
   Für die Übernahme ins klinische Dokumentationssystem werden diese Kürzel
   hier bewusst in verständliche Fachformulierungen übersetzt.
*/
const PL_WDOC={
  W1:'Stabilisierung, Orientierung und Regulation',
  W2:'Aktivierung, Antriebsaufbau und Aufmerksamkeitslenkung',
  W3:'Ausdruck, Entlastung und Affektregulation',
  W4:'Kontakt, Resonanz und Gruppeneinbindung',
  W5:'biografische Arbeit, Sinnbezug und Identitätsstärkung',
  W6:'Integration, Abschluss und alltagsbezogener Transfer'
};
const PL_METHODDOC={
  km:'körper- und stimmbezogene musiktherapeutische Arbeit',
  rz:'rezeptive Klang- und Hörerfahrung',
  im:'improvisatorische Klangarbeit',
  rn:'rhythmisch-körperbezogene Aktivierung und Orientierung',
  tr:'trommelbezogene Rhythmus- und Kontaktarbeit',
  hs:'ressourcen- und lösungsorientierte hypnosystemische Rahmung',
  lk:'kognitiv-motorische Aktivierung im musikalisch-rhythmischen Rahmen'
};
function plDocWirkLabelFromCode(code){ return PL_WDOC[code] || (PL_WLABEL[code]||'').toLowerCase(); }
function plDocWirkLabelFromValue(value){
  const m=String(value||'').match(/^(W[1-6])\b/);
  return m ? plDocWirkLabelFromCode(m[1]) : plCleanLine(value);
}
function plDocModuleTitle(moduleId){
  const meta=M[moduleId]||{};
  return plCleanLine(meta.n||moduleId).replace(/&/g,'und').replace(/\s*★\s*/g,'').replace(/\s*⊕\s*/g,'');
}
function plDocMethod(moduleId){
  const meta=M[moduleId]||{};
  return PL_METHODDOC[meta.m] || (METHODNAME[meta.m]||'musiktherapeutische Arbeit');
}
function plDocOfferLabel(text){
  return plDocReadableText(text)
    .replace(/\*+/g,'')
    .replace(/\(\s*\d+(?:\s*[–-]\s*\d+)?\s*(?:min(?:uten)?|sek(?:unden)?|std(?:unden)?)\.?\s*\)/gi,'')
    .replace(/\b\d+(?:\s*[–-]\s*\d+)?\s*(?:min(?:uten)?|sek(?:unden)?|std(?:unden)?)\.?\b/gi,'')
    .replace(/^(?:Phase|Anleitung|Durchführung|Inhalt)\s*:\s*/i,'')
    .replace(/[.!?;:,]+$/,'')
    .trim();
}
function plDocOfferSummary(b){
  const fixed=typeof CONTENT!=='undefined'&&CONTENT&&CONTENT.module_summaries&&CONTENT.module_summaries[b.moduleId];
  if(fixed) return plDocReadableText(fixed);
  const raw=String(b.phases||'').replace(/\\n/g,'\n').trim();
  if(!raw) return '';
  const labels=[];
  raw.split(/\n\s*\n/).forEach(part=>{
    if(labels.length>=3) return;
    const lines=part.split(/\n/).map(x=>x.trim()).filter(Boolean);
    let label=plDocOfferLabel(lines.find(x=>! /^(?:Anleitung|Durchführung|Inhalt|Ziel)\s*:/i.test(x))||'');
    if(!label) return;
    if(label.length>70) label=label.slice(0,67).replace(/\s+\S*$/,'')+'…';
    if(!labels.includes(label)) labels.push(label);
  });
  const method=plDocMethod(b.moduleId);
  if(!labels.length) return method;
  const focus=labels.length===1 ? labels[0] : `${labels.slice(0,-1).join(', ')} sowie ${labels[labels.length-1]}`;
  return `${method} mit den Schwerpunkten ${focus}`;
}
function plDocActualBlocks(session){ return (session.blocks||[]).filter(b=>b.status==='performed'||b.status==='adapted'); }
function plDocPlannedBlocks(session){ return (session.blocks||[]).filter(b=>!b.status||b.status==='planned'); }
function plDocOmittedBlocks(session){ return (session.blocks||[]).filter(b=>b.status==='omitted'); }

function plDocFirstText(values){
  for(const v of values){ const c=plDocReadableText(v); if(c) return c; }
  return '';
}
function plDocBlockTitles(session){
  return plDocActualBlocks(session).map(b=>plDocModuleTitle(b.moduleId)).filter(Boolean);
}
function plDocBlockMethods(session){
  const methods=[];
  plDocActualBlocks(session).forEach(b=>{ const m=plDocMethod(b.moduleId); if(m&&!methods.includes(m)) methods.push(m); });
  return methods;
}
function plDocMethodsSentence(methods,titles){
  if(!methods.length) return '';
  const methodText=methods.slice(0,2).join(' und ');
  const titleText=(titles&&titles.length)?` (u. a. ${titles.slice(0,2).join(', ')})`:'';
  return methods.length===1
    ? `Zum Einsatz kam ${methodText}${titleText}.`
    : `Zum Einsatz kamen ${methodText}${titleText}.`;
}
function plDocConfirmedGreeting(s){ return s.orientGreetingConfirmed ? plDocReadableText(s.orientGreeting) : ''; }
function plDocPick(arr,seed){ return arr[Math.abs(Number(seed)||0)%arr.length]; }
function plDocSentenceEnd(t){ t=plDocReadableText(t); if(!t) return ''; return /[.!?]$/.test(t)?t:t+'.'; }
function plDocLowerFirst(t){ t=plDocReadableText(t); return t?t.charAt(0).toLowerCase()+t.slice(1):''; }
function plSessionDocTextDetailed(plan,s,idx){
  plEnsureSessionFrame(s);
  const lines=[];

  const greeting=plDocConfirmedGreeting(s);
  if(greeting) lines.push(plDocSentenceEnd(greeting));
  if(s.orientThemes) lines.push(plDocSentenceEnd(s.orientThemes));
  if(s.orientCourse) lines.push(plDocSentenceEnd(s.orientCourse));

  const actualBlocks=plDocActualBlocks(s);
  const omittedBlocks=plDocOmittedBlocks(s);
  if(actualBlocks.length){
    actualBlocks.forEach(b=>{
      const summary=plDocOfferSummary(b);
      const action=b.status==='adapted'?'wurde angepasst durchgeführt und umfasste':'umfasste';
      if(summary) lines.push(`Das musiktherapeutische Angebot „${plDocModuleTitle(b.moduleId)}“ ${action} ${plDocSentenceEnd(plDocLowerFirst(summary))}`);
    });
    const notes=actualBlocks.filter(b=>plCleanLine(b.note)).map(b=>plDocSentenceEnd(b.note));
    if(notes.length) lines.push(notes.join(' '));
  }
  if(omittedBlocks.length){
    omittedBlocks.forEach(b=>{
      lines.push(`Nicht durchgeführt wurde „${plDocModuleTitle(b.moduleId)}“.`);
      if(plCleanLine(b.note)) lines.push(plDocSentenceEnd(b.note));
    });
  }
  if(s.notes) lines.push(plDocSentenceEnd(s.notes));
  if(s.orientDoc) lines.push(plDocSentenceEnd(s.orientDoc));
  if(s.docClosing) lines.push(plDocSentenceEnd(s.docClosing));
  return lines.join('\n');
}
function plSessionDocTextShort(plan,s,idx){
  plEnsureSessionFrame(s);
  const start=plDocFirstText([s.orientThemes]);
  const doc=plDocFirstText([s.orientDoc]);
  const greeting=plDocConfirmedGreeting(s);
  const methods=plDocBlockMethods(s);
  const titles=plDocBlockTitles(s);
  const lines=[];
  if(greeting) lines.push(plDocSentenceEnd(greeting));
  if(start) lines.push(plDocSentenceEnd(start));
  if(s.orientCourse) lines.push(plDocSentenceEnd(s.orientCourse));
  if(methods.length) lines.push(plDocMethodsSentence(methods,titles));
  if(doc) lines.push(plDocSentenceEnd(doc));
  if(s.docClosing) lines.push(plDocSentenceEnd(s.docClosing));
  return lines.join('\n');
}
function plSessionDocTextTeam(plan,s,idx){
  plEnsureSessionFrame(s);
  const start=plDocFirstText([s.orientThemes]);
  const doc=plDocFirstText([s.orientDoc]);
  const greeting=plDocConfirmedGreeting(s);
  const methodList=plDocBlockMethods(s);
  const lines=[];
  if(greeting) lines.push(plDocSentenceEnd(greeting));
  if(start) lines.push(plDocSentenceEnd(start));
  if(s.orientCourse) lines.push(plDocSentenceEnd(s.orientCourse));
  if(methodList.length) lines.push(plDocMethodsSentence(methodList));
  if(doc) lines.push(plDocSentenceEnd(doc));
  if(s.docClosing) lines.push(plDocSentenceEnd(s.docClosing));
  return lines.join('\n');
}
function plSessionDocText(plan,s,idx,style){
  plEnsureSessionFrame(s);
  const st=style || s.docStyle || 'kurz';
  if(st==='ausfuehrlich') return plSessionDocTextDetailed(plan,s,idx);
  if(st==='team') return plSessionDocTextTeam(plan,s,idx);
  return plSessionDocTextShort(plan,s,idx);
}

function plDocStyleOptions(current){
  const opts=[['kurz','Kurz'],['ausfuehrlich','Ausführlich'],['team','Team / Übergabe']];
  return opts.map(o=>`<option value="${o[0]}" ${current===o[0]?'selected':''}>${plEsc(o[1])}</option>`).join('');
}
function plHasObservedDocumentation(s){
  return !!(plCleanLine(s.orientThemes)||plCleanLine(s.orientCourse)||plCleanLine(s.orientDoc)||plCleanLine(s.docClosing)||plDocActualBlocks(s).some(b=>plCleanLine(b.note))||plDocOmittedBlocks(s).some(b=>plCleanLine(b.note)));
}
function plRenderSessionDoc(plan,s,idx){
  plEnsureSessionFrame(s);
  const txt=plSessionDocText(plan,s,idx,s.docStyle||'kurz');
  const warning=plHasObservedDocumentation(s)?'':`<div class="pl-doc-warning"><strong>Noch keine beobachtete Wirkung oder Reaktion eingetragen.</strong> Der Text enthält derzeit nur bestätigte Durchführung und ist noch keine vollständige Dokumentation nach der Stunde.</div>`;
  const pendingCount=plDocPlannedBlocks(s).length;
  const greetingPending=!!(plCleanLine(s.orientGreeting)&&!s.orientGreetingConfirmed);
  const pending=(pendingCount||greetingPending)?`<div class="pl-doc-warning"><strong>Status noch offen:</strong> ${greetingPending?'Der geplante Einstieg ist noch nicht als durchgeführt bestätigt. ':''}${pendingCount?`${pendingCount} ausgewählte Baustein(e) sind weiterhin nur als geplant markiert und werden nicht als durchgeführt dokumentiert.`:''}</div>`:'';
  const title=plHasObservedDocumentation(s)?'Automatische Dokumentation':'Dokumentationsentwurf';
  return `<div class="pl-docout">
    <div class="pl-docout-top">
      <div class="pl-docout-title">${title}</div>
      <button class="pl-btn tiny" onclick="plCopyDoc('${s.id}')">Text kopieren</button>
    </div>
    <div class="pl-docstyle">
      <div class="pl-field"><label>Dokumentationsstil</label><select class="pl-select" onchange="plUpdateSession('${s.id}','docStyle',this.value);plRenderMain()">${plDocStyleOptions(s.docStyle||'kurz')}</select></div>
      <div class="pl-hint" style="margin:0;flex:1">Kurz für Routineeinträge, ausführlich für relevante Prozesse, Team / Übergabe für interprofessionell gut lesbare Notizen.</div>
    </div>
    ${warning}
    ${pending}
    <textarea class="pl-area" rows="7" readonly onclick="this.select()">${plEsc(txt)}</textarea>
  </div>`;
}
function plCopyDoc(sid){
  const s=plFindSession(sid); const plan=plFindSessionPlan(sid); if(!s||!plan) return;
  const idx=plan.sessions.findIndex(x=>x.id===sid);
  const txt=plSessionDocText(plan,s,idx);
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(()=>alert('Kurzdokumentation wurde kopiert.')).catch(()=>alert('Kopieren wurde vom Browser blockiert. Text im Feld markieren und manuell kopieren.'));
  }else{
    alert('Automatisches Kopieren wird hier nicht unterstützt. Text im Feld markieren und manuell kopieren.');
  }
}
