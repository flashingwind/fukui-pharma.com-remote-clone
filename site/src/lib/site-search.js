export const normalizeSearchText = text => text.normalize('NFKC').toLocaleLowerCase('ja');

// Treat the search box as ordinary keywords, not as executable query syntax.
export function keywordQuery(text) {
  const words = normalizeSearchText(text).replace(/["\\]/g, ' ').trim().split(/\s+/).filter(Boolean);
  return words.length ? `distance:0 ${words.map(word => `"${word}"`).join(' ')}` : '';
}

export function excerpt(body, query, maxLength = 150) {
  const word = normalizeSearchText(query).split(/\s+/).find(Boolean) || '';
  const position = normalizeSearchText(body).indexOf(word);
  const start = Math.max(0, position - 35);
  return (start ? '…' : '') + body.slice(start, start + maxLength) + (body.length > start + maxLength ? '…' : '');
}
