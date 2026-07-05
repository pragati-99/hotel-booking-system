// src/components/home/Hero.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../../styles/hero.css";
import hotelVideo from "../../assets/Video/hotel-video.mp4"; // ✅ Import video

function Hero() {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getDay = () => String(currentDate.getDate()).padStart(2, '0');
  const getMonth = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[currentDate.getMonth()];
  };
  const getYear = () => currentDate.getFullYear();

  return (
    <section className="hero">
      {/* ✅ Video Background */}
      <video className="hero-video" autoPlay loop muted playsInline>
        <source src={hotelVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className="hero-overlay">
        <div className="container">
          <div className="hero-content">
            <span className="hero-tag">LUXURY HOTEL & BEST RESORT</span>
            <h1>Enjoy A Luxury<br />Experience</h1>
            <p>
              Discover unparalleled comfort and elegance at our premium hotel.
              Book your stay today and create unforgettable memories.
            </p>
            <Link to="/booking">
              <button className="discover-btn">DISCOVER MORE</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="booking-wrapper">
        <div className="booking-box">
          <div className="booking-item">
            <label>CHECK-IN</label>
            <div className="date-input">
              <span className="date-number">{getDay()}</span>
              <span className="date-month">{getMonth()}</span>
            </div>
            <input type="date" defaultValue={`${getYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${getDay()}`} className="date-hidden" />
          </div>

          <div className="booking-item">
            <label>CHECK-OUT</label>
            <div className="date-input">
              <span className="date-number">{String(Number(getDay()) + 1).padStart(2, '0')}</span>
              <span className="date-month">{getMonth()}</span>
            </div>
            <input type="date" defaultValue={`${getYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(Number(getDay()) + 1).padStart(2, '0')}`} className="date-hidden" />
          </div>

          <div className="booking-item">
            <label>GUESTS</label>
            <select defaultValue="1">
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
              <option value="5">5 Guests</option>
              <option value="6">6 Guests</option>
            </select>
          </div>

          <Link to="/booking" style={{ textDecoration: 'none' }}>
            <button className="availability-btn">CHECK AVAILABILITY</button>
          </Link>
        </div>
      </div>

      {/* Price Badge */}
      <div className="price-badge">
        <span className="price-badge-new">NEW</span>
        <span className="price-badge-amount">54</span>
      </div>
    </section>
  );
}

export default Hero;