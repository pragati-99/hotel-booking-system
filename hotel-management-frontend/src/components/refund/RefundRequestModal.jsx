// src/components/refund/RefundRequestModal.jsx
import React, { useState } from 'react';
import api from '../../utils/axiosConfig';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { FaSpinner } from 'react-icons/fa';

function RefundRequestModal({ isOpen, onClose, booking, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast.error('Please enter a reason for refund');
      return;
    }

    setLoading(true);
    try {
      const refundData = {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        customerName: booking.customer?.name || 'Guest',
        customerEmail: booking.customer?.email || '',
        customerPhone: booking.customer?.phone || '',
        amount: booking.totalAmount,
        reason: reason,
        userId: booking.userId || 1
      };

      console.log('📝 Submitting refund:', refundData);

      await api.post('/refunds', refundData);
      toast.success('✅ Refund request submitted successfully!');
      setReason('');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('❌ Refund error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit refund request');
    } finally {
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

  if (!booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Refund" size="md">
      <form onSubmit={handleSubmit}>
        <div className="refund-request-form">
          <div className="booking-info" style={{ background: '#f8f6f3', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <p><strong>Booking ID:</strong> #{booking.bookingNumber}</p>
            <p><strong>Room:</strong> {booking.room?.roomType || 'N/A'}</p>
            <p><strong>Amount:</strong> {formatPrice(booking.totalAmount)}</p>
            <p><strong>Status:</strong> {booking.status}</p>
          </div>

          <div className="form-group">
            <label>Reason for Refund *</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Please explain why you want to cancel this booking..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <small className="text-muted">
              ⚠️ Refund will be processed within 5-7 working days after approval.
            </small>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" />
                Submitting...
              </>
            ) : (
              'Submit Refund Request'
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary w-100 mt-2"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default RefundRequestModal;