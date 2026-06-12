/* ---------- v4.3: Handbuch-Navigation mit stabiler Ankersteuerung ---------- */
const HB_HISTORY=[];
let HB_SEARCH_QUERY='';
let HB_SEARCH_INDEX=-1;
let HB_SEARCH_NODES=[];
function hbSetBackState(){
  const btn=document.getElementById('hbBackBtn');
  if(btn) btn.disabled = HB_HISTORY.length===0;
}
function hbPushPosition(){
  const y=window.scrollY || document.documentElement.scrollTop || 0;
  const last=HB_HISTORY[HB_HISTORY.length-1];
  if(last===undefined || Math.abs(last-y)>20){ HB_HISTORY.push(y); }
  if(HB_HISTORY.length>30) HB_HISTORY.shift();
  hbSetBackState();
}
function hbScrollToElement(el, remember=true, behavior='smooth'){
  if(!el) return;
  if(remember) hbPushPosition();
  const align=()=>{
    const dock=document.getElementById('hbNavDock');
    const offset=(dock?dock.getBoundingClientRect().height:0)+18;
    const top=window.scrollY + el.getBoundingClientRect().top - offset;
    window.scrollTo({top:Math.max(0,top),behavior:'auto'});
  };
  const dock=document.getElementById('hbNavDock');
  const offset=(dock?dock.getBoundingClientRect().height:0)+18;
  const top=window.scrollY + el.getBoundingClientRect().top - offset;
  window.scrollTo({top:Math.max(0,top),behavior});
  requestAnimationFrame(()=>requestAnimationFrame(align));
  const pos=document.getElementById('hbPosition');
  if(pos) pos.textContent=el.textContent ? el.textContent.trim().slice(0,90) : 'Handbuch';
}
function hbScrollOverview(){
  const el=document.querySelector('#view-handbuch .hb-dashboard');
  hbScrollToElement(el,true);
  const pos=document.getElementById('hbPosition');
  if(pos) pos.textContent='Übersicht';
}
function hbScrollTop(){
  hbPushPosition();
  const el=document.getElementById('view-handbuch');
  if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
  const pos=document.getElementById('hbPosition');
  if(pos) pos.textContent='Handbuch & Grundlagen';
}
function hbGoBack(){
  const y=HB_HISTORY.pop();
  hbSetBackState();
  if(y!==undefined) window.scrollTo({top:y,behavior:'smooth'});
}
function hbClearSearchMarks(){
  document.querySelectorAll('#hbContent mark.hb-searchterm').forEach(mark=>{
    mark.replaceWith(document.createTextNode(mark.textContent));
  });
  document.getElementById('hbContent')?.normalize();
}
function hbMarkSearchTerms(host,query){
  hbClearSearchMarks();
  const escaped=query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  if(!escaped) return;
  const re=new RegExp(escaped,'gi');
  const walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);
  const texts=[];
  while(walker.nextNode()){
    const node=walker.currentNode;
    if(node.nodeValue && re.test(node.nodeValue)) texts.push(node);
    re.lastIndex=0;
  }
  texts.forEach(node=>{
    const frag=document.createDocumentFragment();
    let last=0;
    node.nodeValue.replace(re,(match,offset)=>{
      frag.append(document.createTextNode(node.nodeValue.slice(last,offset)));
      const mark=document.createElement('mark');
      mark.className='hb-searchterm';
      mark.textContent=match;
      frag.append(mark);
      last=offset+match.length;
      return match;
    });
    frag.append(document.createTextNode(node.nodeValue.slice(last)));
    node.replaceWith(frag);
    re.lastIndex=0;
  });
}
function hbSearchSectionPaths(host,nodes){
  const wanted=new Set(nodes);
  const paths=new Map();
  const headings={h1:'',h2:'',h3:'',h4:''};
  host.querySelectorAll('h1,h2,h3,h4,p,li,td,th').forEach(el=>{
    const tag=el.tagName.toLowerCase();
    if(headings[tag]!==undefined){
      headings[tag]=el.textContent.trim();
      if(tag==='h1'){ headings.h2=''; headings.h3=''; headings.h4=''; }
      if(tag==='h2'){ headings.h3=''; headings.h4=''; }
      if(tag==='h3') headings.h4='';
    }
    if(wanted.has(el)){
      const path=[headings.h1,headings.h2,headings.h3,headings.h4].filter(Boolean);
      paths.set(el,path.length?path.join(' › '):'Handbuch & Grundlagen');
    }
  });
  return paths;
}
function hbRenderSearchResults(host,nodes){
  const box=document.getElementById('hbSearchResults');
  if(!box) return;
  box.innerHTML='';
  box.classList.remove('open');
  const paths=hbSearchSectionPaths(host,nodes);
  const head=document.createElement('button');
  head.type='button';
  head.className='hb-searchresults-head';
  head.addEventListener('click',()=>hbToggleSearchResults());
  const count=document.createElement('span');
  count.textContent=`${nodes.length} Fundstellen`;
  const toggle=document.createElement('em');
  toggle.textContent='Trefferliste anzeigen';
  head.append(count,toggle);
  box.append(head);
  const list=document.createElement('div');
  list.className='hb-searchresults-list';
  nodes.forEach((node,index)=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='hb-searchresult';
    button.addEventListener('click',()=>hbGoToSearchResult(index));
    const section=document.createElement('strong');
    section.textContent=paths.get(node)||'Handbuch & Grundlagen';
    const excerpt=document.createElement('span');
    const text=node.textContent.replace(/\s+/g,' ').trim();
    excerpt.textContent=text.length>150?text.slice(0,147)+'…':text;
    button.append(section,excerpt);
    list.append(button);
  });
  box.append(list);
  box.hidden=false;
}
function hbGoToSearchResult(index){
  if(!HB_SEARCH_NODES.length) return;
  HB_SEARCH_INDEX=((index%HB_SEARCH_NODES.length)+HB_SEARCH_NODES.length)%HB_SEARCH_NODES.length;
  document.querySelectorAll('#hbContent .hb-searchhit').forEach(el=>el.classList.remove('hb-searchhit'));
  document.querySelectorAll('#hbContent .hb-searchterm.current').forEach(el=>el.classList.remove('current'));
  document.querySelectorAll('#hbSearchResults .hb-searchresult').forEach(el=>el.classList.remove('current'));
  const target=HB_SEARCH_NODES[HB_SEARCH_INDEX];
  target.classList.add('hb-searchhit');
  target.querySelectorAll('mark.hb-searchterm').forEach(mark=>mark.classList.add('current'));
  document.querySelectorAll('#hbSearchResults .hb-searchresult')[HB_SEARCH_INDEX]?.classList.add('current');
  const exact=target.querySelector('mark.hb-searchterm.current')||target;
  hbScrollToElement(exact,true,'auto');
  hbSetSearchResultsOpen(false);
  const pos=document.getElementById('hbPosition');
  if(pos) pos.textContent=`Fundstelle ${HB_SEARCH_INDEX+1} von ${HB_SEARCH_NODES.length}: ${target.textContent.trim().slice(0,65)}`;
}
function hbSetSearchResultsOpen(open){
  const box=document.getElementById('hbSearchResults');
  if(!box) return;
  box.classList.toggle('open',!!open);
  const label=box.querySelector('.hb-searchresults-head em');
  if(label) label.textContent=open?'Trefferliste ausblenden':'Trefferliste anzeigen';
}
function hbToggleSearchResults(){
  const box=document.getElementById('hbSearchResults');
  if(box) hbSetSearchResultsOpen(!box.classList.contains('open'));
}
function hbSearchInputChanged(value){
  if(String(value||'').trim()) return;
  hbClearSearchState(false);
}
function hbSearchNext(){
  const input=document.getElementById('hbSearchInput');
  const host=document.getElementById('hbContent');
  const raw=(input?input.value:'').trim();
  const q=hbNormalizeText(raw);
  if(!q||!host) return;
  if(q!==HB_SEARCH_QUERY) hbMarkSearchTerms(host,raw);
  const nodes=[...host.querySelectorAll('h1,h2,h3,h4,p,li,td,th')].filter(el=>hbNormalizeText(el.textContent).includes(q));
  if(!nodes.length){ alert('Keine Fundstelle im Handbuch gefunden.'); return; }
  if(q!==HB_SEARCH_QUERY){
    HB_SEARCH_QUERY=q;
    HB_SEARCH_INDEX=-1;
    HB_SEARCH_NODES=nodes;
    hbRenderSearchResults(host,nodes);
  }
  hbGoToSearchResult(HB_SEARCH_INDEX+1);
  const next=document.getElementById('hbSearchNextDock');
  if(next) next.disabled=false;
}
function hbToggleCompact(){
  const content=document.querySelector('#view-handbuch .hb-content');
  const btn=document.getElementById('hbCompactBtn');
  if(!content) return;
  content.classList.toggle('compact');
  if(btn) btn.classList.toggle('on',content.classList.contains('compact'));
}
function hbClearSearchState(clearInput=true){
  const input=document.getElementById('hbSearchInput');
  if(clearInput && input) input.value='';
  document.querySelectorAll('#hbContent .hb-searchhit').forEach(el=>el.classList.remove('hb-searchhit'));
  hbClearSearchMarks();
  const next=document.getElementById('hbSearchNextDock');
  if(next) next.disabled=true;
  const results=document.getElementById('hbSearchResults');
  if(results){ results.innerHTML=''; results.hidden=true; }
  HB_SEARCH_QUERY='';
  HB_SEARCH_INDEX=-1;
  HB_SEARCH_NODES=[];
  const pos=document.getElementById('hbPosition');
  if(pos) pos.textContent='Übersicht';
}
function hbClearReadingTools(){
  const content=document.querySelector('#view-handbuch .hb-content');
  if(content) content.classList.remove('compact');
  const btn=document.getElementById('hbCompactBtn'); if(btn) btn.classList.remove('on');
  hbClearSearchState(true);
}

function hbUpdateActiveState(){
  const isHb=document.getElementById('view-handbuch')?.classList.contains('on');
  document.body.classList.toggle('hb-active',!!isHb);
}

/* ---------- Handbuch-Ansicht aufbauen + Inhaltsverzeichnis erzeugen ---------- */
function buildHandbuch(){
  const host=document.getElementById('hbContent');
  host.innerHTML = CONTENT.frame_html + CONTENT.literatur;
  // IDs vergeben + TOC bauen (h1/h2/h3)
  const toc=document.getElementById('hbToc');
  let n=0;
  host.querySelectorAll('h1,h2,h3').forEach(h=>{
    if(!h.id){ h.id='hb-'+(n++); }
    const lvl=h.tagName.toLowerCase();
    const a=document.createElement('a');
    a.href='#'+h.id; a.textContent=h.textContent;
    a.className= lvl==='h2'?'lvl2':(lvl==='h3'?'lvl3':'lvl1');
    a.addEventListener('click',ev=>{ ev.preventDefault(); hbScrollToElement(document.getElementById(h.id), true); });
    toc.appendChild(a);
  });
}
setTimeout(hbUpdateActiveState,0);
