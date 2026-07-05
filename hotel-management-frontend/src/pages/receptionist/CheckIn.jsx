// src/pages/CheckIn.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import PageBanner from "../../components/common/PageBanner";
import { FaSearch, FaCheckCircle, FaUserCheck } from "react-icons/fa";

function CheckIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter confirmed bookings
      const confirmed = response.data.filter(b => 
        b.status === 'confirmed' || b.status === 'pending'
      );
      setBookings(confirmed);
    } catch (err) {
      toast.error("Failed to load bookings");
      // Demo data
      setBookings([
        { id: 1, bookingNumber: 'BK001', customer: { name: 'John Doe' }, room: { roomNumber: '101' }, checkInDate: '2024-06-26', checkOutDate: '2024-06-28', status: 'confirmed' },
        { id: 2, bookingNumber: 'BK002', customer: { name: 'Jane Smith' }, room: { roomNumber: '102' }, checkInDate: '2024-06-26', checkOutDate: '2024-06-29', status: 'confirmed' },
      ]);
    }
  };

  const handleCheckIn = async (bookingId) => {
    if (window.confirm("Are you sure you want to check-in this guest?")) {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        await axios.put(`/api/bookings/${bookingId}/status?status=checked-in`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("✅ Guest checked-in successfully!");
        fetchBookings();
        setSelectedBooking(null);
      } catch (err) {
        toast.error("Failed to check-in guest");
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageBanner title="Check-In Management" />
      <div className="container py-4">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0" style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}>
              <FaUserCheck className="me-2" /> Guest Check-In
              <span className="text-muted ms-2" style={{ fontSize: '14px' }}>
                ({bookings.length} pending check-ins)
              </span>
            </h4>
          </div>
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text"><FaSearch /></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by booking ID, customer name or room..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6 text-end">
                <span className="text-muted">
                  Today: {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Room</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No pending check-ins found
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td><strong>#{booking.bookingNumber || booking.id}</strong></td>
                        <td>{booking.customer?.name || "N/A"}</td>
                        <td>{booking.room?.roomNumber || "N/A"}</td>
                        <td>{booking.checkInDate}</td>
                        <td>{booking.checkOutDate}</td>
                        <td>
                          <span className="status-badge status-confirmed">
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleCheckIn(booking.id)}
                            disabled={loading}
                          >
                            <FaCheckCircle className="me-1" />
                            Check In
                          </button>
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
    </>
  );
}

export default CheckIn;