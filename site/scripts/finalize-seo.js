import { finalizeSeo } from './lib/finalize-seo.js';
finalizeSeo(new URL('../dist/', import.meta.url).pathname);
