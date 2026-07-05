// src/pages/guest/Dashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { 
  FaBed, FaCalendarCheck, FaUser, FaSignOutAlt, 
  FaBook, FaClipboardList, FaUserCog, FaHome,
  FaSearch, FaCheckCircle, FaClock, FaRupeeSign,
  FaEnvelope, FaReply, FaEye, FaTimes, FaSpinner,
  FaSync, FaCalendar, FaHourglassHalf, FaCheck,
  FaExclamationTriangle, FaMoneyBillWave
} from "react-icons/fa";
import "../../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [preBookings, setPreBookings] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    availableRooms: 0,
    pendingPreBookings: 0,
    pendingRefunds: 0
  });
  
  const [messages, setMessages] = useState([]);
  const [showMessages, setShowMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isFetching = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    
    if (!token) {
      toast.error("Please login first");
      navigate("/");
      return;
    }
    
    if (role === "ADMIN") {
      navigate("/admin/dashboard");
      return;
    }
    if (role === "RECEPTIONIST") {
      navigate("/receptionist/dashboard");
      return;
    }
    
    setUser({ username, role });
    loadAllData();
    
    // ✅ Refresh every 60 seconds
    intervalRef.current = setInterval(() => {
      loadAllData(true);
    }, 60000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [navigate]);

  const loadAllData = useCallback(async (silent = false) => {
    if (isFetching.current) return;
    isFetching.current = true;

    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // ✅ Fetch all data in parallel
      const [bookingsRes, roomsRes, preBookingsRes, refundsRes, messagesRes] = await Promise.all([
        api.get("/bookings/my-bookings", { headers }),
        api.get("/rooms/available", { headers }),
        api.get("/pre-bookings/my-pre-bookings", { headers }).catch(() => ({ data: [] })),
        api.get("/refunds/my-refunds", { headers }).catch(() => ({ data: [] })),
        api.get("/contact/my-messages", { headers }).catch(() => ({ data: [] }))
      ]);

      const bookings = bookingsRes.data || [];
      const rooms = roomsRes.data || [];
      const preBookingsData = preBookingsRes.data || [];
      const refundsData = refundsRes.data || [];
      const messagesData = messagesRes.data || [];

      setMyBookings(bookings);
      setAvailableRooms(rooms.slice(0, 4));
      setPreBookings(preBookingsData);
      setRefunds(refundsData);
      setMessages(messagesData);

      // ✅ Calculate stats
      const total = bookings.length;
      const active = bookings.filter(b => 
        b.status === 'confirmed' || b.status === 'checked-in'
      ).length;
      const completed = bookings.filter(b => 
        b.status === 'completed'
      ).length;
      const pendingPre = preBookingsData.filter(p => p.status === 'pending').length;
      const pendingRef = refundsData.filter(r => r.status === 'pending').length;
      const unread = messagesData.filter(m => !m.isRead && !m.reply).length;

      setStats({
        totalBookings: total,
        activeBookings: active,
        completedBookings: completed,
        availableRooms: rooms.length,
        pendingPreBookings: pendingPre,
        pendingRefunds: pendingRef
      });
      setUnreadCount(unread);

    } catch (err) {
      if (!silent) {
        toast.error("Failed to load data");
      }
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetching.current = false;
    }
  }, []);

  const handleRefresh = () => {
    loadAllData(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    toast.success("Logged out successfully");
    navigate("/");
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

  const getStatusText = (status) => {
    const statusMap = {
      'confirmed': '✅ Confirmed',
      'pending': '⏳ Pending',
      'cancelled': '❌ Cancelled',
      'checked-in': '🏨 Checked In',
      'completed': '✔️ Completed'
    };
    return statusMap[status] || status;
  };

  const getPaymentBadge = (paymentStatus) => {
    if (paymentStatus === 'paid') {
      return <span className="badge bg-success">✅ Paid</span>;
    }
    return <span className="badge bg-warning text-dark">⏳ Pending</span>;
  };

  const getPreBookingStatusBadge = (status) => {
    const statusMap = {
      'pending': <span className="badge bg-warning text-dark">⏳ Pending</span>,
      'confirmed': <span className="badge bg-success">✅ Confirmed</span>,
      'cancelled': <span className="badge bg-danger">❌ Cancelled</span>
    };
    return statusMap[status] || statusMap['pending'];
  };

  const getRefundStatusBadge = (status) => {
    const statusMap = {
      'pending': <span className="badge bg-warning text-dark">⏳ Pending</span>,
      'approved': <span className="badge bg-success">✅ Approved</span>,
      'rejected': <span className="badge bg-danger">❌ Rejected</span>
    };
    return statusMap[status] || statusMap['pending'];
  };

  const getRefundStatusForBooking = (bookingId) => {
    const refund = refunds.find(r => r.bookingId === bookingId);
    return refund ? refund.status : null;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Bookings", value: stats.totalBookings, icon: <FaCalendarCheck />, iconClass: "blue", link: "/my-bookings" },
    { title: "Active Bookings", value: stats.activeBookings, icon: <FaCheckCircle />, iconClass: "green", link: "/my-bookings" },
    { title: "Available Rooms", value: stats.availableRooms, icon: <FaClock />, iconClass: "orange", link: "/guest/rooms" },
    { title: "Pending Pre-Bookings", value: stats.pendingPreBookings, icon: <FaHourglassHalf />, iconClass: "gold", link: "/pre-booking" },
    { title: "Pending Refunds", value: stats.pendingRefunds, icon: <FaMoneyBillWave />, iconClass: "pink", link: "/my-bookings" },
  ];

  return (
    <div className="dashboard-container">
      <div className="container py-4">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="user-profile-section">
              <div className="user-avatar guest-avatar">
                <FaUser className="avatar-icon" />
              </div>
              <div className="user-info">
                <h2>👋 Welcome, {user?.username || "Guest"}!</h2>
                <p>
                  <span className="badge-role guest">GUEST</span>
                  <span className="user-status">● Online</span>
                  <span className="user-status" style={{ color: '#28a745' }}>
                    ● {new Date().toLocaleTimeString()}
                  </span>
                  {unreadCount > 0 && (
                    <span className="badge bg-danger ms-2">{unreadCount} New Messages</span>
                  )}
                </p>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className="btn btn-outline-secondary me-2 btn-sm" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? <FaSpinner className="spin" /> : <FaSync />}
                <span className="ms-1">Refresh</span>
              </button>
              <button onClick={handleLogout} className="btn btn-outline-danger logout-btn-header">
                <FaSignOutAlt className="me-2" /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-4">
          {statCards.map((card, index) => (
            <div className="col-md-4 col-lg-2-4" key={index}>
              <Link to={card.link} className="stat-card-link" style={{ '--i': index + 1 }}>
                <div className="stat-card">
                  <div className={`stat-icon ${card.iconClass}`}>
                    {card.icon}
                  </div>
                  <div className="stat-info">
                    <h3>{card.value}</h3>
                    <p>{card.title}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* My Pre-Bookings Section */}
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaCalendar className="me-2" />
              My Pre-Bookings
              {stats.pendingPreBookings > 0 && (
                <span className="badge bg-warning text-dark ms-2">{stats.pendingPreBookings} Pending</span>
              )}
            </h5>
            <Link to="/pre-booking" className="btn btn-sm btn-primary">
              New Pre-Booking
            </Link>
          </div>
          <div className="card-body">
            {preBookings.length === 0 ? (
              <div className="text-center py-3 text-muted">
                <p>No pre-bookings yet</p>
                <Link to="/pre-booking" className="btn btn-sm btn-outline-primary">
                  Create Pre-Booking
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Room Type</th>
                      <th>Guests</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preBookings.slice(0, 5).map((preBooking, index) => (
                      <tr key={preBooking.id}>
                        <td>{index + 1}</td>
                        <td>{preBooking.roomType}</td>
                        <td>{preBooking.guests}</td>
                        <td>{formatDate(preBooking.checkInDate)}</td>
                        <td>{formatDate(preBooking.checkOutDate)}</td>
                        <td>{getPreBookingStatusBadge(preBooking.status)}</td>
                        <td>
                          {preBooking.status === 'pending' && (
                            <span className="text-muted small">Waiting for confirmation</span>
                          )}
                          {preBooking.status === 'confirmed' && (
                            <Link to="/booking" className="btn btn-sm btn-success">
                              Book Now
                            </Link>
                          )}
                          {preBooking.status === 'cancelled' && (
                            <span className="text-muted small">Cancelled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preBookings.length > 5 && (
                  <div className="text-center mt-2">
                    <Link to="/pre-booking" className="btn btn-sm btn-outline-primary">
                      View All {preBookings.length} Pre-Bookings
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* My Messages Section */}
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaEnvelope className="me-2" />
              My Messages
              {unreadCount > 0 && (
                <span className="badge bg-danger ms-2">{unreadCount} Unread</span>
              )}
            </h5>
            <Link to="/contact" className="btn btn-sm btn-primary">
              Send New Message
            </Link>
          </div>
          <div className="card-body">
            {messages.length === 0 ? (
              <div className="text-center py-3 text-muted">
                <p>No messages yet</p>
                <Link to="/contact" className="btn btn-sm btn-outline-primary">
                  Send a Message
                </Link>
              </div>
            ) : (
              messages.slice(0, 5).map((msg) => (
                <div key={msg.id} className={`card mb-2 ${!msg.isRead && !msg.reply ? 'border-primary' : ''}`}>
                  <div className="card-body py-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <strong>{msg.subject || 'No Subject'}</strong>
                          {!msg.isRead && !msg.reply && (
                            <span className="badge bg-primary">New</span>
                          )}
                          <small className="text-muted">{formatDate(msg.createdAt)}</small>
                          {msg.reply && (
                            <span className="badge bg-success">Replied ✅</span>
                          )}
                        </div>
                        <p className="mb-1">{msg.message}</p>
                        {msg.reply && (
                          <div className="bg-light p-2 rounded mt-1">
                            <small><strong>Reply:</strong> {msg.reply}</small>
                            <br />
                            <small className="text-muted">Replied on {formatDate(msg.repliedAt)}</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {messages.length > 5 && (
              <div className="text-center mt-2">
                <Link to="/contact" className="btn btn-sm btn-outline-primary">
                  View All {messages.length} Messages
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Available Rooms */}
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">🏠 Available Rooms</h5>
            <Link to="/guest/rooms" className="btn btn-sm btn-primary">View All</Link>
          </div>
          <div className="card-body">
            {availableRooms.length === 0 ? (
              <p className="text-muted text-center py-3">No rooms available</p>
            ) : (
              <div className="row">
                {availableRooms.map((room) => (
                  <div className="col-md-3 col-6 mb-3" key={room.id}>
                    <div className="room-card">
                      <div className="room-number">{room.roomNumber}</div>
                      <div className="room-type">{room.roomType}</div>
                      <div className="room-price">{formatPrice(room.pricePerNight)} <small>/night</small></div>
                      <div className="room-capacity">👤 {room.capacity} guests</div>
                      <Link to={`/booking?room=${room.id}`} className="btn btn-sm btn-primary w-100 mt-2">
                        Book Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Bookings */}
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">📋 My Bookings</h5>
            <Link to="/my-bookings" className="btn btn-sm btn-primary">View All</Link>
          </div>
          <div className="card-body p-0">
            {myBookings.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No bookings yet.</p>
                <Link to="/booking" className="btn btn-primary mt-2">
                  <FaBook className="me-2" /> Book Now
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Room</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Nights</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Refund</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myBookings.slice(0, 5).map((booking) => {
                      const refundStatus = getRefundStatusForBooking(booking.id);
                      return (
                        <tr key={booking.id}>
                          <td>#{booking.bookingNumber || booking.id}</td>
                          <td>{booking.room?.roomType || "N/A"}</td>
                          <td>{booking.checkInDate}</td>
                          <td>{booking.checkOutDate}</td>
                          <td>{booking.totalNights || 1}</td>
                          <td><strong>{formatPrice(booking.totalAmount)}</strong></td>
                          <td>{getPaymentBadge(booking.paymentStatus)}</td>
                          <td>
                            <span className={getStatusBadge(booking.status)}>
                              {getStatusText(booking.status)}
                            </span>
                          </td>
                          <td>
                            {refundStatus ? (
                              getRefundStatusBadge(refundStatus)
                            ) : (
                              <span className="text-muted small">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions mt-4">
          <h4>⚡ Quick Actions</h4>
          <div className="row g-3">
            <div className="col-md-2 col-4">
              <Link to="/booking" className="quick-action-btn">
                <FaBook className="action-icon" />
                <span>Book a Room</span>
              </Link>
            </div>
            <div className="col-md-2 col-4">
              <Link to="/my-bookings" className="quick-action-btn">
                <FaClipboardList className="action-icon" />
                <span>My Bookings</span>
              </Link>
            </div>
            <div className="col-md-2 col-4">
              <Link to="/profile" className="quick-action-btn">
                <FaUserCog className="action-icon" />
                <span>My Profile</span>
              </Link>
            </div>
            <div className="col-md-2 col-4">
              <Link to="/guest/rooms" className="quick-action-btn">
                <FaSearch className="action-icon" />
                <span>Search Rooms</span>
              </Link>
            </div>
            <div className="col-md-2 col-4">
              <Link to="/pre-booking" className="quick-action-btn">
                <FaCalendar className="action-icon" />
                <span>Pre-Booking</span>
              </Link>
            </div>
            <div className="col-md-2 col-4">
              <Link to="/contact" className="quick-action-btn">
                <FaEnvelope className="action-icon" />
                <span>Send Message</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;