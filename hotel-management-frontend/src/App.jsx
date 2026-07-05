// src/App.jsx - Complete
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import Employees from "./pages/admin/Employees";
import Departments from "./pages/admin/Departments";
import ManagerInfo from "./pages/admin/ManagerInfo";

// Receptionist Pages
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import CheckIn from "./pages/receptionist/CheckIn";
import CheckOut from "./pages/receptionist/CheckOut";

// Guest Pages
import Dashboard from "./pages/guest/Dashboard";
import GuestRooms from "./pages/guest/GuestRooms";
import MyBookings from "./pages/guest/MyBookings";
import MyProfile from "./pages/guest/MyProfile";
import InvoiceView from "./pages/guest/InvoiceView";

// Common Pages
import Rooms from "./pages/common/Rooms";
import RoomDetails from "./pages/common/RoomDetails";
import Booking from "./pages/common/Booking";
import BookingConfirmation from "./pages/common/BookingConfirmation";
import SearchRoom from "./pages/common/SearchRoom";
import Customers from "./pages/common/Customers";
import Drivers from "./pages/common/Drivers";
import Bookings from "./pages/common/Bookings";

// Static Pages
import About from "./pages/static/About";
import Contact from "./pages/static/Contact";

// Reports & Refund & Pre-Booking
import Reports from "./components/reports/Reports";
import RefundHistory from "./components/refund/RefundHistory";
import RefundManagement from "./components/refund/RefundManagement";
import PreBooking from "./components/booking/PreBooking";
import PreBookingManagement from "./components/booking/PreBookingManagement";
// Homepage Components
import Hero from "./components/home/Hero";
import AboutSection from "./components/home/About";
import RoomService from "./components/home/RoomService";
import Pricing from "./components/home/Pricing";
import FlashPromo from "./components/home/FlashPromo";
import Estimation from "./components/home/Estimation";
import Blog from "./components/home/Blog";
import BackToTop from "./components/home/BackToTop";

// Import CSS
import "./App.css";
import "./index.css";

// 404 Page
const NotFound = () => (
  <div className="container py-5 text-center" style={{
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <h1 className="display-1" style={{ fontSize: '100px', color: '#A8876A' }}>404</h1>
    <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}>Page Not Found</h2>
    <p className="text-muted">The page you are looking for does not exist.</p>
    <a href="/" className="btn btn-primary mt-3">Go Home</a>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* ==========================================
                PUBLIC ROUTES - No Login Required
                ========================================== */}

            {/* Home Page */}
            <Route path="/" element={
              <>
                <Hero />
                <AboutSection />
                <RoomService />
                <Pricing />
                <FlashPromo />
                <Estimation />
                <Blog />
                <BackToTop />
              </>
            } />

            {/* Static Pages */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Public Room & Booking */}
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />

            {/* ==========================================
                GUEST ROUTES
                ========================================== */}

            {/* Guest Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={["GUEST"]}>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Guest Rooms - Card View */}
            <Route path="/guest/rooms" element={
              <ProtectedRoute allowedRoles={["GUEST"]}>
                <GuestRooms />
              </ProtectedRoute>
            } />

            {/* Guest Bookings */}
            <Route path="/my-bookings" element={
              <ProtectedRoute allowedRoles={["GUEST"]}>
                <MyBookings />
              </ProtectedRoute>
            } />

            {/* Guest Profile */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            } />

            {/* Invoice View */}
            <Route path="/invoice/:id" element={
              <ProtectedRoute>
                <InvoiceView />
              </ProtectedRoute>
            } />

            {/* Pre-Booking */}
            <Route path="/pre-booking" element={
              <ProtectedRoute allowedRoles={["GUEST"]}>
                <PreBooking />
              </ProtectedRoute>
            } />

            {/* ==========================================
                COMMON ROUTES - Admin & Receptionist Only
                ========================================== */}

            {/* Rooms - Table View (Admin/Receptionist) */}
            <Route path="/rooms" element={
              <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]}>
                <Rooms />
              </ProtectedRoute>
            } />

            {/* Search Room */}
            <Route path="/search-room" element={
              <ProtectedRoute>
                <SearchRoom />
              </ProtectedRoute>
            } />

            {/* ==========================================
                ADMIN ROUTES
                ========================================== */}

            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/employees" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Employees />
              </ProtectedRoute>
            } />

            <Route path="/departments" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Departments />
              </ProtectedRoute>
            } />

            <Route path="/manager-info" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ManagerInfo />
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Reports />
              </ProtectedRoute>
            } />

            {/* Refund Management - Admin */}
            <Route path="/refund-management" element={
              <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]}>
                <RefundManagement userRole={localStorage.getItem('role')} />
              </ProtectedRoute>
            } />

            <Route path="/refund-history" element={
              <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]}>
                <RefundHistory />
              </ProtectedRoute>
            } />

            <Route path="/pre-booking-management" element={
              <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]}>
                <PreBookingManagement userRole={localStorage.getItem('role')} />
              </ProtectedRoute>
            } />

            {/* ==========================================
                RECEPTIONIST ROUTES
                ========================================== */}

            <Route path="/receptionist/dashboard" element={
              <ProtectedRoute allowedRoles={["RECEPTIONIST"]}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            } />

            <Route path="/checkin" element={
              <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]}>
                <CheckIn />
              </ProtectedRoute>
            } />

            <Route path="/checkout" element={
              <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]}>
                <CheckOut />
              </ProtectedRoute>
            } />

            {/* ==========================================
                ADMIN & RECEPTIONIST ROUTES
                ========================================== */}

            <Route path="/customers" element={
              <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]}>
                <Customers />
              </ProtectedRoute>
            } />

            <Route path="/drivers" element={
              <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]}>
                <Drivers />
              </ProtectedRoute>
            } />

            <Route path="/bookings" element={
              <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]}>
                <Bookings />
              </ProtectedRoute>
            } />

            {/* ==========================================
                REDIRECTS
                ========================================== */}
            <Route path="/login" element={<Navigate to="/" />} />
            <Route path="/register" element={<Navigate to="/" />} />
            <Route path="/customers/add" element={<Navigate to="/customers" />} />
            <Route path="/drivers/add" element={<Navigate to="/drivers" />} />
            <Route path="/rooms/add" element={<Navigate to="/rooms" />} />
            <Route path="/employees/add" element={<Navigate to="/employees" />} />

            {/* ==========================================
                404 - Not Found
                ========================================== */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;