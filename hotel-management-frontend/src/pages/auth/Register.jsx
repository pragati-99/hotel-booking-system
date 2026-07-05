// src/pages/auth/Register.jsx - Fixed - Compact & Small
import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/axiosConfig";
import { 
  FaUser, FaLock, FaEnvelope, FaHotel, 
  FaArrowLeft, FaEye, FaEyeSlash, FaPhone, FaTimes
} from "react-icons/fa";
import "../../styles/Login.css";

function Register({ isOpen, onClose, onSwitchToLogin }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    fullName: "",
    phone: ""
  });

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
    
    if (!formData.fullName.trim()) {
      toast.error("❌ Please enter your full name");
      return;
    }
    if (!formData.username.trim() || formData.username.length < 3) {
      toast.error("❌ Username must be at least 3 characters");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("❌ Email is required");
      return;
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      toast.error("❌ Password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("❌ Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        role: "GUEST"
      });
      
      if (response.data.success) {
        toast.success("🎉 Registration successful! Please login.");
        setFormData({
          username: "", password: "", confirmPassword: "",
          email: "", fullName: "", phone: ""
        });
        onClose();
        if (onSwitchToLogin) {
          setTimeout(() => onSwitchToLogin(), 200);
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="register-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="login-header">
          <div className="login-logo">
            <FaHotel className="logo-icon-large" />
          </div>
          <h2>Create Account</h2>
          <p>Join as a Guest</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label>Full Name *</label>
            <div className="input-group">
              <span className="input-icon"><FaUser /></span>
              <input
                type="text"
                name="fullName"
                className="form-control"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Username */}
          <div className="form-group">
            <label>Username *</label>
            <div className="input-group">
              <span className="input-icon"><FaUser /></span>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email Address *</label>
            <div className="input-group">
              <span className="input-icon"><FaEnvelope /></span>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label>Mobile Number</label>
            <div className="input-group">
              <span className="input-icon"><FaPhone /></span>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="Enter mobile number (optional)"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* Password */}
          <div className="form-group">
            <label>Password *</label>
            <div className="input-group">
              <span className="input-icon"><FaLock /></span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
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

          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirm Password *</label>
            <div className="input-group">
              <span className="input-icon"><FaLock /></span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="form-control"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Terms */}
          <div className="form-group">
            <small className="text-muted">By signing up, you agree to our Terms & Conditions</small>
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            className="login-btn register-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Creating...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
          
          {/* Footer */}
          <div className="login-footer">
            <p className="text-muted">Already have an account?</p>
            <button 
              type="button" 
              className="btn btn-outline-secondary w-100 register-link"
              onClick={() => {
                onClose();
                if (onSwitchToLogin) {
                  setTimeout(() => onSwitchToLogin(), 200);
                }
              }}
            >
              <FaArrowLeft className="me-2" /> Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;