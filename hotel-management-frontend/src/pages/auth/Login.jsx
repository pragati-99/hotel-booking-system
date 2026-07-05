// src/pages/auth/Login.jsx - Complete with Forgot Password
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/axiosConfig";
import {
  FaUser, FaLock, FaHotel, FaArrowRight,
  FaUserPlus, FaEye, FaEyeSlash, FaTimes
} from "react-icons/fa";
import "../../styles/Login.css";
import ForgotPassword from "./ForgotPassword";

function Login({ isOpen, onClose, onSwitchToRegister }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Body scroll lock
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error("❌ Please enter your username or email");
      return;
    }
    if (!formData.password.trim()) {
      toast.error("❌ Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        username: formData.username,
        password: formData.password
      });

      if (response.data.success) {
        const { token, role, username, fullName } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("username", username);
        localStorage.setItem("fullName", fullName || username);

        // Close modal first
        onClose();

        // Show toast after modal is closed
        setTimeout(() => {
          toast.success(`✅ Welcome ${fullName || username}!`);
        }, 300);

        // Redirect based on role
        const roleRoutes = {
          ADMIN: "/admin/dashboard",
          RECEPTIONIST: "/receptionist/dashboard",
          GUEST: "/dashboard"
        };
        navigate(roleRoutes[role] || "/dashboard");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed. Please try again.";
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // ✅ If Forgot Password is open
  if (showForgotPassword) {
    return (
      <ForgotPassword 
        onBackToLogin={() => setShowForgotPassword(false)} 
        onClose={onClose}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="login-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="login-header">
          <div className="login-logo">
            <FaHotel className="logo-icon-large" />
          </div>
          <h2>Welcome Back!</h2>
          <p>Login to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username or Email</label>
            <div className="input-group">
              <span className="input-icon"><FaUser /></span>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="Enter username or email"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-group">
              <span className="input-icon"><FaLock /></span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* ✅ Forgot Password Link */}
          <div className="text-end mt-1 mb-3">
            <button
              type="button"
              className="btn btn-link text-muted p-0"
              style={{ fontSize: '13px', textDecoration: 'none' }}
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Signing in...
              </>
            ) : (
              <>
                Login
                <FaArrowRight className="ms-2" />
              </>
            )}
          </button>

          <div className="login-footer">
            <p className="text-muted">Don't have an account?</p>
            <button
              type="button"
              className="btn btn-outline-primary w-100 register-link"
              onClick={() => {
                onClose();
                if (onSwitchToRegister) {
                  setTimeout(() => onSwitchToRegister(), 200);
                }
              }}
            >
              <FaUserPlus className="me-2" /> Create New Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;