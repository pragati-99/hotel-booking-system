// src/pages/common/Booking.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from "../../utils/axiosConfig";
import PageBanner from '../../components/common/PageBanner';
import toast from 'react-hot-toast';
import Invoice from '../../components/invoice/Invoice';
import PaymentModal from '../../components/modals/PaymentModal';
import "../../styles/booking.css";

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function Booking() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomId = params.get('room');
    if (roomId) {
      setFormData(prev => ({ ...prev, roomId: roomId }));
    }
    fetchAvailableRooms();
    loadRazorpayScript();
  }, [location]);

  const fetchAvailableRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/rooms/available", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(response.data || []);
    } catch (err) {
      setRooms([
        { id: 1, roomNumber: '101', roomType: 'Deluxe King', bedType: 'King', pricePerNight: 89, capacity: 2 },
        { id: 2, roomNumber: '102', roomType: 'Deluxe King', bedType: 'King', pricePerNight: 89, capacity: 2 },
        { id: 3, roomNumber: '103', roomType: 'Twin Room', bedType: 'Twin', pricePerNight: 65, capacity: 2 },
        { id: 4, roomNumber: '105', roomType: 'Suite', bedType: 'King', pricePerNight: 149, capacity: 4 },
        { id: 5, roomNumber: '201', roomType: 'Family Room', bedType: 'Queen', pricePerNight: 99, capacity: 4 },
        { id: 6, roomNumber: '203', roomType: 'Standard Room', bedType: 'Queen', pricePerNight: 55, capacity: 2 },
      ]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'roomId') {
      const room = rooms.find(r => r.id === parseInt(value));
      setSelectedRoom(room);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('✅ Payment successful! Booking confirmed.');
    setShowPayment(false);
    navigate('/my-bookings');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim() || !formData.roomId || !formData.checkIn || !formData.checkOut) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        setLoading(false);
        return;
      }

      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      
      if (nights <= 0) {
        toast.error("Check-out date must be after check-in date");
        setLoading(false);
        return;
      }

      const room = rooms.find(r => r.id === parseInt(formData.roomId));
      if (!room) {
        toast.error("Please select a valid room");
        setLoading(false);
        return;
      }

      // ✅ Calculate total amount correctly
      const totalAmount = room.pricePerNight * nights;
      console.log("💰 Room price:", room.pricePerNight);
      console.log("💰 Nights:", nights);
      console.log("💰 Total Amount:", totalAmount);

      const bookingData = {
        customer: {
          name: formData.name,
          email: formData.email || 'guest@email.com',
          phone: formData.phone
        },
        room: { id: parseInt(formData.roomId) },
        checkInDate: formData.checkIn,
        checkOutDate: formData.checkOut,
        totalNights: nights,
        totalAmount: totalAmount,
        guests: parseInt(formData.guests),
        status: 'pending',
        paymentStatus: 'pending',
        specialRequests: formData.specialRequests
      };

      console.log("📤 Sending booking data:", bookingData);

      const response = await api.post("/bookings", bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("✅ Booking response:", response.data);
      
      const booking = response.data;
      setLastBooking(booking);
      localStorage.setItem("lastBooking", JSON.stringify(booking));
      
      // ✅ Show payment modal
      setShowPayment(true);
      
      // ✅ Reset form
      setFormData({
        name: '', email: '', phone: '', roomId: '',
        checkIn: '', checkOut: '', guests: 1, specialRequests: ''
      });
      setSelectedRoom(null);
      
    } catch (err) {
      console.error("❌ Booking error:", err);
      console.error("❌ Error response:", err.response?.data);
      const errorMsg = err.response?.data?.message || err.response?.data || "Booking failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
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

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <>
      <PageBanner title="Book Your Stay" />
      <section className="booking-section py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="booking-form-wrapper">
                <div className="booking-form-header">
                  <h2>Make a Reservation</h2>
                  <p>Fill in the details below to book your stay.</p>
                  {rooms.length > 0 && (
                    <p className="text-success" style={{ fontSize: '14px' }}>
                      ✅ {rooms.length} rooms available for booking
                    </p>
                  )}
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row g-2">
                    {/* Personal Information */}
                    <div className="col-12">
                      <h6 className="form-section-title">Personal Information</h6>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          className="form-control form-control-sm"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Enter full name"
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control form-control-sm"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          className="form-control form-control-sm"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="col-12">
                      <h6 className="form-section-title">Booking Details</h6>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">Select Room *</label>
                        <select
                          name="roomId"
                          className="form-select form-select-sm"
                          value={formData.roomId}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select a room</option>
                          {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.roomNumber} - {room.roomType} ({formatPrice(room.pricePerNight)}/night)
                            </option>
                          ))}
                        </select>
                        {selectedRoom && (
                          <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                            Capacity: {selectedRoom.capacity} guests | Bed: {selectedRoom.bedType}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">Guests</label>
                        <select
                          name="guests"
                          className="form-select form-select-sm"
                          value={formData.guests}
                          onChange={handleChange}
                          required
                        >
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={num}>
                              {num} Guest{num > 1 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">Check-In</label>
                        <input
                          type="date"
                          name="checkIn"
                          className="form-control form-control-sm"
                          value={formData.checkIn}
                          onChange={handleChange}
                          required
                          min={getTodayDate()}
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">Check-Out</label>
                        <input
                          type="date"
                          name="checkOut"
                          className="form-control form-control-sm"
                          value={formData.checkOut}
                          onChange={handleChange}
                          required
                          min={formData.checkIn || getTodayDate()}
                        />
                      </div>
                    </div>

                    <div className="col-md-8">
                      <div className="form-group">
                        <label className="form-label">Special Requests</label>
                        <input
                          type="text"
                          name="specialRequests"
                          className="form-control form-control-sm"
                          value={formData.specialRequests}
                          onChange={handleChange}
                          placeholder="Any special requirements..."
                        />
                      </div>
                    </div>

                    {/* ✅ Booking Summary - Fixed */}
                    {formData.roomId && formData.checkIn && formData.checkOut && selectedRoom && (
                      <div className="col-12">
                        <div className="booking-summary-compact">
                          <div className="row g-2 align-items-center">
                            <div className="col-md-2 col-6">
                              <small className="text-muted">Room</small>
                              <p className="mb-0 fw-bold" style={{ fontSize: '14px' }}>
                                {selectedRoom?.roomType || 'N/A'}
                              </p>
                            </div>
                            <div className="col-md-2 col-6">
                              <small className="text-muted">Nights</small>
                              <p className="mb-0 fw-bold" style={{ fontSize: '14px' }}>
                                {(() => {
                                  const checkIn = new Date(formData.checkIn);
                                  const checkOut = new Date(formData.checkOut);
                                  return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                                })()}
                              </p>
                            </div>
                            <div className="col-md-3 col-6">
                              <small className="text-muted">Total Amount</small>
                              <p className="mb-0 fw-bold" style={{ fontSize: '16px', color: '#C9A27B' }}>
                                {(() => {
                                  const checkIn = new Date(formData.checkIn);
                                  const checkOut = new Date(formData.checkOut);
                                  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                                  return nights > 0 && selectedRoom ? formatPrice(selectedRoom.pricePerNight * nights) : '₹0';
                                })()}
                              </p>
                            </div>
                            <div className="col-md-5 col-6">
                              <button 
                                type="submit" 
                                className="btn btn-primary w-100"
                                disabled={loading}
                                style={{ padding: '8px 16px', fontSize: '14px' }}
                              >
                                {loading ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Processing...
                                  </>
                                ) : (
                                  'Confirm & Pay'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {(!formData.roomId || !formData.checkIn || !formData.checkOut || !selectedRoom) && (
                      <div className="col-12">
                        <button 
                          type="submit" 
                          className="btn btn-secondary w-100"
                          disabled={loading}
                          style={{ padding: '10px 16px', fontSize: '14px' }}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Processing...
                            </>
                          ) : (
                            'Confirm & Pay'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Payment Modal */}
      {showPayment && lastBooking && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => {
            setShowPayment(false);
            navigate('/my-bookings');
          }}
          booking={lastBooking}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* ✅ Invoice Modal - Only for paid bookings */}
      {showInvoice && lastBooking && lastBooking.paymentStatus === 'paid' && (
        <Invoice 
          booking={lastBooking} 
          onClose={() => {
            setShowInvoice(false);
            navigate('/my-bookings');
          }} 
        />
      )}
    </>
  );
}

export default Booking;