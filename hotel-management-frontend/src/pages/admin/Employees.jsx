// src/pages/admin/Employees.jsx - Modern Colorful Design
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { 
  FaEdit, FaTrash, FaPlus, FaSearch, FaDownload, 
  FaEye, FaMoneyBillWave, FaTimes, FaSync,
  FaUsers, FaUserTie, FaRupeeSign, FaCheckCircle, FaClock
} from "react-icons/fa";
import PageBanner from "../../components/common/PageBanner";
import EmployeeModal from "../../components/modals/AddEmployeeModal";
import "../../styles/pages.css";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [salaryStats, setSalaryStats] = useState({
    totalSalary: 0,
    averageSalary: 0,
    paidThisMonth: 0,
    pendingSalary: 0,
    departmentCounts: {}
  });

  useEffect(() => {
    fetchEmployees();
    fetchPaymentStats();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/employees", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load employees");
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const response = await api.get("/employees/payment-stats");
      setSalaryStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const deleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await api.delete(`/employees/${id}`);
        toast.success("Employee deleted successfully");
        fetchEmployees();
        fetchPaymentStats();
      } catch (err) {
        toast.error("Failed to delete employee");
      }
    }
  };

  const markPayment = async (id, status) => {
    try {
      await api.put(`/employees/${id}/payment`, { paymentStatus: status });
      toast.success(`Payment marked as ${status}`);
      fetchEmployees();
      fetchPaymentStats();
    } catch (err) {
      toast.error("Failed to update payment status");
    }
  };

  const formatSalary = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getFilteredEmployees = () => {
    let filtered = [...employees];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.name?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term) ||
        emp.jobTitle?.toLowerCase().includes(term) ||
        emp.department?.toLowerCase().includes(term)
      );
    }
    
    if (departmentFilter) {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }
    
    return filtered;
  };

  const getDepartments = () => {
    const depts = new Set(employees.map(emp => emp.department).filter(Boolean));
    return ['All', ...depts];
  };

  const filteredEmployees = getFilteredEmployees();

  const openModal = (mode, employee = null) => {
    setModalMode(mode);
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    fetchEmployees();
    fetchPaymentStats();
  };

  if (loading) {
    return (
      <>
        <PageBanner title="Employee Management" />
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
    { label: "Total Monthly Salary", value: formatSalary(salaryStats.totalSalary), color: "red", icon: <FaRupeeSign /> },
    { label: "Average Salary", value: formatSalary(salaryStats.averageSalary), color: "blue", icon: <FaUserTie /> },
    { label: "Paid This Month", value: formatSalary(salaryStats.paidThisMonth), color: "green", icon: <FaCheckCircle /> },
    { label: "Pending Salary", value: formatSalary(salaryStats.pendingSalary), color: "orange", icon: <FaClock /> },
  ];

  return (
    <>
      <PageBanner title="Employee Management" />
      <div className="page-container">
        <div className="container py-4">
          {/* Header */}
          <div className="page-header-actions">
            <h2>
              Employees <span className="count">({employees.length} total)</span>
            </h2>
            <button className="btn-primary-gradient" onClick={() => openModal('add')}>
              <FaPlus /> Add Employee
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
                placeholder="Search by name, email, job title..."
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
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              {getDepartments().map(dept => (
                <option key={dept} value={dept === 'All' ? '' : dept}>
                  {dept} {dept !== 'All' && `(${salaryStats.departmentCounts[dept] || 0})`}
                </option>
              ))}
            </select>
            <div className="d-flex gap-2">
              <button className="btn-outline-gradient" onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('');
              }}>
                Clear All
              </button>
              <button className="btn-outline-gradient" onClick={fetchEmployees}>
                <FaSync /> Refresh
              </button>
            </div>
          </div>

          {/* Employee Table */}
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Job Title</th>
                      <th>Department</th>
                      <th>Salary</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-4 text-muted">
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp, index) => (
                        <tr key={emp.id} style={{ '--i': index + 1 }}>
                          <td>{index + 1}</td>
                          <td><strong>{emp.name}</strong></td>
                          <td>{emp.email}</td>
                          <td>{emp.phone}</td>
                          <td>
                            <span className="badge" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
                              {emp.jobTitle}
                            </span>
                          </td>
                          <td>{emp.department}</td>
                          <td><strong>{formatSalary(emp.salary)}</strong></td>
                          <td>
                            <span className={`status-badge-modern ${emp.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                              {emp.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-action view" onClick={() => openModal('view', emp)} title="View">
                                <FaEye />
                              </button>
                              <button className="btn-action edit" onClick={() => openModal('edit', emp)} title="Edit">
                                <FaEdit />
                              </button>
                              <button className="btn-action delete" onClick={() => deleteEmployee(emp.id)} title="Delete">
                                <FaTrash />
                              </button>
                              {emp.paymentStatus !== 'paid' ? (
                                <button className="btn-action payment" onClick={() => markPayment(emp.id, 'paid')} title="Mark Paid">
                                  <FaMoneyBillWave />
                                </button>
                              ) : (
                                <button className="btn-action delete" onClick={() => markPayment(emp.id, 'pending')} title="Mark Pending">
                                  <FaTimes />
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
        <EmployeeModal
          isOpen={showModal}
          mode={modalMode}
          employee={selectedEmployee}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
}

export default Employees;