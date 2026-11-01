import { getCollection } from 'astro:content';
import fs from 'node:fs';
import { plainText, searchDocument } from '../lib/search-content.js';

export const prerender = true;

export async function GET() {
  const collections = ['vitamin-mineral', 'nutrient-foods', 'supplement', 'active-oxygen', 'atopic', 'flowers', 'travel', 'others', 'shop', 'access'] as const;
  const groups = await Promise.all(collections.map(async collection => {
    const entries = await getCollection(collection);
    return entries.map(entry => searchDocument(collection, entry)).filter(Boolean);
  }));
  const home = fs.readFileSync('src/content/index.md', 'utf8');
  const documents = [{ url: '/', title: '福井薬局', body: plainText(home) }, ...groups.flat()];
  return new Response(JSON.stringify(documents), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
