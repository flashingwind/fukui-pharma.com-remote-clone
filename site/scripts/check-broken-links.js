// check-broken-links.js
// site/content配下の.mdファイル内リンク切れを検出
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.resolve('content');
const IMAGE_DIR = path.resolve('public');
const MARKDOWN_EXT = '.md';
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];

function walkFiles(dir, exts) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkFiles(filePath, exts));
    } else if (exts.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  });
  return results;
}

function extractLinks(md, filePath) {
  const linkPattern = /\]\(([^)]+)\)/g;
  const imgPattern = /!\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  let links = [];
  while ((match = linkPattern.exec(md)) !== null) {
    if (!match[1].startsWith('http') && !match[1].startsWith('mailto:')) {
      links.push({ target: match[1], type: 'link' });
    }
  }
  while ((match = imgPattern.exec(md)) !== null) {
    if (!match[1].startsWith('http') && !match[1].startsWith('mailto:')) {
      links.push({ target: match[1], type: 'image' });
    }
  }
  return links;
}

function fileExists(target, baseDir) {
  // 絶対パス・相対パス両対応
  let absPath = target.startsWith('/')
    ? path.join(baseDir, target)
    : path.resolve(path.dirname(baseDir), target);
  return fs.existsSync(absPath);
}

function main() {
  const mdFiles = walkFiles(CONTENT_DIR, [MARKDOWN_EXT]);
  let brokenLinks = [];
  mdFiles.forEach(mdFile => {
    const content = fs.readFileSync(mdFile, 'utf-8');
    const links = extractLinks(content, mdFile);
    links.forEach(link => {
      let baseDir = link.type === 'image' ? IMAGE_DIR : CONTENT_DIR;
      // 拡張子補完
      let targetPath = link.target;
      if (!path.extname(targetPath)) {
        if (link.type === 'link') targetPath += '.md';
      }
      if (!fileExists(targetPath, baseDir)) {
        brokenLinks.push({
          file: mdFile,
          link: link.target,
          type: link.type
        });
      }
    });
  });
  if (brokenLinks.length === 0) {
    console.log('リンク切れはありません');
  } else {
    console.log('リンク切れ一覧:');
    brokenLinks.forEach(b => {
      console.log(`${b.file} -> ${b.link} [${b.type}]`);
    });
  }
}

if (typeof process !== 'undefined' && process.argv[1] === new URL(import.meta.url).pathname) main();
