// src/pages/guest/MyBookings.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import PageBanner from "../../components/common/PageBanner";
import Invoice from "../../components/invoice/Invoice";
import RefundRequestModal from "../../components/refund/RefundRequestModal";
import { FaEye, FaTimes } from "react-icons/fa";
import "../../styles/bookings.css";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedBookingForRefund, setSelectedBookingForRefund] = useState(null);
  const [refundStatus, setRefundStatus] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }
    fetchBookings();
    fetchRefundStatus();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/bookings/my-bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data || []);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load bookings");
      setLoading(false);
    }
  };

  const fetchRefundStatus = async () => {
    try {
      const response = await api.get("/refunds/my-refunds");
      const refunds = response.data || [];
      const statusMap = {};
      refunds.forEach(refund => {
        statusMap[refund.bookingId] = refund.status;
      });
      setRefundStatus(statusMap);
    } catch (err) {
      console.error("Failed to fetch refund status:", err);
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

  const getPaymentBadge = (paymentStatus) => {
    if (paymentStatus === 'paid') {
      return <span className="status-badge status-confirmed">✅ Paid</span>;
    }
    return <span className="status-badge status-pending">⏳ Pending</span>;
  };

  const getRefundStatusBadge = (status) => {
    if (!status) return null;
    const statusMap = {
      'pending': <span className="status-badge status-pending">⏳ Refund Pending</span>,
      'approved': <span className="status-badge status-confirmed">✅ Refund Approved</span>,
      'rejected': <span className="status-badge status-cancelled">❌ Refund Rejected</span>
    };
    return statusMap[status] || null;
  };

  const viewInvoice = (booking) => {
    setSelectedBooking(booking);
    setShowInvoice(true);
  };

  const handleRefundRequest = (booking) => {
    setSelectedBookingForRefund(booking);
    setShowRefundModal(true);
  };

  const handleRefundSuccess = () => {
    fetchBookings();
    fetchRefundStatus();
  };

  const canRequestRefund = (booking) => {
    const status = booking.status;
    const refundStat = refundStatus[booking.id];
    // Can request refund if booking is confirmed/pending and no refund already requested
    return (status === 'confirmed' || status === 'pending' || status === 'checked-in') && !refundStat;
  };

  if (loading) {
    return (
      <>
        <PageBanner title="My Bookings" />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner title="My Bookings" />
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}>
            My Bookings
            <span className="text-muted ms-2" style={{ fontSize: '16px' }}>
              ({bookings.length} bookings)
            </span>
          </h2>
          <Link to="/booking" className="btn btn-primary">
            Book New Room
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-5">
            <h5 className="text-muted">No bookings found</h5>
            <p className="text-muted">Start your first booking today!</p>
            <Link to="/booking" className="btn btn-primary mt-3">
              Book Now
            </Link>
          </div>
        ) : (
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Room</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Nights</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Refund</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td><strong>#{booking.bookingNumber || booking.id}</strong></td>
                        <td>{booking.room?.roomType || "N/A"}</td>
                        <td>{booking.checkInDate}</td>
                        <td>{booking.checkOutDate}</td>
                        <td>{booking.totalNights}</td>
                        <td><strong>{formatPrice(booking.totalAmount)}</strong></td>
                        <td>{getPaymentBadge(booking.paymentStatus)}</td>
                        <td>
                          <span className={getStatusBadge(booking.status)}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          {getRefundStatusBadge(refundStatus[booking.id])}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => viewInvoice(booking)}
                              title="View Invoice"
                            >
                              <FaEye />
                            </button>
                            {canRequestRefund(booking) && (
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRefundRequest(booking)}
                                title="Request Refund"
                              >
                                <FaTimes /> Refund
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {showInvoice && selectedBooking && (
        <Invoice 
          booking={selectedBooking} 
          onClose={() => {
            setShowInvoice(false);
            setSelectedBooking(null);
          }} 
        />
      )}

      {showRefundModal && selectedBookingForRefund && (
        <RefundRequestModal
          isOpen={showRefundModal}
          onClose={() => {
            setShowRefundModal(false);
            setSelectedBookingForRefund(null);
          }}
          booking={selectedBookingForRefund}
          onSuccess={handleRefundSuccess}
        />
      )}
    </>
  );
}

export default MyBookings;