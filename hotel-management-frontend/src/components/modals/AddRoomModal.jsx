// src/components/modals/AddRoomModal.jsx
import React, { useState } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import { FaSpinner } from "react-icons/fa";

function AddRoomModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: "",
    roomType: "",
    bedType: "",
    pricePerNight: "",
    capacity: "",
    floor: "",
    description: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.roomNumber.trim() || !formData.roomType || !formData.pricePerNight) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await api.post("/rooms", {
        ...formData,
        pricePerNight: parseFloat(formData.pricePerNight),
        capacity: parseInt(formData.capacity) || 2,
        floor: parseInt(formData.floor) || 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Room added successfully!");
      setFormData({
        roomNumber: "",
        roomType: "",
        bedType: "",
        pricePerNight: "",
        capacity: "",
        floor: "",
        description: ""
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Room" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="form-group">
              <label>Room Number *</label>
              <input
                type="text"
                name="roomNumber"
                className="form-control"
                placeholder="e.g., 101"
                value={formData.roomNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label>Room Type *</label>
              <select
                name="roomType"
                className="form-select"
                value={formData.roomType}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Deluxe King">Deluxe King</option>
                <option value="Twin Room">Twin Room</option>
                <option value="Suite">Suite</option>
                <option value="Family Room">Family Room</option>
                <option value="Standard Room">Standard Room</option>
              </select>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label>Bed Type *</label>
              <select
                name="bedType"
                className="form-select"
                value={formData.bedType}
                onChange={handleChange}
                required
              >
                <option value="">Select Bed Type</option>
                <option value="King">King</option>
                <option value="Queen">Queen</option>
                <option value="Twin">Twin</option>
              </select>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label>Price/Night *</label>
              <input
                type="number"
                name="pricePerNight"
                className="form-control"
                placeholder="0.00"
                value={formData.pricePerNight}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                name="capacity"
                className="form-control"
                placeholder="2"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label>Floor</label>
              <input
                type="number"
                name="floor"
                className="form-control"
                placeholder="1"
                value={formData.floor}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="2"
                placeholder="Room description..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="col-12">
            <button type="submit" className="btn-primary-gradient w-100" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="spinner me-2" />
                  Saving...
                </>
              ) : (
                'Save Room'
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default AddRoomModal;