import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      const response = await fetch('http://localhost:5000/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setStatus('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('Failed to send message.');
      }
    } catch (err) {
      setStatus('Error sending message.');
    }
  };

  // Replace with your real Google Maps API key
  const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE';
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=15&size=600x400&scale=2&maptype=roadmap&markers=color:gold%7C40.7128,-74.0060&key=${GOOGLE_MAPS_API_KEY}`;

  return (
    <section className="contact-section">
      <div className="contact-container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="contact-header"
        >
          <h2 className="contact-subtitle">Get In Touch</h2>
          <h1 className="contact-title">
            Contact <span className="highlight">Us</span>
          </h1>
          <p className="contact-description">
            Have a project in mind or want to discuss potential collaboration? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="contact-content">
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="contact-form-container"
          >
            <h3 className="form-title">
              <FaPaperPlane className="form-icon" />
              Send Us a Message
            </h3>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message" className="form-label">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="form-textarea"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="submit-button"
              >
                Send Message
                <FaPaperPlane className="button-icon" />
              </motion.button>
              {status && <div className="form-status">{status}</div>}
            </form>
            <div className="contact-info">
              <div className="info-item">
                <FaMapMarkerAlt className="info-icon" />
                <span>Police Housing Estate Karshi</span>
              </div>
              <div className="info-item">
                <FaPhone className="info-icon" />
                <span>+234 (814) 740-4826</span>
              </div>
              <div className="info-item">
                <FaEnvelope className="info-icon" />
                <span>printifypro18@gmail.com</span>
              </div>
            </div>
          </motion.div>

          {/* Location Card with Google Map */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="location-card"
          >
            <div className="map-pattern"></div>
            <div className="map-marker">
              <FaMapMarkerAlt className="marker-icon" />
            </div>
            <img
              src={mapUrl}
              alt="Our Location on Map"
              className="google-map-img"
              style={{ width: '100%', borderRadius: 12, margin: '1rem 0' }}
            />
            <div className="location-info">
              <h3 className="location-title">Our Headquarters</h3>
              <p className="location-address">
                123 Golden Avenue, New York<br />
                Open Mon-Fri: 9AM - 6PM
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Contact;