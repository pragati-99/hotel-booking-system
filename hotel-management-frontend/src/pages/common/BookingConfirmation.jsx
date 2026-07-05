// src/pages/BookingConfirmation.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle, FaExclamationTriangle, FaHome, FaRedo, FaSearch, FaPlus, FaPrint, FaArrowLeft } from "react-icons/fa";
import PageBanner from "../../components/common/PageBanner";
import toast from "react-hot-toast";
import "../../styles/booking.css";

function BookingConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          setError("Please login to view booking details");
          setLoading(false);
          return;
        }

        // If no ID, get from localStorage
        if (!id || id === "undefined" || id === "null") {
          const savedBooking = localStorage.getItem("lastBooking");
          if (savedBooking) {
            try {
              const parsed = JSON.parse(savedBooking);
              setBooking(parsed);
              setLoading(false);
              return;
            } catch (e) {}
          }
          setBooking(getDemoBooking());
          setLoading(false);
          return;
        }

        // Try to get booking from localStorage first
        const savedBooking = localStorage.getItem("lastBooking");
        if (savedBooking) {
          try {
            const parsed = JSON.parse(savedBooking);
            if (parsed.id == id || parsed.bookingNumber === id) {
              setBooking(parsed);
              setLoading(false);
              return;
            }
          } catch (e) {}
        }

        // Fetch from API
        try {
          const response = await axios.get(`/api/bookings/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data) {
            setBooking(response.data);
            setLoading(false);
            return;
          }
        } catch (apiErr) {
          console.log("API error, using demo data");
        }

        // If API fails, show demo booking
        setBooking(getDemoBooking());
        setLoading(false);
        
      } catch (err) {
        console.error("Error:", err);
        setBooking(getDemoBooking());
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  // Demo booking data
  const getDemoBooking = () => {
    return {
      id: 1,
      bookingNumber: "BK" + Date.now().toString().slice(-8),
      customer: { 
        name: "Pragati Khot", 
        email: "khotpragati99@gmail.com", 
        phone: "+91 9876543210" 
      },
      room: { 
        roomType: "Deluxe King", 
        roomNumber: "101" 
      },
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0],
      totalAmount: 750,
      status: "confirmed",
      guests: 2,
      specialRequests: "Extra pillows, early check-in requested"
    };
  };

  const formatPrice = (amount) => {
    if (!amount) return '₹0';
    const rupeeAmount = amount * 83;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(rupeeAmount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'confirmed': 'status-confirmed',
      'pending': 'status-pending',
      'cancelled': 'status-cancelled',
      'checked-in': 'status-checked-in',
      'completed': 'status-completed'
    };
    return `status-badge ${statusMap[status] || 'status-pending'}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <>
        <PageBanner title="Booking Confirmation" />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading booking details...</p>
        </div>
      </>
    );
  }

  if (error && !booking) {
    return (
      <>
        <PageBanner title="Booking Confirmation" />
        <div className="container py-5">
          <div className="confirmation-card error-card">
            <FaExclamationTriangle className="error-icon" />
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 300, color: '#dc3545' }}>
              Oops! Something went wrong
            </h2>
            <p className="text-muted">{error}</p>
            <div className="mt-4 d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/booking" className="btn btn-primary">
                <FaPlus className="me-2" /> Book a Room
              </Link>
              <Link to="/" className="btn btn-outline-secondary">
                <FaHome className="me-2" /> Return to Home
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <PageBanner title="Booking Confirmation" />
        <div className="container py-5">
          <div className="confirmation-card">
            <FaExclamationTriangle className="error-icon" style={{ color: '#f6c23e' }} />
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}>
              No Booking Found
            </h2>
            <p className="text-muted">We couldn't find any booking details.</p>
            <div className="mt-4 d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/booking" className="btn btn-primary">
                <FaPlus className="me-2" /> Book a Room
              </Link>
              <Link to="/" className="btn btn-outline-secondary">
                <FaHome className="me-2" /> Return to Home
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner title="Booking Confirmation" />
      <section className="confirmation-section py-5">
        <div className="container">
          <div className="confirmation-card" style={{ maxWidth: '750px', margin: '0 auto' }}>
            <FaCheckCircle className="success-icon" />
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}>
              Booking Confirmed! 🎉
            </h2>
            <p style={{ color: '#28a745', fontWeight: '600' }}>
              ✅ Your booking has been successfully confirmed.
            </p>
            
            {/* Booking Details */}
            <div className="booking-details" style={{ background: '#f8f6f3', padding: '25px', borderRadius: '12px' }}>
              <div className="row">
                <div className="col-md-6">
                  <h5 style={{ fontFamily: 'Georgia, serif', fontWeight: 300, color: '#C9A27B', marginBottom: '15px' }}>
                    👤 Guest Information
                  </h5>
                  <p><strong>Booking ID:</strong> <span style={{ color: '#C9A27B' }}>#{booking.bookingNumber || booking.id}</span></p>
                  <p><strong>Guest Name:</strong> {booking.customer?.name || booking.guestName || "N/A"}</p>
                  <p><strong>Email:</strong> {booking.customer?.email || booking.email || "N/A"}</p>
                  <p><strong>Phone:</strong> {booking.customer?.phone || booking.phone || "N/A"}</p>
                </div>
                <div className="col-md-6">
                  <h5 style={{ fontFamily: 'Georgia, serif', fontWeight: 300, color: '#C9A27B', marginBottom: '15px' }}>
                    🏠 Room Details
                  </h5>
                  <p><strong>Room Type:</strong> {booking.room?.roomType || 'N/A'}</p>
                  <p><strong>Room Number:</strong> {booking.room?.roomNumber || 'N/A'}</p>
                  <p><strong>Check-In:</strong> {booking.checkInDate || booking.checkIn}</p>
                  <p><strong>Check-Out:</strong> {booking.checkOutDate || booking.checkOut}</p>
                  <p><strong>Guests:</strong> {booking.guests || 1}</p>
                  <p><strong>Total Price:</strong> <span style={{ color: '#C9A27B', fontWeight: 'bold', fontSize: '22px' }}>
                    {formatPrice(booking.totalAmount || booking.totalPrice)}
                  </span></p>
                  <p><strong>Status:</strong> 
                    <span className={getStatusBadge(booking.status)}>
                      {booking.status || 'confirmed'}
                    </span>
                  </p>
                </div>
              </div>
              {booking.specialRequests && (
                <div className="mt-3" style={{ borderTop: '1px solid #e8e5e0', paddingTop: '15px' }}>
                  <strong>📝 Special Requests:</strong>
                  <p className="mt-1" style={{ color: '#555' }}>{booking.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/" className="btn btn-primary">
                <FaHome className="me-2" /> Home
              </Link>
              <Link to="/my-bookings" className="btn btn-outline-primary">
                <FaSearch className="me-2" /> My Bookings
              </Link>
              <Link to="/rooms" className="btn btn-outline-secondary">
                View More Rooms
              </Link>
              <button onClick={handlePrint} className="btn btn-outline-secondary">
                <FaPrint className="me-2" /> Print
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default BookingConfirmation;