/* ---- Landkarten-Daten (aktualisiert aus Modullandkarte v10.8 / 59 Module) ---- */
const MC={
  km:{bg:'#FFF3CC',fg:'#7A5C00'},rz:{bg:'#E1F5EE',fg:'#085041'},
  im:{bg:'#A8DFF0',fg:'#054862'},rn:{bg:'#FDE8CC',fg:'#6A3A08'},
  tr:{bg:'#F5E0E0',fg:'#7A1414'},hs:{bg:'#EEEDFE',fg:'#26215C'},
  lk:{bg:'#F8E0F0',fg:'#6B1858'}
};
const SC={p:'#1A6FBF',s:'#BA7517',g:'#4A8A18',a:'#D44000'};
const M={
  'KM-1':{n:'Ankommen & Grounding',m:'km',p:1,s:1,g:1,a:1,star:1},
  'KM-2':{n:'Atem & Stimme',m:'km',p:1,s:1,g:1,a:1},
  'RZ-4':{n:'Monochord / Körperklang',m:'rz',p:1,s:1,g:1,a:1},
  'RZ-1':{n:'Klangreise',m:'rz',p:1,s:1,g:.4,a:.4,star:1},
  'RN-1':{n:'Pulse-Grounding',m:'rn',p:1,s:1,g:1,a:1},
  'HS-2':{n:'Symptom als Ressource',m:'hs',p:1,s:1,g:.4,a:.4,note:'⊕ integrativ'},
  'KM-3':{n:'Rhythmus & Körper',m:'km',p:1,s:1,g:.4,a:.4},
  'IM-1':{n:'Klangerkundung',m:'im',p:1,s:1,g:.4,a:0,star:1},
  'RN-2':{n:'Rhythm. Aktivierung',m:'rn',p:1,s:1,g:1,a:0,star:1},
  'RN-3':{n:'Metrum & Bewegung',m:'rn',p:1,s:1,g:0,a:0},
  'TR-1':{n:'Trommelkreis',m:'tr',p:1,s:1,g:0,a:0,star:1},
  'LK-1':{n:'Koordination & Rhythmus',m:'lk',p:1,s:1,g:.4,a:0,star:1},
  'LK-2':{n:'Asymmetr. Muster & Überkreuz',m:'lk',p:1,s:1,g:.4,a:0},
  'LK-3':{n:'Kogn. Doppelaufgaben',m:'lk',p:1,s:1,g:.4,a:0},
  'KM-5':{n:'Ausdruck & Entlastg.',m:'km',p:.4,s:1,g:0,a:0},
  'RZ-2':{n:'Mus. Assoziieren',m:'rz',p:1,s:1,g:0,a:0},
  'IM-3':{n:'Themenimprov.',m:'im',p:1,s:1,g:0,a:0},
  'TR-2':{n:'Call & Response Trommel',m:'tr',p:1,s:1,g:0,a:0},
  'TR-4':{n:'Rhythmus & Ausdruck',m:'tr',p:1,s:1,g:0,a:0},
  'HS-1':{n:'Reframing & Utilisation',m:'hs',p:1,s:1,g:0,a:0,note:'⊕ integrativ'},
  'KM-6':{n:'Gemeinschaft & Resonanz',m:'km',p:1,s:1,g:.4,a:0},
  'RN-4':{n:'Rhythmisches Echo',m:'rn',p:1,s:1,g:1,a:0},
  'IM-2':{n:'Mus. Dialog',m:'im',p:1,s:1,g:0,a:0},
  'IM-4':{n:'Gruppenimprov.',m:'im',p:1,s:1,g:0,a:0},
  'TR-3':{n:'Groove-Entwicklung',m:'tr',p:1,s:1,g:0,a:0},
  'KM-4':{n:'Lied & Biografie',m:'km',p:1,s:1,g:1,a:-1,star:1},
  'KM-7':{n:'Kraft & Identität',m:'km',p:1,s:1,g:.4,a:0},
  'RZ-3':{n:'Song-Arbeit',m:'rz',p:1,s:1,g:0,a:0},
  'HS-3':{n:'Innere Anteile / Klang',m:'hs',p:1,s:.4,g:0,a:0,note:'Vertiefung'},
  'KM-8':{n:'Stille & Integration',m:'km',p:1,s:1,g:.4,a:.4,note:'⊕ integrativ'},
  'KM-9':{n:'Miteinander singen',m:'km',p:1,s:1,g:1,a:.4,star:1},
  'HS-4':{n:'Ressourcenankern',m:'hs',p:1,s:1,g:.4,a:0,star:1},
  // --- Module 5–8 je Methode plus IM-9/TR-9 (v10.8 / 59 Module) ---
  'RZ-5':{n:'Fantasiereise / GIM',m:'rz',p:1,s:.4,g:.4,a:0},
  'RZ-6':{n:'Geteiltes Hören & Resonanz',m:'rz',p:1,s:1,g:.4,a:0,note:'⊕ integrativ'},
  'RZ-7':{n:'Liedtext-Arbeit',m:'rz',p:1,s:1,g:.4,a:0},
  'RZ-8':{n:'Stille und Klang',m:'rz',p:1,s:1,g:.4,a:0,note:'⊕ integrativ'},
  'IM-5':{n:'Instrumentenwahl & Ausdruck',m:'im',p:1,s:1,g:.4,a:0},
  'IM-6':{n:'Freie Vokalimprovisation',m:'im',p:.4,s:1,g:0,a:0},
  'IM-7':{n:'Dyaden-Improvisation',m:'im',p:1,s:1,g:.4,a:0,note:'⊕ integrativ'},
  'IM-8':{n:'Klang und Stille',m:'im',p:1,s:1,g:.4,a:0,note:'⊕ integrativ'},
  'RN-5':{n:'Rhythmische Sprache',m:'rn',p:1,s:1,g:1,a:0},
  'RN-6':{n:'Bewegung & Melodie / RAS',m:'rn',p:1,s:1,g:1,a:0},
  'RN-7':{n:'Rhythmus und Atmung',m:'rn',p:1,s:1,g:1,a:.4,note:'⊕ integrativ'},
  'RN-8':{n:'Rhythmische Ko-Regulation',m:'rn',p:1,s:1,g:.4,a:0,note:'⊕ integrativ'},
  'TR-5':{n:'Frage und Antwort im kleinen Kontaktfeld',m:'tr',p:1,s:1,g:.4,a:0,note:'⊕ integrativ'},
  'TR-6':{n:'Trommel und Stimme',m:'tr',p:1,s:1,g:0,a:0,note:'⊕ integrativ'},
  'TR-7':{n:'Polyrhythmus',m:'tr',p:1,s:1,g:0,a:0},
  'TR-8':{n:'Trommelgeschichte',m:'tr',p:1,s:1,g:.4,a:0},
  'IM-9':{n:'Instrumentenvorstellung & Erkundung',m:'im',p:1,s:1,g:.4,a:0,note:'Orientierung'},
  'TR-9':{n:'Trommeltechnik – Grundlagen',m:'tr',p:1,s:1,g:.4,a:0,note:'Orientierung'},
  'HS-5':{n:'Wunderfrage musikalisch',m:'hs',p:1,s:1,g:.4,a:0,note:'⊕ integrativ'},
  'HS-6':{n:'Ausnahmen erkunden',m:'hs',p:1,s:1,g:.4,a:0,note:'Vertiefung'},
  'HS-7':{n:'Skalierungsarbeit m. Klang',m:'hs',p:1,s:1,g:.4,a:0,note:'⊕ integrativ'},
  'HS-8':{n:'Dyaden-Aufstellung mit Klang',m:'hs',p:1,s:1,g:0,a:0,note:'Vertiefung'},
  'LK-4':{n:'Ball und Rhythmus',m:'lk',p:1,s:1,g:.4,a:0},
  'LK-5':{n:'Augen und Motorik',m:'lk',p:1,s:1,g:.4,a:0},
  'LK-6':{n:'Rückwärtselemente',m:'lk',p:1,s:1,g:.4,a:0},
  'LK-7':{n:'Koordination zu zweit',m:'lk',p:1,s:1,g:.4,a:0,note:'⊕ integrativ'},
  'LK-8':{n:'Klang & Kognition',m:'lk',p:1,s:1,g:1,a:.4,note:'⊕ integrativ'},
};
const D=[
  {code:'W1',name:'Stabilisierung',trig:'unruhig · dysreguliert · aufgewühlt',bg:'#FCEBEB',fg:'#A32D2D',mods:['KM-1','KM-2','RZ-4','RZ-1','RN-1','HS-2','RZ-5','RN-7','HS-7']},
  {code:'W2',name:'Aktivierung',trig:'erschöpft · apathisch · stumm · leer',bg:'#FAEEDA',fg:'#854F0B',mods:['KM-3','IM-1','RN-2','RN-3','TR-1','LK-1','LK-2','LK-3','RN-5','RN-6','TR-7','LK-4','LK-5','LK-6','LK-7','LK-8','IM-9','TR-9']},
  {code:'W3',name:'Ausdruck',trig:'aufgestaut · Spannung · sucht Weg raus',bg:'#FAECE7',fg:'#993C1D',mods:['KM-5','RZ-2','IM-3','TR-2','TR-4','HS-1','RZ-7','IM-5','IM-6','TR-6']},
  {code:'W4',name:'Verbindung',trig:'Einzelkämpfer · Gruppe findet sich nicht',bg:'#E6F1FB',fg:'#185FA5',mods:['KM-9','KM-6','RN-4','IM-2','IM-4','TR-3','RZ-6','IM-7','RN-8','TR-5','TR-7','HS-8','LK-7']},
  {code:'W5',name:'Biografie & Sinn',trig:'Lebensthemen · Erinnerung · Würde · Identität',bg:'#EEEDFE',fg:'#534AB7',mods:['KM-4','KM-7','RZ-3','IM-3','HS-3','RZ-6','RZ-7','IM-5','TR-8','HS-5','HS-6']},
  {code:'W6',name:'Integration & Transfer',trig:'Abschluss · Was nehme ich mit?',bg:'#E1F5EE',fg:'#0F6E56',mods:['KM-8','RZ-3','IM-4','TR-3','HS-4','RZ-8','IM-8','HS-5']},
];

// Vertretungseignung nach Word-Schnellübersicht: vok = vertretungsgeeignet, vexp = therapeutische Erfahrung nötig, vrahm = Ergänzung / Abschlussbaustein.
const VOK=new Set(['KM-1','KM-2','KM-3','KM-4','KM-6','KM-9','RZ-1','RZ-4','RZ-5','IM-1','IM-2','IM-4','IM-9','RN-1','RN-2','RN-3','RN-4','RN-5','RN-6','TR-1','TR-3','TR-7','TR-9','HS-4','LK-1','LK-2','LK-3','LK-4','LK-5','LK-6']);
const VEXP=new Set(['KM-5','KM-7','RZ-2','RZ-3','RZ-6','RZ-7','IM-3','IM-5','IM-6','TR-2','TR-4','TR-6','TR-8','HS-1','HS-2','HS-3','HS-5','HS-6','HS-7','HS-8']);
const VRAHM=new Set(['KM-8','RZ-8','IM-7','IM-8','RN-7','RN-8','TR-5','LK-7','LK-8']);
const VERTIEFUNG=new Set(['HS-3','HS-6','HS-8']);
const TB=[
  {t:'Transferwort',d:'ein Begriff oder Satz als Mitnahme aus der Einheit'},
  {t:'Körperanker',d:'Atem, Geste, Summton oder Rhythmus für den Alltag'},
  {t:'Abschlussritual',d:'kurzer Klang, Puls oder Stille zur Verdichtung'}
];

/* Methoden-Vollnamen fur das Panel */
const METHODNAME={km:'Körpermusik / Bodysongs',rz:'Rezeptive Musiktherapie',im:'Improvisation',rn:'Rhythmik / NMT',tr:'Trommelgruppe',hs:'Hypnosystemische Methoden',lk:'Life Kinetik'};


const W2SUB={
  a:new Set(['IM-1']),
  b:new Set(['KM-3','RN-2','RN-3','TR-1','RN-5','RN-6','TR-7']),
  c:new Set(['LK-1','LK-2','LK-3','LK-4','LK-5','LK-6','LK-7','LK-8','IM-9','TR-9'])
};
function w2Label(id){
  if(W2SUB.a.has(id)) return 'W2a sanft';
  if(W2SUB.b.has(id)) return 'W2b rhythmisch';
  if(W2SUB.c.has(id)) return 'W2c kognitiv/technisch';
  return '';
}

const cnt={};
D.forEach(d=>d.mods.forEach(id=>{cnt[id]=(cnt[id]||0)+1;}));

function dot(v,c){
  if(v===1)  return `<span class="sd" style="background:${c}"></span>`;
  if(v===.4) return `<span class="sd" style="background:${c};opacity:.3"></span>`;
  if(v===-1) return `<span class="sd" style="background:transparent;border:1.5px dashed ${c}"></span>`;
  return `<span class="sd" style="background:#C8C7BF"></span>`;
}
function chip(id){
  const d=M[id],mc=MC[d.m];
  const dots=['p','s','g','a'].map(k=>dot(d[k],SC[k])).join('');
  const keys=['p','s','g','a'].filter(k=>d[k]>0||d[k]===-1);
  if(d.star) keys.push('kern');
  if(d.note && d.note.includes('⊕')) keys.push('integ');
  if(VERTIEFUNG.has(id)) keys.push('vertief');
  if(VOK.has(id)) keys.push('vok');
  if(VEXP.has(id)) keys.push('vexp');
  if(VRAHM.has(id)) keys.push('vrahm');
  keys.push(d.m);
  const sk=keys.join(',');
  const tag=cnt[id]>1?'⇅':'';
  const star=d.star?' ★':'';
  const integ=(d.note && d.note.includes('⊕'))?' ⊕':'';
  const w2=w2Label(id);
  const tagBits=[tag,w2].filter(Boolean).join(' · ');
  const tagHtml=tagBits?`<div class="cnote">${tagBits}</div>`:'';
  const vbadges=[];
  if(VERTIEFUNG.has(id)) vbadges.push('<span class="vb vb-vt">Vertiefung</span>');
  if(VOK.has(id)) vbadges.push('<span class="vb vb-ok">vertretungsgeeignet</span>');
  if(VEXP.has(id)) vbadges.push('<span class="vb vb-exp">Erfahrung nötig</span>');
  if(VRAHM.has(id)) vbadges.push('<span class="vb vb-rahm">Ergänzung</span>');
  const badges=vbadges.length?`<div class="vbadges">${vbadges.join('')}</div>`:'';
  const search=(id+' '+d.n).toLowerCase();
  return `<div class="chip" tabindex="0" role="button" style="background:${mc.bg}" data-s="${sk}" data-id="${id}" data-search="${search}"
    onclick="openModule('${id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openModule('${id}')}">
  <div class="cid" style="color:${mc.fg}">${id}${star}${integ}</div>
  <div class="cname" style="color:${mc.fg}">${d.n}</div>
  ${tagHtml}<div class="sdots">${dots}</div>${badges}
</div>`;
}
function w2SubChips(){
  const subs=[
    {key:'a',label:'W2a – Sanfte Aktivierung',bg:'#EAF3DE',fg:'#3B6D11',border:'#C0DD97'},
    {key:'b',label:'W2b – Körperlich-rhythmisch',bg:'#E6F1FB',fg:'#185FA5',border:'#B5D4F4'},
    {key:'c',label:'W2c – Kognitiv / technisch',bg:'#EEEDFE',fg:'#3C3489',border:'#CECBF6'}
  ];
  const w2mods=D.find(d=>d.code==='W2').mods;
  return subs.map(sub=>{
    const ids=[...W2SUB[sub.key]].filter(id=>w2mods.includes(id));
    if(!ids.length) return '';
    return `<div class="w2sg"><div class="w2sghead"><span class="w2sgbadge" style="background:${sub.bg};color:${sub.fg};border:0.5px solid ${sub.border}">${sub.label}</span><span class="w2sgline"></span></div><div class="chips">${ids.map(chip).join('')}</div></div>`;
  }).join('');
}
function transferBox(){
  return `<div class="ml-note"><strong>W6-Hinweis:</strong> Integration und Transfer sind nicht nur eigene Module, sondern Ergänzung / Abschlussbausteine in vielen Einheiten. Die Bausteine werden niedrig dosiert eingesetzt und ersetzen keine weitere thematische Öffnung.<div class="tchips">${TB.map(x=>`<span class="tchip"><strong>${x.t}:</strong> ${x.d}</span>`).join('')}</div></div>`;
}
document.getElementById('mlb').innerHTML=D.map((dim,i)=>`
<div class="wrow">
  <div class="whead">
    <span class="wbadge" style="background:${dim.bg};color:${dim.fg}">${dim.code}</span>
    <span class="wname">${dim.name}</span>
    <span class="wtrig">${dim.trig}</span>
  </div>
  ${dim.code==='W2'?w2SubChips():`<div class="chips">${dim.mods.map(chip).join('')}</div>`}
  ${dim.code==='W6'?transferBox():''}
</div>${i<5?'<div class="wdiv"></div>':''}`).join('');

/* ---------- Modul-Detail-Panel ---------- */
const panel=document.getElementById('panel'), overlay=document.getElementById('overlay');
function openModule(id){
  const mod=CONTENT.modules[id];
  if(!mod){return;}
  const meta=M[id], mc=MC[meta.m];
  const tag=document.getElementById('panelTag');
  tag.textContent=id+(meta.star?' ★':'')+((meta.note&&meta.note.includes('⊕'))?' ⊕':'');
  tag.style.background=mc.bg; tag.style.color=mc.fg;
  document.getElementById('panelMethod').textContent=METHODNAME[meta.m]||mod.method||'';
  document.getElementById('panelBody').innerHTML=decisionCardHtml(id)+mod.html;
  panel.classList.add('on'); overlay.classList.add('on');
  document.getElementById('panelBody').scrollTop=0;
  document.body.style.overflow='hidden';
}
function closePanel(){
  panel.classList.remove('on'); overlay.classList.remove('on');
  document.body.style.overflow='';
}
function printPanel(){
  document.body.classList.add('printing-panel');
  window.print();
  setTimeout(()=>document.body.classList.remove('printing-panel'),300);
}
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closePanel(); });

function settingSuitabilityText(meta){
  const label={p:'Psy',s:'Sucht',g:'Ger',a:'Akut'};
  return ['p','s','g','a'].map(k=>{
    const v=meta[k];
    let t=v===1?'ja':(v===0.4?'angepasst':(v===0?'nein':(v===-1?'Ausnahme':'—')));
    return label[k]+': '+t;
  }).join(' · ');
}
function moduleBadgesText(id){
  const bits=[];
  const meta=M[id]||{};
  if(meta.star) bits.push('Kernmodul');
  if(meta.note && meta.note.includes('⊕')) bits.push('integrativ / Abschluss');
  if(VOK.has(id)) bits.push('vertretungsgeeignet');
  if(VEXP.has(id)) bits.push('therapeutische Erfahrung nötig');
  if(VERTIEFUNG.has(id)) bits.push('Vertiefung');
  if(VRAHM.has(id)) bits.push('Ergänzung / Rahmung');
  return bits.join(' · ') || 'Standardmodul';
}
function moduleMainWirk(id){
  const dims=D.filter(dim=>dim.mods.includes(id)).map(dim=>dim.code+' '+dim.name);
  return dims.join(' · ') || 'nicht zugeordnet';
}
function decisionCardHtml(id){
  const meta=M[id]; if(!meta) return '';
  const safe=plEsc;
  const suitability=settingSuitabilityText(meta);
  let caution='Settinghinweise im Profil prüfen.';
  if(VEXP.has(id)||VERTIEFUNG.has(id)) caution='Nur mit therapeutischer Erfahrung, klarer Rückführung und stabiler Gruppe einsetzen.';
  else if(meta.a===0||meta.a===-1) caution='Für Akut-Entgiftung nicht oder nur in Ausnahmeform geeignet.';
  else if(meta.g===0||meta.g===0.4) caution='In Geronto Tempo, Komplexität und Wiederholung besonders prüfen.';
  else if(VOK.has(id)) caution='Robust einsetzbar, trotzdem Setting und aktuelle Belastbarkeit prüfen.';
  return `<div class="decision-card"><h3>Modul in 10 Sekunden einschätzen</h3><div class="decision-grid">
    <div><b>Wirkdimension</b>${safe(moduleMainWirk(id))}</div>
    <div><b>Modulart</b>${safe(moduleBadgesText(id))}</div>
    <div><b>Setting</b>${safe(suitability)}</div>
    <div><b>Vorsicht</b>${safe(caution)}</div>
  </div></div>`;
}
