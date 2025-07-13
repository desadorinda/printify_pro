import React from 'react';
import { FaArrowRight, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './FeaturedDesigns.css';

// Import images with proper variable assignments
import gild1 from '../../assets/categories/gilded/gild1.jpeg';
import royal1 from '../../assets/categories/royal/royal1.jpeg';
import art4 from '../../assets/categories/art/art4.jpeg';

function FeaturedDesigns() {
  const navigate = useNavigate();

  const designs = [
    {
      id: 1,
      title: "Gilded Interface",
      description: "Luxurious UI with golden accents on dark velvet backgrounds",
      rating: 5,
      image: gild1,
      tags: ["PREMIUM", "ELEGANT", "LUXURY"],
      route: "gilded" // Added route property
    },
    {
      id: 2,
      title: "Royal Designs",
      description: "Opulent data visualization with gold leaf highlights",
      rating: 4,
      image: royal1,
      tags: ["REGAL", "DARK", "DESIGNS"],
      route: "royal" // Added route property
    },
    {
      id: 3,
      title: "Art Deco Layout",
      description: "Timeless geometric patterns in gold and ebony",
      rating: 5,
      image: art4,
      tags: ["CLASSIC", "1920S", "TIMELESS"],
      route: "art" // Added route property
    }
  ];

  const handleViewDetails = (design) => {
    // Navigate to the specific route with the design ID
    navigate(`/${design.route}/${design.id}`);
  };

  return (
    <section className="featured-section">
      {/* Gold particle background */}
      <div className="gold-particles">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="gold-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: `0 0 ${Math.random() * 15 + 5}px ${Math.random() * 3 + 1}px rgba(212, 175, 55, 0.7)`
            }}
          />
        ))}
      </div>

      <div className="featured-container">
        <div className="featured-header">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="featured-title"
          >
            <span className="gradient-text">
              CURATED DESIGNS
            </span>
            <span className="blinking-cursor">_</span>
          </motion.h2>
          
          <p className="featured-subtitle">
            Discover our exclusive collection of gold-accented masterpieces
          </p>
        </div>

        <div className="designs-grid">
          {designs.map((design) => (
            <DesignCard 
              key={design.id} 
              design={design} 
              onViewDetails={() => handleViewDetails(design)} 
            />
          ))}
        </div>

        <div className="cta-container">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cta-button"
            onClick={() => navigate('/designs')}
          >
            <span className="button-text">EXPLORE COLLECTION</span>
            <span className="button-overlay" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}

const DesignCard = ({ design, onViewDetails }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    whileHover={{ scale: 1.03 }}
    className="design-card"
  >
    {/* Gold border effect */}
    <div className="card-border" />
    
    <div className="card-image-container">
      <img 
        src={design.image} 
        alt={design.title} 
        className="card-image"
        loading="lazy"
      />
      <div className="image-overlay" />
      
      {/* Gold tags */}
      <div className="card-tags">
        {design.tags.map((tag, i) => (
          <span key={i} className="design-tag">
            #{tag}
          </span>
        ))}
      </div>
    </div>
    
    <div className="card-content">
      <div className="card-header">
        <h3 className="card-title">
          {design.title}
        </h3>
        <div className="card-rating">
          <FaStar className="rating-icon" />
          <span>{design.rating}.0</span>
        </div>
      </div>
      
      <p className="card-description">
        {design.description}
      </p>
      
      <button 
        className="card-button"
        onClick={onViewDetails}
      >
        <span className="button-label">VIEW DETAILS</span>
        <FaArrowRight className="button-arrow" />
      </button>
    </div>
    
    {/* Subtle grid overlay */}
    <div className="grid-overlay" />
  </motion.div>
);

export default FeaturedDesigns;