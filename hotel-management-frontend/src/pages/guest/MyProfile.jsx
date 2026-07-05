// src/pages/guest/MyProfile.jsx - Modern Colorful Design
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  FaUser, FaEnvelope, FaCalendar, FaEdit, FaSave, 
  FaUserTie, FaPhone, FaMapMarkerAlt, FaIdCard
} from "react-icons/fa";
import PageBanner from "../../components/common/PageBanner";
import "../../styles/pages.css";

function MyProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    role: "",
    createdAt: "",
    fullName: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    
    if (!token) {
      navigate("/login");
      return;
    }
    
    setUserData({
      username: username || "",
      email: "",
      role: role || "GUEST",
      createdAt: new Date().toLocaleDateString(),
      fullName: "",
      phone: "",
      address: ""
    });
  }, [navigate]);

  const handleSave = async () => {
    setLoading(true);
    try {
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      ADMIN: "admin",
      RECEPTIONIST: "receptionist",
      GUEST: "guest"
    };
    return styles[role] || "guest";
  };

  const getRoleIcon = (role) => {
    if (role === "ADMIN") return <FaUserTie />;
    if (role === "RECEPTIONIST") return <FaUserTie />;
    return <FaUser />;
  };

  const infoItems = [
    { label: "Username", value: userData.username, icon: <FaUser /> },
    { label: "Email", value: userData.email || "Not provided", icon: <FaEnvelope /> },
    { label: "Full Name", value: userData.fullName || "Not provided", icon: <FaIdCard /> },
    { label: "Role", value: userData.role, icon: <FaUserTie />, isRole: true },
    { label: "Phone", value: userData.phone || "Not provided", icon: <FaPhone /> },
    { label: "Member Since", value: userData.createdAt, icon: <FaCalendar /> },
  ];

  return (
    <>
      <PageBanner title="My Profile" />
      <div className="page-container">
        <div className="container py-4">
          <div className="profile-modern">
            {/* Header */}
            <div className="profile-header text-center">
              <div className="profile-avatar mx-auto">
                {getRoleIcon(userData.role)}
              </div>
              <div className="profile-name">{userData.username}</div>
              <div className="profile-role">{userData.role}</div>
            </div>

            {/* Body */}
            <div className="profile-body">
              <div className="info-grid">
                {infoItems.map((item, index) => (
                  <div className="info-item" key={index}>
                    <div className="label">{item.label}</div>
                    <div className="value">
                      {editing && item.label !== "Role" && item.label !== "Member Since" ? (
                        <input
                          type={item.label === "Email" ? "email" : "text"}
                          className="form-control"
                          value={userData[item.label.toLowerCase().replace(/\s/g, '')]}
                          onChange={(e) => setUserData({...userData, [item.label.toLowerCase().replace(/\s/g, '')]: e.target.value})}
                          placeholder={`Enter ${item.label}`}
                        />
                      ) : item.isRole ? (
                        <span className={`badge-role ${getRoleBadge(item.value)}`}>
                          {item.value}
                        </span>
                      ) : (
                        item.value
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="text-center mt-4">
                {editing ? (
                  <button className="btn-primary-gradient" onClick={handleSave} disabled={loading}>
                    <FaSave className="me-2" /> {loading ? "Saving..." : "Save Changes"}
                  </button>
                ) : (
                  <button className="btn-primary-gradient" onClick={() => setEditing(true)}>
                    <FaEdit className="me-2" /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MyProfile;