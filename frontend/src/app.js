import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import UserHome from './pages/UserHome';
import LinkedUserHome from './pages/LinkedUserHome';
import TravelPartnerHome from './pages/TravelPartnerHome';
import AdminLayout from './pages/admin/AdminLayout';
import './i18n/i18n';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'linked_user': return '/linked';
      case 'travel_partner': return '/partner';
      case 'admin': return '/admin';
      default: return '/dashboard';
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        theme={isDark ? 'dark' : 'light'}
        toastStyle={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
      />
      <Routes>
        <Route path="/login" element={user ? <Navigate to={getDashboardRoute()} replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={getDashboardRoute()} replace /> : <Register />} />
        <Route path="/dashboard" element={<PrivateRoute allowedRoles={['guardian']}><UserHome /></PrivateRoute>} />
        <Route path="/linked" element={<PrivateRoute allowedRoles={['linked_user']}><LinkedUserHome /></PrivateRoute>} />
        <Route path="/partner" element={<PrivateRoute allowedRoles={['travel_partner']}><TravelPartnerHome /></PrivateRoute>} />
        <Route path="/admin/*" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout /></PrivateRoute>} />
        <Route path="/" element={<Navigate to={user ? getDashboardRoute() : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
