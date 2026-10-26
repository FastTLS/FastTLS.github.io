import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
const root = resolve('docs');
function files(dir) { return readdirSync(dir, {withFileTypes:true}).flatMap(e => e.name === '.vitepress' ? [] : e.isDirectory() ? files(resolve(dir,e.name)) : e.name.endsWith('.md') ? [resolve(dir,e.name)] : []); }
const failures=[];
const markdown=files(root);
for (const file of markdown) {
  const text=readFileSync(file,'utf8').replace(/```[\s\S]*?```/g,'');
  for (const m of text.matchAll(/][(]([^ )]+)[)]/g)) {
    const target=m[1].split('#')[0].split('?')[0];
    if (!target || /^(https?:|mailto:|data:)/.test(target)) continue;
    const path=resolve(target.startsWith('/')?root:dirname(file),target.startsWith('/')?target.slice(1):target);
    const candidates=extname(path)?[path]:[path+'.md',resolve(path,'index.md')];
    if(!candidates.some(existsSync))failures.push(`${file}: ${target}`);
  }
}
if(failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Checked local links in ${markdown.length} Markdown pages.`);
