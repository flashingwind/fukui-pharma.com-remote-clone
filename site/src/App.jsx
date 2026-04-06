import { useEffect } from 'react'
import MenuLeft from './components/MenuLeft'
import MarkdownContent from './components/MarkdownContent'
import flowersIndex from './generated/flowersIndex.js'
import './styles/MenuLeft.css'
import './styles/MarkdownContent.css'
import './App.css'

const SITE_URL = 'https://fukui-pharma.com'
const SITE_NAME = '福井薬局'
const CONTENT_DIRS = ['nutrient-foods', 'vitamins', 'minerals', 'atopic', 'flowers', 'travel', 'others', 'publication', 'shop', 'access']
const NUTRIENT_FOOD_SLUGS = new Set([
  'eiyouso', 'ganyuute',
  'aganyuu', 'eganyuu', 'dganyuu', 'bkganyuu', 'cganyuu', 'b1ganyuu', 'b2ganyuu', 'b3ganyuu',
  'b5ganyuu', 'b6ganyuu', 'b12ganyu', 'yousanga', 'biotinga',
  'carugany', 'magganyu', 'karigany', 'aenganyu', 'tetugany', 'douganyu', 'cromugan', 'mangagan',
  'yo-dogan', 'serengan', 'moribuga', 'vanagany', 'senigany', 'keisogan', 'housogan', 'gerumaga',
  'coqganyu', 'colingan', 'inosigan',
])
const SECTION_LABELS = {
  'nutrient-foods': '栄養素を多く含む食品',
  vitamins: 'ビタミン',
  minerals: 'ミネラル',
  atopic: 'アトピー',
  flowers: '花の写真集',
  travel: 'ハワイ旅行',
  others: 'その他',
  publication: '出版',
  shop: '通販',
  access: 'アクセス',
}
const FOOTER_LINKS_LEFT = [
  { href: '/flowers-top', label: '花の写真集' },
  { href: '/travel_top', label: 'ハワイ旅行' },
]
const FOOTER_LINKS_RIGHT = [
  { href: '/eiyou', label: 'ビタミン' },
  { href: '/mineral', label: 'ミネラル' },
  { href: '/mokuzitu', label: '出版' },
  //{ href: '/tyuumon', label: '通販' },
  //{ href: '/access', label: 'アクセス情報' },
]

function ensureMeta(attr, key, content) {
  let element = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function ensureCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

function getPreferredPath(section, slug, isTop) {
  if (isTop) {
    return '/'
  }
  if ((section === 'vitamins' || section === 'minerals') && NUTRIENT_FOOD_SLUGS.has(slug)) {
    return `/nutrient-foods/${slug}`
  }
  if (section) {
    return `/${section}/${slug}`
  }
  return `/${slug}`
}

function buildSeoMeta(section, slug, isTop) {
  const preferredPath = getPreferredPath(section, slug, isTop)
  const canonicalUrl = `${SITE_URL}${preferredPath}`
  const sectionLabel = section ? SECTION_LABELS[section] || section : ''
  const pageTitle = isTop
    ? `${SITE_NAME} | ビタミン・ミネラル情報`
    : `${sectionLabel ? `${sectionLabel} - ` : ''}${slug} | ${SITE_NAME}`
  const description = isTop
    ? '福井薬局の公式サイト。ビタミン・ミネラル・栄養情報、花の写真、旅行記などを掲載。'
    : `福井薬局の${sectionLabel || 'コンテンツ'}ページ（${slug}）。`
  return { pageTitle, description, canonicalUrl }
}

function App() {
  const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '')
  const normalizedPath = rawPath.replace(/\.(htm|html)$/i, '')
  const segments = normalizedPath.split('/').filter(Boolean)
  const section = segments.length > 1 && CONTENT_DIRS.includes(segments[0]) ? segments[0] : null
  const baseSlug = segments.length === 0 ? '' : segments[segments.length - 1]
  const isTop = baseSlug === '' || baseSlug === 'index' || baseSlug === 'index2'
  const contentSlug = baseSlug === 'access' ? 'index' : baseSlug
  const flowersPath = flowersIndex[contentSlug]
  const orderedDirs = section
    ? [section, ...CONTENT_DIRS.filter((dir) => dir !== section)]
    : CONTENT_DIRS
  const candidates = orderedDirs.flatMap((dir) => {
    if (dir === 'flowers' && flowersPath) {
      return [flowersPath, `/content/flowers/${contentSlug}.md`]
    }
    return [`/content/${dir}/${contentSlug}.md`]
  })
  const effectiveSection = section || (CONTENT_DIRS.includes(baseSlug) ? baseSlug : null)

  useEffect(() => {
    const { pageTitle, description, canonicalUrl } = buildSeoMeta(effectiveSection, contentSlug, isTop)
    document.documentElement.lang = 'ja'
    document.title = pageTitle
    ensureMeta('name', 'description', description)
    ensureMeta('property', 'og:type', 'website')
    ensureMeta('property', 'og:site_name', SITE_NAME)
    ensureMeta('property', 'og:title', pageTitle)
    ensureMeta('property', 'og:description', description)
    ensureMeta('property', 'og:url', canonicalUrl)
    ensureMeta('property', 'og:image', `${SITE_URL}/taitorf.gif`)
    ensureMeta('name', 'twitter:card', 'summary')
    ensureMeta('name', 'twitter:title', pageTitle)
    ensureMeta('name', 'twitter:description', description)
    ensureCanonical(canonicalUrl)
  }, [effectiveSection, contentSlug, isTop])

  return (
    <div className="app-shell">
      <MenuLeft />
      <section id="center">
        {isTop ? (
          <MarkdownContent file="/content/others/index.md" />
        ) : (
          <MarkdownContent fileCandidates={candidates} />
        )}
        <footer className="site-footer">
          <div className="footer-title">福井薬局</div>
          <div className="footer-links">
            <ul>
              {FOOTER_LINKS_LEFT.map((item) => (
                <li key={item.href}><a href={item.href}>{item.label}</a></li>
              ))}
            </ul>
            <ul>
              {FOOTER_LINKS_RIGHT.map((item) => (
                <li key={item.href}><a href={item.href}>{item.label}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer-credit">
            (C)2022 Fukui Pharamacy., (C)2012 福井透. 2012/2/12最終更新.
          </div>
        </footer>
      </section>
    </div>
  )
}

export default App
