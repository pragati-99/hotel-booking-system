// src/components/modals/EmployeeModal.jsx
import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import Modal from "../common/Modal";

function AddEmployeeModal({ isOpen, mode, employee, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    jobTitle: "",
    department: "",
    salary: "",
    hireDate: "",
    address: "",
    paymentStatus: "pending"
  });

  useEffect(() => {
    if (employee && (mode === "edit" || mode === "view")) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        jobTitle: employee.jobTitle || "",
        department: employee.department || "",
        salary: employee.salary || "",
        hireDate: employee.hireDate || "",
        address: employee.address || "",
        paymentStatus: employee.paymentStatus || "pending"
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        jobTitle: "",
        department: "",
        salary: "",
        hireDate: "",
        address: "",
        paymentStatus: "pending"
      });
    }
  }, [employee, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.jobTitle) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        salary: parseFloat(formData.salary) || 0
      };

      if (mode === "edit" && employee) {
        await api.put(`/employees/${employee.id}`, payload);
        toast.success("Employee updated successfully!");
      } else {
        await api.post("/employees", payload);
        toast.success("Employee added successfully!");
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
    if (mode === "view") return "View Employee";
    if (mode === "edit") return "Edit Employee";
    return "Add New Employee";
  };

  const isViewMode = mode === "view";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="lg">
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="form-group">
              <label>Full Name *</label>
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
              <label>Email *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
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
              <label>Job Title *</label>
              <select
                name="jobTitle"
                className="form-select"
                value={formData.jobTitle}
                onChange={handleChange}
                required
                disabled={isViewMode}
              >
                <option value="">Select Job Title</option>
                <option value="Manager">Manager</option>
                <option value="Assistant Manager">Assistant Manager</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Housekeeper">Housekeeper</option>
                <option value="Chef">Chef</option>
                <option value="Cook">Cook</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Security">Security</option>
                <option value="Driver">Driver</option>
                <option value="Cleaner">Cleaner</option>
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Department</label>
              <select
                name="department"
                className="form-select"
                value={formData.department}
                onChange={handleChange}
                disabled={isViewMode}
              >
                <option value="">Select Department</option>
                <option value="Front Desk">Front Desk</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Security">Security</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Monthly Salary (₹)</label>
              <input
                type="number"
                name="salary"
                className="form-control"
                value={formData.salary}
                onChange={handleChange}
                min="0"
                step="1000"
                disabled={isViewMode}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Hire Date</label>
              <input
                type="date"
                name="hireDate"
                className="form-control"
                value={formData.hireDate}
                onChange={handleChange}
                disabled={isViewMode}
              />
            </div>
          </div>
          <div className="col-md-6">
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
          <div className="col-12">
            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                className="form-control"
                rows="2"
                value={formData.address}
                onChange={handleChange}
                disabled={isViewMode}
              />
            </div>
          </div>
          {!isViewMode && (
            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Saving..." : mode === "edit" ? "Update Employee" : "Save Employee"}
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

export default AddEmployeeModal;