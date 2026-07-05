// src/components/reports/Reports.jsx - Without Excel
import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { FaFilePdf, FaPrint, FaDownload } from "react-icons/fa";
import PageBanner from "../common/PageBanner";
import "../../styles/reports.css";

function Reports() {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("bookings");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    revenue: 0,
    paid: 0,
    pending: 0
  });

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      let response;

      switch(reportType) {
        case "bookings":
          endpoint = "/bookings";
          break;
        case "payments":
          endpoint = "/payments/summary";
          break;
        case "employees":
          endpoint = "/employees";
          break;
        case "customers":
          endpoint = "/customers";
          break;
        case "drivers":
          endpoint = "/drivers";
          break;
        default:
          endpoint = "/bookings";
      }

      response = await api.get(endpoint);
      setData(response.data || []);
      
      if (reportType === "bookings" || reportType === "payments") {
        const bookings = response.data || [];
        const total = bookings.length;
        const revenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0) * 83, 0);
        const paid = bookings.filter(b => b.paymentStatus === "paid").length;
        const pending = bookings.filter(b => b.paymentStatus === "pending").length;
        setSummary({ total, revenue, paid, pending });
      }
      
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load report data");
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    window.print();
  };

  const formatPrice = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getColumns = () => {
    switch(reportType) {
      case "bookings":
        return ["Booking ID", "Customer", "Room", "Check In", "Check Out", "Amount", "Status"];
      case "employees":
        return ["Name", "Email", "Phone", "Job Title", "Department", "Salary"];
      case "customers":
        return ["Customer ID", "Name", "Email", "Phone", "Address"];
      case "drivers":
        return ["Name", "Phone", "Car Model", "Car Number", "Availability"];
      default:
        return ["ID", "Name", "Email"];
    }
  };

  const getRowData = (item) => {
    switch(reportType) {
      case "bookings":
        return [
          item.bookingNumber,
          item.customer?.name || "N/A",
          item.room?.roomType || "N/A",
          item.checkInDate,
          item.checkOutDate,
          formatPrice(item.totalAmount * 83),
          item.status
        ];
      case "employees":
        return [
          item.name,
          item.email,
          item.phone,
          item.jobTitle,
          item.department,
          formatPrice(item.salary)
        ];
      case "customers":
        return [
          item.customerId,
          item.name,
          item.email,
          item.phone,
          item.address || "N/A"
        ];
      case "drivers":
        return [
          item.name,
          item.phone,
          item.carModel || "N/A",
          item.carNumber || "N/A",
          item.availability
        ];
      default:
        return ["N/A", "N/A", "N/A"];
    }
  };

  const reportTypes = [
    { value: "bookings", label: "📋 Bookings Report" },
    { value: "payments", label: "💰 Payments Report" },
    { value: "employees", label: "👔 Employees Report" },
    { value: "customers", label: "👤 Customers Report" },
    { value: "drivers", label: "🚗 Drivers Report" }
  ];

  return (
    <>
      <PageBanner title="Reports" />
      <div className="reports-container page-enter">
        <div className="container py-4">
          <div className="reports-header page-enter-delay-1">
            <h2>📊 Reports</h2>
            <p>Generate and export reports</p>
          </div>

          <div className="reports-filters page-enter-delay-2">
            <div className="filter-group">
              <label>Report Type</label>
              <select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
                className="form-select"
              >
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>From Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>To Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>&nbsp;</label>
              <button 
                className="btn-primary-gradient"
                onClick={fetchReportData}
              >
                Generate Report
              </button>
            </div>
          </div>

          {(reportType === "bookings" || reportType === "payments") && (
            <div className="summary-cards page-enter-delay-3">
              <div className="summary-card">
                <h4>Total</h4>
                <p className="count">{summary.total}</p>
                <small>Records</small>
              </div>
              <div className="summary-card">
                <h4>Revenue</h4>
                <p className="count gold">{formatPrice(summary.revenue)}</p>
                <small>Total Revenue</small>
              </div>
              <div className="summary-card">
                <h4>Paid</h4>
                <p className="count green">{summary.paid}</p>
                <small>Paid Bookings</small>
              </div>
              <div className="summary-card">
                <h4>Pending</h4>
                <p className="count orange">{summary.pending}</p>
                <small>Pending Payments</small>
              </div>
            </div>
          )}

          <div className="export-buttons page-enter-delay-4">
            <button className="btn-pdf" onClick={exportToPDF}>
              <FaFilePdf /> Export PDF
            </button>
            <button className="btn-print" onClick={exportToPDF}>
              <FaPrint /> Print
            </button>
          </div>

          <div className="reports-table page-enter-delay-5">
            <div className="table-responsive">
              <table className="table-modern">
                <thead>
                  <tr>
                    {getColumns().map((col, i) => (
                      <th key={i}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={getColumns().length} className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={getColumns().length} className="text-center py-4 text-muted">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => (
                      <tr key={index} style={{ '--i': index + 1 }} className="table-row-animated">
                        {getRowData(item).map((value, i) => (
                          <td key={i}>{value}</td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Reports;