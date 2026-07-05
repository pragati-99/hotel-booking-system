// src/pages/SearchRoom.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import PageBanner from "../../components/common/PageBanner";
import { FaSearch, FaBed, FaUsers } from "react-icons/fa";

function SearchRoom() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    roomType: '',
    bedType: '',
    status: '',
    capacity: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await axios.get("/api/rooms");
      setRooms(response.data);
      setFilteredRooms(response.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load rooms");
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let results = [...rooms];

    if (filters.roomType) {
      results = results.filter(r => r.roomType?.toLowerCase().includes(filters.roomType.toLowerCase()));
    }
    if (filters.bedType) {
      results = results.filter(r => r.bedType?.toLowerCase().includes(filters.bedType.toLowerCase()));
    }
    if (filters.status) {
      results = results.filter(r => r.status?.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.capacity) {
      results = results.filter(r => r.capacity >= parseInt(filters.capacity));
    }

    setFilteredRooms(results);
    if (results.length === 0) {
      toast("No rooms found matching your criteria");
    }
  };

  const clearFilters = () => {
    setFilters({
      roomType: '',
      bedType: '',
      status: '',
      capacity: ''
    });
    setFilteredRooms(rooms);
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
      'available': 'status-available',
      'booked': 'status-booked',
      'occupied': 'status-booked',
      'maintenance': 'status-cancelled'
    };
    return `status-badge ${statusMap[status] || 'status-available'}`;
  };

  if (loading) {
    return (
      <>
        <PageBanner title="Search Rooms" />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner title="Search Rooms" />
      <div className="container py-5">
        <div className="card mb-4">
          <div className="card-header">
            <h4 className="mb-0" style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}>
              <FaSearch className="me-2" /> Search Filters
            </h4>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Room Type</label>
                <select
                  className="form-select"
                  value={filters.roomType}
                  onChange={(e) => setFilters({...filters, roomType: e.target.value})}
                >
                  <option value="">All Types</option>
                  <option value="Deluxe King">Deluxe King</option>
                  <option value="Twin Room">Twin Room</option>
                  <option value="Suite">Suite</option>
                  <option value="Family Room">Family Room</option>
                  <option value="Standard Room">Standard Room</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Bed Type</label>
                <select
                  className="form-select"
                  value={filters.bedType}
                  onChange={(e) => setFilters({...filters, bedType: e.target.value})}
                >
                  <option value="">All Types</option>
                  <option value="King">King</option>
                  <option value="Queen">Queen</option>
                  <option value="Twin">Twin</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">All Status</option>
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Min Capacity</label>
                <select
                  className="form-select"
                  value={filters.capacity}
                  onChange={(e) => setFilters({...filters, capacity: e.target.value})}
                >
                  <option value="">Any</option>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>
              <div className="col-12">
                <button className="btn btn-primary me-2" onClick={handleSearch}>
                  <FaSearch className="me-1" /> Search
                </button>
                <button className="btn btn-secondary" onClick={clearFilters}>
                  Clear All
                </button>
                <span className="ms-3 text-muted">
                  Found {filteredRooms.length} rooms
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Type</th>
                    <th>Bed</th>
                    <th>Price/Night</th>
                    <th>Capacity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No rooms found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    filteredRooms.map((room) => (
                      <tr key={room.id}>
                        <td><strong>{room.roomNumber}</strong></td>
                        <td>{room.roomType}</td>
                        <td>{room.bedType}</td>
                        <td><strong>{formatPrice(room.pricePerNight)}</strong></td>
                        <td>
                          <FaUsers className="me-1" />
                          {room.capacity}
                        </td>
                        <td>
                          <span className={getStatusBadge(room.status)}>
                            {room.status || 'available'}
                          </span>
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
    </>
  );
}

export default SearchRoom;