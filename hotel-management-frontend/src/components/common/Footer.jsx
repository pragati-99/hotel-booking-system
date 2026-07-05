// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import "../../styles/footer.css";
import { FaFacebookF, FaInstagram, FaTwitter, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3>🏨 HOTEL BOOKING</h3>
            <p>
              Luxury Hotel & Resort Experience for modern travelers. 
              Enjoy world-class amenities and unforgettable stays.
            </p>
            <div className="social-icons">
              <FaFacebookF />
              <FaInstagram />
              <FaTwitter />
            </div>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/" style={{ color: '#ccc', textDecoration: 'none' }}>Home</Link></li>
              <li><Link to="/rooms" style={{ color: '#ccc', textDecoration: 'none' }}>Rooms</Link></li>
              <li><Link to="/about" style={{ color: '#ccc', textDecoration: 'none' }}>About</Link></li>
              <li><Link to="/contact" style={{ color: '#ccc', textDecoration: 'none' }}>Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4>Contact Info</h4>
            <p><FaPhone style={{ marginRight: '10px', color: '#c9a27b' }} /> +91 9876543210</p>
            <p><FaEnvelope style={{ marginRight: '10px', color: '#c9a27b' }} /> hotel@example.com</p>
            <p><FaMapMarkerAlt style={{ marginRight: '10px', color: '#c9a27b' }} /> 123 Luxury Lane, Hotel District</p>
          </div>
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '30px 0' }} />

        <div className="copyright">
          © 2026 Hotel Booking. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;