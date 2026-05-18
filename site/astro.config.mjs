import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import fs from 'fs';
import path from 'path';

import sitemap from '@astrojs/sitemap';

// .html付き旧URL → 正規URLへのリダイレクトHTMLを dist/ に生成
// パスが変わるものだけ明示。それ以外は .html を除いて / を付けるだけ
const HTML_REDIRECT_EXPLICIT = {
  // パス変換が必要なもの（コレクション移動・フラット化など）
  '/flowers/2006/2006lycaste11.html': '/flowers/2006lycaste11/',
  '/flowers/dendrobium/kaizyou.html': '/flowers/kaizyou/',
  '/flowers/paphiopedilum2.html':     '/flowers/paphio/paphiopedilum2/',
  '/vitamin-mineral/coqganyu.html':   '/nutrient-foods/coqganyu/',
  '/vitamin-mineral/aenganyu.html':   '/nutrient-foods/aenganyu/',
  '/vitamin-mineral/yousanga.html':   '/nutrient-foods/yousanga/',
  '/vitamin-mineral/karigany.html':   '/nutrient-foods/karigany/',
  '/vitamin-mineral/keisogan.html':   '/nutrient-foods/keisogan/',
  '/vitamin-mineral/cromugan.html':   '/nutrient-foods/cromugan/',
  '/vitamin-mineral/gerumaga.html':   '/nutrient-foods/gerumaga/',
  '/vitamin-mineral/vanagany.html':   '/nutrient-foods/vanagany/',
  '/vitamin-mineral/serengan.html':   '/nutrient-foods/serengan/',
  '/vitamin-mineral/tetugany.html':   '/nutrient-foods/tetugany/',
  '/vitamin-mineral/carugany.html':   '/nutrient-foods/carugany/',
  '/vitamin-mineral/douganyu.html':   '/nutrient-foods/douganyu/',
  '/vitamin-mineral/moribuga.html':   '/nutrient-foods/moribuga/',
  '/vitamin-mineral/b6ganyuu.html':   '/nutrient-foods/b6ganyuu/',
  '/vitamin-mineral/senigany.html':   '/nutrient-foods/senigany/',
  '/vitamin-mineral/housogan.html':   '/nutrient-foods/housogan/',
  '/vitamin-mineral/shyoyou.html':    '/supplement/shyoyou/',
  '/nutri/eiyou.html':                '/vitamin-mineral/eiyou/',
  '/nutri/serensir.html':             '/vitamin-mineral/serensir/',
  '/nutri/shyoyou.html':              '/supplement/shyoyou/',
  '/nutri/magsiryou.html':            '/vitamin-mineral/magsiryou/',
  '/nutri/vitasi2.html':              '/vitamin-mineral/vitasi2/',
  '/nutri/aensiryou.html':            '/vitamin-mineral/aensiryou/',
  '/nutri/senigany.html':             '/nutrient-foods/senigany/',
  '/nutri/b1ganyuu.html':             '/nutrient-foods/b1ganyuu/',
  '/nutri/b2ganyuu.html':             '/nutrient-foods/b2ganyuu/',
  '/nutri/carugany.html':             '/nutrient-foods/carugany/',
  '/nutri/gerumaga.html':             '/nutrient-foods/gerumaga/',
  '/nutri/bkganyuu.html':             '/nutrient-foods/bkganyuu/',
  '/nutri/douganyu.html':             '/nutrient-foods/douganyu/',
  '/nutri/lipoicacid.html':           '/vitamin-mineral/lipoicacid/',
  '/nutri/colingan.html':             '/nutrient-foods/colingan/',
  '/nutri/eganyuu.html':              '/nutrient-foods/eganyuu/',
  '/order.html':                      '/shop/order/',
  '/lipoicacid.html':                 '/vitamin-mineral/lipoicacid/',
  '/others/index.html':               '/',
  '/index2.html':                     '/',
  '/index3.html':                     '/',
  '/skincare.html':                   '/',
  // suplement/supliments typo → supplement
  '/suplement/megafudo.html':         '/supplement/megafudo/',
  '/suplement/be-tagur10.html':       '/supplement/be-tagur10/',
  '/suplement/begu.html':             '/supplement/begu/',
  '/supliments/be-tagur.html':        '/supplement/be-tagur/',
  '/supliments/be-tagur10.html':      '/supplement/be-tagur10/',
};

// 単純変換: .html を除いて / を付けるだけのもの
const HTML_SIMPLE_PATHS = [
  '/flowers/phalaenopsis.html',
  '/flowers/phalaenopsis/phalaenopsis.html',
  '/flowers/phalaenopsis4.html',
  '/flowers/paphiopedilum.html',
  '/flowers/kaizyou.html',
  '/flowers/cattleya22.html',
  '/flowers/lycasteNew.html',
  '/flowers/dendrobiumnew.html',
  '/flowers/takasimayabaraten.html',
  '/flowers/2007/2007paphE.html',
  '/flowers/cattleya/cattleya1.html',
  '/flowers/cattleya/cattleya.html',
  '/flowers/cattleya/cattleya22.html',
  '/flowers/cattleya/cattleyablue.html',
  '/flowers/2007/2007catC.html',
  '/flowers/2007/2007ranten120.html',
  '/flowers/2006/2006cattleya.html',
  '/flowers/others/harubotan16.html',
  '/flowers/others/masdevallia.html',
  '/flowers/others/takasimayabaraten.html',
  '/flowers/paphio/paphiopedilum2.html',
  '/flowers/paphio/paphiopedilum.html',
  '/flowers/paphio/paphio101.html',
  '/flowers/paphio/paphio103.html',
  '/flowers/paphio/paphio202.html',
  '/flowers/lycaste/lycasteNew.html',
  '/flowers/lycaste/lycaste1.html',
  '/flowers/dendrobium/dendrobiumnew.html',
  '/flowers/dendrobium/dendrobiumu.html',
  '/about/fukui2.html',
  '/about/fukui3.html',
  '/others/hadautukusisa.html',
  '/others/oldcar.html',
  '/travel/mauibus.html',
  '/travel/mauisyokubutu.html',
  '/travel/hanaumabay.html',
  '/travel/wikikibeach.html',
  '/travel/mauisunset.html',
  '/travel/hawaibeach.html',
  '/shop/tyuumon.html',
  '/vitamin-mineral/bkganyuu.html',
  '/vitamin-mineral/b12ganyu.html',
  '/vitamin-mineral/b5ganyuu.html',
  '/vitamin-mineral/b3ganyuu.html',
  '/vitamin-mineral/serensir.html',
  '/vitamin-mineral/vitasi2.html',
  '/vitamin-mineral/vitasi3.html',
  '/vitamin-mineral/eiyou.html',
  '/vitamin-mineral/mokuzitu.html',
  '/vitamin-mineral/lipoicacid.html',
  '/active-oxygen/kousanka.html',
  '/atopic/meneki.html',
  '/atopic/atopic.html',
];

const HTML_REDIRECT_MAP = {
  ...HTML_REDIRECT_EXPLICIT,
  ...Object.fromEntries(
    HTML_SIMPLE_PATHS.map(p => [p, p.replace(/\.html$/, '/').replace(/\/\/+/, '/')])
  ),
};

function htmlRedirectGenerator() {
  return {
    name: 'html-redirect-generator',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const distDir = dir.pathname.replace(/\/$/, '');
        for (const [htmlPath, targetUrl] of Object.entries(HTML_REDIRECT_MAP)) {
          const filePath = path.join(distDir, htmlPath);
          const fileDir = path.dirname(filePath);
          if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
          fs.writeFileSync(filePath, `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${targetUrl}"><link rel="canonical" href="https://fukui-pharma.com${targetUrl}"></head><body><script>location.replace("${targetUrl}")</script></body></html>`);
        }
      },
    },
  };
}

// Plugin to resolve images from public directory
const resolvePublicImages = {
  name: 'resolve-public-images',
  apply: 'build',
  resolveId(id) {
    // Handle absolute paths like /access/image.jpg
    if (id.match(/^\/[a-z-]+\/.*\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      const filePath = path.join('./public', id);
      if (fs.existsSync(filePath)) {
        return { id, external: true };
      }
      // If file doesn't exist, return external so it doesn't fail
      return { id, external: true };
    }
    return null;
  },
};

export default defineConfig({
  site: 'https://fukui-pharma.com',
  integrations: [react(), sitemap(), htmlRedirectGenerator()],
  output: 'static',
  outDir: './dist',
  publicDir: './public',
  srcDir: './src',
  vite: {
    plugins: [resolvePublicImages],
  },
});