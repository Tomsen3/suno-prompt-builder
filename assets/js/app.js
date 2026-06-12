let CONTENT;

async function loadContent(){
  const [modulesResponse, handbookResponse, documentationResponse] = await Promise.all([
    fetch('./data/modules.json'),
    fetch('./data/handbook.json'),
    fetch('./data/documentation.json')
  ]);
  if(!modulesResponse.ok || !handbookResponse.ok || !documentationResponse.ok) throw new Error('Inhaltsdaten konnten nicht geladen werden.');
  const modules = await modulesResponse.json();
  const handbook = await handbookResponse.json();
  const documentation = await documentationResponse.json();
  CONTENT = {...modules, ...handbook, ...documentation};
}

function showLoadError(error){
  console.error(error);
  const message=document.createElement('div');
  message.className='load-error';
  message.innerHTML='<strong>Die Daten konnten nicht geladen werden.</strong><br>Bitte die App Ã¼ber einen lokalen Server oder GitHub Pages Ã¶ffnen.';
  document.body.prepend(message);
}

async function initApp(){
  try{
    await loadContent();
    buildHandbuch();
    renderModuleList();
    plLoad();
    plRender();
    startRenderRecommendations();
    mlUpdateClinicalModeBox();
  }catch(error){ showLoadError(error); }
}

initApp();
