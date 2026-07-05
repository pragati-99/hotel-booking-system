// src/components/PaymentModal.jsx
import React, { useState } from 'react';
import api from '../../utils/axiosConfig';
import toast from 'react-hot-toast';
import { FaCreditCard, FaSpinner } from 'react-icons/fa';
import '../../styles/payment.css';
import hotelLogo from '../../assets/images/hotel-logo.png';

function PaymentModal({ isOpen, onClose, booking, onSuccess }) {
  const [processing, setProcessing] = useState(false);

  const formatPrice = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePayment = async () => {
    if (!booking) return;

    setProcessing(true);
    try {
      if (typeof window.Razorpay === 'undefined') {
        toast.error('Payment gateway not loaded. Please refresh and try again.');
        setProcessing(false);
        return;
      }

      const bookingId = booking.id;
      const totalAmount = booking.totalAmount || 0;
      const amountInINR = totalAmount * 83;
      
      console.log('💰 Amount in INR:', amountInINR);
      console.log('📦 Booking ID:', bookingId);
      
      const orderResponse = await api.post('/payments/create-order', {
        bookingId: bookingId,
        amount: amountInINR
      });

      console.log('📥 Order response:', orderResponse.data);

      if (!orderResponse.data.success) {
        toast.error(orderResponse.data.message || 'Failed to create order');
        setProcessing(false);
        return;
      }

      const { orderId, amount, currency, key, bookingId: bId } = orderResponse.data;

      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'Hotel Booking',
        description: `Booking #${booking.bookingNumber}`,
        image: hotelLogo,
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyResponse = await api.post('/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: bId
            });

            if (verifyResponse.data.success) {
              toast.success('✅ Payment successful! Booking confirmed.');
              onSuccess?.();
              onClose();
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: booking.customer?.name || '',
          email: booking.customer?.email || '',
          contact: booking.customer?.phone || ''
        },
        theme: {
          color: '#C9A27B'
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error('Payment error:', err);
      toast.error(err.response?.data?.message || 'Payment initiation failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen || !booking) return null;

  const totalAmountINR = (booking.totalAmount || 0) * 83;
  const gst = totalAmountINR * 0.18;
  const serviceCharge = totalAmountINR * 0.05;
  const grandTotal = totalAmountINR + gst + serviceCharge;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h3>Complete Payment</h3>
          <button className="payment-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="payment-modal-body">
          <div className="payment-summary">
            <h4>Booking Summary</h4>
            <div className="summary-details">
              <div className="summary-row">
                <span>Booking ID:</span>
                <span>#{booking.bookingNumber}</span>
              </div>
              <div className="summary-row">
                <span>Room:</span>
                <span>{booking.room?.roomType || 'N/A'}</span>
              </div>
              <div className="summary-row">
                <span>Check-In:</span>
                <span>{booking.checkInDate}</span>
              </div>
              <div className="summary-row">
                <span>Check-Out:</span>
                <span>{booking.checkOutDate}</span>
              </div>
              <div className="summary-row">
                <span>Nights:</span>
                <span>{booking.totalNights}</span>
              </div>
            </div>
          </div>

          <div className="payment-amount">
            <div className="amount-row">
              <span>Room Charges ({booking.totalNights} nights)</span>
              <span>{formatPrice(totalAmountINR)}</span>
            </div>
            <div className="amount-row">
              <span>GST (18%)</span>
              <span>{formatPrice(gst)}</span>
            </div>
            <div className="amount-row">
              <span>Service Charges (5%)</span>
              <span>{formatPrice(serviceCharge)}</span>
            </div>
            <div className="amount-row total">
              <span>Total Amount</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <button 
            className="payment-btn"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <FaSpinner className="spinner" />
                Processing...
              </>
            ) : (
              <>
                <FaCreditCard />
                Pay {formatPrice(grandTotal)}
              </>
            )}
          </button>

          <p className="payment-note">
            🔒 Secure payment via Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;