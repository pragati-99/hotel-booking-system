// src/pages/CheckOut.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import PageBanner from "../../components/common/PageBanner";
import { FaSearch, FaDoorOpen } from "react-icons/fa";

function CheckOut() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter checked-in bookings
      const checkedIn = response.data.filter(b => b.status === 'checked-in');
      setBookings(checkedIn);
    } catch (err) {
      toast.error("Failed to load bookings");
      // Demo data
      setBookings([
        { id: 3, bookingNumber: 'BK003', customer: { name: 'Mike Johnson' }, room: { roomNumber: '103' }, checkInDate: '2024-06-25', checkOutDate: '2024-06-26', totalAmount: 540, status: 'checked-in' },
      ]);
    }
  };

  const handleCheckOut = async (bookingId) => {
    if (window.confirm("Are you sure you want to check-out this guest?")) {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        await axios.put(`/api/bookings/${bookingId}/status?status=completed`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("✅ Guest checked-out successfully!");
        fetchBookings();
      } catch (err) {
        toast.error("Failed to check-out guest");
      } finally {
        setLoading(false);
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

  const filteredBookings = bookings.filter(booking =>
    booking.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageBanner title="Check-Out Management" />
      <div className="container py-4">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0" style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}>
              <FaDoorOpen className="me-2" /> Guest Check-Out
              <span className="text-muted ms-2" style={{ fontSize: '14px' }}>
                ({bookings.length} guests currently checked-in)
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
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No guests currently checked-in
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
                        <td><strong>{formatPrice(booking.totalAmount)}</strong></td>
                        <td>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleCheckOut(booking.id)}
                            disabled={loading}
                          >
                            <FaDoorOpen className="me-1" />
                            Check Out
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

export default CheckOut;