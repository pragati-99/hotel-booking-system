// src/components/common/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/" />;
  }

  // ✅ If no allowedRoles specified, allow all authenticated users
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  // ✅ Check if user's role is allowed
  if (!allowedRoles.includes(role)) {
    // Redirect based on role
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" />;
    if (role === 'RECEPTIONIST') return <Navigate to="/receptionist/dashboard" />;
    if (role === 'GUEST') return <Navigate to="/dashboard" />;
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;