import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HeroCarousel.css';

// Import images
import sparkles from '../../assets/hero/sparkles.gif';
import hero3 from '../../assets/hero/hero3.jpg';

const HeroCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const items = [
    {
      title: "Create Your Unique Style",
      description: "Design custom apparel that stands out from the crowd",
      buttonText: "Start Designing",
      link: "/designs",
      image: hero3,
      overlayColor: "rgba(90, 74, 31, 0.6)"
    },
    {
      title: "Premium Quality Products",
      description: "Printed on high-quality materials that last",
      buttonText: "Browse Products",
      link: "/products",
      image: sparkles,
      overlayColor: "rgba(166, 124, 0, 0.6)"
    },
    {
      title: "Fast & Reliable Delivery",
      description: "Get your custom designs in 3-5 business days",
      buttonText: "Order Now",
      link: "/products",
      image: sparkles,
      overlayColor: "rgba(255, 193, 7, 0.5)"
    }
  ];

  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length, isHovered]);

  const goToPrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  return (
    <section 
      className="hero-carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="carousel-track">
        {items.map((item, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === activeIndex ? 'active' : ''}`}
            style={{
              '--overlay-color': item.overlayColor,
              backgroundImage: `url(${item.image})`
            }}
          >
            <div className="slide-content">
              <h2 className="slide-title">
                {item.title}
              </h2>
              <p className="slide-description">
                {item.description}
              </p>
              <Link 
                to={item.link} 
                className="slide-button"
              >
                {item.buttonText}
                <span className="button-arrow">→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="carousel-indicators">
        {items.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <button 
        className="carousel-control prev"
        onClick={goToPrev}
        aria-label="Previous slide"
      >
        <svg viewBox="0 0 24 24">
          <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
        </svg>
      </button>
      <button 
        className="carousel-control next"
        onClick={goToNext}
        aria-label="Next slide"
      >
        <svg viewBox="0 0 24 24">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
      </button>
    </section>
  );
};

export default HeroCarousel;