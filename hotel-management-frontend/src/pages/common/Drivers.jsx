// src/pages/common/Drivers.jsx - Modern Colorful Design
import React, { useEffect, useState } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { 
  FaEdit, FaTrash, FaPlus, FaSearch, FaEye,
  FaMoneyBillWave, FaTimes, FaSync,
  FaCar, FaUserCheck, FaUserClock, FaUserSlash
} from "react-icons/fa";
import PageBanner from "../../components/common/PageBanner";
import DriverModal from "../../components/modals/AddDriverModal";
import "../../styles/pages.css";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    busy: 0,
    offDuty: 0
  });

  useEffect(() => {
    fetchDrivers();
    fetchStats();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await api.get("/drivers");
      setDrivers(response.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load drivers");
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/drivers/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const deleteDriver = async (id) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        await api.delete(`/drivers/${id}`);
        toast.success("Driver deleted successfully");
        fetchDrivers();
        fetchStats();
      } catch (err) {
        toast.error("Failed to delete driver");
      }
    }
  };

  const updateDriverStatus = async (id, status) => {
    try {
      await api.put(`/drivers/${id}/status?availability=${status}`);
      toast.success(`Status updated to ${status}`);
      fetchDrivers();
      fetchStats();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const markPayment = async (id, paymentStatus) => {
    try {
      await api.put(`/drivers/${id}/payment`, { paymentStatus });
      toast.success(`Payment marked as ${paymentStatus}`);
      fetchDrivers();
    } catch (err) {
      toast.error("Failed to update payment status");
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'available': { class: 'available', label: '✅ Available' },
      'busy': { class: 'busy', label: '🟡 Busy' },
      'off-duty': { class: 'off-duty', label: '🔴 Off-Duty' }
    };
    const s = statusMap[status] || statusMap['available'];
    return <span className={`status-badge-modern ${s.class}`}>{s.label}</span>;
  };

  const getPaymentBadge = (status) => {
    return <span className={`status-badge-modern ${status === 'paid' ? 'paid' : 'pending'}`}>
      {status === 'paid' ? '✅ Paid' : '⏳ Pending'}
    </span>;
  };

  const getFilteredDrivers = () => {
    let filtered = [...drivers];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.name?.toLowerCase().includes(term) ||
        d.phone?.toLowerCase().includes(term) ||
        d.carModel?.toLowerCase().includes(term) ||
        d.carNumber?.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(d => d.availability === statusFilter);
    }
    
    return filtered;
  };

  const filteredDrivers = getFilteredDrivers();

  const openModal = (mode, driver = null) => {
    setModalMode(mode);
    setSelectedDriver(driver);
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    fetchDrivers();
    fetchStats();
  };

  if (loading) {
    return (
      <>
        <PageBanner title="Driver Management" />
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

  const statsData = [
    { label: "Total Drivers", value: stats.total, color: "purple", icon: <FaCar /> },
    { label: "Available", value: stats.available, color: "green", icon: <FaUserCheck /> },
    { label: "Busy", value: stats.busy, color: "red", icon: <FaUserClock /> },
    { label: "Off-Duty", value: stats.offDuty, color: "orange", icon: <FaUserSlash /> },
  ];

  return (
    <>
      <PageBanner title="Driver Management" />
      <div className="page-container">
        <div className="container py-4">
          {/* Header */}
          <div className="page-header-actions">
            <h2>
              Driver Management <span className="count">({drivers.length} drivers)</span>
            </h2>
            <button className="btn-primary-gradient" onClick={() => openModal('add')}>
              <FaPlus /> Add Driver
            </button>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            {statsData.map((stat, index) => (
              <div className={`stat-card-modern color-${index + 1}`} key={index}>
                <div className="stat-icon-bg">{stat.icon}</div>
                <div className="stat-label">{stat.label}</div>
                <div className={`stat-value ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="search-filter-bar">
            <div className="input-group">
              <span className="input-group-text"><FaSearch /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, phone, car model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
                  <FaTimes />
                </button>
              )}
            </div>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="off-duty">Off-Duty</option>
            </select>
            <div className="d-flex gap-2">
              <button className="btn-outline-gradient" onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}>
                Clear All
              </button>
              <button className="btn-outline-gradient" onClick={fetchDrivers}>
                <FaSync /> Refresh
              </button>
            </div>
          </div>

          {/* Driver Table */}
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Car Model</th>
                      <th>Car Number</th>
                      <th>Salary</th>
                      <th>Availability</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrivers.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-4 text-muted">
                          No drivers found
                        </td>
                      </tr>
                    ) : (
                      filteredDrivers.map((driver, index) => (
                        <tr key={driver.id} style={{ '--i': index + 1 }}>
                          <td>{index + 1}</td>
                          <td><strong>{driver.name}</strong></td>
                          <td>{driver.phone}</td>
                          <td>{driver.carModel || '-'}</td>
                          <td>{driver.carNumber || '-'}</td>
                          <td>₹{driver.salary || 25000}</td>
                          <td>{getStatusBadge(driver.availability)}</td>
                          <td>{getPaymentBadge(driver.paymentStatus)}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-action view" onClick={() => openModal('view', driver)} title="View">
                                <FaEye />
                              </button>
                              <button className="btn-action edit" onClick={() => openModal('edit', driver)} title="Edit">
                                <FaEdit />
                              </button>
                              <button className="btn-action delete" onClick={() => deleteDriver(driver.id)} title="Delete">
                                <FaTrash />
                              </button>
                              <div className="dropdown">
                                <button className="btn-action status" data-bs-toggle="dropdown" title="Status">
                                  <FaUserClock />
                                </button>
                                <ul className="dropdown-menu">
                                  <li><button className="dropdown-item" onClick={() => updateDriverStatus(driver.id, 'available')}>
                                    <FaUserCheck className="text-success me-2" /> Available
                                  </button></li>
                                  <li><button className="dropdown-item" onClick={() => updateDriverStatus(driver.id, 'busy')}>
                                    <FaUserClock className="text-warning me-2" /> Busy
                                  </button></li>
                                  <li><button className="dropdown-item" onClick={() => updateDriverStatus(driver.id, 'off-duty')}>
                                    <FaUserSlash className="text-danger me-2" /> Off-Duty
                                  </button></li>
                                </ul>
                              </div>
                              {driver.paymentStatus !== 'paid' && (
                                <button className="btn-action payment" onClick={() => markPayment(driver.id, 'paid')} title="Mark Paid">
                                  <FaMoneyBillWave />
                                </button>
                              )}
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

      {showModal && (
        <DriverModal
          isOpen={showModal}
          mode={modalMode}
          driver={selectedDriver}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
}

export default Drivers;