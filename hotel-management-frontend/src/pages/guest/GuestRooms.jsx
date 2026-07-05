// src/pages/guest/GuestRooms.jsx (Fixed - No useDebounce)
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { 
  FaBed, FaUsers, FaSearch, 
  FaWifi, FaCoffee, FaTv, FaSnowflake, FaBath,
  FaStar, FaStarHalf
} from "react-icons/fa";
import PageBanner from "../../components/common/PageBanner";

import room1 from "../../assets/Images/room-1.jpeg";
import room2 from "../../assets/Images/room-2-720x720.jpeg";
import room3 from "../../assets/Images/room-3-720x720.jpeg";
import room4 from "../../assets/Images/room-4-720x720.jpeg";
import room5 from "../../assets/Images/square-5.jpg";
import room6 from "../../assets/Images/square-4.jpg";

import "../../styles/guest-rooms.css";

function GuestRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [filteredRooms, setFilteredRooms] = useState([]);

  const roomImages = {
    "Deluxe King": room1,
    "Deluxe Twin": room2,
    "Twin Room": room3,
    "Suite": room4,
    "Family Room": room5,
    "Standard Room": room6,
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/rooms/available", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedRooms = (response.data || []).map((room, index) => ({
        ...room,
        image: room.imageUrl || roomImages[room.roomType] || [room1, room2, room3, room4, room5, room6][index % 6],
      }));

      setRooms(updatedRooms);
      setFilteredRooms(updatedRooms);
      setLoading(false);
    } catch (err) {
      // Demo data with images
      const demoRooms = [
        { id: 1, roomNumber: "101", roomType: "Deluxe King", bedType: "King", pricePerNight: 89, capacity: 2, status: "available", image: room1, description: "Luxury king room with ocean view." },
        { id: 2, roomNumber: "102", roomType: "Deluxe King", bedType: "King", pricePerNight: 89, capacity: 2, status: "available", image: room2, description: "Luxurious king room with garden view." },
        { id: 3, roomNumber: "103", roomType: "Twin Room", bedType: "Twin", pricePerNight: 65, capacity: 2, status: "available", image: room3, description: "Comfortable twin room with city view." },
        { id: 4, roomNumber: "105", roomType: "Suite", bedType: "King", pricePerNight: 149, capacity: 4, status: "available", image: room4, description: "Luxury suite with separate living area." },
        { id: 5, roomNumber: "201", roomType: "Family Room", bedType: "Queen", pricePerNight: 99, capacity: 4, status: "available", image: room5, description: "Large family room with two queen beds." },
        { id: 6, roomNumber: "203", roomType: "Standard Room", bedType: "Queen", pricePerNight: 55, capacity: 2, status: "available", image: room6, description: "Standard queen room with city view." },
      ];
      setRooms(demoRooms);
      setFilteredRooms(demoRooms);
      setLoading(false);
    }
  };

  const getRoomTypes = () => {
    const types = ["all", ...new Set(rooms.map(room => room.roomType))];
    return types;
  };

  // ✅ Simple search - runs on every change (no debounce)
  useEffect(() => {
    let filtered = [...rooms];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(room =>
        room.roomType?.toLowerCase().includes(term) ||
        room.roomNumber?.toLowerCase().includes(term) ||
        room.description?.toLowerCase().includes(term)
      );
    }
    
    if (selectedType !== "all") {
      filtered = filtered.filter(room => room.roomType === selectedType);
    }
    
    setFilteredRooms(filtered);
  }, [searchTerm, selectedType, rooms]);

  const formatPrice = (amount) => {
    if (!amount) return '₹0';
    const rupeeAmount = amount * 83;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(rupeeAmount);
  };

  const getAmenities = (roomType) => {
    const amenities = {
      'Deluxe King': [
        { icon: <FaWifi />, label: 'Free WiFi' },
        { icon: <FaSnowflake />, label: 'AC' },
        { icon: <FaTv />, label: 'TV' },
        { icon: <FaCoffee />, label: 'Mini Bar' },
        { icon: <FaBath />, label: 'Bathroom' },
      ],
      'Twin Room': [
        { icon: <FaWifi />, label: 'Free WiFi' },
        { icon: <FaSnowflake />, label: 'AC' },
        { icon: <FaTv />, label: 'TV' },
        { icon: <FaBath />, label: 'Bathroom' },
      ],
      'Suite': [
        { icon: <FaWifi />, label: 'Free WiFi' },
        { icon: <FaSnowflake />, label: 'AC' },
        { icon: <FaTv />, label: 'TV' },
        { icon: <FaCoffee />, label: 'Mini Bar' },
        { icon: <FaBath />, label: 'Jacuzzi' },
      ],
      'Family Room': [
        { icon: <FaWifi />, label: 'Free WiFi' },
        { icon: <FaSnowflake />, label: 'AC' },
        { icon: <FaTv />, label: 'TV' },
        { icon: <FaBath />, label: 'Bathroom' },
        { icon: <FaCoffee />, label: 'Kitchen' },
      ],
      'Standard Room': [
        { icon: <FaWifi />, label: 'Free WiFi' },
        { icon: <FaSnowflake />, label: 'AC' },
        { icon: <FaTv />, label: 'TV' },
        { icon: <FaBath />, label: 'Bathroom' },
      ],
    };
    return amenities[roomType] || amenities['Standard Room'];
  };

  if (loading) {
    return (
      <>
        <PageBanner title="Our Rooms" />
        <div className="guest-rooms-container">
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
      <PageBanner title="Our Rooms" />
      <div className="guest-rooms-container">
        <div className="container py-5">
          <div className="guest-rooms-header">
            <div className="search-filter-wrapper">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="filter-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {getRoomTypes().map(type => (
                  <option key={type} value={type}>
                    {type === "all" ? "All Types" : type}
                  </option>
                ))}
              </select>
            </div>
            <p className="rooms-count">{filteredRooms.length} rooms available</p>
          </div>

          <div className="rooms-grid">
            {filteredRooms.length === 0 ? (
              <div className="no-rooms">
                <h4>No rooms available</h4>
                <p>Please try different search criteria</p>
              </div>
            ) : (
              filteredRooms.map((room, index) => (
                <div className="room-card-guest" key={room.id} style={{ '--i': index + 1 }}>
                  <div className="room-card-image">
                    <img src={room.image} alt={room.roomType} />
                    <div className="room-overlay">
                      <span className="room-status available">Available</span>
                      <div className="room-price-badge">
                        {formatPrice(room.pricePerNight)}
                        <small>/Night</small>
                      </div>
                    </div>
                  </div>

                  <div className="room-card-body">
                    <div className="room-title">
                      <h3>{room.roomType}</h3>
                      <div className="room-stars">
                        <FaStar /><FaStar /><FaStar /><FaStar /><FaStarHalf />
                      </div>
                    </div>

                    <div className="room-specs">
                      <span><FaUsers /> {room.capacity} Guests</span>
                      <span><FaBed /> {room.bedType} Bed</span>
                    </div>

                    <p className="room-description">{room.description}</p>

                    <div className="room-amenities">
                      {getAmenities(room.roomType).slice(0, 4).map((amenity, i) => (
                        <span key={i} className="amenity-tag">
                          {amenity.icon} {amenity.label}
                        </span>
                      ))}
                    </div>

                    <div className="room-card-footer">
                      <div className="room-price">
                        {formatPrice(room.pricePerNight)}
                        <span>/night</span>
                      </div>
                      <Link to={`/booking?room=${room.id}`} className="book-now-btn-guest">
                        BOOK NOW →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default GuestRooms;