// src/pages/RoomDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import PageBanner from "../../components/common/PageBanner";
import { FaBed, FaUsers, FaCheck, FaWifi, FaCoffee, FaTv, FaSnowflake, FaBath } from "react-icons/fa";
import "../../styles/roomdetails.css";
import defaultRoomImg from "../../assets/images/room-1.jpeg";

function RoomDetails() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/rooms/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          setRoom(response.data);
          setLoading(false);
        } else {
          setError("Room not found");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching room:", err);
        // If API fails, use demo data based on ID
        const demoRoom = getDemoRoom(id);
        if (demoRoom) {
          setRoom(demoRoom);
          setLoading(false);
          toast.info("Showing demo room data");
        } else {
          setError("Failed to load room details. Please try again.");
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchRoom();
    } else {
      setError("Invalid room ID");
      setLoading(false);
    }
  }, [id]);

  // Demo rooms based on ID
  const getDemoRoom = (roomId) => {
    const rooms = {
      1: { 
        id: 1, roomNumber: '101', roomType: 'Deluxe King', 
        bedType: 'King', pricePerNight: 250, capacity: 2, 
        status: 'available', floor: 1,
        description: 'Experience luxury in our Deluxe King room with stunning ocean views, premium amenities, and a spacious balcony perfect for relaxation.'
      },
      2: { 
        id: 2, roomNumber: '102', roomType: 'Deluxe King', 
        bedType: 'King', pricePerNight: 250, capacity: 2, 
        status: 'available', floor: 1,
        description: 'Luxurious king room with garden view, modern amenities, and elegant decor for a memorable stay.'
      },
      3: { 
        id: 3, roomNumber: '103', roomType: 'Twin Room', 
        bedType: 'Twin', pricePerNight: 180, capacity: 2, 
        status: 'available', floor: 1,
        description: 'Comfortable twin room with city view, perfect for friends or colleagues traveling together.'
      },
      4: { 
        id: 4, roomNumber: '104', roomType: 'Twin Room', 
        bedType: 'Twin', pricePerNight: 180, capacity: 2, 
        status: 'booked', floor: 1,
        description: 'Spacious twin room with garden view, ideal for business travelers or small groups.'
      },
      5: { 
        id: 5, roomNumber: '105', roomType: 'Suite', 
        bedType: 'King', pricePerNight: 450, capacity: 4, 
        status: 'available', floor: 2,
        description: 'Luxury suite with separate living area, dining space, and panoramic views of the city skyline.'
      },
      6: { 
        id: 6, roomNumber: '106', roomType: 'Suite', 
        bedType: 'King', pricePerNight: 450, capacity: 4, 
        status: 'available', floor: 2,
        description: 'Premium suite with ocean view, private jacuzzi, and a spacious balcony for ultimate relaxation.'
      },
      7: { 
        id: 7, roomNumber: '201', roomType: 'Family Room', 
        bedType: 'Queen', pricePerNight: 320, capacity: 4, 
        status: 'available', floor: 2,
        description: 'Large family room with two queen beds, perfect for family vacations with kids.'
      },
      8: { 
        id: 8, roomNumber: '202', roomType: 'Family Room', 
        bedType: 'Queen', pricePerNight: 320, capacity: 4, 
        status: 'booked', floor: 2,
        description: 'Family room with garden view and connecting door option for larger families.'
      },
    };
    return rooms[roomId] || null;
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

  const getStatusText = (status) => {
    const statusMap = {
      'available': '✅ Available',
      'booked': '🔴 Booked',
      'occupied': '🔴 Occupied',
      'maintenance': '🔧 Maintenance'
    };
    return statusMap[status] || status;
  };

  const amenities = [
    { icon: <FaWifi />, label: 'Free WiFi' },
    { icon: <FaSnowflake />, label: 'Air Conditioning' },
    { icon: <FaTv />, label: 'Flat Screen TV' },
    { icon: <FaCoffee />, label: 'Mini Bar' },
    { icon: <FaBath />, label: 'Private Bathroom' },
    { icon: <FaBed />, label: 'Premium Bedding' },
  ];

  if (loading) {
    return (
      <>
        <PageBanner title="Room Details" />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading room details...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageBanner title="Room Details" />
        <div className="container py-5">
          <div className="alert alert-danger text-center">
            <h4 className="mb-3">⚠️ {error}</h4>
            <Link to="/rooms" className="btn btn-primary">
              Back to Rooms
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!room) {
    return (
      <>
        <PageBanner title="Room Details" />
        <div className="container py-5">
          <div className="alert alert-warning text-center">
            <h4 className="mb-3">⚠️ Room not found</h4>
            <p className="mb-3">The room you are looking for does not exist.</p>
            <Link to="/rooms" className="btn btn-primary">
              Back to Rooms
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner title={room.roomType || "Room Details"} />
      <section className="room-details-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {/* Room Image */}
              <div className="room-image-container">
                <img
                  src={defaultRoomImg}
                  alt={room.roomType}
                  className="img-fluid rounded room-main-image"
                />
                <div className="room-status-overlay">
                  <span className={getStatusBadge(room.status)}>
                    {getStatusText(room.status)}
                  </span>
                </div>
              </div>

              {/* Room Info */}
              <div className="room-info mt-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}>
                      {room.roomType}
                    </h2>
                    <p className="text-muted">
                      <FaBed className="me-1" /> {room.bedType} Bed • Room {room.roomNumber} • Floor {room.floor}
                    </p>
                  </div>
                  <div className="text-end">
                    <h3 style={{ color: '#C9A27B' }}>{formatPrice(room.pricePerNight)}</h3>
                    <small className="text-muted">per night</small>
                  </div>
                </div>

                <p className="mt-3">{room.description}</p>

                {/* Amenities */}
                <div className="room-amenities mt-4">
                  <h5>Amenities</h5>
                  <div className="row">
                    {amenities.map((item, index) => (
                      <div className="col-md-4 col-6" key={index}>
                        <div className="amenity-item">
                          <span className="amenity-icon">{item.icon}</span>
                          <span className="amenity-label">{item.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="col-lg-4">
              <div className="booking-card">
                <h5>Book This Room</h5>
                <div className="price-display">
                  <h3>{formatPrice(room.pricePerNight)}</h3>
                  <span>/ night</span>
                </div>
                <hr />
                <div className="room-specs">
                  <p><strong>Room Number:</strong> {room.roomNumber}</p>
                  <p><strong>Bed Type:</strong> {room.bedType}</p>
                  <p><strong>Capacity:</strong> <FaUsers className="me-1" /> {room.capacity} Guests</p>
                  <p><strong>Status:</strong> <span className={getStatusBadge(room.status)}>
                    {getStatusText(room.status)}
                  </span></p>
                </div>
                {room.status === 'available' ? (
                  <Link to={`/booking?room=${room.id}`} className="btn btn-primary w-100 mt-3">
                    Book Now
                  </Link>
                ) : (
                  <button className="btn btn-secondary w-100 mt-3" disabled>
                    Not Available
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default RoomDetails;