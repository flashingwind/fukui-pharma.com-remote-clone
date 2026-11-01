// Search text is derived from the archive; the source documents are never edited.
export function plainText(markdown) {
  return markdown
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp);|&#(?:x[\da-f]+|\d+);/gi, entity => {
      const named = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&nbsp;': ' ' };
      if (named[entity]) return named[entity];
      const code = entity[2].toLowerCase() === 'x' ? parseInt(entity.slice(3, -1), 16) : parseInt(entity.slice(2, -1), 10);
      return code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ' ';
    })
    .replace(/^[\s#>*|+=-]+/gm, ' ')
    .replace(/[`*_]|\{(?:width|height)=[^}]*\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function searchDocument(collection, entry) {
  if (entry.data.noindex || entry.id === 'index') return null;
  const heading = entry.body?.match(/^#{1,3}\s+(.+)/m)?.[1];
  return {
    url: `/${collection}/${entry.id}/`,
    title: plainText(entry.data.title || heading || entry.id),
    body: plainText(entry.body || ''),
  };
}
