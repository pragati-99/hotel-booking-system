// src/components/PageBanner.jsx
import React from "react";
import "../../styles/pagebanner.css";

function PageBanner({ title }) {
  return (
    <div className="page-banner">
      <div className="page-banner-overlay">
        <div className="container">
          <h1>{title}</h1>
        </div>
      </div>
    </div>
  );
}

export default PageBanner;