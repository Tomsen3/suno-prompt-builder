/* ---------- Tab-Wechsel ---------- */
function showView(v,btn){
  document.querySelectorAll('.tab').forEach(t=>{t.classList.remove('on');t.setAttribute('aria-selected','false');});
  btn.classList.add('on'); btn.setAttribute('aria-selected','true');
  document.querySelectorAll('.view').forEach(s=>s.classList.remove('on'));
  document.getElementById('view-'+v).classList.add('on');
  window.scrollTo(0,0);
}


function hbNormalizeText(txt){
  return String(txt||'').toLowerCase().replace(/\s+/g,' ').trim();
}
function hbJumpContains(term){
  const host=document.getElementById('hbContent');
  const view=document.getElementById('view-handbuch');
  if(!host || !view) return false;
  const needle=hbNormalizeText(term);
  if(!needle) return false;

  const findTarget=()=>{
    const heads=[...host.querySelectorAll('h1,h2,h3,h4')];
    return heads.find(h=>hbNormalizeText(h.textContent).includes(needle));
  };

  const doJump=()=>{
    const target=findTarget();
    if(!target) return false;
    if(typeof hbScrollToElement==='function'){
      hbScrollToElement(target,true);
    }else{
      target.scrollIntoView({behavior:'smooth',block:'start'});
    }
    return true;
  };

  // Wenn der Handbuch-Reiter gerade erst eingeblendet wurde, braucht der Browser
  // einen Layout-Zyklus. Sonst läuft der Sprung ins Leere oder bleibt oben hängen.
  if(!view.classList.contains('on')){
    showView('handbuch',document.getElementById('tab-handbuch'));
  }
  requestAnimationFrame(()=>requestAnimationFrame(doJump));
  return true;
}
