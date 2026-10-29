const $ = (id) => document.getElementById(id);
const header=document.querySelector('.header');
function syncHeader(){const visible=window.scrollY>24;header.classList.toggle('header--visible',visible);header.inert=!visible;header.setAttribute('aria-hidden',String(!visible));}
window.addEventListener('scroll',syncHeader,{passive:true});syncHeader();
const wall = $('wall'), lens = $('lens'), dialog = $('detailDialog');
document.documentElement.classList.add('is-loading');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let data = [], nodes = [], width = 0, height = 0, cardW = 260, cardH = 173;
let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0, dragging = null, moved = false, selected = 0, lastFocus = null;
const columns = 11, rows = 9;
let filterIndex = 0;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function safeStorageGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
const storedTheme = safeStorageGet('az-theme');
const initialLight = storedTheme === 'light';
document.body.classList.toggle('light', initialLight);
function updateThemeLabel() { $('themeButton').setAttribute('aria-label', document.body.classList.contains('light') ? 'Включить тёмную тему' : 'Включить светлую тему'); }
updateThemeLabel();
$('themeButton').addEventListener('click', () => {
  document.body.classList.toggle('light'); updateThemeLabel();
  try { localStorage.setItem('az-theme', document.body.classList.contains('light') ? 'light' : 'dark'); } catch { /* Private browsing */ }
});
function wrap(n, span) { return ((n + span / 2) % span + span) % span - span / 2; }
let lastTime=0, parallaxX=0, parallaxY=0, desiredPX=0, desiredPY=0;
const wipes=new Map();
const smoothstep=t=>t*t*(3-2*t);
function render(time=performance.now()) {
  frame=0;
  const dt=Math.min(32,lastTime ? time-lastTime : 16.67);lastTime=time;
  const panEase=reduced.matches ? 1 : 1-Math.exp(-dt/135);
  const pointerEase=reduced.matches ? 1 : 1-Math.exp(-dt/230);
  x+=(targetX-x)*panEase;y+=(targetY-y)*panEase;
  parallaxX+=(desiredPX-parallaxX)*pointerEase;parallaxY+=(desiredPY-parallaxY)*pointerEase;
  lens.style.transform=`translate3d(${parallaxX.toFixed(3)}px,${parallaxY.toFixed(3)}px,0)`;
  const gap=width<600 ? 12 : 16, stepX=cardW+gap, stepY=cardH+gap;
  nodes.forEach((el,i)=>{
    const row=Math.floor(i/columns),col=i%columns;
    const cx=wrap((col-5)*stepX+(row%2 ? stepX/2:0)+x,columns*stepX);
    const cy=wrap((row-4)*stepY+y,rows*stepY);
    const edge=Math.max(Math.abs(cx)/(width/2+cardW*.5),Math.abs(cy)/(height/2+cardH*.5));
    const lensFalloff=smoothstep(clamp((edge-.4)/.75,0,1));
    // Uniform scale preserves every image's aspect ratio, including the edges.
    const scale=1-.24*lensFalloff;
    const visible=Math.abs(cx)<width/2+cardW && Math.abs(cy)<height/2+cardH;
    if(el.hidden===visible)el.hidden=!visible;
    const tab=visible && Math.abs(cx)<width/2-cardW*.15 && Math.abs(cy)<height/2-cardH*.15 ? 0:-1;
    if(el.tabIndex!==tab)el.tabIndex=tab;
    el.style.transform=`translate3d(${(cx-cardW*scale/2).toFixed(3)}px,${(cy-cardH*scale/2).toFixed(3)}px,0) scale(${scale.toFixed(5)})`;
    if(visible&&!el.dataset.loaded){el.querySelectorAll('img').forEach(img=>img.src=img.dataset.src);el.dataset.loaded='true';}
  });
  let wipeMoving=false;
  wipes.forEach((state,el)=>{
    state.value+=(state.goal-state.value)*(reduced.matches?1:1-Math.exp(-dt/110));
    el.style.setProperty('--reveal',state.value.toFixed(5));
    if(Math.abs(state.goal-state.value)>.0005)wipeMoving=true;
    else if(state.goal===0){el.style.setProperty('--reveal','0');wipes.delete(el);}
  });
  const moving=Math.abs(targetX-x)+Math.abs(targetY-y)+Math.abs(desiredPX-parallaxX)+Math.abs(desiredPY-parallaxY)>.015;
  if(moving||wipeMoving)requestRender();else lastTime=0;
}
function requestRender(){if(!frame)frame=requestAnimationFrame(render);}
function resize(){
  width=wall.clientWidth;height=wall.clientHeight;
  cardW=width<600?210:clamp(width/4.8,240,360);cardH=cardW*2/3;
  lens.style.setProperty('--w',cardW+'px');requestRender();
}
function wipeTo(button,goal){
  const state=wipes.get(button)||{value:0,goal:0};state.goal=goal;wipes.set(button,state);requestRender();
}
function createTile(item, i) {
  const button = document.createElement('button'); button.className = 'tile';
  button.setAttribute('aria-label', `${item.category}: ${item.title}. Открыть сравнение`);
  const card = document.createElement('span'); card.className = 'card';
  const face = document.createElement('span'); face.className = 'face';
  const after = document.createElement('img'); after.alt = ''; after.draggable = false; after.decoding = 'async'; after.dataset.src = item.after; after.style.objectPosition = item.position;
  const reveal = document.createElement('span'); reveal.className = 'reveal';
  const before = document.createElement('img'); before.alt = ''; before.draggable = false; before.decoding = 'async'; before.dataset.src = item.before; before.style.objectPosition = item.position;
  [after,before].forEach(img=>img.addEventListener('load',()=>img.classList.add('is-loaded'),{once:true}));
  [after, before].forEach(img => img.addEventListener('error', () => {
    if (img.dataset.failed) return;
    img.dataset.failed = 'true';
    img.src = 'assets/unavailable.svg';
  }));
  reveal.append(before); face.append(after, reveal);
  const caption = document.createElement('span'); caption.className = 'caption';
  const category = document.createElement('span'); category.className = 'eyebrow'; category.textContent = item.category;
  const title = document.createElement('span'); title.className = 'title'; title.textContent = item.title;
  caption.append(category,title); face.append(caption);
  const rim = document.createElement('span'); rim.className = 'rim';card.append(face,rim); button.append(card);
  button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!dragging){const r=button.getBoundingClientRect();wipeTo(button,clamp((e.clientX-r.left)/r.width,.03,.97));}});
  button.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!dragging){const r=button.getBoundingClientRect();wipeTo(button,clamp((e.clientX-r.left)/r.width,.03,.97));}});
  button.addEventListener('pointerleave',()=>wipeTo(button,0));
  button.addEventListener('focus',()=>wipeTo(button,.5));button.addEventListener('blur',()=>wipeTo(button,0));
  button.addEventListener('click', e => { if (moved) { e.preventDefault(); return; } openCard(i); });
  return button;
}
wall.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  moved = false;
  dragging = { id:e.pointerId, startX:e.clientX, startY:e.clientY, baseX:targetX, baseY:targetY, touch:e.pointerType==='touch' };
});
window.addEventListener('pointermove', e => {
  if (!dragging || dragging.id !== e.pointerId) return;
  const dx = e.clientX-dragging.startX, dy = e.clientY-dragging.startY;
  if (!moved && Math.hypot(dx,dy) < 7) return;
  // Let vertical swipes scroll the page instead of stealing touch navigation.
  if (dragging.touch && !moved && Math.abs(dy) > Math.abs(dx)) { dragging=null; return; }
  if (!moved) { moved=true; wall.classList.add('dragging'); wall.setPointerCapture(e.pointerId); wipes.forEach((state)=>state.goal=0); }
  targetX=dragging.baseX+dx; targetY=dragging.baseY+(dragging.touch ? 0 : dy); requestRender();
});
function stopDrag(e) {
  if (!dragging || e.pointerId!==dragging.id) return;
  if (wall.hasPointerCapture(e.pointerId)) wall.releasePointerCapture(e.pointerId);
  dragging=null; wall.classList.remove('dragging');
  // click is dispatched immediately after pointerup; keep the drag guard until then.
  setTimeout(()=>{moved=false;},0);
}
window.addEventListener('pointerup',stopDrag);window.addEventListener('pointercancel',stopDrag);
wall.addEventListener('pointermove',e=>{
  if(dragging||reduced.matches||e.pointerType!=='mouse')return;
  const r=wall.getBoundingClientRect();
  desiredPX=-(e.clientX-r.left-width/2)*.04;desiredPY=-(e.clientY-r.top-height/2)*.04;requestRender();
});
wall.addEventListener('pointerleave',()=>{desiredPX=desiredPY=0;requestRender();});

function setCompare(value) {
  $('beforeLayer').style.clipPath=`inset(0 ${100-value}% 0 0)`;
  $('compareLine').style.left=value+'%';
}
$('compareRange').addEventListener('input',e=>setCompare(Number(e.target.value)));
function showItem(index) {
  selected=(index+data.length)%data.length; const item=data[selected];filterIndex++;
  const imageToken=filterIndex;
  $('detailTitle').textContent=item.title;$('detailCategory').textContent=item.category;
  $('detailIndex').textContent=`${String(selected+1).padStart(2,'0')} / ${data.length}`;
  // Start with the already cached previews, then load the larger versions.
  for (const [id,preview,full] of [['afterImage',item.after,item.full],['beforeImage',item.before,item.beforeFull]]) {
    $(id).src=preview; const preload=new Image();preload.onload=()=>{if(imageToken===filterIndex)$(id).src=full;};preload.src=full;
  }
  $('compareRange').value='50';setCompare(50);
}
function openCard(index) {
  lastFocus=document.activeElement;showItem(index);dialog.showModal(); document.body.style.overflow='hidden';$('closeDialog').focus();

}
$('closeDialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{ document.body.style.overflow=''; lastFocus?.focus({preventScroll:true}); });
$('previousCard').addEventListener('click',()=>showItem(selected-1));$('nextCard').addEventListener('click',()=>showItem(selected+1));
dialog.addEventListener('keydown',e=>{
  if(e.target===$('compareRange')) return;
  if(e.key==='ArrowLeft'){e.preventDefault();showItem(selected-1);}
  if(e.key==='ArrowRight'){e.preventDefault();showItem(selected+1);}
});
for(const el of [dialog,$('aboutDialog')]) el.addEventListener('click',e=>{if(e.target===el){const r=el.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)el.close();}});
$('aboutButton').addEventListener('click',()=>$('aboutDialog').showModal());$('closeAbout').addEventListener('click',()=>$('aboutDialog').close());
new ResizeObserver(resize).observe(wall);
try {
  const response=await fetch('gallery.json');if(!response.ok)throw new Error('Gallery unavailable');data=await response.json();
  nodes=data.map(createTile);lens.append(...nodes);$('loadState').hidden=true;resize();
  await new Promise(requestAnimationFrame);
  const visible=[...lens.querySelectorAll('.tile:not([hidden]) .face>img')];
  await Promise.race([Promise.all(visible.map(img=>img.decode().catch(()=>{}))),new Promise(resolve=>setTimeout(resolve,1400))]);
  document.documentElement.classList.replace('is-loading','is-ready');
} catch(error) { $('loadState').textContent='Не удалось загрузить галерею. Обновите страницу.'; console.error(error); document.documentElement.classList.replace('is-loading','is-ready'); }
