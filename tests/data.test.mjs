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
