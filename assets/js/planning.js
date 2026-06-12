/* =====================================================================
   PLANUNG: Stundenverläufe + Behandlungsverläufe
   Datenmodell (für Nachfolge dokumentiert):
   plState = { v:1, activePlanId, plans:[ Plan ] }
     Plan    = { id, name, kind:'plan'|'single', setting:'p'|'s'|'g'|'a', sessions:[ Session ] }
     Session = { id, label, date, group, wirkdim, orientMode, orientGreeting, orientGreetingConfirmed, orientThemes, orientCourse, orientDecision, orientDoc, docClosing, notes, blocks:[ Block ] }
     Block   = { id, moduleId, role, status:'planned'|'performed'|'adapted'|'omitted', duration:Zahl(Min.), phases:Text, note }
   Einzelstunden werden bewusst im selben Datenmodell gespeichert: kind='single' mit genau einer Session.
   Persistenz: localStorage-Schlüssel 'mhb_plaene_v1'.
   ===================================================================== */
const PL_KEY='mhb_plaene_v1';
const PL_SETTING_LABEL={p:'TK Psychosomatik',s:'TK Sucht',g:'Gerontopsychiatrie',a:'Akute Entgiftung'};
const PL_WORDER=['W1','W2','W3','W4','W5','W6'];
const PL_WLABEL={W1:'Stabilisierung',W2:'Aktivierung',W3:'Ausdruck',W4:'Verbindung',W5:'Biografie & Sinn',W6:'Integration & Transfer'};

/* ---- Startansicht: vom klinischen Anlass zur Arbeitsfläche ---- */
const START_STATES={
  unruhig:{w:'W1',label:'unruhig / angespannt / überflutet',decision:'Heute steht Stabilisierung im Vordergrund: erst regulieren, orientieren und körperlich ankern, keine schnelle Aktivierung oder Vertiefung.',mods:['KM-1','RN-1','RZ-4']},
  erschoepft:{w:'W2',label:'erschöpft / apathisch / blockiert',decision:'Heute steht niedrigschwellige Aktivierung im Vordergrund: kleine Bewegungs- oder Rhythmusimpulse ohne Leistungsdruck.',mods:['RN-2','IM-9','LK-1']},
  ausdruck:{w:'W3',label:'affektiv geladen / ausdrucksbedürftig',decision:'Heute steht sicher gerahmter Ausdruck im Vordergrund: Ausdruck ermöglichen, aber Exposition und Reflexionstiefe begrenzen.',mods:['KM-5','TR-4','IM-3']},
  kontakt:{w:'W4',label:'vereinzelt / wenig Kontakt',decision:'Heute steht Verbindung im Vordergrund: Ko-Regulation, Synchronisation und gemeinsames Erleben vor persönlicher Vertiefung.',mods:['KM-6','TR-1','RZ-6']},
  bio:{w:'W5',label:'biografisch berührt / suchend',decision:'Heute steht Biografie und Sinn im Vordergrund: Ressourcen, Erinnerung und Identitätsbezug behutsam ankoppeln.',mods:['KM-4','RZ-3','RZ-7']},
  abschluss:{w:'W6',label:'Abschluss / Verdichtung / Transfer',decision:'Heute steht Integration im Vordergrund: Erlebtes bündeln, Übergang markieren und Transfer sichern.',mods:['KM-8','RZ-8','HS-4']}
};
const START_VERTRETUNG={
  p:['KM-1','KM-9','RN-1','RZ-1','IM-9'],
  s:['KM-1','KM-9','RN-1','RN-2','IM-9'],
  g:['KM-9','RZ-4','KM-4','RN-2','KM-1'],
  a:['KM-1','RZ-4','RN-1','KM-9']
};
function startWirkValue(key){ const d=START_STATES[key]; return d?`${d.w} ${PL_WLABEL[d.w]||''}`:''; }
function startFilteredMods(setting,mods){ return (mods||[]).filter(id=>M[id] && plModuleSelectable(id,setting)); }
function startModPill(id){ const meta=M[id]||{n:id,m:'km'}; return `<span class="start-rec"><strong>${plEsc(id)}</strong> ${plEsc(meta.n)} <button type="button" onclick="openModule('${id}')">Profil</button></span>`; }
function startRenderRecommendations(){
  const sEl=document.getElementById('startSetting'), stEl=document.getElementById('startState');
  if(!sEl||!stEl) return;
  const setting=sEl.value, state=stEl.value;
  const data=START_STATES[state];
  const note=document.getElementById('startStateNote');
  if(!data){
    if(note) note.innerHTML='<strong>Noch offen:</strong> Wähle einen Gruppenzustand, wenn du bereits einen anfänglichen therapeutischen Fokus festlegen möchtest.';
    const recHost=document.getElementById('startRecs');
    if(recHost) recHost.innerHTML='<span class="start-rec">Ohne festgelegten Gruppenzustand werden noch keine wirkdimensionsbezogenen Module empfohlen.</span>';
    const vHost=document.getElementById('startVertretungList');
    if(vHost){
      const vmods=startFilteredMods(setting,START_VERTRETUNG[setting]||[]);
      vHost.innerHTML=vmods.map(id=>{
        const meta=M[id]||{n:id};
        return `<div class="start-mini"><strong>${plEsc(id)} – ${plEsc(meta.n)}</strong>${plEsc(startVertretungReason(id,setting))}</div>`;
      }).join('');
    }
    return;
  }
  if(note) note.innerHTML=`<strong>${plEsc(data.w)} ${plEsc(PL_WLABEL[data.w])}</strong>: ${plEsc(data.decision)}`;
  const recs=startFilteredMods(setting,data.mods);
  const recHost=document.getElementById('startRecs');
  if(recHost) recHost.innerHTML=recs.length?recs.map(startModPill).join(''):'<span class="start-rec">Keine robuste Empfehlung für diese Kombination. Bitte Modullandkarte prüfen.</span>';
  const vHost=document.getElementById('startVertretungList');
  if(vHost){
    const vmods=startFilteredMods(setting,START_VERTRETUNG[setting]||[]);
    vHost.innerHTML=vmods.map(id=>{
      const meta=M[id]||{n:id};
      return `<div class="start-mini"><strong>${plEsc(id)} – ${plEsc(meta.n)}</strong>${plEsc(startVertretungReason(id,setting))}</div>`;
    }).join('') || '<div class="start-mini">Für dieses Setting wurden keine Standardpfade gefunden.</div>';
  }
}
function startVertretungReason(id,setting){
  if(setting==='a') return 'kurz, reizarm, jederzeit abbrechbar; keine Reflexionspflicht.';
  if(setting==='g') return 'ruhiger, ritualisierter oder niedrigschwelliger Einstieg; Tempo und Wiederholung beachten.';
  if(id==='IM-9'||id==='TR-9') return 'sicherer Material- und Technikstart, geeignet für neue oder unsichere Gruppen.';
  if(id==='RN-2'||id==='LK-1') return 'niedrigschwellige Aktivierung ohne hohen Selbstausdruck.';
  return 'robuster stabilisierender Standardpfad für unklare oder kurzfristige Situationen.';
}
function startCreateBlock(moduleId,role){
  const ex=plExtractPhases(moduleId);
  return {id:plUid(),moduleId,role:role||'Hauptteil',status:'planned',duration:ex.duration,phases:ex.text,note:''};
}
function startCreatePreset(mode){
  const sEl=document.getElementById('startSetting'), stEl=document.getElementById('startState'), tEl=document.getElementById('startTitle');
  const setting=sEl?sEl.value:'p';
  const state=stEl?stEl.value:'';
  const data=START_STATES[state]||null;
  const isVert=mode==='vertretung';
  const mods=startFilteredMods(setting,isVert?(START_VERTRETUNG[setting]||[]):((data&&data.mods)||[])).slice(0,isVert?2:1);
  const titleBase=tEl&&tEl.value?tEl.value:(isVert?'Vertretungsstunde':'Ad-hoc-Stunde');
  const session=plEnsureSessionFrame({
    id:plUid(),
    label:isVert?'Vertretung in 30 Minuten':titleBase,
    date:'',group:'',wirkdim:data?startWirkValue(state):'',notes:'',blocks:[],
    orientMode:setting==='g'?'geronto':(setting==='a'?'crisis':'auto'),
    orientGreeting:'',
    orientGreetingConfirmed:false,
    orientThemes:'',
    orientCourse:'',
    orientDecision:'',
    orientDoc:'',
    docClosing:''
  });
  mods.forEach((id,i)=>session.blocks.push(startCreateBlock(id,i===0?'Einstieg':'Hauptteil')));
  const plan={id:plUid(),name:titleBase,kind:'single',setting,sessions:[session]};
  plState.plans.push(plan); plState.activePlanId=plan.id; plSave(); plRender();
  showView('planung',document.getElementById('tab-planung'));
}
let plState={v:1,activePlanId:null,plans:[]};
let plPickerTarget=null;
let plPickerView='wirk';
let plPickerAllDimensions=false;

function plEnsureSessionFrame(s){
  if(!s) return s;
  if(s.orientMode==null) s.orientMode='auto';
  if(s.orientGreeting==null) s.orientGreeting='';
  if(s.orientGreetingConfirmed==null) s.orientGreetingConfirmed=false;
  if(s.orientThemes==null) s.orientThemes='';
  if(s.orientCourse==null) s.orientCourse='';
  if(s.orientDecision==null) s.orientDecision='';
  if(s.orientDoc==null) s.orientDoc='';
  if(s.docClosing==null) s.docClosing='';
  if(s.docStyle==null) s.docStyle='kurz';
  (s.blocks||[]).forEach(b=>{ if(b.status==null) b.status='planned'; });
  return s;
}
function plFrameModeEffective(session,setting){
  const mode=(session&&session.orientMode)||'auto';
  if(mode==='auto') return setting==='g'?'geronto':'regular';
  return mode;
}
function plFrameGuide(session,setting){
  const mode=plFrameModeEffective(session,setting);
  if(mode==='geronto') return 'Geronto-Einstieg: kein langer verbaler Vorlauf. Du beginnst musikalisch, ritualisiert und gut erkennbar. Beobachtung, Kontaktaufnahme und Anpassung laufen über Tempo, Blick, Atmung, Mitbewegung und Resonanz.';
  if(mode==='crisis') return 'Krisen-/Akutlogik: kurze Orientierung, keine ausführliche Themenrunde. Erst Sicherheit, Kontakt und Regulation; danach nur kleine, überschaubare Schritte.';
  return 'Regulärer Einstieg: kurze Begrüßung, aktueller Zustand und Themenlage klären, daraus die therapeutische Richtung der Stunde ableiten. Die Bausteine folgen dieser Entscheidung, nicht umgekehrt.';
}
function plFrameModeOptions(current){
  const opts=[['auto','automatisch nach Setting'],['regular','reguläre Eingangsrunde'],['geronto','Geronto: direkter musikalischer Beginn'],['crisis','Krise/Akut: kurze Stabilisierung']];
  return opts.map(o=>`<option value="${o[0]}" ${current===o[0]?'selected':''}>${plEsc(o[1])}</option>`).join('');
}
function plFrameSuggestions(plan,s){
  const mode=plFrameModeEffective(s,plan.setting);
  const wcode=plSessionWirkCode(s);
  const state=Object.values(START_STATES).find(item=>item.w===wcode);
  const greeting=mode==='geronto'
    ? 'Ritualisierter musikalischer Beginn, ruhiges Tempo, Beobachtung vor Gespräch.'
    : (mode==='crisis'
      ? 'Kurze Orientierung, klares Abbruchrecht und reizarmen Beginn anbieten.'
      : 'Kurze Begrüßung, Kontakt herstellen und die aktuelle Lage offen erfassen.');
  return {orientGreeting:greeting,orientDecision:state?state.decision:''};
}
function plApplyFrameSuggestion(sid,field){
  const s=plFindSession(sid); const plan=plFindSessionPlan(sid);
  if(!s||!plan) return;
  const value=plFrameSuggestions(plan,s)[field]||'';
  if(!value) return;
  if(s[field] && !confirm('Die vorhandene Eingabe wird durch den Vorschlag ersetzt. Fortfahren?')) return;
  s[field]=value;
  if(field==='orientGreeting') s.orientGreetingConfirmed=false;
  plSave(); plRenderMain();
}
function plSuggestionHtml(sid,field,text){
  if(!text) return '';
  return `<div class="pl-suggestion"><span><strong>Vorschlag, nicht dokumentiert:</strong> ${plEsc(text)}</span><button type="button" class="pl-btn tiny" onclick="plApplyFrameSuggestion('${sid}','${field}')">übernehmen</button></div>`;
}
function plTextBlockSelect(sid,field){
  const items=(CONTENT&&CONTENT.field_suggestions&&CONTENT.field_suggestions[field])||[];
  if(!items.length) return '';
  const options=items.map(text=>`<option value="${plEsc(text)}">${plEsc(text)}</option>`).join('');
  return `<select class="pl-select pl-textblock" onchange="plApplyTextBlock('${sid}','${field}',this)"><option value="">Textbaustein auswählen …</option>${options}</select>`;
}
function plApplyTextBlock(sid,field,select){
  const s=plFindSession(sid); const value=select&&select.value;
  if(!s||!value) return;
  const current=String(s[field]||'').trim();
  s[field]=current&&current!==value ? `${current} ${value}` : value;
  if(field==='orientGreeting') s.orientGreetingConfirmed=false;
  select.value='';
  plSave(); plRenderMain();
}

const PL_FAVORITES=['KM-1','KM-9','RN-1','RN-2','KM-4','RZ-3','RZ-4','HS-4'];
const PL_RECOMMENDATIONS={
  W1:{safe:['KM-1','RN-1','RZ-4'],activate:['RN-2','KM-3','LK-1'],connect:['KM-6','RZ-6','RN-8'],finish:['HS-4','KM-8','RZ-8']},
  W2:{safe:['RN-2','LK-1','KM-3'],activate:['LK-2','RN-3','TR-1'],connect:['KM-6','TR-2','LK-7'],finish:['HS-4','KM-8','RZ-8']},
  W3:{safe:['KM-5','IM-3','TR-4'],activate:['TR-3','IM-5','KM-7'],connect:['IM-2','TR-2','KM-6'],finish:['HS-4','KM-8','RZ-8']},
  W4:{safe:['KM-6','TR-1','RZ-6'],activate:['RN-2','TR-2','LK-7'],connect:['IM-2','RN-8','TR-5'],finish:['HS-4','KM-8','RZ-8']},
  W5:{safe:['KM-4','RZ-3','RZ-7'],activate:['KM-7','IM-5','TR-8'],connect:['KM-6','RZ-6','IM-2'],finish:['HS-4','KM-8','RZ-8']},
  W6:{safe:['HS-4','KM-8','RZ-8'],activate:['RN-1','KM-1','RZ-4'],connect:['KM-6','RZ-6','TR-5'],finish:['KM-8','RZ-8','HS-4']}
};
const PL_REC_LABELS={safe:'sicherer Einstieg',activate:'etwas aktivierender',connect:'stärker verbindend',finish:'Abschluss / Transfer'};
function plRenderSettingModeNotice(plan){
  if(!plan) return '';
  if(plan.setting==='g') return `<div class="pl-hint"><strong>Geronto-Startlogik:</strong> In der Gerontopsychiatrie beginnt die Stunde nicht mit einer langen Gesprächsrunde. Vorrang haben musikalisches Ankommen, Ritual, Wiederholung, Beobachtung und schrittweise Kontaktaufnahme. Die Empfehlungen bevorzugen vertraute, wiederholbare und niedrig komplexe Module.</div>`;
  if(plan.setting==='a') return `<div class="pl-hint"><strong>Akut-Modus:</strong> Kurz, reizarm, freiwillig, jederzeit abbrechbar und ohne Reflexionsdruck arbeiten. Im Picker werden für die Akute Entgiftung nur fachlich nutzbare Module angezeigt; bei Unsicherheit bleibt Rücksprache mit Pflege, ärztlichem Dienst oder Behandlungsteam vorrangig.</div>`;
  return '';
}
function plFirstSuitable(ids,setting){ return (ids||[]).find(id=>M[id] && plModuleSelectable(id,setting)); }
function plAddRecommendedBlock(sid,moduleId,role){
  if(!moduleId) return;
  const s=plFindSession(sid); if(!s) return;
  const ex=plExtractPhases(moduleId);
  s.blocks.push({id:plUid(),moduleId,role:role||'Hauptteil',status:'planned',duration:ex.duration,phases:ex.text,note:''});
  plSave(); plRenderMain();
}
function plRenderSessionRecommendations(plan,s){
  const wcode=plRecommendationWirkCode(s);
  if(!wcode) return `<div class="pl-recs"><div class="pl-recs-title">Empfohlene Module</div><div class="pl-hint" style="margin:0">Wähle zuerst eine Wirkdimension. Danach werden hier vier robuste Modulvorschläge für dieses Setting angezeigt.</div></div>`;
  const rec=(plan.setting==='g') ? Object.assign({},PL_RECOMMENDATIONS[wcode]||{}, {safe:['KM-9','KM-4','RZ-4','KM-1'],activate:['RN-2','KM-3','LK-1'],connect:['KM-6','RZ-6','TR-1'],finish:['KM-8','RZ-8','HS-4']}) : (plan.setting==='a' ? Object.assign({},PL_RECOMMENDATIONS[wcode]||{}, {safe:['KM-1','RZ-4','RN-1','KM-9'],activate:['RN-1','KM-1'],connect:['KM-9','RN-1'],finish:['KM-1','RZ-4']}) : (PL_RECOMMENDATIONS[wcode]||{}));
  let items='';
  Object.keys(PL_REC_LABELS).forEach(key=>{
    const id=plFirstSuitable(rec[key],plan.setting);
    if(!id) return;
    const meta=M[id]||{n:id};
    const role=key==='safe'?'Einstieg':(key==='finish'?'Abschluss':'Hauptteil');
    items+=`<div class="pl-recitem"><em>${plEsc(PL_REC_LABELS[key])}</em><strong>${plEsc(plDocModuleTitle(id))}</strong><span>${plEsc(moduleBadgesText(id))}</span><div class="pl-recactions"><button class="pl-btn tiny" onclick="plAddRecommendedBlock('${s.id}','${id}','${role}')">übernehmen</button><button class="pl-btn tiny" onclick="openModule('${id}')">Profil</button></div></div>`;
  });
  if(!items) items='<div class="pl-hint" style="margin:0">Für diese Kombination wurde keine sichere Empfehlung gefunden. Bitte Modullandkarte prüfen.</div>';
  return `<div class="pl-recs"><div class="pl-recs-title">Empfohlene Module für ${plEsc(PL_SETTING_LABEL[plan.setting])} und den geplanten Fokus ${plEsc(wcode+' '+(PL_WLABEL[wcode]||''))}</div><div class="pl-recgrid">${items}</div></div>`;
}
function plRenderFavorites(){
  const host=document.getElementById('plFavList'); if(!host) return;
  host.innerHTML=PL_FAVORITES.filter(id=>M[id]).map(id=>{
    const meta=M[id];
    return `<button class="pl-favbtn" onclick="plFavoriteAction('${id}')"><strong>${plEsc(plDocModuleTitle(id))}</strong><span>Profil öffnen · bei aktiver Stunde direkt nutzbar</span></button>`;
  }).join('');
}
function plFavoriteAction(id){
  const plan=plActivePlan();
  if(plan && (plan.sessions||[]).length){
    const s=plan.sessions[plan.sessions.length-1];
    if(confirm('Modul in die aktuell ausgewählte Stunde übernehmen?\n\nAbbrechen öffnet nur das Profil.')){
      plAddRecommendedBlock(s.id,id,(s.blocks&&s.blocks.length)?'Hauptteil':'Einstieg');
      return;
    }
  }
  openModule(id);
}

function plRenderFrame(plan,s){
  plEnsureSessionFrame(s);
  const guide=plFrameGuide(s,plan.setting);
  const eff=plFrameModeEffective(s,plan.setting);
  const geronto=eff==='geronto';
  const suggestions=plFrameSuggestions(plan,s);
  return `<div class="pl-frame">
    <div class="pl-frame-top">
      <div class="pl-frame-title">Stundenrahmen / klinische Orientierung</div>
      <div class="pl-field" style="min-width:230px"><label>Einstiegslogik</label><select class="pl-select" onchange="plUpdateSession('${s.id}','orientMode',this.value);plRenderMain()">${plFrameModeOptions(s.orientMode||'auto')}</select></div>
    </div>
    <div class="pl-frame-guide"><strong>Orientierungshinweis:</strong> ${plEsc(guide)} Dieser Hinweis wird nicht automatisch in die Dokumentation übernommen.</div>
    <div class="pl-frame-section">Planung vor der Stunde</div>
    <div class="pl-frame-grid">
      <div class="pl-field"><label>${geronto?'Geplanter musikalischer Beginn / Ritual':'Geplanter Einstieg / Ankommen'}</label>${plTextBlockSelect(s.id,'orientGreeting')}${plSuggestionHtml(s.id,'orientGreeting',suggestions.orientGreeting)}<textarea class="pl-area" rows="2" placeholder="${geronto?'z. B. vertrauter Anfangston, Begrüßungslied, Klangritual, Tempo ruhig setzen':'z. B. kurze Begrüßung, Kontakt herstellen, Gruppe sammeln'}" onchange="plUpdateSession('${s.id}','orientGreeting',this.value)">${plEsc(s.orientGreeting)}</textarea><label class="pl-confirm"><input type="checkbox" ${s.orientGreetingConfirmed?'checked':''} ${s.orientGreeting?'':'disabled'} onchange="plUpdateSession('${s.id}','orientGreetingConfirmed',this.checked);plRenderMain()"> Einstieg wurde wie beschrieben durchgeführt und darf dokumentiert werden</label></div>
      <div class="pl-field"><label>Geplante therapeutische Ausrichtung</label>${plSuggestionHtml(s.id,'orientDecision',suggestions.orientDecision)}<textarea class="pl-area" rows="2" placeholder="z. B. zunächst stabilisieren, dann vorsichtig aktivieren; Ausdruck vermeiden; biografisch anschließen" onchange="plUpdateSession('${s.id}','orientDecision',this.value)">${plEsc(s.orientDecision)}</textarea></div>
    </div>
    <div class="pl-frame-section after">Nach beziehungsweise während der Stunde tatsächlich eintragen</div>
    <div class="pl-frame-grid">
      <div class="pl-field full"><label>Beobachtete Ausgangslage</label>${plTextBlockSelect(s.id,'orientThemes')}<textarea class="pl-area" rows="2" placeholder="${geronto?'z. B. Wachheit, Blickkontakt, Unruhe oder Rückzug zu Beginn':'z. B. tatsächliche Stimmung, Themenlage und Beteiligung zu Beginn'}" onchange="plUpdateSession('${s.id}','orientThemes',this.value)">${plEsc(s.orientThemes)}</textarea></div>
      <div class="pl-field full"><label>Tatsächlicher Verlauf</label>${plTextBlockSelect(s.id,'orientCourse')}<textarea class="pl-area" rows="2" placeholder="z. B. Veränderungen von Beteiligung, Kontakt, Belastbarkeit oder Regulation im Verlauf" onchange="plUpdateSession('${s.id}','orientCourse',this.value)">${plEsc(s.orientCourse)}</textarea></div>
      <div class="pl-field full"><label>Beobachtete Wirkung / Dokumentationskern nach der Stunde</label>${plTextBlockSelect(s.id,'orientDoc')}<textarea class="pl-area" rows="2" placeholder="Nur tatsächlich Beobachtetes eintragen: Wirkung, Anpassungen, Reaktionen und nächster Schritt" onchange="plUpdateSession('${s.id}','orientDoc',this.value)">${plEsc(s.orientDoc)}</textarea></div>
      <div class="pl-field full"><label>Schlusssatz der Dokumentation</label>${plTextBlockSelect(s.id,'docClosing')}<textarea class="pl-area" rows="2" placeholder="z. B. weiterer therapeutischer Fokus oder Empfehlung für die nächste Einheit" onchange="plUpdateSession('${s.id}','docClosing',this.value)">${plEsc(s.docClosing)}</textarea></div>
    </div>
  </div>`;
}

function plActivePlan(){ return plState.plans.find(p=>p.id===plState.activePlanId)||null; }

/* ---- Phasen + Referenzdauer aus dem Modulprofil extrahieren ---- */
function plExtractPhases(moduleId){
  const mod=CONTENT.modules[moduleId];
  if(!mod){return {text:'',duration:25};}
  const tmp=document.createElement('div'); tmp.innerHTML=mod.html;
  let phaseTable=null;
  tmp.querySelectorAll('table').forEach(t=>{
    if(phaseTable) return;
    const th=t.querySelector('thead th');
    if(th && th.textContent.trim().toLowerCase()==='phase') phaseTable=t;
  });
  const lines=[]; let sumMid=0;
  if(phaseTable){
    phaseTable.querySelectorAll('tbody tr').forEach(tr=>{
      const tds=tr.querySelectorAll('td');
      if(tds.length<2) return;
      const name=tds[0].textContent.replace(/\*+/g,'').replace(/\s+/g,' ').trim();
      const time=tds[1].textContent.replace(/\s+/g,' ').trim();
      const instruction=tds[2]?tds[2].textContent.replace(/\s+/g,' ').trim():'';
      const aim=tds[3]?tds[3].textContent.replace(/\s+/g,' ').trim():'';
      if(!name) return;
      let block=`${name}${time?' ('+time+')':''}`;
      if(instruction) block+=`\nAnleitung: ${instruction}`;
      if(aim) block+=`\nZiel: ${aim}`;
      lines.push(block);
      const nums=(time.match(/\d+/g)||[]).map(Number);
      if(nums.length===1) sumMid+=nums[0];
      else if(nums.length>=2) sumMid+=Math.round((nums[0]+nums[1])/2);
    });
  }
  // Referenzdauer bevorzugt aus "Referenzversion: X–Y min"
  let duration=0;
  const ref=mod.html.match(/Referenzversion[^<]*?(\d+)\s*[\u2013-]\s*(\d+)/);
  if(ref){ duration=Math.round((Number(ref[1])+Number(ref[2]))/2); }
  else if(sumMid>0){ duration=sumMid; }
  else { duration=25; }
  return {text:lines.join('\n\n'),duration};
}

/* ---- Primäre Wirkdimension eines Moduls (erste Nennung in D, W1..W6) ---- */
function plPhaseOf(moduleId){
  for(const dim of D){ if(dim.mods.includes(moduleId)) return dim.code; }
  return null;
}

/* ---- Wirkdimension-Filter für den Baustein-Picker ----
   Leeres Feld = keine Einschränkung nach Wirkdimension.
   Sobald in der Stunde eine Wirkdimension gewählt ist, zeigt der Picker nur
   Module, die in dieser Wirkdimension gelistet sind. Dadurch wirken Setting
   und Wirkdimension gemeinsam als Filter: zuerst fachliche Settingeignung,
   dann inhaltliche Passung zur Stundenwirkung.
*/
function plSessionWirkCode(session){
  const v=(session&&session.wirkdim?String(session.wirkdim):'').trim();
  const m=v.match(/^(W[1-6])\b/);
  return m?m[1]:'';
}
function plSessionWirkCodes(session){
  const codes=[];
  const selected=plSessionWirkCode(session);
  if(selected) codes.push(selected);
  (session&&session.blocks||[]).forEach(block=>{
    plModuleWirkCodes(block.moduleId).forEach(code=>{ if(!codes.includes(code)) codes.push(code); });
  });
  return codes;
}
function plModuleDerivedWirkCodes(session){
  const codes=[];
  (session&&session.blocks||[]).forEach(block=>{
    plModuleWirkCodes(block.moduleId).forEach(code=>{ if(!codes.includes(code)) codes.push(code); });
  });
  return codes;
}
function plRecommendationWirkCode(session){
  return plSessionWirkCode(session);
}
function plSessionWirkFlowHtml(session){
  const selected=plSessionWirkCode(session);
  const derived=plModuleDerivedWirkCodes(session);
  let h='';
  if(selected){
    h+=`<div class="pl-wirkflow"><span>Ausdrücklich gewählter Anfangsfokus</span><em>${plEsc(selected+' '+(PL_WLABEL[selected]||selected))}</em></div>`;
  }else{
    h+='<div class="pl-wirkflow open"><span>Anfängliche Wirkdimension</span><em>noch nicht festgelegt</em></div>';
  }
  if(derived.length){
    h+=`<div class="pl-wirkflow derived"><span>Wirkdimensionen der ausgewählten Bausteine</span>${derived.map(code=>{
      const label=PL_WLABEL[code]||code;
      return `<em>${plEsc(code+' '+label)}</em>`;
    }).join('')}</div>`;
  }
  return h;
}
function plModuleMatchesWirkdim(moduleId,wcode){
  if(!wcode) return true;
  const dim=D.find(x=>x.code===wcode);
  return !!(dim && Array.isArray(dim.mods) && dim.mods.includes(moduleId));
}
function plModuleWirkCodes(moduleId){
  return D.filter(dim=>Array.isArray(dim.mods)&&dim.mods.includes(moduleId)).map(dim=>dim.code);
}
function plWirkBadgeHtml(moduleId){
  const codes=plModuleWirkCodes(moduleId);
  return `<span class="pl-wbadges">${codes.map(code=>{
    const dim=D.find(x=>x.code===code);
    const color=dim?dim.fg:'#6b6760';
    return `<span class="pl-wbadge" style="color:${color};background:rgba(255,255,255,.55)">${code}</span>`;
  }).join('')}</span>`;
}
function plSetPickerView(view){
  plPickerView = view==='method' ? 'method' : 'wirk';
  const bw=document.getElementById('plViewWirk');
  const bm=document.getElementById('plViewMethod');
  if(bw) bw.classList.toggle('on',plPickerView==='wirk');
  if(bm) bm.classList.toggle('on',plPickerView==='method');
  plRenderPicker();
}
function plClearPickerWirkdim(){
  const session=plPickerTarget?plFindSession(plPickerTarget):null;
  if(session){ session.wirkdim=''; plSave(); plRenderMain(); }
  plRenderPicker();
}

/* ---- Setting-Warnung (gleiche Datenbasis wie die Landkarte) ---- */
function plSettingWarn(moduleId,setting){
  const meta=M[moduleId]; if(!meta) return null;
  const v=meta[setting];
  const lbl=PL_SETTING_LABEL[setting];
  if(v===1||v===undefined) return null;
  if(v===0.4) return {level:'amber',text:`Anpassung nötig im Setting ${lbl} – Settinghinweise im Modulprofil beachten.`};
  if(v===-1) return {level:'red',text:`Nur als Ausnahme im Setting ${lbl} vorgesehen – Modulprofil prüfen.`};
  if(v===0) return {level:'red',text:`Im Setting ${lbl} nicht vorgesehen.`};
  return null;
}

function plSessionTotal(session){
  return (session.blocks||[]).reduce((s,b)=>s+(Number(b.duration)||0),0);
}

/* ---- Dezenter Verlaufs-Check entlang der Kurzformel ---- */
function plVerlaufCheck(session){
  const seq=(session.blocks||[]).map(b=>plPhaseOf(b.moduleId)).filter(Boolean);
  if(seq.length===0) return {seq:'',hints:[]};
  const ranks=seq.map(w=>PL_WORDER.indexOf(w)+1);
  const hints=[];
  // 1) Beginnt die Einheit mit Ausdruck/Verbindung (W3/W4) ohne vorherige Regulation/Aktivierung?
  if(ranks[0]>=3){
    const hasEarly=ranks.some(r=>r<=2);
    if(!hasEarly || ranks.indexOf(Math.min(...ranks))>0){
      hints.push('Die Einheit beginnt mit einem aktivierenden/ausdrucksstarken Baustein. Die Kurzformel legt nahe: erst regulieren (W1), dann aktivieren/ausdrücken.');
    }
  }
  // 2) Kein Integrations-/Abschlussbaustein (W6) am Ende, obwohl mehrere Bausteine?
  if(seq.length>1 && ranks[ranks.length-1]<6){
    hints.push('Ein Abschluss-/Integrationsbaustein (W6) am Ende rundet die Einheit ab – optional.');
  }
  return {seq:seq.join(' → '),hints};
}

/* ---- Rendern ---- */
function plRender(){ plRenderPlanList(); plRenderSingleList(); plRenderFavorites(); plRenderMain(); }

function plPlanListItem(p){
  const count=(p.sessions||[]).length;
  const meta=p.kind==='single' ? `${PL_SETTING_LABEL[p.setting]||''} · Einzelstunde` : `${PL_SETTING_LABEL[p.setting]||''} · ${count} Std.`;
  return `<li><button class="pl-planbtn ${p.id===plState.activePlanId?'on':''}" onclick="plSelectPlan('${p.id}')">${plEsc(p.name)||'(ohne Titel)'}<span class="pl-planmeta">${plEsc(meta)}</span></button></li>`;
}
function plRenderPlanList(){
  const ul=document.getElementById('plPlanList');
  const plans=plState.plans.filter(p=>(p.kind||'plan')==='plan');
  if(plans.length===0){ ul.innerHTML='<li style="font-size:12px;color:var(--color-text-secondary);padding:4px 2px">Noch kein Verlauf angelegt.</li>'; return; }
  ul.innerHTML=plans.map(plPlanListItem).join('');
}
function plRenderSingleList(){
  const ul=document.getElementById('plSingleList'); if(!ul) return;
  const singles=plState.plans.filter(p=>p.kind==='single');
  if(singles.length===0){ ul.innerHTML='<li style="font-size:12px;color:var(--color-text-secondary);padding:4px 2px">Noch keine Einzelstunde angelegt.</li>'; return; }
  ul.innerHTML=singles.map(plPlanListItem).join('');
}

function plRenderMain(){
  const host=document.getElementById('plMain');
  const plan=plActivePlan();
  if(!plan){
    host.innerHTML='<div class="pl-empty">Wähle links einen Behandlungsverlauf oder eine Einzelstunde. Mit <strong>„+ Neuer Verlauf“</strong> planst du mehrere Einheiten; mit <strong>„+ Einzelstunde“</strong> legst du eine ad-hoc-Stunde ohne Verlaufsrahmen an.</div>';
    return;
  }
  const settingSel=['p','s','g','a'].map(k=>`<option value="${k}" ${plan.setting===k?'selected':''}>${PL_SETTING_LABEL[k]}</option>`).join('');
  const isSingle=plan.kind==='single';
  let h=`
  <div class="pl-planhead">
    <input class="pl-planname" value="${plEsc(plan.name)}" placeholder="${isSingle?'Titel der Einzelstunde':'Name des Behandlungsverlaufs'}" onchange="plRenamePlan('${plan.id}',this.value)">
    <div class="pl-field">
      <label>${isSingle?'Setting der Einzelstunde':'Setting (gilt für alle Stunden)'}</label>
      <select class="pl-select" onchange="plSetSetting('${plan.id}',this.value)">${settingSel}</select>
    </div>
    <button class="pl-btn tiny" onclick="plPrintPlan('${plan.id}')">${isSingle?'Einzelstunde drucken':'Verlauf drucken'}</button>
    <button class="pl-btn tiny" onclick="plPrintPlanDocs('${plan.id}')">nur Dokumentation</button>
    <button class="pl-btn tiny danger" onclick="plDeletePlan('${plan.id}')">${isSingle?'Einzelstunde löschen':'Verlauf löschen'}</button>
  </div>`;
  h+=plRenderSettingModeNotice(plan);

  if((plan.sessions||[]).length===0){
    h+=isSingle
      ? '<div class="pl-empty">Diese Einzelstunde ist noch leer. Füge unten Bausteine hinzu.</div>'
      : '<div class="pl-empty">Noch keine Stunde geplant. Lege mit <strong>„+ Neue Stunde“</strong> die erste Einheit an.</div>';
  }
  (plan.sessions||[]).forEach((s,idx)=>{
    h+=plRenderSession(plan,s,idx);
  });
  if(!isSingle){ h+=`<div style="margin-top:10px"><button class="pl-btn primary" onclick="plAddSession('${plan.id}')">+ Neue Stunde</button></div>`; }
  host.innerHTML=h;
}

function plRenderSession(plan,s,idx){
  const wsel=['',...PL_WORDER].map(w=>{
    const lab=w?`${w} ${PL_WLABEL[w]}`:'— nicht festgelegt —';
    return `<option value="${plEsc(lab)}" ${s.wirkdim===lab?'selected':''}>${plEsc(lab)}</option>`;
  }).join('');
  const isSingle=plan.kind==='single';
  let h=`<div class="pl-session">
    <div class="pl-session-head">
      <span class="pl-session-num">${isSingle?'Einzelstunde':'Einheit '+(idx+1)}</span>
      <input class="pl-input" style="flex:1;min-width:160px" value="${plEsc(s.label)}" placeholder="Titel der Stunde (optional)" onchange="plUpdateSession('${s.id}','label',this.value)">
      ${isSingle?'':`<button class="pl-mvbtn" title="nach oben" onclick="plMoveSession('${s.id}',-1)" ${idx===0?'disabled':''}>↑</button>
      <button class="pl-mvbtn" title="nach unten" onclick="plMoveSession('${s.id}',1)" ${idx===plan.sessions.length-1?'disabled':''}>↓</button>`}
      <button class="pl-btn tiny" onclick="plPrintSession('${s.id}')">Drucken</button>
      <button class="pl-btn tiny" onclick="plPrintSessionDoc('${s.id}')">Doku</button>
      ${isSingle?'':`<button class="pl-btn tiny danger" onclick="plDeleteSession('${s.id}')">Löschen</button>`}
    </div>
    <div class="pl-session-fields">
      <div class="pl-field"><label>Datum / Termin</label><input class="pl-input" value="${plEsc(s.date)}" placeholder="z. B. 14.06. oder Woche 1" onchange="plUpdateSession('${s.id}','date',this.value)"></div>
      <div class="pl-field"><label>Gruppe</label><input class="pl-input" value="${plEsc(s.group)}" placeholder="z. B. Gruppe A" onchange="plUpdateSession('${s.id}','group',this.value)"></div>
      <div class="pl-field"><label>Geplanter anfänglicher Fokus</label><select class="pl-select" onchange="plUpdateSession('${s.id}','wirkdim',this.value);plRenderMain()">${wsel}</select></div>
    </div>
    ${plSessionWirkFlowHtml(s)}
    <div class="pl-session-body">
      ${plRenderSessionRecommendations(plan,s)}
      ${plRenderFrame(plan,s)}
      <div class="pl-field"><label>Weitere Notizen zur Stunde</label>${plTextBlockSelect(s.id,'notes')}<textarea class="pl-area" rows="2" placeholder="Material, organisatorische Hinweise, Besonderheiten …" onchange="plUpdateSession('${s.id}','notes',this.value)">${plEsc(s.notes)}</textarea></div>`;

  (s.blocks||[]).forEach((b,bi)=>{ h+=plRenderBlock(plan,s,b,bi); });

  h+=`<div class="pl-addrow"><button class="pl-btn" onclick="plOpenPicker('${s.id}')">+ Baustein hinzufügen</button></div>`;

  const vc=plVerlaufCheck(s);
  if(vc.seq){
    h+=`<div class="pl-seq">Planungsfolge nach primärer Modulzuordnung: <b>${plEsc(vc.seq)}</b>`;
    vc.hints.forEach(hint=>{ h+=`<br>↳ ${plEsc(hint)}`; });
    h+=`</div>`;
  }
  h+=`<div class="pl-total">Gesamtdauer: <span id="tot-${s.id}">${plSessionTotal(s)}</span> Min.</div>`;
  h+=plRenderSessionDoc(plan,s,idx);
  h+=`</div></div>`;
  return h;
}

function plRenderBlock(plan,s,b,bi){
  if(b.status==null) b.status='planned';
  const meta=M[b.moduleId]||{m:'km',n:b.moduleId};
  const mc=MC[meta.m]||{bg:'#eee',fg:'#333'};
  const roleSel=['','Einstieg','Hauptteil','Abschluss'].map(r=>`<option value="${r}" ${b.role===r?'selected':''}>${r||'— Rolle —'}</option>`).join('');
  const statusSel=[['planned','geplant'],['performed','durchgeführt'],['adapted','angepasst durchgeführt'],['omitted','entfallen']].map(x=>`<option value="${x[0]}" ${b.status===x[0]?'selected':''}>${x[1]}</option>`).join('');
  const warn=plSettingWarn(b.moduleId,plan.setting);
  let h=`<div class="pl-block">
    <div class="pl-block-bar">
      <span class="pl-block-tag" style="background:${mc.bg};color:${mc.fg}">${plEsc(b.moduleId)}</span>
      <span class="pl-block-name">${plEsc(meta.n)}</span>
      <button class="pl-btn tiny" onclick="openModule('${b.moduleId}')" title="Modulprofil öffnen">Profil</button>
      <span class="pl-block-spacer"></span>
      <select class="pl-select pl-role" onchange="plUpdateBlock('${s.id}','${b.id}','role',this.value)">${roleSel}</select>
      <select class="pl-select pl-status" title="Status für die automatische Dokumentation" onchange="plUpdateBlock('${s.id}','${b.id}','status',this.value);plRenderMain()">${statusSel}</select>
      <button class="pl-mvbtn" title="nach oben" onclick="plMoveBlock('${s.id}','${b.id}',-1)" ${bi===0?'disabled':''}>↑</button>
      <button class="pl-mvbtn" title="nach unten" onclick="plMoveBlock('${s.id}','${b.id}',1)" ${bi===s.blocks.length-1?'disabled':''}>↓</button>
      <button class="pl-mvbtn" title="Baustein entfernen" onclick="plDeleteBlock('${s.id}','${b.id}')">×</button>
    </div>`;
  if(warn){ h+=`<div class="pl-warn ${warn.level==='red'?'pl-warn-red':'pl-warn-amber'}">⚠ ${plEsc(warn.text)}</div>`; }
  h+=`<div class="pl-block-body">
      <div class="pl-field"><label>Dauer (Min.)</label><input type="number" min="0" step="1" class="pl-input pl-dur" value="${Number(b.duration)||0}" oninput="plUpdateBlock('${s.id}','${b.id}','duration',this.value);plRecalcTotal('${s.id}')"></div>
      <div class="pl-field grow"><label>Durchführungsphasen mit Anleitung (aus dem Profil übernommen, frei editierbar)</label><textarea class="pl-area" rows="7" onchange="plUpdateBlock('${s.id}','${b.id}','phases',this.value)">${plEsc(b.phases)}</textarea><button type="button" class="pl-btn tiny pl-phase-refresh" onclick="plRefreshBlockPhases('${s.id}','${b.id}')">aus Modulprofil neu übernehmen</button></div>
      <div class="pl-field grow"><label>Beobachtung / Anpassung zum Baustein</label><textarea class="pl-area" rows="7" placeholder="Nur tatsächliche Durchführung, Anpassung, Beobachtung oder Reaktion eintragen …" onchange="plUpdateBlock('${s.id}','${b.id}','note',this.value)">${plEsc(b.note)}</textarea></div>
    </div></div>`;
  return h;
}

function plRecalcTotal(sid){
  const s=plFindSession(sid); if(!s) return;
  const el=document.getElementById('tot-'+sid); if(el) el.textContent=plSessionTotal(s);
}

/* ---- CRUD: Pläne ---- */
function plAddPlan(){
  const p={id:plUid(),name:'Neuer Verlauf',kind:'plan',setting:'p',sessions:[]};
  plState.plans.push(p); plState.activePlanId=p.id; plSave(); plRender();
}
function plAddSingle(){
  const s=plEnsureSessionFrame({id:plUid(),label:'',date:'',group:'',wirkdim:'',notes:'',blocks:[]});
  const p={id:plUid(),name:'Neue Einzelstunde',kind:'single',setting:'p',sessions:[s]};
  plState.plans.push(p); plState.activePlanId=p.id; plSave(); plRender();
}
function plSelectPlan(id){ plState.activePlanId=id; plSave(); plRender(); }
function plRenamePlan(id,name){ const p=plState.plans.find(x=>x.id===id); if(p){p.name=name;plSave();plRenderPlanList();plRenderSingleList();} }
function plSetSetting(id,setting){ const p=plState.plans.find(x=>x.id===id); if(p){p.setting=setting;plSave();plRender();} }
function plDeletePlan(id){
  const p=plState.plans.find(x=>x.id===id); if(!p) return;
  const kind=p.kind==='single'?'Einzelstunde':'Behandlungsverlauf';
  const detail=p.kind==='single'?'':` mit ${p.sessions.length} Stunde(n)`;
  if(!confirm(`${kind} „${p.name||'(ohne Titel)'}“${detail} endgültig löschen?`)) return;
  plState.plans=plState.plans.filter(x=>x.id!==id);
  if(plState.activePlanId===id) plState.activePlanId=plState.plans.length?plState.plans[0].id:null;
  plSave(); plRender();
}

/* ---- CRUD: Stunden ---- */
function plFindSession(sid){ for(const p of plState.plans){ const s=(p.sessions||[]).find(x=>x.id===sid); if(s) return s; } return null; }
function plFindSessionPlan(sid){ for(const p of plState.plans){ if((p.sessions||[]).some(x=>x.id===sid)) return p; } return null; }
function plAddSession(planId){
  const p=plState.plans.find(x=>x.id===planId); if(!p) return;
  p.sessions.push(plEnsureSessionFrame({id:plUid(),label:'',date:'',group:'',wirkdim:'',notes:'',blocks:[]}));
  plSave(); plRenderMain();
}
function plUpdateSession(sid,field,val){
  const s=plFindSession(sid); if(!s) return;
  s[field]=val;
  if(field==='orientGreeting') s.orientGreetingConfirmed=false;
  plSave();
}
function plDeleteSession(sid){
  const p=plFindSessionPlan(sid); if(!p) return;
  if(!confirm('Diese Stunde löschen?')) return;
  p.sessions=p.sessions.filter(x=>x.id!==sid); plSave(); plRenderMain();
}
function plMoveSession(sid,dir){
  const p=plFindSessionPlan(sid); if(!p) return;
  const i=p.sessions.findIndex(x=>x.id===sid); const j=i+dir;
  if(j<0||j>=p.sessions.length) return;
  [p.sessions[i],p.sessions[j]]=[p.sessions[j],p.sessions[i]]; plSave(); plRenderMain();
}

/* ---- CRUD: Bausteine ---- */
function plUpdateBlock(sid,bid,field,val){
  const s=plFindSession(sid); if(!s) return;
  const b=s.blocks.find(x=>x.id===bid); if(!b) return;
  b[field]= field==='duration' ? (Number(val)||0) : val;
  plSave();
}
function plDeleteBlock(sid,bid){
  const s=plFindSession(sid); if(!s) return;
  s.blocks=s.blocks.filter(x=>x.id!==bid); plSave(); plRenderMain();
}
function plMoveBlock(sid,bid,dir){
  const s=plFindSession(sid); if(!s) return;
  const i=s.blocks.findIndex(x=>x.id===bid); const j=i+dir;
  if(j<0||j>=s.blocks.length) return;
  [s.blocks[i],s.blocks[j]]=[s.blocks[j],s.blocks[i]]; plSave(); plRenderMain();
}

function plRefreshBlockPhases(sid,bid){
  const s=plFindSession(sid); if(!s) return;
  const b=(s.blocks||[]).find(x=>x.id===bid); if(!b) return;
  if(b.phases && !confirm('Die aktuell eingetragenen Phasen werden durch die ausführlichen Angaben aus dem Modulprofil ersetzt. Fortfahren?')) return;
  const ex=plExtractPhases(b.moduleId);
  b.phases=ex.text;
  if(!b.duration) b.duration=ex.duration;
  plSave(); plRenderMain();
}
function plAddBlock(sid,moduleId){
  const s=plFindSession(sid); if(!s) return;
  const ex=plExtractPhases(moduleId);
  const role = s.blocks.length===0 ? 'Einstieg' : 'Hauptteil';
  s.blocks.push({id:plUid(),moduleId,role,status:'planned',duration:ex.duration,phases:ex.text,note:''});
  plSave(); plRenderMain();
}

/* ---- Modulpicker ---- */
function plOpenPicker(sid){
  plPickerTarget=sid;
  plPickerAllDimensions=false;
  document.getElementById('plPickerSearch').value='';
  plRenderPicker();
  document.getElementById('plPicker').classList.add('on');
  document.getElementById('plPickerOverlay').classList.add('on');
  document.body.style.overflow='hidden';
}
function plClosePicker(){
  plPickerTarget=null;
  document.getElementById('plPicker').classList.remove('on');
  document.getElementById('plPickerOverlay').classList.remove('on');
  document.body.style.overflow='';
}
function plModuleSelectable(moduleId,setting){
  const d=M[moduleId]; if(!d) return false;
  const v=d[setting];
  // Akute Entgiftung wird bewusst enger geführt: nur kurze, reizarme und jederzeit abbrechbare Standardformen.
  if(setting==='a') return ML_ACUTE_SAFE_IDS.includes(moduleId) && (v===1 || v===0.4 || v===undefined);
  // Im Picker erscheinen nur fachlich nutzbare Module: geeignet oder mit Anpassung.
  // Nicht vorgesehene Module (0) und reine Ausnahmen (-1) werden bewusst ausgeblendet.
  return v===1 || v===0.4 || v===undefined;
}
function plRenderPicker(){
  const search=document.getElementById('plPickerSearch');
  const q=(search?search.value:'').trim().toLowerCase();
  const plan=plActivePlan();
  const session=plPickerTarget?plFindSession(plPickerTarget):null;
  const setting=plan?plan.setting:'p';
  const wcode=plRecommendationWirkCode(session);
  const filterWcode=plPickerAllDimensions?'':wcode;
  const wtext=wcode?`${wcode} ${PL_WLABEL[wcode]||''}`:'alle Wirkdimensionen';
  const body=document.getElementById('plPickerBody');
  const bw=document.getElementById('plViewWirk');
  const bm=document.getElementById('plViewMethod');
  if(bw) bw.classList.toggle('on',plPickerView==='wirk');
  if(bm) bm.classList.toggle('on',plPickerView==='method');

  const baseIds=Object.keys(M)
    .filter(id=>plModuleSelectable(id,setting))
    .filter(id=>plModuleMatchesWirkdim(id,filterWcode))
    .filter(id=>{
      if(!q) return true;
      return (id+' '+M[id].n+' '+plModuleWirkCodes(id).join(' ')).toLowerCase().includes(q);
    });

  let h=`<div class="pl-hint">Auswahl für <strong>${plEsc(PL_SETTING_LABEL[setting])}</strong> und <strong>${plEsc(wtext)}</strong>: ${plPickerAllDimensions?'Alle fachlich passenden Wirkdimensionen sind geöffnet.':(wcode?'Zunächst werden Module für den geplanten anfänglichen Fokus gezeigt.':'Es ist noch kein anfänglicher Fokus festgelegt.')} Nicht vorgesehene Module und reine Ausnahme-Module sind ausgeblendet.</div>`;
  if(wcode){
    h+=`<div class="pl-filter-pill">Geplanter anfänglicher Fokus: <strong>${plEsc(wtext)}</strong><button type="button" onclick="plPickerAllDimensions=!plPickerAllDimensions;plRenderPicker()">${plPickerAllDimensions?'nur anfänglichen Fokus zeigen':'weitere Wirkdimension ergänzen'}</button></div>`;
  }

  function itemHtml(id){
    const d=M[id], mc=MC[d.m];
    const v=d[setting];
    let suit='', cls='';
    if(v===1||v===undefined){suit='geeignet';cls='pl-suit-ja';}
    else {suit='Anpassung';cls='pl-suit-anp';}
    const dots=['p','s','g','a'].map(k=>dot(d[k],SC[k])).join('');
    return `<div class="pl-pitem" onclick="plPickModule('${id}')">
      <span class="pl-pitem-id" style="color:${mc.fg}">${id}${d.star?' ★':''}</span>
      <span class="pl-pitem-n">${plEsc(d.n)} <span style="color:var(--color-text-secondary);font-size:10.5px">· ${plEsc(METHODNAME[d.m]||d.m)}</span></span>
      ${plWirkBadgeHtml(id)}
      <span class="pl-pitem-dots">${dots}</span>
      <span class="pl-pitem-suit ${cls}">${suit}</span>
    </div>`;
  }

  let hits=0;
  if(plPickerView==='method'){
    const order=['km','rz','im','rn','tr','hs','lk'];
    order.forEach(mkey=>{
      const ids=baseIds.filter(id=>M[id].m===mkey);
      if(ids.length===0) return;
      hits+=ids.length;
      h+=`<div class="pl-pgroup-h">${plEsc(METHODNAME[mkey]||mkey)}</div>`;
      ids.forEach(id=>{ h+=itemHtml(id); });
    });
  }else{
    const dims=filterWcode ? D.filter(dim=>dim.code===filterWcode) : D;
    const seenForCount=[];
    dims.forEach(dim=>{
      const ids=dim.mods.filter(id=>baseIds.includes(id));
      if(ids.length===0) return;
      ids.forEach(id=>{ if(!seenForCount.includes(id)) seenForCount.push(id); });
      h+=`<div class="pl-pgroup-h" style="color:${dim.fg}">${plEsc(dim.code)} ${plEsc(dim.name)}</div>`;
      ids.forEach(id=>{ h+=itemHtml(id); });
    });
    hits=seenForCount.length;
  }
  if(hits===0) h+='<div class="pl-empty">Kein geeignetes Modul gefunden. Suche anpassen, Wirkdimensionsfilter lösen oder ein anderes Setting wählen.</div>';
  body.innerHTML=h;
}
function plPickModule(id){
  const sid=plPickerTarget;
  const plan=sid?plFindSessionPlan(sid):plActivePlan();
  const session=sid?plFindSession(sid):null;
  if(plan && !plModuleSelectable(id,plan.setting)){
    alert('Dieses Modul ist für das gewählte Setting nicht zur Auswahl freigegeben. Bitte Setting prüfen oder ein geeignetes Modul wählen.');
    return;
  }
  if(sid){ plAddBlock(sid,id); }
  plClosePicker();
}
