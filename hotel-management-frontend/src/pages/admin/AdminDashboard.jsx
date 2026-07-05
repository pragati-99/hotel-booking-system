// src/pages/admin/AdminDashboard.jsx - Add Messages Section Only
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import {
  FaBed, FaUsers, FaCalendarCheck, FaUserTie,
  FaCar, FaEnvelope, FaMoneyBillWave, FaClock,
  FaCheckCircle, FaSpinner, FaSync, FaReply, FaEye, FaTrash
} from "react-icons/fa";
import "../../styles/dashboard.css";

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    totalEmployees: 0,
    totalCustomers: 0,
    totalDrivers: 0,
    totalRevenue: 0,
    unreadMessages: 0,
    paidBookings: 0,
    pendingAmount: 0
  });

  // ✅ Messages state
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMessages, setShowMessages] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchMessages();
  }, []);

  const fetchStats = async () => {
    try {
      const [roomsRes, bookingsRes, employeesRes, customersRes, driversRes, messagesRes, paymentSummaryRes] = await Promise.all([
        api.get("/rooms"),
        api.get("/bookings"),
        api.get("/employees"),
        api.get("/customers"),
        api.get("/drivers"),
        api.get("/contact/unread"),
        api.get("/payments/summary")
      ]);

      const totalRooms = roomsRes.data.length || 0;
      const availableRooms = roomsRes.data.filter(r => r.status === 'available').length || 0;
      const totalBookings = bookingsRes.data.length || 0;
      const totalRevenue = bookingsRes.data
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      const paymentData = paymentSummaryRes.data;

      setStats({
        totalRooms,
        availableRooms,
        totalBookings,
        totalEmployees: employeesRes.data.length || 0,
        totalCustomers: customersRes.data.length || 0,
        totalDrivers: driversRes.data.length || 0,
        totalRevenue: totalRevenue * 83,
        unreadMessages: messagesRes.data.length || 0,
        paidBookings: paymentData.paidBookings || 0,
        pendingAmount: paymentData.pendingAmount || 0
      });
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  // ✅ Fetch messages
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

  // ✅ Mark message as read
  const markAsRead = async (id) => {
    try {
      await api.put(`/contact/${id}/read`);
      fetchMessages();
      fetchStats();
      toast.success("Message marked as read");
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  // ✅ Send reply
  const sendReply = async (id) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setMessageLoading(true);
    try {
      await api.post(`/contact/${id}/reply`, { reply: replyText });
      toast.success("Reply sent successfully!");
      setReplyingTo(null);
      setReplyText("");
      fetchMessages();
    } catch (err) {
      toast.error("Failed to send reply");
    } finally {
      setMessageLoading(false);
    }
  };

  // ✅ Delete message
  const deleteMessage = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await api.delete(`/contact/${id}`);
        toast.success("Message deleted successfully");
        fetchMessages();
        fetchStats();
      } catch (err) {
        toast.error("Failed to delete message");
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    await fetchMessages();
    setRefreshing(false);
    toast.success("🔄 Data refreshed!");
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Rooms", value: stats.totalRooms, icon: <FaBed />, color: "#4e73df", link: "/rooms" },
    { title: "Available Rooms", value: stats.availableRooms, icon: <FaBed />, color: "#1cc88a", link: "/rooms" },
    { title: "Total Bookings", value: stats.totalBookings, icon: <FaCalendarCheck />, color: "#f6c23e", link: "/bookings" },
    { title: "Employees", value: stats.totalEmployees, icon: <FaUserTie />, color: "#858796", link: "/employees" },
    { title: "Customers", value: stats.totalCustomers, icon: <FaUsers />, color: "#36b9cc", link: "/customers" },
    { title: "Drivers", value: stats.totalDrivers, icon: <FaCar />, color: "#e74a3b", link: "/drivers" },
    { title: "Paid Bookings", value: stats.paidBookings, icon: <FaCheckCircle />, color: "#28a745", link: "/bookings" },
    { title: "Pending Amount", value: formatCurrency(stats.pendingAmount), icon: <FaClock />, color: "#fd7e14", link: "/bookings" },
    { title: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: <FaMoneyBillWave />, color: "#dc3545", link: "/bookings" },
    { title: "Unread Messages", value: stats.unreadMessages, icon: <FaEnvelope />, color: "#17a2b8", link: "/contact" },
  ];

  return (
    <div className="dashboard-container">
      <div className="container py-4">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div>
              <h2>👋 Admin Dashboard</h2>
              <p>Complete hotel management overview and analytics</p>
            </div>
            <div className="header-actions d-flex gap-2">
              <button onClick={handleRefresh} className="btn btn-outline-secondary btn-sm" disabled={refreshing}>
                {refreshing ? <FaSpinner className="spin" /> : <FaSync />}
                <span className="ms-1">Refresh</span>
              </button>
              <span className="badge bg-success">Admin Access</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-4">
          {statCards.map((card, index) => (
            <div className="col-lg-3 col-md-6" key={index}>
              <Link to={card.link} className="stat-card-link">
                <div className="stat-card" style={{ borderLeft: `4px solid ${card.color}` }}>
                  <div className="stat-icon" style={{ background: `${card.color}15`, color: card.color }}>
                    {card.icon}
                  </div>
                  <div className="stat-info">
                    <h3>{typeof card.value === 'string' ? card.value : formatNumber(card.value)}</h3>
                    <p>{card.title}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* ✅ Messages Section - Full Management */}
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaEnvelope className="me-2" />
              Customer Messages
              {unreadCount > 0 && (
                <span className="badge bg-danger ms-2">{unreadCount} Unread</span>
              )}
            </h5>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => {
                  setShowMessages(!showMessages);
                  if (!showMessages) fetchMessages();
                }}
              >
                {showMessages ? 'Hide' : 'View Messages'}
              </button>
              <Link to="/contact" className="btn btn-sm btn-primary">
                View All
              </Link>
            </div>
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
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <strong>{msg.name}</strong>
                            {!msg.isRead && (
                              <span className="badge bg-primary">New</span>
                            )}
                            <small className="text-muted">{formatDate(msg.createdAt)}</small>
                            {msg.repliedBy && (
                              <span className="badge bg-success">Replied</span>
                            )}
                          </div>
                          <p className="mb-1 small"><strong>{msg.subject || 'No Subject'}</strong></p>
                          <p className="mb-1">{msg.message}</p>
                          
                          {msg.reply && (
                            <div className="bg-light p-2 rounded mt-1">
                              <small><strong>Reply:</strong> {msg.reply}</small>
                              <br />
                              <small className="text-muted">Replied by {msg.repliedBy} on {formatDate(msg.repliedAt)}</small>
                            </div>
                          )}
                        </div>
                        <div className="d-flex gap-1 ms-2 flex-wrap">
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
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteMessage(msg.id)}
                            title="Delete"
                          >
                            <FaTrash size={12} />
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
                            disabled={messageLoading}
                          />
                          <div className="mt-1 d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => sendReply(msg.id)}
                              disabled={messageLoading}
                            >
                              {messageLoading ? <FaSpinner className="spin" /> : 'Send Reply'}
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
                    View All {messages.length} Messages
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions mt-4">
          <h4>⚡ Quick Actions</h4>
          <div className="row g-3">
            <div className="col-md-2 col-6">
              <Link to="/rooms/add" className="quick-action-btn">
                <FaBed className="action-icon" />
                <span>Add Room</span>
              </Link>
            </div>
            <div className="col-md-2 col-6">
              <Link to="/employees/add" className="quick-action-btn">
                <FaUserTie className="action-icon" />
                <span>Add Employee</span>
              </Link>
            </div>
            <div className="col-md-2 col-6">
              <Link to="/customers/add" className="quick-action-btn">
                <FaUsers className="action-icon" />
                <span>Add Customer</span>
              </Link>
            </div>
            <div className="col-md-2 col-6">
              <Link to="/drivers/add" className="quick-action-btn">
                <FaCar className="action-icon" />
                <span>Add Driver</span>
              </Link>
            </div>
            <div className="col-md-2 col-6">
              <Link to="/bookings/create" className="quick-action-btn">
                <FaCalendarCheck className="action-icon" />
                <span>Create Booking</span>
              </Link>
            </div>
            <div className="col-md-2 col-6">
              <Link to="/contact" className="quick-action-btn">
                <FaEnvelope className="action-icon" />
                <span>View Messages</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;