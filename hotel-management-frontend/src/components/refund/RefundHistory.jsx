// src/components/refund/RefundHistory.jsx
import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { FaSearch, FaSync, FaTimes, FaCheck } from "react-icons/fa";
import PageBanner from "../common/PageBanner";
import "../../styles/refund.css";

function RefundHistory() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      // In production, this would be a real API
      // For now, using demo data
      const demoRefunds = [
        {
          id: 1,
          bookingNumber: "BK001",
          customer: "John Doe",
          amount: 62250,
          reason: "Cancelled by customer",
          status: "approved",
          requestedAt: "2026-07-01",
          processedAt: "2026-07-02"
        },
        {
          id: 2,
          bookingNumber: "BK002",
          customer: "Jane Smith",
          amount: 29880,
          reason: "Room not available",
          status: "pending",
          requestedAt: "2026-07-03",
          processedAt: null
        },
        {
          id: 3,
          bookingNumber: "BK003",
          customer: "Mike Johnson",
          amount: 74700,
          reason: "Duplicate payment",
          status: "rejected",
          requestedAt: "2026-06-30",
          processedAt: "2026-07-01"
        }
      ];
      setRefunds(demoRefunds);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load refunds");
      setLoading(false);
    }
  };

  const formatPrice = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'approved': 'status-confirmed',
      'pending': 'status-pending',
      'rejected': 'status-cancelled'
    };
    return `status-badge ${statusMap[status] || 'status-pending'}`;
  };

  const getStatusText = (status) => {
    const statusMap = {
      'approved': '✅ Approved',
      'pending': '⏳ Pending',
      'rejected': '❌ Rejected'
    };
    return statusMap[status] || status;
  };

  const filteredRefunds = refunds.filter(refund =>
    refund.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    refund.customer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <PageBanner title="Refund History" />
        <div className="refund-container">
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
      <PageBanner title="Refund History" />
      <div className="refund-container page-enter">
        <div className="container py-4">
          <div className="refund-header page-enter-delay-1">
            <h2>💰 Refund History</h2>
            <p>Track all refund requests</p>
          </div>

          {/* Search & Filter */}
          <div className="refund-filters page-enter-delay-2">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by booking ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="btn-outline-gradient" onClick={fetchRefunds}>
              <FaSync /> Refresh
            </button>
          </div>

          {/* Refund Cards */}
          <div className="refund-grid">
            {filteredRefunds.length === 0 ? (
              <div className="no-refunds">
                <p>No refunds found</p>
              </div>
            ) : (
              filteredRefunds.map((refund, index) => (
                <div key={refund.id} className="refund-card page-enter-delay-3" style={{ '--i': index + 1 }}>
                  <div className="refund-card-header">
                    <span className="refund-id">#{refund.bookingNumber}</span>
                    <span className={getStatusBadge(refund.status)}>
                      {getStatusText(refund.status)}
                    </span>
                  </div>
                  <div className="refund-card-body">
                    <p><strong>Customer:</strong> {refund.customer}</p>
                    <p><strong>Amount:</strong> {formatPrice(refund.amount)}</p>
                    <p><strong>Reason:</strong> {refund.reason}</p>
                    <p><strong>Requested:</strong> {refund.requestedAt}</p>
                    {refund.processedAt && (
                      <p><strong>Processed:</strong> {refund.processedAt}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default RefundHistory;