import MenuLeft from './components/MenuLeft'
import MarkdownContent from './components/MarkdownContent'
import './styles/MenuLeft.css'
import './styles/MarkdownContent.css'
import './App.css'

function App() {
  return (
    <>
      <MenuLeft />
      <section id="center" style={{ marginLeft: 200, padding: 24 }}>
        <h1>サンプルページ</h1>
        <p>左メニューはmid.xhtmをもとにReactで再現しています。</p>
        <MarkdownContent file={"/content/cattleya.md"} />
      </section>
    </>
  )
}

export default App
