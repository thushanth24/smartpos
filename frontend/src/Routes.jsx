import React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from './components/ui/toaster';

// Pages
import LoginScreen from './pages/login-screen';
import ForgotPassword from './pages/forgot-password';
import ResetPassword from './pages/reset-password';
import SalesDashboard from './pages/sales-dashboard';
import PointOfSaleTerminal from './pages/point-of-sale-terminal';
import ProductManagement from './pages/product-management';
import InventoryManagement from './pages/inventory-management';
import UserManagement from './pages/user-management';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Layout component for authenticated routes
const AuthenticatedLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-100">
    {/* You can add a common layout for all authenticated pages here */}
    {children}
  </div>
);

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public routes */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Protected routes - require authentication */}
        <Route path="/" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <SalesDashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/sales-dashboard" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <SalesDashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/pos-terminal" element={
          <ProtectedRoute requiredRoles={['cashier', 'admin']}>
            <AuthenticatedLayout>
              <PointOfSaleTerminal />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/products" element={
          <ProtectedRoute requiredRoles={['inventory_manager', 'admin']}>
            <AuthenticatedLayout>
              <ProductManagement />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/inventory" element={
          <ProtectedRoute requiredRoles={['inventory_manager', 'admin']}>
            <AuthenticatedLayout>
              <InventoryManagement />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute requireAdmin>
            <AuthenticatedLayout>
              <UserManagement />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        
        {/* Redirect old login path to new one */}
        <Route path="/login-screen" element={<Navigate to="/login" replace />} />
        
        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      
      {/* Toast notifications */}
      <Toaster />
    </ErrorBoundary>
  );
};

export default AppRoutes;