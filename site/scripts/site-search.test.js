import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createIndex, LinearIndex, search } from 'staticseek';
import { plainText, searchDocument } from '../src/lib/search-content.js';
import { normalizeSearchText, keywordQuery } from '../src/lib/site-search.js';

test('archived comments and incomplete pages are excluded from search data', () => {
  assert.equal(plainText('---\ntitle: metadata\n---\n# 鉄\n<!--非公開の注文案内-->\n[本文](/old/) <b>記録</b> &amp; &#x9244;'), '鉄 本文 記録 & 鉄');
  assert.equal(searchDocument('vitamin-mineral', {id:'draft', data:{noindex:true}, body:'# 未完成'}), null);
  assert.deepEqual(searchDocument('flowers', {id:'lycaste/lycasteNew', data:{}, body:'# リカステ\n写真の記録'}), {
    url:'/flowers/lycaste/lycasteNew/', title:'リカステ', body:'リカステ 写真の記録',
  });
});

test('Japanese and width variants match without broad fuzzy matches', async () => {
  const documents = [
    {title:'ビタミンＢ１２', body:'鉄と栄養の記録'},
    {title:'マグネシウム', body:'食品の記録'},
    {title:'カトレア', body:'青い花の写真'},
  ].map(doc => ({title:normalizeSearchText(doc.title),body:normalizeSearchText(doc.body)}));
  const index = createIndex(LinearIndex, documents, {weights:[['title',3],['body',1]]});
  for (const query of ['ビタミンB12', 'ビタミンＢ１２', '鉄']) {
    assert.deepEqual((await search(index, keywordQuery(query))).map(r=>r.id),[0]);
  }
  assert.deepEqual(await search(index,keywordQuery('マグネシュム')),[]);
  assert.deepEqual((await search(index,keywordQuery('花 写真'))).map(r=>r.id),[2]);
  assert.deepEqual(await search(index,keywordQuery('存在しない語句')),[]);
  assert.equal(keywordQuery('" \\ '),'');
});
