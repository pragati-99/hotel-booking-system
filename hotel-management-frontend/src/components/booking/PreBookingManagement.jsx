// src/components/booking/PreBookingManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import toast from 'react-hot-toast';
import { FaCheck, FaTimes, FaSync } from 'react-icons/fa';
import PageBanner from '../common/PageBanner';
import '../../styles/prebooking.css';

function PreBookingManagement({ userRole }) {
  const [preBookings, setPreBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPreBookings();
  }, []);

  const fetchPreBookings = async () => {
    setLoading(true);
    try {
      console.log("📤 Fetching pre-bookings...");
      const response = await api.get('/pre-bookings');
      console.log("📥 Pre-bookings response:", response.data);
      
      setPreBookings(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching pre-bookings:", err);
      console.error("❌ Error response:", err.response?.data);
      
      toast.error(err.response?.data?.message || 'Failed to load pre-bookings');
      setPreBookings([]);
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      console.log(`📝 Updating pre-booking ${id} to ${status}`);
      const response = await api.put(`/pre-bookings/${id}/status`, { status });
      console.log("✅ Update response:", response.data);
      
      toast.success(`Pre-booking ${status} successfully`);
      fetchPreBookings();
    } catch (err) {
      console.error("❌ Error updating status:", err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'cancelled': 'status-cancelled'
    };
    return `status-badge ${statusMap[status] || 'status-pending'}`;
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '⏳ Pending',
      'confirmed': '✅ Confirmed',
      'cancelled': '❌ Cancelled'
    };
    return statusMap[status] || status;
  };

  const filteredPreBookings = filterStatus === 'all' 
    ? preBookings 
    : preBookings.filter(p => p.status === filterStatus);

  if (loading) {
    return (
      <>
        <PageBanner title="Pre-Booking Management" />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner title="Pre-Booking Management" />
      <div className="prebooking-management-container page-enter">
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}>
              📅 Pre-Booking Management
              <span className="text-muted ms-2" style={{ fontSize: '16px' }}>
                ({preBookings.length} requests)
              </span>
            </h2>
            <div className="d-flex gap-2">
              <select 
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="all">All Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="confirmed">✅ Confirmed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
              <button className="btn btn-outline-secondary" onClick={fetchPreBookings}>
                <FaSync /> Refresh
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Room Type</th>
                      <th>Guests</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Note</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPreBookings.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-4 text-muted">
                          No pre-booking requests found
                        </td>
                      </tr>
                    ) : (
                      filteredPreBookings.map((preBooking, index) => (
                        <tr key={preBooking.id} style={{ '--i': index + 1 }} className="table-row-animated">
                          <td>{index + 1}</td>
                          <td>{preBooking.user?.username || 'Guest'}</td>
                          <td>{preBooking.roomType}</td>
                          <td>{preBooking.guests}</td>
                          <td>{preBooking.checkInDate}</td>
                          <td>{preBooking.checkOutDate}</td>
                          <td className="text-truncate" style={{ maxWidth: '120px' }}>
                            {preBooking.note || '-'}
                          </td>
                          <td>
                            <span className={getStatusBadge(preBooking.status)}>
                              {getStatusText(preBooking.status)}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              {preBooking.status === 'pending' && (
                                <>
                                  <button 
                                    className="btn btn-sm btn-success"
                                    onClick={() => updateStatus(preBooking.id, 'confirmed')}
                                    title="Confirm"
                                  >
                                    <FaCheck />
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => updateStatus(preBooking.id, 'cancelled')}
                                    title="Cancel"
                                  >
                                    <FaTimes />
                                  </button>
                                </>
                              )}
                              {preBooking.status !== 'pending' && (
                                <span className="text-muted small">Processed</span>
                              )}
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

export default PreBookingManagement;