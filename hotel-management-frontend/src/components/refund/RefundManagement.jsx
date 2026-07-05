// src/components/refund/RefundManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import toast from 'react-hot-toast';
import { FaCheck, FaTimes, FaEye, FaSync, FaTrash } from 'react-icons/fa';
import PageBanner from '../common/PageBanner';
import '../../styles/refund.css';

function RefundManagement({ userRole }) {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const response = await api.get('/refunds');
      setRefunds(response.data || []);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load refunds');
      setLoading(false);
    }
  };

  const updateRefundStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this refund?`)) return;
    
    try {
      await api.put(`/refunds/${id}/status`, { status });
      toast.success(`Refund ${status} successfully`);
      fetchRefunds();
    } catch (err) {
      toast.error('Failed to update refund status');
    }
  };

  const deleteRefund = async (id) => {
    if (!window.confirm('Are you sure you want to delete this refund?')) return;
    
    try {
      await api.delete(`/refunds/${id}`);
      toast.success('Refund deleted successfully');
      fetchRefunds();
    } catch (err) {
      toast.error('Failed to delete refund');
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
      'pending': 'status-pending',
      'approved': 'status-confirmed',
      'rejected': 'status-cancelled'
    };
    return `status-badge ${statusMap[status] || 'status-pending'}`;
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '⏳ Pending',
      'approved': '✅ Approved',
      'rejected': '❌ Rejected'
    };
    return statusMap[status] || status;
  };

  const viewDetails = (refund) => {
    setSelectedRefund(refund);
    setShowDetails(true);
  };

  const filteredRefunds = filterStatus === 'all' 
    ? refunds 
    : refunds.filter(r => r.status === filterStatus);

  if (loading) {
    return (
      <>
        <PageBanner title="Refund Management" />
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
      <PageBanner title="Refund Management" />
      <div className="refund-management-container page-enter">
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}>
              💰 Refund Management
              <span className="text-muted ms-2" style={{ fontSize: '16px' }}>
                ({refunds.length} requests)
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
                <option value="approved">✅ Approved</option>
                <option value="rejected">❌ Rejected</option>
              </select>
              <button className="btn btn-outline-secondary" onClick={fetchRefunds}>
                <FaSync /> Refresh
              </button>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card">
                <div className="card-body text-center">
                  <h6 className="text-muted">Total Requests</h6>
                  <h3 style={{ color: '#4e73df' }}>{refunds.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body text-center">
                  <h6 className="text-muted">Pending</h6>
                  <h3 style={{ color: '#fd7e14' }}>{refunds.filter(r => r.status === 'pending').length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body text-center">
                  <h6 className="text-muted">Approved</h6>
                  <h3 style={{ color: '#28a745' }}>{refunds.filter(r => r.status === 'approved').length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body text-center">
                  <h6 className="text-muted">Rejected</h6>
                  <h3 style={{ color: '#dc3545' }}>{refunds.filter(r => r.status === 'rejected').length}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Reason</th>
                      <th>Requested</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRefunds.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4 text-muted">
                          No refund requests found
                        </td>
                      </tr>
                    ) : (
                      filteredRefunds.map((refund, index) => (
                        <tr key={refund.id} style={{ '--i': index + 1 }} className="table-row-animated">
                          <td>{index + 1}</td>
                          <td><strong>#{refund.bookingNumber}</strong></td>
                          <td>
                            <strong>{refund.customerName}</strong>
                            <br />
                            <small className="text-muted">{refund.customerEmail}</small>
                          </td>
                          <td><strong>{formatPrice(refund.amount)}</strong></td>
                          <td className="text-truncate" style={{ maxWidth: '150px' }}>
                            {refund.reason}
                          </td>
                          <td>{new Date(refund.requestedAt).toLocaleDateString()}</td>
                          <td>
                            <span className={getStatusBadge(refund.status)}>
                              {getStatusText(refund.status)}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button 
                                className="btn btn-sm btn-outline-info"
                                onClick={() => viewDetails(refund)}
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                              {refund.status === 'pending' && (
                                <>
                                  <button 
                                    className="btn btn-sm btn-success"
                                    onClick={() => updateRefundStatus(refund.id, 'approved')}
                                    title="Approve"
                                  >
                                    <FaCheck />
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => updateRefundStatus(refund.id, 'rejected')}
                                    title="Reject"
                                  >
                                    <FaTimes />
                                  </button>
                                </>
                              )}
                              {(userRole === 'ADMIN') && (
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteRefund(refund.id)}
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>
                              )}
                              {refund.status === 'pending' && userRole === 'RECEPTIONIST' && (
                                <span className="text-muted small">Waiting for Admin</span>
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

      {showDetails && selectedRefund && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-container modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Refund Details</h3>
              <button className="modal-close" onClick={() => setShowDetails(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="refund-details">
                <p><strong>Booking ID:</strong> #{selectedRefund.bookingNumber}</p>
                <p><strong>Customer:</strong> {selectedRefund.customerName}</p>
                <p><strong>Email:</strong> {selectedRefund.customerEmail}</p>
                <p><strong>Phone:</strong> {selectedRefund.customerPhone || 'N/A'}</p>
                <p><strong>Amount:</strong> {formatPrice(selectedRefund.amount)}</p>
                <p><strong>Reason:</strong> {selectedRefund.reason}</p>
                <p><strong>Requested:</strong> {new Date(selectedRefund.requestedAt).toLocaleString()}</p>
                {selectedRefund.processedAt && (
                  <p><strong>Processed:</strong> {new Date(selectedRefund.processedAt).toLocaleString()}</p>
                )}
                {selectedRefund.processedBy && (
                  <p><strong>Processed By:</strong> {selectedRefund.processedBy}</p>
                )}
                <p><strong>Status:</strong> <span className={getStatusBadge(selectedRefund.status)}>
                  {getStatusText(selectedRefund.status)}
                </span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RefundManagement;