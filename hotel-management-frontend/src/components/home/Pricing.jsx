// src/components/Pricing.jsx
import React from 'react';
import "../../styles/pricing.css";

function Pricing() {
  return (
    <section className="pricing-section">
      <div className="pricing-overlay">
        <div className="container">
          <div className="pricing-title">
            <span>OUR ROOM PRICES</span>
            <h2>The Best Prices</h2>
          </div>

          <div className="pricing-cards">
            <div className="price-card">
              <h3>Single Room</h3>
              <div className="price">
                ₹3,735 <span>/ night</span>
              </div>
              <ul>
                <li>✓ Comfortable single bed</li>
                <li>✓ Free high-speed WiFi</li>
                <li>✓ Air conditioning & heating</li>
                <li>✓ 24/7 room service</li>
              </ul>
              <button>MORE INFO</button>
            </div>

            <div className="price-card featured">
              <div className="featured-badge">
                MOST POPULAR
              </div>
              <h3>Small Suite</h3>
              <div className="price">
                ₹4,565 <span>/ night</span>
              </div>
              <ul>
                <li>✓ Spacious suite with living area</li>
                <li>✓ King-size premium bed</li>
                <li>✓ Complimentary breakfast</li>
                <li>✓ Mini bar & room service</li>
                <li>✓ Premium Services Included</li>
              </ul>
              <button>MORE INFO</button>
            </div>

            <div className="price-card">
              <h3>Apartment</h3>
              <div className="price">
                ₹5,976 <span>/ night</span>
              </div>
              <ul>
                <li>✓ Full apartment with kitchen</li>
                <li>✓ Separate bedroom & living room</li>
                <li>✓ Private balcony with view</li>
                <li>✓ Premium amenities & services</li>
              </ul>
              <button>MORE INFO</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pricing;