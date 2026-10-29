const $ = (id) => document.getElementById(id);
const wall = $('wall'), lens = $('lens'), dialog = $('detailDialog');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let data = [], nodes = [], width = 0, height = 0, cardW = 260, cardH = 173;
let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0, dragging = null, moved = false, selected = 0, lastFocus = null;
const columns = 11, rows = 9;
let filterIndex = 0;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function safeStorageGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
const storedTheme = safeStorageGet('az-theme');
const initialLight = storedTheme === 'light' || (!storedTheme && matchMedia('(prefers-color-scheme: light)').matches);
document.body.classList.toggle('light', initialLight);
function updateThemeLabel() { $('themeButton').setAttribute('aria-label', document.body.classList.contains('light') ? 'Включить тёмную тему' : 'Включить светлую тему'); }
updateThemeLabel();
$('themeButton').addEventListener('click', () => {
  document.body.classList.toggle('light'); updateThemeLabel();
  try { localStorage.setItem('az-theme', document.body.classList.contains('light') ? 'light' : 'dark'); } catch { /* Private browsing */ }
});
function wrap(n, span) { return ((n + span / 2) % span + span) % span - span / 2; }
function render() {
  frame = 0;
  const ease = reduced.matches ? 1 : .095;
  x += (targetX - x) * ease; y += (targetY - y) * ease;
  const gap = cardW * .055, stepX = cardW + gap, stepY = cardH + gap;
  nodes.forEach((el, i) => {
    const row = Math.floor(i / columns), col = i % columns;
    const cx = wrap((col - 5) * stepX + (row % 2 ? stepX / 2 : 0) + x, columns * stepX);
    const cy = wrap((row - 4) * stepY + y, rows * stepY);
    // A soft rectangular lens: full cards at the centre, little thumbnails at the perimeter.
    const horizontal = clamp((width / 2 - Math.abs(cx) - 4) / (cardW * .72), 0, 1);
    const vertical = clamp((height / 2 - Math.abs(cy) - 4) / (cardH * .38), 0, 1);
    const sx = .16 + .84 * (1 - Math.pow(1 - horizontal, 2));
    const sy = .23 + .77 * (1 - Math.pow(1 - vertical, 2));
    const visible = Math.abs(cx) < width / 2 + cardW / 2 && Math.abs(cy) < height / 2 + cardH / 2;
    el.hidden = !visible;
    el.tabIndex = visible && sx > .65 && sy > .65 ? 0 : -1;
    el.classList.toggle('shrunk', sx < .9 || sy < .9);
    el.style.transform = `translate3d(${(cx - cardW * sx / 2).toFixed(2)}px,${(cy - cardH * sy / 2).toFixed(2)}px,0) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
    if (visible && !el.dataset.loaded) {
      el.querySelectorAll('img').forEach(img => { img.src = img.dataset.src; }); el.dataset.loaded = 'true';
    }
  });
  if (Math.abs(targetX - x) + Math.abs(targetY - y) > .1) requestRender();
}
function requestRender() { if (!frame) frame = requestAnimationFrame(render); }
function resize() {
  width = wall.clientWidth; height = wall.clientHeight;
  cardW = width < 600 ? 200 : clamp(width / 5.4, 235, 300); cardH = cardW * 2 / 3;
  lens.style.setProperty('--w', cardW + 'px'); requestRender();
}
function createTile(item, i) {
  const button = document.createElement('button'); button.className = 'tile';
  button.setAttribute('aria-label', `${item.category}: ${item.title}. Открыть сравнение`);
  const card = document.createElement('span'); card.className = 'card';
  const face = document.createElement('span'); face.className = 'face';
  const after = document.createElement('img'); after.alt = ''; after.draggable = false; after.decoding = 'async'; after.dataset.src = item.after; after.style.objectPosition = item.position;
  const reveal = document.createElement('span'); reveal.className = 'reveal';
  const before = document.createElement('img'); before.alt = ''; before.draggable = false; before.decoding = 'async'; before.dataset.src = item.before; before.style.objectPosition = item.position;
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
  button.addEventListener('pointermove', e => { const r = button.getBoundingClientRect(); button.style.setProperty('--u', clamp((e.clientX - r.left) / r.width, 0, 1)); });
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
  if (!moved) { moved=true; wall.classList.add('dragging'); wall.setPointerCapture(e.pointerId); }
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
wall.addEventListener('pointermove', e => {
  if (dragging || reduced.matches || e.pointerType !== 'mouse') return;
  const r=wall.getBoundingClientRect();
  // Offset only a few pixels: the gallery follows the pointer without fighting a pan.
  lens.style.transform=`translate3d(${((e.clientX-r.left-width/2)*-.025).toFixed(2)}px,${((e.clientY-r.top-height/2)*-.025).toFixed(2)}px,0)`;
});
wall.addEventListener('pointerleave',()=> { if(!dragging)lens.style.transform='translate3d(0,0,0)'; });
$('resetButton').addEventListener('click',()=> { targetX=targetY=0;requestRender(); });
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
  const from=nodes[index]?.getBoundingClientRect();
  if (from && !reduced.matches) {
    const to=$('compare').getBoundingClientRect();
    $('compare').animate([{transformOrigin:'0 0',transform:`translate(${from.x-to.x}px,${from.y-to.y}px) scale(${from.width/to.width},${from.height/to.height})`,opacity:.6},{transformOrigin:'0 0',transform:'none',opacity:1}],{duration:460,easing:'cubic-bezier(.22,1,.36,1)'});
  }
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
  nodes=data.map(createTile);lens.append(...nodes);$('count').textContent=data.length;$('loadState').hidden=true;resize();
} catch(error) { $('loadState').textContent='Не удалось загрузить галерею. Обновите страницу.'; console.error(error); }
