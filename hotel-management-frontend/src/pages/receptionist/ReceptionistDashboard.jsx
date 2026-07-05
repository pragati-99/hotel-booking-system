// src/pages/receptionist/ReceptionistDashboard.jsx - Complete
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { 
  FaBed, FaUsers, FaCalendarCheck, FaUserCheck, 
  FaDoorOpen, FaSearch, FaPlus, FaClipboardList,
  FaSignOutAlt, FaUser, FaClock, FaCheckCircle,
  FaSpinner, FaSync, FaEnvelope, FaReply, FaEye,
  FaMoneyBillWave
} from "react-icons/fa";
import "../../styles/dashboard.css";

function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    totalBookings: 0,
    pendingCheckIns: 0,
    activeGuests: 0,
    pendingRefunds: 0
  });
  const [todayBookings, setTodayBookings] = useState([]);
  
  // Messages state
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMessages, setShowMessages] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    
    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    
    setUser({ username, role });
    fetchData();
    fetchMessages();
    
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchMessages = async () => {
    try {
      const response = await api.get("/contact");
      const allMessages = response.data || [];
      setMessages(allMessages);
      const unread = allMessages.filter(m => !m.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/contact/${id}/read`);
      fetchMessages();
      toast.success("Message marked as read");
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const sendReply = async (id) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    try {
      await api.post(`/contact/${id}/reply`, { reply: replyText });
      toast.success("Reply sent successfully!");
      setReplyingTo(null);
      setReplyText("");
      fetchMessages();
    } catch (err) {
      toast.error("Failed to send reply");
    }
  };

  const fetchData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const roomsRes = await api.get("/rooms", { headers });
      const bookingsRes = await api.get("/bookings", { headers });
      const refundsRes = await api.get("/refunds/status/pending").catch(() => ({ data: [] }));
      
      const rooms = roomsRes.data || [];
      const bookings = bookingsRes.data || [];
      
      const today = new Date().toISOString().split('T')[0];
      
      const todayCheckIns = bookings.filter(b => 
        b.checkInDate === today && b.status === 'confirmed'
      );
      
      const todayCheckOuts = bookings.filter(b => 
        b.checkOutDate === today && b.status === 'checked-in'
      );
      
      const pendingCheckIns = bookings.filter(b => 
        b.status === 'confirmed'
      );
      
      const activeGuests = bookings.filter(b => 
        b.status === 'checked-in'
      );
      
      setStats({
        totalRooms: rooms.length,
        availableRooms: rooms.filter(r => r.status === 'available').length,
        todayCheckIns: todayCheckIns.length,
        todayCheckOuts: todayCheckOuts.length,
        totalBookings: bookings.length,
        pendingCheckIns: pendingCheckIns.length,
        activeGuests: activeGuests.length,
        pendingRefunds: refundsRes.data?.length || 0
      });
      
      setTodayBookings([
        ...todayCheckIns.map(b => ({ ...b, type: 'check-in' })),
        ...todayCheckOuts.map(b => ({ ...b, type: 'check-out' }))
      ].sort((a, b) => a.checkInDate > b.checkInDate ? 1 : -1));
      
      setLastUpdated(new Date().toLocaleTimeString());
      
    } catch (err) {
      console.error("Error fetching data:", err);
      if (!silent) {
        toast.error("Failed to load data");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchData(false);
    fetchMessages();
    toast.success("🔄 Refreshing data...");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    toast.success("Logged out successfully");
    navigate("/login");
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

  const getEventBadge = (type) => {
    if (type === 'check-in') {
      return <span className="badge bg-success">✅ Check In</span>;
    }
    return <span className="badge bg-warning">🚪 Check Out</span>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading reception dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Rooms", value: stats.totalRooms, icon: <FaBed />, iconClass: "blue", link: "/rooms" },
    { title: "Available Rooms", value: stats.availableRooms, icon: <FaBed />, iconClass: "green", link: "/rooms" },
    { title: "Today's Check-ins", value: stats.todayCheckIns, icon: <FaUserCheck />, iconClass: "teal", link: "/checkin" },
    { title: "Today's Check-outs", value: stats.todayCheckOuts, icon: <FaDoorOpen />, iconClass: "red", link: "/checkout" },
    { title: "Active Guests", value: stats.activeGuests, icon: <FaUsers />, iconClass: "orange", link: "/checkin" },
    { title: "Pending Check-ins", value: stats.pendingCheckIns, icon: <FaClipboardList />, iconClass: "gold", link: "/checkin" },
    { title: "Pending Refunds", value: stats.pendingRefunds, icon: <FaMoneyBillWave />, iconClass: "pink", link: "/refund-management" },
  ];

  return (
    <div className="dashboard-container">
      <div className="container py-4">
        <div className="dashboard-header">
          <div className="header-content">
            <div className="user-profile-section">
              <div className="user-avatar">
                <FaUser className="avatar-icon" />
              </div>
              <div className="user-info">
                <h2>🛎️ Welcome, {user?.username || "Receptionist"}!</h2>
                <p>
                  <span className="badge-role receptionist">RECEPTIONIST</span>
                  <span className="user-status">● Online</span>
                  <span className="user-status" style={{ color: '#17a2b8' }}>
                    ● {new Date().toLocaleDateString()}
                  </span>
                  {lastUpdated && (
                    <span className="user-status text-muted">
                      ● Last updated: {lastUpdated}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="header-actions d-flex gap-2">
              <button 
                onClick={handleManualRefresh} 
                className="btn btn-outline-secondary btn-sm"
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

        <div className="row g-4">
          {statCards.map((card, index) => (
            <div className="col-lg-4 col-md-6" key={index}>
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

        {/* Messages Section */}
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaEnvelope className="me-2" />
              Customer Messages
              {unreadCount > 0 && (
                <span className="badge bg-danger ms-2">{unreadCount} Unread</span>
              )}
            </h5>
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => {
                setShowMessages(!showMessages);
                if (!showMessages) fetchMessages();
              }}
            >
              {showMessages ? 'Hide' : 'View Messages'}
            </button>
          </div>
          
          {showMessages && (
            <div className="card-body">
              {messages.length === 0 ? (
                <div className="text-center py-3 text-muted">
                  <p>No messages received yet</p>
                </div>
              ) : (
                messages.slice(0, 5).map((msg) => (
                  <div key={msg.id} className={`card mb-2 ${!msg.isRead ? 'border-primary' : ''}`}>
                    <div className="card-body py-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2">
                            <strong>{msg.name}</strong>
                            {!msg.isRead && <span className="badge bg-primary">New</span>}
                            <small className="text-muted">{formatDate(msg.createdAt)}</small>
                          </div>
                          <p className="mb-1 small">{msg.subject || 'No Subject'}</p>
                          <p className="mb-1 text-truncate">{msg.message}</p>
                          {msg.reply && (
                            <div className="bg-light p-1 rounded mt-1">
                              <small><strong>Reply:</strong> {msg.reply}</small>
                              <br />
                              <small className="text-muted">Replied by {msg.repliedBy}</small>
                            </div>
                          )}
                        </div>
                        <div className="d-flex gap-1 ms-2">
                          {!msg.isRead && (
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => markAsRead(msg.id)}
                              title="Mark as Read"
                            >
                              <FaEye size={12} />
                            </button>
                          )}
                          <button 
                            className="btn btn-sm btn-outline-success"
                            onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)}
                            title="Reply"
                          >
                            <FaReply size={12} />
                          </button>
                        </div>
                      </div>
                      {replyingTo === msg.id && (
                        <div className="mt-2">
                          <textarea
                            className="form-control form-control-sm"
                            rows="2"
                            placeholder="Type your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <div className="mt-1 d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => sendReply(msg.id)}
                            >
                              Send Reply
                            </button>
                            <button 
                              className="btn btn-sm btn-secondary"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {messages.length > 5 && (
                <div className="text-center mt-2">
                  <Link to="/contact" className="btn btn-sm btn-outline-primary">
                    View All Messages
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Today's Schedule */}
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">📅 Today's Schedule - {new Date().toLocaleDateString()}</h5>
            <span className="text-muted">{todayBookings.length} events today</span>
          </div>
          <div className="card-body p-0">
            {todayBookings.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <FaClock className="mb-2" size={32} />
                <p>No check-ins or check-outs scheduled for today</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Booking ID</th>
                      <th>Guest</th>
                      <th>Room</th>
                      <th>Event</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayBookings.map((booking, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>#{booking.bookingNumber || booking.id}</td>
                        <td>
                          <strong>{booking.customer?.name || "N/A"}</strong>
                          <br />
                          <small className="text-muted">{booking.customer?.phone || ""}</small>
                        </td>
                        <td>
                          <strong>{booking.room?.roomNumber || "N/A"}</strong>
                          <br />
                          <small className="text-muted">{booking.room?.roomType || ""}</small>
                        </td>
                        <td>{getEventBadge(booking.type)}</td>
                        <td>
                          <span className={getStatusBadge(booking.status)}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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
            <div className="col-md-2 col-6">
              <Link to="/checkin" className="quick-action-btn">
                <FaUserCheck className="action-icon" />
                <span>Check In</span>
              </Link>
            </div>
            <div className="col-md-2 col-6">
              <Link to="/checkout" className="quick-action-btn">
                <FaDoorOpen className="action-icon" />
                <span>Check Out</span>
              </Link>
            </div>
            <div className="col-md-2 col-6">
              <Link to="/bookings/create" className="quick-action-btn">
                <FaPlus className="action-icon" />
                <span>Create Booking</span>
              </Link>
            </div>
            <div className="col-md-2 col-6">
              <Link to="/search-room" className="quick-action-btn">
                <FaSearch className="action-icon" />
                <span>Search Room</span>
              </Link>
            </div>
            <div className="col-md-2 col-6">
              <Link to="/customers/add" className="quick-action-btn">
                <FaUsers className="action-icon" />
                <span>Add Customer</span>
              </Link>
            </div>
            <div className="col-md-2 col-6">
              <Link to="/refund-management" className="quick-action-btn">
                <FaMoneyBillWave className="action-icon" />
                <span>Refund Requests</span>
              </Link>
            </div>
            <div className="col-md-2 col-6">
              <Link to="/bookings" className="quick-action-btn">
                <FaCalendarCheck className="action-icon" />
                <span>All Bookings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceptionistDashboard;