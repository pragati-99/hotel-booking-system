// src/context/BookingContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/axiosConfig';

const BookingContext = createContext();

export const useBookings = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);

  // ✅ Cache data for 30 seconds
  const isDataStale = () => {
    if (!lastFetched) return true;
    const now = Date.now();
    const diff = now - lastFetched;
    return diff > 30000; // 30 seconds
  };

  const fetchAllData = useCallback(async (force = false) => {
    if (!force && !isDataStale()) {
      console.log('📦 Using cached data');
      return;
    }

    setLoading(true);
    try {
      const [bookingsRes, messagesRes, roomsRes] = await Promise.all([
        api.get('/bookings/my-bookings'),
        api.get('/contact/my-messages'),
        api.get('/rooms/available')
      ]);

      setBookings(bookingsRes.data || []);
      setMessages(messagesRes.data || []);
      setAvailableRooms(roomsRes.data || []);
      setLastFetched(Date.now());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Refetch when component mounts
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const value = {
    bookings,
    messages,
    availableRooms,
    loading,
    refresh: () => fetchAllData(true)
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};