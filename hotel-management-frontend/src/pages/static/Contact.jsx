// src/pages/static/Contact.jsx - Simplified (Only Send Message)
import React, { useState } from "react";
import PageBanner from "../../components/common/PageBanner";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from "react-icons/fa";
import "../../styles/contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/contact", formData);
      toast.success("✅ Message sent successfully! We will get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBanner title="Contact Us" />
      <section className="contact-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className="contact-info-card">
                <h3>Get In Touch</h3>
                <div className="info-item">
                  <FaMapMarkerAlt className="info-icon" />
                  <div>
                    <h5>Address</h5>
                    <p>123 Luxury Lane, Hotel District, City 10001</p>
                  </div>
                </div>
                <div className="info-item">
                  <FaPhone className="info-icon" />
                  <div>
                    <h5>Phone</h5>
                    <p>+91 9876543210</p>
                  </div>
                </div>
                <div className="info-item">
                  <FaEnvelope className="info-icon" />
                  <div>
                    <h5>Email</h5>
                    <p>hotel@example.com</p>
                  </div>
                </div>
                <div className="info-item">
                  <FaClock className="info-icon" />
                  <div>
                    <h5>Working Hours</h5>
                    <p>24/7 Customer Support</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="contact-form-container">
                <h3>Send Us a Message</h3>
                <p className="text-muted">We'll get back to you within 24 hours</p>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Your Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        className="form-control"
                        value={formData.subject}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Message *</label>
                      <textarea
                        name="message"
                        className="form-control"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-secondary w-100 py-3"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Sending...
                          </>
                        ) : (
                          'Send Message'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;