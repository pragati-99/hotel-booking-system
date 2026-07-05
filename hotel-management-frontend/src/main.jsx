// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import { Toaster } from "react-hot-toast";
import "./App.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Toaster 
      position="top-center"
      containerStyle={{
        zIndex: 999999,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          padding: '14px 24px',
          borderRadius: '10px',
          fontSize: '14px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          zIndex: 999999,
        },
        success: {
          duration: 3500,
          style: {
            background: '#28a745',
            color: '#fff',
          },
        },
        error: {
          duration: 4500,
          style: {
            background: '#dc3545',
            color: '#fff',
          },
        },
      }}
    />
    <App />
  </React.StrictMode>
);