// src/components/About.jsx
import React from 'react';
import "../../styles/about.css";
import lobbyImg from "../../assets/images/parallax-11.jpeg";
import roomImg from "../../assets/images/room-3-720x720.jpeg";
import interiorImg from "../../assets/images/room-4-720x720.jpeg";

function About() {
  return (
    <section className="about-section">
      <div className="container">

        <div className="about-wrapper">

          {/* Left Images */}
          <div className="about-images">
            <img
              src={lobbyImg}
              alt="Luxury hotel lobby"
              className="img-one"
            />
            <img
              src={roomImg}
              alt="Elegant hotel room"
              className="img-two"
            />
            <img
              src={interiorImg}
              alt="Modern hotel interior"
              className="img-three"
            />
          </div>

          {/* Right Content */}
          <div className="about-content">
            <span className="mini-title">
              FAMILY RESORT
            </span>

            <h2>
              Best Hotel in
              <br />
              Vacancy Area
            </h2>

            <p>
              Welcome to the finest luxury hotel experience in the city. 
              Our resort offers world-class amenities, breathtaking views, 
              and unmatched hospitality. Whether you're traveling for business 
              or leisure, we ensure a memorable stay with premium services 
              and comfortable accommodations.
            </p>

            <button>
              ABOUT US
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;