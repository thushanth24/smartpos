import React from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import LoginScreen from './pages/login-screen';
import SalesDashboard from './pages/sales-dashboard';
import PointOfSaleTerminal from './pages/point-of-sale-terminal';
import ProductManagement from './pages/product-management';
import InventoryManagement from './pages/inventory-management';
import UserManagement from './pages/user-management';
import NotFound from './pages/NotFound';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Root route */}
          <Route path="/" element={<SalesDashboard />} />
          
          {/* Authentication */}
          <Route path="/login-screen" element={<LoginScreen />} />
          
          {/* Main Application Routes */}
          <Route path="/sales-dashboard" element={<SalesDashboard />} />
          <Route path="/point-of-sale-terminal" element={<PointOfSaleTerminal />} />
          <Route path="/product-management" element={<ProductManagement />} />
          <Route path="/inventory-management" element={<InventoryManagement />} />
          <Route path="/user-management" element={<UserManagement />} />
          
          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRoutes;