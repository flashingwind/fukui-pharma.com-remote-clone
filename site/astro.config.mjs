import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import fs from 'fs';
import path from 'path';

import sitemap from '@astrojs/sitemap';

// .html付き旧URL → 正規URLへのリダイレクトHTMLを dist/ に生成
// キー: /path/to/page.html  値: /canonical/url/
const HTML_REDIRECT_MAP = {
  '/flowers/phalaenopsis.html':       '/flowers/phalaenopsis/',
  '/flowers/phalaenopsis/phalaenopsis.html': '/flowers/phalaenopsis/phalaenopsis/',
  '/flowers/phalaenopsis4.html':      '/flowers/phalaenopsis4/',
  '/flowers/paphiopedilum.html':      '/flowers/paphiopedilum/',
  '/flowers/kaizyou.html':            '/flowers/kaizyou/',
  '/flowers/cattleya22.html':         '/flowers/cattleya22/',
  '/flowers/lycasteNew.html':         '/flowers/lycasteNew/',
  '/flowers/dendrobiumnew.html':      '/flowers/dendrobiumnew/',
  '/flowers/takasimayabaraten.html':  '/flowers/takasimayabaraten/',
  '/flowers/2006/2006lycaste11.html': '/flowers/2006lycaste11/',
  '/flowers/2007/2007paphE.html':     '/flowers/2007/2007paphE/',
  '/vitamin-mineral/bkganyuu.html':   '/vitamin-mineral/bkganyuu/',
  '/vitamin-mineral/b12ganyu.html':   '/vitamin-mineral/b12ganyu/',
  '/vitamin-mineral/b5ganyuu.html':   '/vitamin-mineral/b5ganyuu/',
  '/vitamin-mineral/coqganyu.html':   '/nutrient-foods/coqganyu/',
  '/vitamin-mineral/aenganyu.html':   '/nutrient-foods/aenganyu/',
  '/vitamin-mineral/yousanga.html':   '/nutrient-foods/yousanga/',
  '/vitamin-mineral/karigany.html':   '/nutrient-foods/karigany/',
  '/vitamin-mineral/keisogan.html':   '/nutrient-foods/keisogan/',
  '/vitamin-mineral/cromugan.html':   '/nutrient-foods/cromugan/',
  '/vitamin-mineral/gerumaga.html':   '/nutrient-foods/gerumaga/',
  '/vitamin-mineral/serensir.html':   '/vitamin-mineral/serensir/',
  '/vitamin-mineral/vitasi3.html':    '/vitamin-mineral/vitasi3/',
  '/vitamin-mineral/shyoyou.html':    '/supplement/shyoyou/',
  '/nutri/eiyou.html':                '/vitamin-mineral/eiyou/',
  '/nutri/serensir.html':             '/vitamin-mineral/serensir/',
  '/nutri/shyoyou.html':              '/supplement/shyoyou/',
  '/atopic/meneki.html':              '/atopic/meneki/',
  '/order.html':                      '/shop/order/',
  '/vitamin-mineral/lipoicacid.html': '/vitamin-mineral/lipoicacid/',
  '/lipoicacid.html':                 '/vitamin-mineral/lipoicacid/',
  '/index2.html':                     '/',
  '/index3.html':                     '/',
  '/skincare.html':                   '/',
  // 今回追加分（flowers サブディレクトリ内の .html）
  '/flowers/dendrobium/kaizyou.html':         '/flowers/kaizyou/',
  '/flowers/cattleya/cattleya1.html':         '/flowers/cattleya/cattleya1/',
  '/flowers/cattleya/cattleya.html':          '/flowers/cattleya/cattleya/',
  '/flowers/cattleya/cattleya22.html':        '/flowers/cattleya/cattleya22/',
  '/flowers/cattleya/cattleyablue.html':      '/flowers/cattleya/cattleyablue/',
  '/flowers/2007/2007catC.html':             '/flowers/2007/2007catC/',
  '/flowers/2007/2007ranten120.html':        '/flowers/2007/2007ranten120/',
  '/flowers/2006/2006cattleya.html':         '/flowers/2006/2006cattleya/',
  '/flowers/others/harubotan16.html':        '/flowers/others/harubotan16/',
  '/flowers/others/masdevallia.html':        '/flowers/others/masdevallia/',
  '/flowers/others/takasimayabaraten.html':  '/flowers/others/takasimayabaraten/',
  '/flowers/paphio/paphiopedilum2.html':     '/flowers/paphio/paphiopedilum2/',
  '/flowers/paphio/paphiopedilum.html':      '/flowers/paphio/paphiopedilum/',
  '/flowers/paphio/paphio101.html':          '/flowers/paphio/paphio101/',
  '/flowers/paphio/paphio103.html':          '/flowers/paphio/paphio103/',
  '/flowers/paphio/paphio202.html':          '/flowers/paphio/paphio202/',
  '/flowers/lycaste/lycasteNew.html':        '/flowers/lycaste/lycasteNew/',
  '/flowers/lycaste/lycaste1.html':          '/flowers/lycaste/lycaste1/',
  '/flowers/dendrobium/dendrobiumnew.html':  '/flowers/dendrobium/dendrobiumnew/',
  '/flowers/dendrobium/dendrobiumu.html':    '/flowers/dendrobium/dendrobiumu/',
  // about
  '/about/fukui2.html':              '/about/fukui2/',
  '/about/fukui3.html':              '/about/fukui3/',
  // others
  '/others/hadautukusisa.html':      '/others/hadautukusisa/',
  '/others/oldcar.html':             '/others/oldcar/',
  '/others/index.html':              '/',
  // travel
  '/travel/mauibus.html':            '/travel/mauibus/',
  '/travel/mauisyokubutu.html':      '/travel/mauisyokubutu/',
  '/travel/hanaumabay.html':         '/travel/hanaumabay/',
  '/travel/wikikibeach.html':        '/travel/wikikibeach/',
  '/travel/mauisunset.html':         '/travel/mauisunset/',
  '/travel/hawaibeach.html':         '/travel/hawaibeach/',
  // supplement（suplement は typo）
  '/suplement/megafudo.html':        '/supplement/megafudo/',
  '/suplement/be-tagur10.html':      '/supplement/be-tagur10/',
  '/suplement/begu.html':            '/supplement/begu/',
  '/shop/tyuumon.html':              '/shop/tyuumon/',
  // vitamin-mineral 追加分
  '/vitamin-mineral/vanagany.html':  '/nutrient-foods/vanagany/',
  '/vitamin-mineral/serengan.html':  '/nutrient-foods/serengan/',
  '/vitamin-mineral/tetugany.html':  '/nutrient-foods/tetugany/',
  '/vitamin-mineral/carugany.html':  '/nutrient-foods/carugany/',
  '/vitamin-mineral/vitasi2.html':   '/vitamin-mineral/vitasi2/',
  '/vitamin-mineral/douganyu.html':  '/nutrient-foods/douganyu/',
  '/vitamin-mineral/eiyou.html':     '/vitamin-mineral/eiyou/',
  '/vitamin-mineral/moribuga.html':  '/nutrient-foods/moribuga/',
  '/vitamin-mineral/b6ganyuu.html':  '/nutrient-foods/b6ganyuu/',
  '/vitamin-mineral/mokuzitu.html':  '/vitamin-mineral/mokuzitu/',
  '/vitamin-mineral/senigany.html':  '/nutrient-foods/senigany/',
  '/vitamin-mineral/housogan.html':  '/nutrient-foods/housogan/',
  // active-oxygen / atopic
  '/active-oxygen/kousanka.html':    '/active-oxygen/kousanka/',
  '/atopic/atopic.html':             '/atopic/atopic/',
  // flowers（大文字小文字違い・追加分）
  '/flowers/paphiopedilum2.html':    '/flowers/paphio/paphiopedilum2/',
  // supliments typo
  '/supliments/be-tagur.html':       '/supplement/be-tagur/',
  '/supliments/be-tagur10.html':     '/supplement/be-tagur10/',
  // nutri/ 追加分
  '/nutri/colingan.html':            '/nutrient-foods/colingan/',
  '/nutri/eganyuu.html':             '/nutrient-foods/eganyuu/',
  '/nutri/vitasi2.html':             '/vitamin-mineral/vitasi2/',
  '/nutri/aensiryou.html':           '/vitamin-mineral/aensiryou/',
  '/nutri/senigany.html':            '/nutrient-foods/senigany/',
  '/nutri/b1ganyuu.html':            '/nutrient-foods/b1ganyuu/',
  '/nutri/b2ganyuu.html':            '/nutrient-foods/b2ganyuu/',
  '/nutri/carugany.html':            '/nutrient-foods/carugany/',
  '/nutri/gerumaga.html':            '/nutrient-foods/gerumaga/',
  '/nutri/bkganyuu.html':            '/nutrient-foods/bkganyuu/',
  '/nutri/douganyu.html':            '/nutrient-foods/douganyu/',
  '/nutri/lipoicacid.html':          '/vitamin-mineral/lipoicacid/',
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