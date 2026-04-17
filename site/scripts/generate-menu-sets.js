import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, '../content');

const CONTENT_DIRS = ['vitamin-mineral', 'supplement', 'active-oxygen', 'atopic', 'flowers', 'travel', 'others', 'publication', 'shop', 'access', 'about'];

function getAllSlugsInSection(sectionDir) {
  const slugs = [];
  const walk = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (file.endsWith('.md') && file !== 'index.md') {
        slugs.push(file.replace(/\.md$/, ''));
      }
    });
  };
  if (fs.existsSync(sectionDir)) {
    walk(sectionDir);
  }
  return slugs.sort();
}

function generateMenuCode() {
  const sets = {};

  CONTENT_DIRS.forEach(section => {
    const sectionDir = path.join(CONTENT_DIR, section);
    const slugs = getAllSlugsInSection(sectionDir);

    if (slugs.length === 0) return;

    // セクション内にサブディレクトリがあるか確認
    const hasSubdirs = fs.existsSync(sectionDir) &&
      fs.readdirSync(sectionDir).some(f =>
        fs.statSync(path.join(sectionDir, f)).isDirectory()
      );

    if (hasSubdirs) {
      // サブディレクトリごとにセットを作成
      const subdirs = fs.readdirSync(sectionDir).filter(f =>
        fs.statSync(path.join(sectionDir, f)).isDirectory()
      );

      subdirs.forEach(subdir => {
        const subSlugs = getAllSlugsInSection(path.join(sectionDir, subdir));
        if (subSlugs.length > 0) {
          const setName = `${section.toUpperCase()}_${subdir.toUpperCase()}`;
          sets[setName] = subSlugs;
        }
      });

      // セクション全体のセット
      sets[section.toUpperCase()] = slugs;
    } else {
      // サブディレクトリなし
      sets[section.toUpperCase()] = slugs;
    }
  });

  // JavaScript コード生成
  return Object.entries(sets)
    .map(([setName, slugs]) => {
      // ハイフンをアンダースコアに変換（JS 変数名対応）
      const jsSetName = setName.replace(/-/g, '_');
      const slugList = slugs.map(s => `"${s}"`).join(', ');
      return `const ${jsSetName} = new Set([${slugList}]);`;
    })
    .join('\n');
}

const menuCode = generateMenuCode();
console.log('Generated menu sets:\n');
console.log(menuCode);
console.log('\n\nAdd these to MenuLeft.jsx after line 2 (import statement)');
