// src/components/RoomService.jsx
import React from 'react';
import "../../styles/roomservice.css";
import towelImg from "../../assets/images/towels-1024x837.png";

function RoomService() {
  return (
    <section className="room-service">
      <div className="service-overlay">
        <div className="container">

          <div className="service-content">
            <span className="service-tag">
              DAILY SANITIZATION
            </span>

            <h2>
              Room Service
            </h2>

            <p>
              Experience the pinnacle of luxury with our 24/7 room service. 
              Our dedicated team ensures your room is impeccably clean, 
              beautifully maintained, and equipped with all modern amenities. 
              From fresh linens to gourmet dining, we cater to your every need.
            </p>

            <div className="payment-icons">
              <div>VISA</div>
              <div>PayPal</div>
              <div>MasterCard</div>
              <div>Stripe</div>
            </div>
          </div>

          <div className="promo-area">
            <div className="promo-circle">
              <span>UP TO</span>
              <h1>50%</h1>
              <p>ON SELECTED ROOMS</p>
            </div>

            <div className="towel-box">
              <img
                src={towelImg}
                alt="Luxury towels"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default RoomService;