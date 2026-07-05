// src/components/common/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome, FaBed, FaInfoCircle, FaBook, FaEnvelope,
  FaBars, FaTimes, FaUser, FaSignOutAlt,
  FaChevronDown, FaUserCircle, FaCalendarCheck,
  FaUserPlus
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Login from '../../pages/auth/Login';
import Register from '../../pages/auth/Register';
import '../../styles/navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsHomePage(location.pathname === '/');
  }, [location]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("username");
    setIsLoggedIn(!!token);
    setUserRole(role);
    setUsername(name || "");
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    toast.success('Logged out successfully');
    navigate('/');
    closeMenu();
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setTimeout(() => setShowRegisterModal(true), 100);
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setTimeout(() => setShowLoginModal(true), 100);
  };

  // ✅ Main links - always visible
  const mainLinks = [
    { path: '/', label: 'Home', icon: <FaHome /> },
    { path: '/about', label: 'About', icon: <FaInfoCircle /> },
    { path: '/contact', label: 'Contact', icon: <FaEnvelope /> },
  ];

  // ✅ Dynamic links based on role
  const getDynamicLinks = () => {
    const links = [];
    
    if (isLoggedIn) {
      if (userRole === 'GUEST') {
        links.push({ path: '/guest/rooms', label: 'Rooms', icon: <FaBed /> });
        links.push({ path: '/booking', label: 'Booking', icon: <FaBook /> });
      } else if (userRole === 'ADMIN' || userRole === 'RECEPTIONIST') {
        links.push({ path: '/rooms', label: 'Rooms', icon: <FaBed /> });
        links.push({ path: '/booking', label: 'Booking', icon: <FaBook /> });
      }
    } else {
      // Public users
      links.push({ path: '/rooms', label: 'Rooms', icon: <FaBed /> });
      links.push({ path: '/booking', label: 'Booking', icon: <FaBook /> });
    }
    
    return links;
  };

  // ✅ Dropdown items based on role
  const getDropdownItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/profile', label: 'My Profile' },
    ];

    const guestItems = [
      { path: '/my-bookings', label: ' My Bookings' },
      { path: '/guest/rooms', label: ' Available Rooms' },
      { path: '/pre-booking', label: ' Pre-Booking' },
    ];

    const adminItems = [
      { path: '/employees', label: ' Employees' },
      { path: '/bookings', label: ' All Bookings' },
      { path: '/reports', label: ' Reports' },
      { path: '/refund-management', label: ' Refunds' },
      { path: '/pre-booking-management', label: ' Pre-Bookings' },
      { path: '/rooms', label: ' Room Management' },
      { path: '/customers', label: ' Customers' },
      { path: '/drivers', label: ' Drivers' }
    ];

    const receptionistItems = [
      { path: '/bookings', label: ' All Bookings' },
      { path: '/checkin', label: ' Check In' },
      { path: '/checkout', label: ' Check Out' },
      { path: '/refund-management', label: ' Refunds' },
      { path: '/pre-booking-management', label: ' Pre-Bookings' },
      { path: '/rooms', label: ' Room Management' },
      { path: '/customers', label: ' Customers' },
     
    ];

    if (userRole === 'ADMIN') {
      return [...commonItems, ...adminItems];
    } else if (userRole === 'RECEPTIONIST') {
      return [...commonItems, ...receptionistItems];
    } else if (userRole === 'GUEST') {
      return [...commonItems, ...guestItems];
    }
    return commonItems;
  };

  const getDisplayName = () => username || "User";
  const getRoleBadge = () => {
    const roleColors = { ADMIN: 'admin', RECEPTIONIST: 'receptionist', GUEST: 'guest' };
    return roleColors[userRole] || 'guest';
  };

  const getNavbarClass = () => {
    let classes = 'navbar-main';
    if (isScrolled) classes += ' navbar-scrolled';
    if (!isHomePage && !isScrolled) classes += ' navbar-dark-bg';
    return classes;
  };

  return (
    <>
      <nav className={getNavbarClass()}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <span>
              <span className="logo-text">HOTEL</span>
              <span className="logo-sub">BOOKING</span>
            </span>
          </Link>

          <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
            {/* Main links */}
            {mainLinks.map((link) => (
              <li key={link.path} className="navbar-item">
                <Link
                  to={link.path}
                  className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  {link.icon}
                  {link.label}
                </Link>
              </li>
            ))}
            
            {/* ✅ Dynamic links based on role */}
            {getDynamicLinks().map((link) => (
              <li key={link.path} className="navbar-item">
                <Link
                  to={link.path}
                  className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  {link.icon}
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Mobile auth buttons */}
            <li className="navbar-item mobile-auth">
              {isLoggedIn ? (
                <>
                  <div className="mobile-user-info">
                    <span className="mobile-username">
                      <FaUserCircle /> {getDisplayName()}
                    </span>
                    <span className={`mobile-role-badge ${getRoleBadge()}`}>
                      {userRole}
                    </span>
                  </div>
                  {getDropdownItems().map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="navbar-link mobile-dropdown-item"
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button onClick={handleLogout} className="navbar-link mobile-logout-btn">
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="navbar-link mobile-login-btn"
                    onClick={() => {
                      closeMenu();
                      setShowLoginModal(true);
                    }}
                  >
                    <FaUser /> Login
                  </button>
                  <button
                    className="navbar-link mobile-register-btn"
                    onClick={() => {
                      closeMenu();
                      setShowRegisterModal(true);
                    }}
                  >
                    <FaUserPlus /> Register
                  </button>
                </>
              )}
            </li>
          </ul>

          <div className="navbar-right">
            {isLoggedIn && userRole === 'GUEST' ? (
              <Link to="/guest/rooms" className="book-now-btn">VIEW ROOMS</Link>
            ) : isLoggedIn ? (
              <Link to="/booking" className="book-now-btn">BOOK NOW</Link>
            ) : (
              <Link to="/booking" className="book-now-btn">BOOK NOW</Link>
            )}

            {isLoggedIn ? (
              <div className="user-section" ref={dropdownRef}>
                <div className="user-profile-btn" onClick={toggleDropdown}>
                  <FaUserCircle className="user-icon" />
                  <span className="user-name">{getDisplayName()}</span>
                  <FaChevronDown className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
                </div>

                {isDropdownOpen && (
                  <div className="dropdown-menu show">
                    <div className="dropdown-header">
                      <div className="dropdown-user-avatar"><FaUserCircle /></div>
                      <div className="dropdown-user-info">
                        <span className="dropdown-username">{getDisplayName()}</span>
                        <span className={`dropdown-role ${getRoleBadge()}`}>{userRole}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    {getDropdownItems().map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="dropdown-item"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          closeMenu();
                        }}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout-item">
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  className="login-btn-nav"
                  onClick={() => setShowLoginModal(true)}
                >
                  <FaUser /> Login
                </button>
                <button
                  className="login-btn-nav register-btn-nav"
                  onClick={() => setShowRegisterModal(true)}
                >
                  <FaUserPlus /> Register
                </button>
              </>
            )}
          </div>

          <button className="hamburger-btn" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      <Login
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={switchToRegister}
      />

      <Register
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
}

export default Navbar;