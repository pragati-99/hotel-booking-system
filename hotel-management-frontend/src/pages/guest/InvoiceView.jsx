// src/pages/guest/InvoiceView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import PageBanner from '../../components/common/PageBanner';
import Invoice from '../../components/invoice/Invoice';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa';

function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view invoice');
          setLoading(false);
          return;
        }

        // Try to get from localStorage first
        const savedBooking = localStorage.getItem('lastBooking');
        if (savedBooking) {
          try {
            const parsed = JSON.parse(savedBooking);
            if (parsed.id == id || parsed.bookingNumber === id) {
              setBooking(parsed);
              setLoading(false);
              return;
            }
          } catch (e) {}
        }

        // Fetch from API
        const response = await api.get(`/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          setBooking(response.data);
        } else {
          setError('Booking not found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load invoice details');
        setLoading(false);
      }
    };

    if (id) {
      fetchBooking();
    } else {
      setError('Invalid booking ID');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <PageBanner title="Invoice" />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading invoice details...</p>
        </div>
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <PageBanner title="Invoice" />
        <div className="container py-5">
          <div className="alert alert-danger text-center">
            <h4 className="mb-3">⚠️ {error || 'Booking not found'}</h4>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/my-bookings')}
            >
              <FaArrowLeft className="me-2" /> Back to My Bookings
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner title="Invoice" />
      <div className="container py-4">
        <div className="mb-3">
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate('/my-bookings')}
          >
            <FaArrowLeft className="me-2" /> Back to My Bookings
          </button>
        </div>
        <Invoice 
          booking={booking} 
          onClose={() => navigate('/my-bookings')} 
        />
      </div>
    </>
  );
}

export default InvoiceView;