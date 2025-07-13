import React from 'react';
import { motion } from 'framer-motion';
import { FaAward, FaPalette, FaLightbulb, FaTshirt, FaShippingFast, FaPrint } from 'react-icons/fa';
import './About.css';
import user1 from '../../assets/users/user1.jpg';
import user2 from '../../assets/users/user2.jpg';
import user3 from '../../assets/users/user3.jpeg';
import user4 from '../../assets/users/user4.jpeg';

function About() {
  
  const teamMembers = [
    { name: "Sara Medunjanin", role: "Design Specialist", image: user2 },
    { name: "Meshack Adeoye", role: "Design Manager", image: user1 },
    { name: "Debra Wilfred", role: "Production Lead", image: user3 },
    { name: "Maria Garcia", role: "Customer Service", image: user4 }
  ];

  return (
    <section className="about-section">
      <div className="about-container">
        {/* Decorative elements */}
        <div className="decorative-circle top-left"></div>
        <div className="decorative-circle bottom-right"></div>
        
        <div className="about-grid">
          {/* Left column - Story */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="about-story"
          >
            <div className="gradient-backdrop"></div>
            <div className="story-content">
              <h2 className="section-subtitle">Our Story</h2>
              <h1 className="section-title">
                Bringing <span className="gradient-text">Designs</span> to Life
              </h1>
              <p className="story-description">
                PrintifyPro transforms your creative visions into high-quality printed products. We specialize in printing custom designs on various items and delivering them directly to your customers with premium quality and fast turnaround times.
              </p>
              
              <div className="tag-container">
                <span className="tag">Since 2018</span>
                <span className="tag">Premium Quality</span>
                <span className="tag">Fast Shipping</span>
              </div>
              

            </div>
          </motion.div>
          
          {/* Right column - Features */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="features-container"
          >
            <FeatureCard 
              icon={<FaPrint />}
              title="Premium Printing"
              description="State-of-the-art printing technology that brings your designs to life with vibrant colors and crisp details."
            />
            
            <FeatureCard 
              icon={<FaTshirt />}
              title="Wide Product Range"
              description="From apparel to accessories, we offer a variety of products to showcase your unique designs."
            />
            
            <FeatureCard 
              icon={<FaShippingFast />}
              title="Reliable Delivery"
              description="Fast and secure shipping to ensure your customers receive their custom products promptly."
            />
          </motion.div>
        </div>
        
        {/* Team section */}
        <div className="team-section">
          <div className="team-header">
            <h2 className="section-title">
              Our <span className="gradient-text">Team</span>
            </h2>
            <p className="team-description">
              Dedicated professionals committed to delivering exceptional print quality and customer service.
            </p>
          </div>
          
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <TeamMember 
                key={index}
                member={member}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card">
    <div className="feature-content">
      <div className="feature-icon">
        {icon}
      </div>
      <div>
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description">{description}</p>
      </div>
    </div>
  </div>
);

// Team Member Component
const TeamMember = ({ member, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="team-member"
  >
    <div className="member-image-container">
      <img 
        src={member.image} 
        alt={member.name} 
        className="member-image"
      />
      <div className="image-overlay"></div>
      <div className="gold-line"></div>
    </div>
    <h3 className="member-name">{member.name}</h3>
    <p className="member-role">{member.role}</p>
  </motion.div>
);

export default About;