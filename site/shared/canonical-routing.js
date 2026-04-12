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

export const PREFERRED_SECTION_NAMES = Object.freeze(
  SECTION_NAME_GROUPS.map((group) => {
    const preferredSide = resolvePreferredGroupSide(group)
    return preferredSide === 'left' ? group.left[0] : group.right[0]
  })
)
