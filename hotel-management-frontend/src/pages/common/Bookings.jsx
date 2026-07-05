// src/pages/common/Bookings.jsx - Modern Colorful Design
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { FaPlus, FaTrash, FaEye, FaEdit, FaSearch, FaSync, FaTimes } from "react-icons/fa";
import PageBanner from "../../components/common/PageBanner";
import "../../styles/pages.css";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = "/bookings";
      
      if (filterStatus === "all") {
        url = "/bookings";
      } else if (filterStatus === "pending") {
        url = "/bookings/pending";
      } else if (filterStatus === "cancelled") {
        url = "/bookings/cancelled";
      } else if (filterStatus === "completed") {
        url = "/bookings/completed";
      } else if (filterStatus === "confirmed") {
        url = "/bookings/confirmed";
      }
      
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load bookings");
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await api.delete(`/bookings/${id}`);
        toast.success("Booking cancelled successfully");
        fetchBookings();
      } catch (err) {
        toast.error("Failed to cancel booking");
      }
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
      'confirmed': 'confirmed',
      'pending': 'pending',
      'cancelled': 'cancelled',
      'checked-in': 'checked-in',
      'completed': 'completed'
    };
    return `status-badge-modern ${statusMap[status] || 'pending'}`;
  };

  const filteredBookings = bookings.filter(booking =>
    booking.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <PageBanner title="Booking Management" />
        <div className="page-container">
          <div className="container py-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner title="Booking Management" />
      <div className="page-container">
        <div className="container py-4">
          {/* Header */}
          <div className="page-header-actions">
            <h2>
              All Bookings <span className="count">({bookings.length})</span>
            </h2>
            <Link to="/bookings/create" className="btn-primary-gradient">
              <FaPlus /> Create Booking
            </Link>
          </div>

          {/* Search & Filter */}
          <div className="search-filter-bar">
            <div className="input-group">
              <span className="input-group-text"><FaSearch /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by booking ID, customer or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
                  <FaTimes />
                </button>
              )}
            </div>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="checked-in">Checked In</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="d-flex gap-2">
              <button className="btn-outline-gradient" onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}>
                Clear All
              </button>
              <button className="btn-outline-gradient" onClick={fetchBookings}>
                <FaSync /> Refresh
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Room</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4 text-muted">
                          {searchTerm ? 'No bookings found matching your search' : 'No bookings found'}
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking, index) => (
                        <tr key={booking.id} style={{ '--i': index + 1 }}>
                          <td><strong>#{booking.bookingNumber || booking.id}</strong></td>
                          <td>{booking.customer?.name || "N/A"}</td>
                          <td>{booking.room?.roomNumber || "N/A"}</td>
                          <td>{booking.checkInDate}</td>
                          <td>{booking.checkOutDate}</td>
                          <td><strong>{formatPrice(booking.totalAmount)}</strong></td>
                          <td>
                            <span className={getStatusBadge(booking.status)}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <Link to={`/booking-confirmation/${booking.id}`} className="btn-action view">
                                <FaEye />
                              </Link>
                              <button 
                                className="btn-action delete"
                                onClick={() => cancelBooking(booking.id)}
                                disabled={booking.status === "cancelled"}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Bookings;