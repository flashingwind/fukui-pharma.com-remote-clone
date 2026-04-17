import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FLOWERS_DIR = path.resolve(__dirname, '../content/flowers');
const OUTPUT_FILE = path.resolve(__dirname, '../src/generated/flowersIndex.js');

function getAllFlowerSlugs() {
  const slugMap = {}; // slug => fullPath
  const walk = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (file.endsWith('.md')) {
        const slug = file.replace(/\.md$/, '');
        slugMap[slug] = filePath;
      }
    });
  };
  walk(FLOWERS_DIR);
  return { slugs: Object.keys(slugMap).sort(), slugMap };
}

function extractYear(slug, filePath) {
  // スラッグから年を抽出（例：2007ranten, 2005paphio）
  const slugMatch = slug.match(/^(\d{4})/);
  if (slugMatch) return slugMatch[1];

  // ファイルパスから年を抽出（例：content/flowers/2005/...）
  const pathMatch = filePath.match(/flowers[\/\\](\d{4})[\/\\]/);
  return pathMatch ? pathMatch[1] : null;
}

function generateSets(slugs, slugMap) {
  const sets = {};
  // 既知の2005年ファイル（メニューから確認）
  const flower2005 = new Set(["dendrobiumu", "paphio101", "paphio202", "paphio103", "cattleya1", "cattleya22", "lycaste1", "phalaenopsis", "masdevallia", "kaizyou"]);

  slugs.forEach(slug => {
    const filePath = slugMap[slug];
    let year = extractYear(slug, filePath);

    // 2005年の手動定義をチェック
    if (flower2005.has(slug)) year = '2005';

    if (year) {
      const setName = `FLOWER_${year}`;
      if (!sets[setName]) sets[setName] = [];
      sets[setName].push(slug);
    } else {
      // 年がない場合は FLOWER_EXTRA
      if (!sets.FLOWER_EXTRA) sets.FLOWER_EXTRA = [];
      sets.FLOWER_EXTRA.push(slug);
    }
  });
  return sets;
}

const { slugs: allSlugs, slugMap } = getAllFlowerSlugs();
const sets = generateSets(allSlugs, slugMap);

// flowersIndex用のマップも生成
const indexMap = {};
allSlugs.forEach(slug => {
  const files = fs.readdirSync(FLOWERS_DIR);
  const findFile = (dir) => {
    const dirFiles = fs.readdirSync(dir);
    for (const f of dirFiles) {
      const filePath = path.join(dir, f);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        const found = findFile(filePath);
        if (found) return found;
      } else if (f === `${slug}.md`) {
        return path.relative(path.resolve(__dirname, '../content'), filePath).replace(/\\/g, '/');
      }
    }
    return null;
  };
  const relativePath = findFile(FLOWERS_DIR);
  if (relativePath) {
    indexMap[slug] = `/${relativePath}`;
  }
});

// MenuLeft.jsx用の JavaScript コード生成
const menuLeftCode = Object.entries(sets)
  .map(([setName, slugs]) => `const ${setName} = new Set([${slugs.map(s => `"${s}"`).join(', ')}]);`)
  .join('\n');

// flowersIndex.js 生成
const flowersIndexCode = `const flowersIndex = {
${Object.entries(indexMap)
  .map(([slug, path]) => `  '${slug}': '${path}',`)
  .join('\n')}
};

export default flowersIndex;
`;

// 出力
fs.writeFileSync(OUTPUT_FILE, flowersIndexCode);
console.log(`Generated ${OUTPUT_FILE}`);
console.log('\nFor MenuLeft.jsx, add these lines:');
console.log(menuLeftCode);
