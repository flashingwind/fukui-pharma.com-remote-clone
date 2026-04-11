export const VITAMIN_MINERAL_URL_SECTION = 'vitamin-mineral'
export const CANONICAL_CONTENT_SECTIONS = [
  'supplement',
  'vitamin-mineral',
  'active-oxygen',
  'atopic',
  'flowers',
  'travel',
  'others',
  'publication',
  'shop',
  'access',
]

const SECTION_ALIASES = {
  suppliments: 'supplement',
  nutri: 'vitamin-mineral',
  books: 'vitamin-mineral',
  hawaii: 'travel',
  vitamins: 'vitamin-mineral',
  minerals: 'vitamin-mineral',
  'nutrient-foods': 'vitamin-mineral',
  freeradical: 'active-oxygen',
}

export function getCanonicalPathFromAlias(parts) {
  if (!Array.isArray(parts) || parts.length !== 2) {
    return null
  }

  const [section, slug] = parts
  if (section === 'oldcar' && slug === 'oldcar') {
    return '/others/oldcar'
  }

  const mappedSection = SECTION_ALIASES[section]
  if (mappedSection) {
    return `/${mappedSection}/${slug}`
  }

  return null
}
