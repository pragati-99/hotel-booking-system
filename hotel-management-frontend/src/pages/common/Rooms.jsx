// src/pages/common/Rooms.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { 
  FaEdit, FaTrash, FaPlus, FaEye, FaSync, FaTimes,
  FaBed, FaUsers, FaRupeeSign, FaSearch
} from "react-icons/fa";
import PageBanner from "../../components/common/PageBanner";
import AddRoomModal from "../../components/modals/AddRoomModal";
import "../../styles/pages.css";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    booked: 0,
    occupied: 0,
    maintenance: 0
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/rooms", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(response.data);
      calculateStats(response.data);
      setLoading(false);
    } catch (err) {
      // Demo data
      setRooms([
        { id: 1, roomNumber: "101", roomType: "Deluxe King", bedType: "King", pricePerNight: 250, capacity: 2, status: "available" },
        { id: 2, roomNumber: "102", roomType: "Deluxe King", bedType: "King", pricePerNight: 250, capacity: 2, status: "available" },
        { id: 3, roomNumber: "103", roomType: "Twin Room", bedType: "Twin", pricePerNight: 180, capacity: 2, status: "available" },
        { id: 4, roomNumber: "104", roomType: "Twin Room", bedType: "Twin", pricePerNight: 180, capacity: 2, status: "booked" },
        { id: 5, roomNumber: "105", roomType: "Suite", bedType: "King", pricePerNight: 450, capacity: 4, status: "available" },
        { id: 6, roomNumber: "106", roomType: "Suite", bedType: "King", pricePerNight: 450, capacity: 4, status: "available" },
        { id: 7, roomNumber: "201", roomType: "Family Room", bedType: "Queen", pricePerNight: 320, capacity: 4, status: "available" },
        { id: 8, roomNumber: "202", roomType: "Family Room", bedType: "Queen", pricePerNight: 320, capacity: 4, status: "booked" },
        { id: 9, roomNumber: "203", roomType: "Standard Room", bedType: "Queen", pricePerNight: 150, capacity: 2, status: "available" },
        { id: 10, roomNumber: "204", roomType: "Standard Room", bedType: "Queen", pricePerNight: 150, capacity: 2, status: "available" },
      ]);
      calculateStats(rooms);
      setLoading(false);
      toast.error("Using demo data - Backend not connected");
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const available = data.filter(r => r.status === 'available').length;
    const booked = data.filter(r => r.status === 'booked').length;
    const occupied = data.filter(r => r.status === 'occupied').length;
    const maintenance = data.filter(r => r.status === 'maintenance').length;
    
    setStats({ total, available, booked, occupied, maintenance });
  };

  const deleteRoom = async (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await api.delete(`/rooms/${id}`);
        toast.success("Room deleted successfully");
        fetchRooms();
      } catch (err) {
        toast.error("Failed to delete room");
      }
    }
  };

  const formatPrice = (amount) => {
    if (!amount) return '₹0';
    const rupeeAmount = amount * 83;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(rupeeAmount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'available': { class: 'available', label: '✅ Available' },
      'booked': { class: 'booked', label: '🔴 Booked' },
      'occupied': { class: 'booked', label: '🔴 Occupied' },
      'maintenance': { class: 'cancelled', label: '🔧 Maintenance' }
    };
    const s = statusMap[status] || statusMap['available'];
    return <span className={`status-badge-modern ${s.class}`}>{s.label}</span>;
  };

  const getFilteredRooms = () => {
    let filtered = [...rooms];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.roomNumber?.toLowerCase().includes(term) ||
        r.roomType?.toLowerCase().includes(term) ||
        r.bedType?.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    return filtered;
  };

  const filteredRooms = getFilteredRooms();

  if (loading) {
    return (
      <>
        <PageBanner title="Room Management" />
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
    { label: "Total Rooms", value: stats.total, color: "purple", icon: <FaBed /> },
    { label: "Available", value: stats.available, color: "green", icon: <FaBed /> },
    { label: "Booked", value: stats.booked, color: "red", icon: <FaBed /> },
    { label: "Occupied", value: stats.occupied, color: "orange", icon: <FaUsers /> },
    { label: "Maintenance", value: stats.maintenance, color: "blue", icon: <FaBed /> },
  ];

  return (
    <>
      <PageBanner title="Room Management" />
      <div className="page-container">
        <div className="container py-4">
          {/* Header */}
          <div className="page-header-actions">
            <h2>
              All Rooms <span className="count">({rooms.length} rooms)</span>
            </h2>
            <button className="btn-primary-gradient" onClick={() => setShowModal(true)}>
              <FaPlus /> Add Room
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
                placeholder="Search by room number, type, bed type..."
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
              <option value="booked">Booked</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <div className="d-flex gap-2">
              <button className="btn-outline-gradient" onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}>
                Clear All
              </button>
              <button className="btn-outline-gradient" onClick={fetchRooms}>
                <FaSync /> Refresh
              </button>
            </div>
          </div>

          {/* Rooms Table */}
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Room Number</th>
                      <th>Type</th>
                      <th>Bed Type</th>
                      <th>Price/Night</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted">
                          No rooms found matching your criteria
                        </td>
                      </tr>
                    ) : (
                      filteredRooms.map((room, index) => (
                        <tr key={room.id} style={{ '--i': index + 1 }}>
                          <td><strong>{room.roomNumber}</strong></td>
                          <td>{room.roomType}</td>
                          <td>{room.bedType}</td>
                          <td><strong>{formatPrice(room.pricePerNight)}</strong></td>
                          <td><FaUsers className="me-1" /> {room.capacity} guests</td>
                          <td>{getStatusBadge(room.status)}</td>
                          <td>
                            <div className="action-buttons">
                              <Link to={`/rooms/${room.id}`} className="btn-action view" title="View">
                                <FaEye />
                              </Link>
                              <button className="btn-action edit" title="Edit">
                                <FaEdit />
                              </button>
                              <button 
                                className="btn-action delete"
                                onClick={() => deleteRoom(room.id)}
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

      <AddRoomModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={fetchRooms}
      />
    </>
  );
}

export default Rooms;