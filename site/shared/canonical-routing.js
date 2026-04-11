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

const SECTION_ALIAS_GROUPS = [
  { canonical: 'supplement', aliases: ['suppliments'] },
  { canonical: 'vitamin-mineral', aliases: ['nutri', 'books', 'vitamins', 'minerals', 'nutrient-foods'] },
  { canonical: 'travel', aliases: ['hawaii'] },
  { canonical: 'active-oxygen', aliases: ['freeradical'] },
]

// Left-side (alias) names are authoritative. First definition wins on duplicates.
export const SECTION_ALIASES = Object.freeze(
  SECTION_ALIAS_GROUPS.reduce((acc, group) => {
    for (const alias of group.aliases) {
      if (!acc[alias]) {
        acc[alias] = group.canonical
      }
    }
    return acc
  }, {})
)

// Reverse index is useful when canonical-side entries become the larger maintenance surface.
export const ALIASES_BY_CANONICAL = Object.freeze(
  SECTION_ALIAS_GROUPS.reduce((acc, group) => {
    acc[group.canonical] = [...group.aliases]
    return acc
  }, {})
)

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
