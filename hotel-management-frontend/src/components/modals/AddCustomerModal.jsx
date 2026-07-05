// src/components/modals/AddCustomerModal.jsx
import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import Modal from "../common/Modal";

function AddCustomerModal({ isOpen, mode, customer, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    idProof: "",
    idProofNumber: ""
  });

  useEffect(() => {
    if (mode === "edit" && customer) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        idProof: customer.idProof || "",
        idProofNumber: customer.idProofNumber || ""
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        idProof: "",
        idProofNumber: ""
      });
    }
  }, [customer, mode, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    setLoading(true);
    try {
      if (mode === "edit" && customer) {
        await api.put(`/customers/${customer.id}`, formData);
        toast.success("Customer updated successfully!");
      } else {
        await api.post("/customers", formData);
        toast.success("Customer added successfully!");
      }
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        idProof: "",
        idProofNumber: ""
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    return mode === "edit" ? "Edit Customer" : "Add New Customer";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="md">
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Enter name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
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
                placeholder="Enter phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>ID Proof Type</label>
              <select
                name="idProof"
                className="form-select"
                value={formData.idProof}
                onChange={handleChange}
              >
                <option value="">Select ID Proof</option>
                <option value="Aadhar">Aadhar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
                <option value="Voter ID">Voter ID</option>
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>ID Proof Number</label>
              <input
                type="text"
                name="idProofNumber"
                className="form-control"
                placeholder="Enter ID number"
                value={formData.idProofNumber}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                className="form-control"
                rows="2"
                placeholder="Enter address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Saving..." : mode === "edit" ? "Update Customer" : "Save Customer"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default AddCustomerModal;