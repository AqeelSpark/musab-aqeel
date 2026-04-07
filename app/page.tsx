import Hero from '@/components/sections/Hero'
import Marquee from '@/components/sections/Marquee'
import About from '@/components/sections/About'
import Work from '@/components/sections/Work'
import Process from '@/components/sections/Process'
import Testimonials from '@/components/sections/Testimonials'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <About />
      <Work />
      <Process />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  )
}
