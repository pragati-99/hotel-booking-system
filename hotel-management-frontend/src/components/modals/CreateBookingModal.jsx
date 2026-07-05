// src/pages/CreateBooking.jsx - Modal Version
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "../common/Modal"

function CreateBookingModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    customerId: "",
    roomId: "",
    checkInDate: "",
    checkOutDate: "",
    status: "confirmed"
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [customersRes, roomsRes] = await Promise.all([
        axios.get("/api/customers"),
        axios.get("/api/rooms/available")
      ]);
      setCustomers(customersRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (err) {
      toast.error("Failed to load data");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.roomId || !formData.checkInDate || !formData.checkOutDate) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/bookings", {
        customer: { id: parseInt(formData.customerId) },
        room: { id: parseInt(formData.roomId) },
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        status: formData.status
      });
      toast.success("Booking created successfully!");
      setFormData({ customerId: "", roomId: "", checkInDate: "", checkOutDate: "", status: "confirmed" });
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Booking" size="md">
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="form-group">
              <label>Customer *</label>
              <select
                name="customerId"
                className="form-select"
                value={formData.customerId}
                onChange={handleChange}
                required
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - {c.customerId}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Room *</label>
              <select
                name="roomId"
                className="form-select"
                value={formData.roomId}
                onChange={handleChange}
                required
              >
                <option value="">Select Room</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.roomNumber} - {r.roomType}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Check-In Date *</label>
              <input
                type="date"
                name="checkInDate"
                className="form-control"
                value={formData.checkInDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Check-Out Date *</label>
              <input
                type="date"
                name="checkOutDate"
                className="form-control"
                value={formData.checkOutDate}
                onChange={handleChange}
                required
                min={formData.checkInDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="col-md-12">
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="checked-in">Checked In</option>
              </select>
            </div>
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default CreateBookingModal;