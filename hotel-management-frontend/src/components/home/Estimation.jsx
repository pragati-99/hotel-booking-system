// src/components/Estimation.jsx
import React, { useState } from 'react';
import '../../styles/estimation.css';
import { FaPhoneAlt } from 'react-icons/fa';

function Estimation() {
  const [nights, setNights] = useState(1);
  const [persons, setPersons] = useState(1);
  const [accommodation, setAccommodation] = useState('Room');
  const [smoking, setSmoking] = useState('No');

  // Pricing logic in Rupees
  const basePricePerNight = 4565;
  const accommodationPrices = {
    'Room': 0,
    'Suite': 1660,
    'Apartment': 2490,
    'Double': 830
  };
  const smokingPrice = smoking === 'Yes' ? 415 : 0;

  const totalPrice = (basePricePerNight + accommodationPrices[accommodation] + smokingPrice) * nights;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(totalPrice);

  return (
    <section className="estimation-section">
      <div className="container">
        <div className="estimation-wrapper">
          {/* Left Content */}
          <div className="estimation-content">
            <span className="estimation-tag">ESTIMATION</span>
            <h2>Extra Service Cost</h2>
            <p>
              Calculate the total cost of your stay including additional services. 
              Select your accommodation type, number of nights, and preferences 
              to get an accurate estimate. Our transparent pricing ensures 
              you get the best value for your luxury stay.
            </p>
            <div className="direct-line">
              <FaPhoneAlt className="phone-icon" />
              <div>
                <span>Direct Line</span>
                <h4>+91 98765 43210</h4>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="estimation-form">
            <div className="form-row">
              <div className="form-group">
                <label>Number of Nights</label>
                <select value={nights} onChange={(e) => setNights(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} Night{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Type of Accommodation</label>
                <select value={accommodation} onChange={(e) => setAccommodation(e.target.value)}>
                  {['Room', 'Suite', 'Apartment', 'Double'].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Number of Persons</label>
                <select value={persons} onChange={(e) => setPersons(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Smoking</label>
                <div className="smoking-options">
                  <button 
                    className={`smoking-btn ${smoking === 'Yes' ? 'active' : ''}`}
                    onClick={() => setSmoking('Yes')}
                  >
                    Yes
                  </button>
                  <button 
                    className={`smoking-btn ${smoking === 'No' ? 'active' : ''}`}
                    onClick={() => setSmoking('No')}
                  >
                    Not
                  </button>
                </div>
              </div>
            </div>
            <div className="price-display">
              <span className="price-tag">{formattedPrice}</span>
              <span className="price-label">FINAL PRICE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Estimation;