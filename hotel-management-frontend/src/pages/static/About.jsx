// src/pages/About.jsx
import React from 'react';
import PageBanner from '../../components/common/PageBanner';
import AboutSection from '../../components/home/About';
import "../../styles/about.css";

function About() {
  return (
    <>
      <PageBanner title="About Us" />
      <AboutSection />
    </>
  );
}

export default About;