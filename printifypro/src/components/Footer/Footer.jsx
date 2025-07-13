import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Logo and Description */}
          <div className="footer-column">
            <h3 className="footer-logo">Golden Designs</h3>
            <p className="footer-description">
              Premium digital experiences with luxurious aesthetics.
            </p>
            <div className="social-icons">
              <a href="#" className="social-icon">
                <FaFacebook />
              </a>
              <a href="#" className="social-icon">
                <FaTwitter />
              </a>
              <a href="#" className="social-icon">
                <FaInstagram />
              </a>
              <a href="#" className="social-icon">
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Home</a></li>
              <li><a href="#" className="footer-link">About</a></li>
              <li><a href="#" className="footer-link">Services</a></li>
              <li><a href="#" className="footer-link">Portfolio</a></li>
              <li><a href="#" className="footer-link">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-column">
            <h4 className="footer-title">Services</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">UI/UX Design</a></li>
              <li><a href="#" className="footer-link">Web Development</a></li>
              <li><a href="#" className="footer-link">Brand Identity</a></li>
              <li><a href="#" className="footer-link">Digital Marketing</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-column">
            <h4 className="footer-title">Contact</h4>
            <ul className="footer-contact">
              <li className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>Police Housing Estate Karshi</span>
              </li>
              <li className="contact-item">
                <FaPhone className="contact-icon" />
                <span>+234 (814) 740-4826</span>
              </li>
              <li className="contact-item">
                <FaEnvelope className="contact-icon" />
                <span>printifypro18@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-copyright">
          <p>© {new Date().getFullYear()} Golden Designs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;