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

const SECTION_NAME_GROUPS = [
  { left: ['suppliments'], right: ['supplement'] },
  { left: ['nutri', 'books', 'vitamins', 'minerals', 'nutrient-foods'], right: ['vitamin-mineral'] },
  { left: ['hawaii'], right: ['travel'] },
  { left: ['freeradical'], right: ['active-oxygen'] },
]

function resolvePreferredGroupSide(group) {
  // When both sides have the same cardinality, prefer left-side naming.
  if (group.left.length === group.right.length) {
    return 'left'
  }
  return group.left.length > group.right.length ? 'left' : 'right'
}

function resolveCanonicalTarget(group) {
  // For 1:1 pairs, always prefer left-side naming.
  if (group.left.length === 1 && group.right.length === 1) {
    return group.left[0]
  }
  return group.right[0]
}

// Left-side entries are authoritative keys. First definition wins on duplicates.
export const SECTION_ALIASES = Object.freeze(
  SECTION_NAME_GROUPS.reduce((acc, group) => {
    const primaryTarget = resolveCanonicalTarget(group)
    for (const alias of group.left) {
      if (!acc[alias]) {
        acc[alias] = primaryTarget
      }
    }
    for (const canonicalName of group.right) {
      if (!acc[canonicalName]) {
        acc[canonicalName] = primaryTarget
      }
    }
    return acc
  }, {})
)

// Right-side index supports the opposite maintenance direction (many-right or many-left).
export const ALIASES_BY_CANONICAL = Object.freeze(
  SECTION_NAME_GROUPS.reduce((acc, group) => {
    for (const canonicalName of group.right) {
      if (!acc[canonicalName]) {
        acc[canonicalName] = []
      }
      acc[canonicalName].push(...group.left)
    }
    return acc
  }, {})
)

export const PREFERRED_SECTION_NAMES = Object.freeze(
  SECTION_NAME_GROUPS.map((group) => {
    const preferredSide = resolvePreferredGroupSide(group)
    return preferredSide === 'left' ? group.left[0] : group.right[0]
  })
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
