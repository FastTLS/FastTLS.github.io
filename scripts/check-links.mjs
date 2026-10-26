import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, extname, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { createMarkdownRenderer } from 'vitepress';

const root = resolve('docs');
const display = file => relative(root, file).split(sep).join('/');
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.name === '.vitepress' ? [] : entry.isDirectory() ? files(resolve(dir, entry.name)) :
      entry.name.endsWith('.md') ? [resolve(dir, entry.name)] : []);
}
const failures = [];
const markdown = files(root);
const renderer = await createMarkdownRenderer(root);
const parsed = new Map(markdown.map(file => {
  const text = readFileSync(file, 'utf8');
  const tokens = renderer.parse(text, { path: file, relativePath: display(file) });
  const ids = new Set(tokens.filter(token => token.type === 'heading_open').map(token => token.attrGet('id')));
  const links = tokens.flatMap(token => token.children ?? []).filter(token => token.type === 'link_open')
    .map(token => token.attrGet('href'));
  return [file, { text, ids, links }];
}));

for (const [file, { links }] of parsed) {
  for (let href of links) {
    if (href.startsWith('https://fasttls.github.io/')) href = new URL(href).pathname + new URL(href).hash;
    if (/^(?:[a-z][\w+.-]*:|\/\/)/i.test(href)) continue;
    const [pathPart, fragment] = href.split('#');
    const target = decodeURIComponent(pathPart.split('?')[0]);
    const path = !target ? file : resolve(target.startsWith('/') ? root : dirname(file), target.replace(/^\//, ''));
    const candidates = extname(path) ? [path] : [path + '.md', resolve(path, 'index.md')];
    const destination = candidates.find(existsSync);
    if (!destination) {
      failures.push(`${display(file)}: missing link ${href}`);
      continue;
    }
    if (fragment && parsed.has(destination) && !parsed.get(destination).ids.has(decodeURIComponent(fragment))) {
      failures.push(`${display(file)}: missing heading ${href}`);
    }
    if (display(file).startsWith('en/') && parsed.has(destination) && !display(destination).startsWith('en/')) {
      failures.push(`${display(file)}: English link leaves locale: ${href}`);
    }
  }
}

const manifest = JSON.parse(readFileSync('translations.json', 'utf8'));
if (manifest.schema !== 1 || !Array.isArray(manifest.pages)) throw Error('Invalid translations manifest');
const declared = new Set();
const digest = text => createHash('sha256').update(text.replace(/\r\n/g, '\n')).digest('hex');
for (const page of manifest.pages) {
  if (page.english !== `en/${page.chinese}`) failures.push(`Invalid language pair: ${page.chinese}`);
  for (const [name, expected] of [[page.chinese, page.chinese_sha256], [page.english, page.english_sha256]]) {
    const file = resolve(root, name);
    if (declared.has(file)) failures.push(`Duplicate language entry: ${name}`);
    declared.add(file);
    if (!parsed.has(file)) failures.push(`Missing language page: ${name}`);
    else if (digest(parsed.get(file).text) !== expected) failures.push(`Translation review is stale: ${name}`);
  }
}
for (const file of markdown) if (!declared.has(file)) failures.push(`Page has no reviewed language pair: ${display(file)}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Checked links, headings, and translation freshness in ${markdown.length} pages (${manifest.pages.length} language pairs).`);
