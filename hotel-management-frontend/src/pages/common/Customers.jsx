// src/pages/common/Customers.jsx
import React, { useEffect, useState } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaEye, FaTimes, FaSync } from "react-icons/fa";
import PageBanner from "../../components/common/PageBanner";
import AddCustomerModal from "../../components/modals/AddCustomerModal";
import "../../styles/pages.css";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/customers");
      setCustomers(response.data || []);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load customers");
      setLoading(false);
    }
  };

  const searchCustomers = async () => {
    if (!searchTerm.trim()) {
      fetchCustomers();
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/customers/search?name=${searchTerm}`);
      setCustomers(response.data || []);
      setLoading(false);
    } catch (err) {
      toast.error("Search failed");
      setLoading(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchCustomers();
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    
    try {
      await api.delete(`/customers/${id}`);
      toast.success("Customer deleted successfully!");
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete customer");
    }
  };

  const viewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const editCustomer = (customer) => {
    setSelectedCustomer(customer);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    fetchCustomers();
    setSelectedCustomer(null);
    setModalMode("add");
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCustomer(null);
    setModalMode("add");
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <PageBanner title="Customer Management" />
        <div className="page-container">
          <div className="container py-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner title="Customer Management" />
      <div className="page-container">
        <div className="container py-4">
          {/* Header */}
          <div className="page-header-actions">
            <h2>
              Customer Management
              <span className="count">({customers.length} customers)</span>
            </h2>
            <button className="btn-primary-gradient" onClick={() => setShowModal(true)}>
              <FaPlus /> Add Customer
            </button>
          </div>

          {/* Search & Filter */}
          <div className="search-filter-bar">
            <div className="input-group">
              <span className="input-group-text"><FaSearch /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
              {searchTerm && (
                <button className="btn btn-outline-secondary" onClick={() => {
                  setSearchTerm('');
                  fetchCustomers();
                }}>
                  <FaTimes />
                </button>
              )}
            </div>
            <button className="btn-outline-gradient" onClick={searchCustomers}>
              <FaSearch /> Search
            </button>
            <button className="btn-outline-gradient" onClick={fetchCustomers}>
              <FaSync /> Refresh
            </button>
          </div>

          {/* Customer Table */}
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>ID Proof</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted">
                          {searchTerm ? 'No customers found matching your search' : 'No customers found'}
                        </td>
                      </tr>
                    ) : (
                      customers.map((customer, index) => (
                        <tr key={customer.id} style={{ '--i': index + 1 }}>
                          <td><strong>{customer.customerId}</strong></td>
                          <td><strong>{customer.name}</strong></td>
                          <td>{customer.email || '-'}</td>
                          <td>{customer.phone}</td>
                          <td>{customer.idProof || '-'}</td>
                          <td>{formatDate(customer.createdAt)}</td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="btn-action view" 
                                onClick={() => viewCustomer(customer)}
                                title="View"
                              >
                                <FaEye />
                              </button>
                              <button 
                                className="btn-action edit" 
                                onClick={() => editCustomer(customer)}
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="btn-action delete" 
                                onClick={() => deleteCustomer(customer.id)}
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      <AddCustomerModal 
        isOpen={showModal}
        mode={modalMode}
        customer={selectedCustomer}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />

      {/* View Customer Modal */}
      {showViewModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-container modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customer Details</h3>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="customer-details">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Customer ID:</strong> {selectedCustomer.customerId}</p>
                    <p><strong>Name:</strong> {selectedCustomer.name}</p>
                    <p><strong>Email:</strong> {selectedCustomer.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Address:</strong> {selectedCustomer.address || 'N/A'}</p>
                    <p><strong>ID Proof:</strong> {selectedCustomer.idProof || 'N/A'}</p>
                    <p><strong>ID Proof Number:</strong> {selectedCustomer.idProofNumber || 'N/A'}</p>
                    <p><strong>Created:</strong> {formatDate(selectedCustomer.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Customers;