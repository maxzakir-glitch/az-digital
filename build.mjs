import { readFile, mkdir, writeFile } from 'node:fs/promises';
const root=new URL('./',import.meta.url);
const fontFiles=['assets/condensed-font.css','assets/bold-font.css'];
const [html,css,source,gallery,placeholder,lettering,...fonts]=await Promise.all(['index.html','styles.css','app.js','gallery.json','assets/unavailable.svg','assets/identity-lettering.svg',...fontFiles].map(p=>readFile(new URL(p,root),'utf8')));
const data=JSON.stringify(JSON.parse(gallery)).replaceAll('<','\\u003c');
const app=source.replace("const response=await fetch('gallery.json');if(!response.ok)throw new Error('Gallery unavailable');data=await response.json();",`data=${data};`).replaceAll("'assets/unavailable.svg'",JSON.stringify('data:image/svg+xml,'+encodeURIComponent(placeholder)));
let bundled=html.replace('src="assets/identity-lettering.svg"','src="data:image/svg+xml;base64,'+Buffer.from(lettering).toString('base64')+'"').replace('<link rel="stylesheet" href="styles.css">',`<style>${css}</style>`).replace('<script type="module" src="app.js"></script>',`<script type="module">${app}</script>`);
fontFiles.forEach((path,i)=>bundled=bundled.replace(`<link rel="stylesheet" href="${path}">`,`<style>${fonts[i]}</style>`));
await mkdir(new URL('dist/',root),{recursive:true});await writeFile(new URL('dist/index.html',root),bundled);console.log('Built dist/index.html with live text and self-hosted fonts');
