import MenuLeft from './components/MenuLeft'
import MarkdownContent from './components/MarkdownContent'
import flowersIndex from './generated/flowersIndex.js'
import './styles/MenuLeft.css'
import './styles/MarkdownContent.css'
import './App.css'

const CONTENT_DIRS = ['vitamins', 'minerals', 'atopic', 'flowers', 'travel', 'others', 'publication', 'shop', 'access']
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

function App() {
  const slug = window.location.pathname.replace(/^\/+|\/+$/g, '')
  const normalizedSlug = slug.replace(/\.(htm|html)$/i, '')
  const isTop = normalizedSlug === '' || normalizedSlug === 'index' || normalizedSlug === 'index2'
  const contentSlug = normalizedSlug === 'access' ? 'index' : normalizedSlug
  const flowersPath = flowersIndex[contentSlug]
  const candidates = CONTENT_DIRS.flatMap((dir) => {
    if (dir === 'flowers' && flowersPath) {
      return [flowersPath, `/content/flowers/${contentSlug}.md`]
    }
    return [`/content/${dir}/${contentSlug}.md`]
  })

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
