import { useEffect, useState } from 'react'
import MenuLeft from './components/MenuLeft'
import MarkdownContent from './components/MarkdownContent'
import './styles/MenuLeft.css'
import './styles/MarkdownContent.css'
import './App.css'

const SITE_URL = 'https://fukui-pharma.com'
const SITE_NAME = '福井薬局'
const CONTENT_DIRS = ['vitamin-mineral', 'supplement', 'active-oxygen', 'atopic', 'flowers', 'travel', 'others', 'publication', 'shop', 'access']
const SECTION_LABELS = {
  'vitamin-mineral': 'ビタミン・ミネラル',
  'active-oxygen': '活性酸素',
  atopic: 'アトピー',
  flowers: '花の写真集',
  travel: 'ハワイ旅行',
  others: 'その他',
  publication: '出版',
  supplement: 'サプリメント',
  shop: '通販',
  access: 'アクセス',
}
const FOOTER_MENU_SECTIONS = [
  { href: '/vitamin-mineral/ganyuute', label: '栄養素を多く含む食品' },
  { href: '/vitamin-mineral/eiyou', label: 'ビタミン・ミネラル' },
  { href: '/active-oxygen/kousanka', label: '活性酸素' },
  { href: '/atopic/atopic', label: 'アトピー・免疫' },
  { href: '/others/hadautukusisa', label: '肌の美しさと栄養' },
  { href: '/vitamin-mineral/mokuzitu', label: '出版' },
  { href: '/flowers/others/harubotan16', label: '花の写真集' },
  { href: '/travel/mauisunset', label: 'ハワイ旅行' },
]

function safeDecodePathname(pathname) {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return pathname
  }
}

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
  if (section) {
    return `/${section}/${slug}`
  }
  return `/${slug}`
}

function buildSeoMeta(section, slug, isTop, headingText) {
  const preferredPath = getPreferredPath(section, slug, isTop)
  const canonicalUrl = `${SITE_URL}${preferredPath}`
  const baseTitleSuffix = '福井薬局 | ビタミン・ミネラル情報'
  const sectionLabel = section ? SECTION_LABELS[section] || section : ''
  const heading = (headingText || '').trim()
  const pageTitle = isTop
    ? baseTitleSuffix
    : `${heading || (sectionLabel ? `${sectionLabel} - ${slug}` : slug)} ${baseTitleSuffix}`
  const description = isTop
    ? '福井薬局の公式サイト。ビタミン・ミネラル・栄養情報、花の写真、旅行記などを掲載。'
    : `福井薬局の${sectionLabel || 'コンテンツ'}ページ（${slug}）。`
  return { pageTitle, description, canonicalUrl }
}

function App() {
  const [seoRobots, setSeoRobots] = useState('index,follow')
  const [seoHeading, setSeoHeading] = useState('')
  const decodedPathname = safeDecodePathname(window.location.pathname)
  const rawPath = decodedPathname.replace(/^\/+|\/+$/g, '')
  const normalizedPath = rawPath.replace(/\.(htm|html)$/i, '')
  const segments = normalizedPath.split('/').filter(Boolean)
  const rawSection = segments.length > 1 ? segments[0] : null
  const section = rawSection && CONTENT_DIRS.includes(rawSection) ? rawSection : null
  const baseSlug = segments.length === 0 ? '' : segments[segments.length - 1]
  const isTop = baseSlug === '' || baseSlug === 'index' || baseSlug === 'index2'
  const seoSlug = baseSlug
  const contentPath = isTop
    ? '/content/index.md'
    : normalizedPath === 'access'
      ? '/content/access/index.md'
      : `/content/${normalizedPath}.md`

  useEffect(() => {
    const { pageTitle, description, canonicalUrl } = buildSeoMeta(section, seoSlug, isTop, seoHeading)
    document.documentElement.lang = 'ja'
    document.title = pageTitle
    ensureMeta('name', 'description', description)
    ensureMeta('name', 'robots', seoRobots)
    ensureMeta('property', 'og:type', 'website')
    ensureMeta('property', 'og:site_name', SITE_NAME)
    ensureMeta('property', 'og:title', pageTitle)
    ensureMeta('property', 'og:description', description)
    ensureMeta('property', 'og:url', canonicalUrl)
    ensureMeta('property', 'og:image', `${SITE_URL}/taitorf.gif`)
    ensureMeta('property', 'og:image:alt', SITE_NAME)
    ensureMeta('name', 'twitter:card', 'summary')
    ensureMeta('name', 'twitter:title', pageTitle)
    ensureMeta('name', 'twitter:description', description)
    ensureMeta('name', 'twitter:image', `${SITE_URL}/taitorf.gif`)
    ensureCanonical(canonicalUrl)
  }, [section, seoSlug, isTop, seoRobots, seoHeading])

  return (
    <div className="app-shell">
      <MenuLeft />
      <section id="center">
        <MarkdownContent
          file={contentPath}
          onResolveStatus={setSeoRobots}
          onResolveHeading={setSeoHeading}
        />
        <footer className="site-footer">
          <div className="footer-title">福井薬局</div>
          <div className="footer-menu-inline" aria-label="Footer navigation">
            {FOOTER_MENU_SECTIONS.map((item, index) => (
              <span key={item.href}>
                {index > 0 ? <span className="footer-separator"> | </span> : null}
                <a href={item.href}>{item.label}</a>
              </span>
            ))}
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
