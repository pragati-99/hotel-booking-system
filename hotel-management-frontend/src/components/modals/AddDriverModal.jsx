// src/components/modals/DriverModal.jsx
import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import Modal from "../common/Modal";

function AddDriverModal({ isOpen, mode, driver, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    carModel: "",
    carNumber: "",
    availability: "available",
    salary: 25000,
    paymentStatus: "pending"
  });

  useEffect(() => {
    if (driver && (mode === "edit" || mode === "view")) {
      setFormData({
        name: driver.name || "",
        phone: driver.phone || "",
        carModel: driver.carModel || "",
        carNumber: driver.carNumber || "",
        availability: driver.availability || "available",
        salary: driver.salary || 25000,
        paymentStatus: driver.paymentStatus || "pending"
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        carModel: "",
        carNumber: "",
        availability: "available",
        salary: 25000,
        paymentStatus: "pending"
      });
    }
  }, [driver, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Name and Phone are required");
      return;
    }

    setLoading(true);
    try {
      if (mode === "edit" && driver) {
        await api.put(`/drivers/${driver.id}`, formData);
        toast.success("Driver updated successfully!");
      } else {
        await api.post("/drivers", formData);
        toast.success("Driver added successfully!");
      }
      
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === "view") return "View Driver";
    if (mode === "edit") return "Edit Driver";
    return "Add New Driver";
  };

  const isViewMode = mode === "view";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="md">
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="form-group">
              <label>Driver Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isViewMode}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={isViewMode}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Car Model</label>
              <input
                type="text"
                name="carModel"
                className="form-control"
                value={formData.carModel}
                onChange={handleChange}
                disabled={isViewMode}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Car Number</label>
              <input
                type="text"
                name="carNumber"
                className="form-control"
                value={formData.carNumber}
                onChange={handleChange}
                disabled={isViewMode}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Salary (₹)</label>
              <input
                type="number"
                name="salary"
                className="form-control"
                value={formData.salary}
                onChange={handleChange}
                disabled={isViewMode}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Availability</label>
              <select
                name="availability"
                className="form-select"
                value={formData.availability}
                onChange={handleChange}
                disabled={isViewMode}
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="off-duty">Off-Duty</option>
              </select>
            </div>
          </div>
          <div className="col-md-12">
            <div className="form-group">
              <label>Payment Status</label>
              <select
                name="paymentStatus"
                className="form-select"
                value={formData.paymentStatus}
                onChange={handleChange}
                disabled={isViewMode}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          {!isViewMode && (
            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Saving..." : mode === "edit" ? "Update Driver" : "Save Driver"}
              </button>
            </div>
          )}
          {isViewMode && (
            <div className="col-12">
              <button type="button" className="btn btn-secondary w-100" onClick={onClose}>
                Close
              </button>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

export default AddDriverModal;