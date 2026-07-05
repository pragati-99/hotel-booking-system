// src/components/FlashPromo.jsx
import React from 'react';
import "../../styles/flashpromo.css";

function FlashPromo() {
  return (
    <section className="flash-promo">
      <div className="container">
        <div className="promo-wrapper">
          {/* Left Side */}
          <div className="promo-left">
            <span className="promo-tag">
              FLASH PROMO
            </span>
            <h2>
              All Included
            </h2>
            <p>
              Book now and enjoy our all-inclusive package with premium services. 
              Get the best value with complimentary meals, free WiFi, 
              swimming pool access, and exclusive room service. 
              Limited time offer - book your stay today!
            </p>
            <button>
              VIEW DETAILS
            </button>
          </div>

          {/* Right Side */}
          <div className="promo-right">
            <div className="menu-card">
              <h3>
                Half Board
              </h3>
              <div className="price">
                ₹4,150
              </div>
              <ul>
                <li>✓ Breakfast Included</li>
                <li>✓ Lunch Included</li>
                <li>✓ Free WiFi</li>
                <li>✓ Swimming Pool</li>
                <li>✓ Room Service</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FlashPromo;