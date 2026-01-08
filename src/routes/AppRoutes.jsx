import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../features/auth/Login';
import Signup from '../features/auth/Signup';
import LandingPage from '../features/landing/LandingPage';
import PassengerDashboard from '../features/passenger/Dashboard';
import DriverDashboard from '../features/driver/Dashboard';
import AdminDashboard from '../features/admin/Dashboard';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
      
      {/* Protected Routes */}
      <Route element={<AppLayout />}>
        <Route path="/passenger" element={
          <ProtectedRoute allowedRoles={['passenger']}>
            <PassengerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/driver" element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
