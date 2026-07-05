// src/components/invoice/Invoice.jsx
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  FaPrint, 
  FaDownload, 
  FaCreditCard,  // ✅ Changed from FaPayment to FaCreditCard
  FaCheck 
} from 'react-icons/fa';

const Invoice = ({ booking, onClose, onPayment }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const formatPrice = (amount) => {
    if (!amount) return '₹0';
    const rupeeAmount = amount * 83;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(rupeeAmount);
  };

  const formatPriceDirect = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Convert USD to INR for display
  const totalInr = (booking.totalAmount || 0) * 83;
  const gst = totalInr * 0.18;
  const serviceCharge = totalInr * 0.05;
  const grandTotal = totalInr + gst + serviceCharge;

  const handlePayment = () => {
    if (onPayment) {
      onPayment();
    }
  };

  if (!booking) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h3>Invoice</h3>
          <div className="d-flex gap-2">
            <button className="btn btn-success btn-sm" onClick={handlePayment}>
              <FaCreditCard className="me-1" /> Pay Now  {/* ✅ Fixed icon */}
            </button>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <FaPrint className="me-1" /> Print
            </button>
            <button className="btn btn-success btn-sm">
              <FaDownload className="me-1" /> Download
            </button>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal-body" ref={componentRef} style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#A8876A', fontFamily: 'Georgia, serif' }}>🏨 Hotel Booking</h1>
            <p style={{ color: '#777' }}>123 Luxury Lane, Hotel District, City 10001</p>
            <p style={{ color: '#777' }}>Email: hotel@example.com | Phone: +91 9876543210</p>
            <hr />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h4>Invoice #: {booking.bookingNumber || booking.id}</h4>
              <p>Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h4>Status: <span style={{ color: booking.paymentStatus === 'paid' ? '#28a745' : '#dc3545' }}>
                {booking.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
              </span></h4>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h5>Guest Information</h5>
            <p><strong>Name:</strong> {booking.customer?.name || 'N/A'}</p>
            <p><strong>Email:</strong> {booking.customer?.email || 'N/A'}</p>
            <p><strong>Phone:</strong> {booking.customer?.phone || 'N/A'}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h5>Room Details</h5>
            <p><strong>Room Type:</strong> {booking.room?.roomType || 'N/A'}</p>
            <p><strong>Room Number:</strong> {booking.room?.roomNumber || 'N/A'}</p>
            <p><strong>Check-In:</strong> {booking.checkInDate}</p>
            <p><strong>Check-Out:</strong> {booking.checkOutDate}</p>
            <p><strong>Nights:</strong> {booking.totalNights || 1}</p>
            <p><strong>Guests:</strong> {booking.guests || 1}</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ background: '#f8f6f3' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px' }}>Room Charges ({booking.totalNights || 1} nights)</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{formatPriceDirect(totalInr)}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px' }}>GST (18%)</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{formatPriceDirect(gst)}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px' }}>Service Charges (5%)</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{formatPriceDirect(serviceCharge)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #A8876A' }}>
                <td style={{ padding: '10px', fontWeight: 'bold', fontSize: '18px' }}>Total Amount</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', fontSize: '18px', color: '#A8876A' }}>
                  {formatPriceDirect(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #e8e5e0', paddingTop: '20px' }}>
            <p style={{ color: '#999' }}>Thank you for choosing Hotel Booking!</p>
            <p style={{ color: '#999', fontSize: '12px' }}>This is a system generated invoice.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;