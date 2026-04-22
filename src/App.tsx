import { useState } from 'react'
import Loader   from './components/Loader'
import Nav      from './components/Nav'
import Hero     from './components/Hero'
import Marquee  from './components/Marquee'
import Projects from './components/Projects'
import About    from './components/About'
import Contact  from './components/Contact'
import Footer   from './components/Footer'

export default function App() {
  const [loaded, setLoaded] = useState(false)


  return (
    <>
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      <div style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}>
        <Nav />
        <Hero ready={loaded} />
        <Marquee />
        <Projects />
        <About />
        <Contact />
        <Footer />
      </div>
    </>
  )
}
