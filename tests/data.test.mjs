import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const data=JSON.parse(await readFile(new URL('../gallery.json',import.meta.url),'utf8'));
test('wall has a complete 11 by 9 dataset',()=>assert.equal(data.length,99));
test('all cards have unique IDs, captions and valid HTTPS images',()=>{
 assert.equal(new Set(data.map(x=>x.id)).size,data.length);
 for(const item of data){assert.ok(item.title);assert.ok(item.category);for(const key of ['after','before','full','beforeFull'])assert.equal(new URL(item[key]).protocol,'https:');}
});
test('every interactive HTML target is unique',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size);
 const js=await readFile(new URL('../app.js',import.meta.url),'utf8');for(const m of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(m[1]),`Missing #${m[1]}`);
});

test('hero stays clean and headline is inside the gallery',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.ok(html.indexOf('class="gallery-section"')<html.indexOf('id="headline"'));
 assert.ok(!html.includes('class="bottom-bar"'));assert.ok(!html.includes('class="wall-note"'));assert.ok(!html.includes('class="detail-hint"'));
 const css=await readFile(new URL('../styles.css',import.meta.url),'utf8');assert.ok(css.includes('@keyframes word-resolve'));assert.ok(css.includes('.header.header--visible'));
});
test('only the requested brush word is artwork; other lines are live text',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 const heading=html.match(/<h1\b[\s\S]*?<\/h1>/)[0];assert.equal((heading.match(/<img\b/g)||[]).length,1);assert.ok(heading.includes('assets/identity-lettering.svg'));
 assert.ok(heading.includes('headline-script'));assert.ok(heading.includes('Для ресторанов'));
 assert.ok(!html.includes('INDEPENDENT CREATIVE STUDIO'));
 for(const f of ['condensed','bold']){const css=await readFile(new URL(`../assets/${f}-font.css`,import.meta.url),'utf8');assert.ok(css.includes('data:font/woff2;base64,'));}
});
