// src/components/booking/PreBooking.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaCalendarCheck, FaClock, FaBell } from "react-icons/fa";
import PageBanner from "../common/PageBanner";
import api from "../../utils/axiosConfig";
import "../../styles/prebooking.css";

function PreBooking() {
  const [formData, setFormData] = useState({
    roomType: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    note: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.roomType || !formData.checkIn || !formData.checkOut) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate dates
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    if (checkOutDate <= checkInDate) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    setLoading(true);
    try {
      console.log("📝 Submitting pre-booking:", formData);
      
      const response = await api.post("/pre-bookings", {
        roomType: formData.roomType,
        guests: parseInt(formData.guests),
        checkInDate: formData.checkIn,
        checkOutDate: formData.checkOut,
        note: formData.note
      });

      console.log("✅ Pre-booking response:", response.data);

      if (response.data.success) {
        toast.success("✅ Pre-booking request submitted successfully!");
        setFormData({
          roomType: "",
          checkIn: "",
          checkOut: "",
          guests: 1,
          note: ""
        });
      } else {
        toast.error(response.data.message || "Failed to submit pre-booking");
      }
    } catch (err) {
      console.error("❌ Pre-booking error:", err);
      console.error("❌ Error response:", err.response?.data);
      
      const errorMsg = err.response?.data?.message || 
                       err.response?.data?.error || 
                       "Failed to submit pre-booking. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBanner title="Pre-Booking" />
      <div className="prebooking-container page-enter">
        <div className="container py-4">
          <div className="prebooking-header page-enter-delay-1">
            <h2>📅 Pre-Booking Request</h2>
            <p>Book your stay in advance</p>
          </div>

          <div className="row">
            <div className="col-lg-8">
              <div className="prebooking-form page-enter-delay-2">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Room Type *</label>
                      <select
                        name="roomType"
                        className="form-select"
                        value={formData.roomType}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Room Type</option>
                        <option value="Deluxe King">Deluxe King</option>
                        <option value="Twin Room">Twin Room</option>
                        <option value="Suite">Suite</option>
                        <option value="Family Room">Family Room</option>
                        <option value="Standard Room">Standard Room</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Number of Guests</label>
                      <select
                        name="guests"
                        className="form-select"
                        value={formData.guests}
                        onChange={handleChange}
                      >
                        {[1,2,3,4,5,6].map(num => (
                          <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Check-In Date *</label>
                      <input
                        type="date"
                        name="checkIn"
                        className="form-control"
                        value={formData.checkIn}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Check-Out Date *</label>
                      <input
                        type="date"
                        name="checkOut"
                        className="form-control"
                        value={formData.checkOut}
                        onChange={handleChange}
                        required
                        min={formData.checkIn || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Special Requests</label>
                      <textarea
                        name="note"
                        className="form-control"
                        rows="3"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="Any special requirements or preferences..."
                      />
                    </div>
                    <div className="col-12">
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100"
                        disabled={loading}
                        style={{ padding: '12px' }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Submitting...
                          </>
                        ) : (
                          'Submit Pre-Booking'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="prebooking-sidebar page-enter-delay-3">
                <div className="info-card">
                  <h4><FaClock /> Why Pre-Book?</h4>
                  <ul>
                    <li>✅ Guaranteed room availability</li>
                    <li>✅ Best price guarantee</li>
                    <li>✅ Free cancellation</li>
                    <li>✅ Priority check-in</li>
                    <li>✅ Special offers & upgrades</li>
                  </ul>
                </div>
                <div className="info-card">
                  <h4><FaBell /> Notifications</h4>
                  <p>You will receive:</p>
                  <ul>
                    <li>📧 Confirmation email</li>
                    <li>📱 SMS reminder</li>
                    <li>🔔 Booking updates</li>
                  </ul>
                </div>
                <Link to="/booking" className="btn btn-primary w-100 text-center">
                  <FaCalendarCheck /> Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PreBooking;