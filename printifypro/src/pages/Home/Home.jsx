import { useState } from 'react'
import HeroCarousel from '../../components/HeroCarousel/HeroCarousel'
import FeaturedDesigns from '../../components/FeaturedDesigns/FeaturedDesigns'
import AboutSection from '../../components/About/About'
import ContactSection from '../../components/Contact/Contact'
import Footer from '../../components/Footer/Footer'
import './Home.css'

const Home = ({ user, cartCount, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <div className="floating-elements">
        <span></span>
        <span></span>
      </div>

      
      <main className="home-page">
        <HeroCarousel />
        <FeaturedDesigns />
        <AboutSection />
        <ContactSection />
      </main>
      
      <Footer />
    </>
  )
}

export default Home