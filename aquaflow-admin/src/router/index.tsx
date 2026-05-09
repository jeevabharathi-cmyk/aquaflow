import * as React from 'react';
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AdminLayout } from '@/components/common/AdminLayout';
import LoginPage from '@/pages/auth/Login';
import RegisterPage from '@/pages/auth/Register';

import { AuthGuard } from '@/components/auth/AuthGuard';

// Lazy load pages
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const Orders = lazy(() => import('@/pages/orders/Orders'));
const Suppliers = lazy(() => import('@/pages/suppliers/Suppliers'));
const Inventory = lazy(() => import('@/pages/inventory/Inventory'));
const Products = lazy(() => import('@/pages/products/Products'));
const Assembly = lazy(() => import('@/pages/assembly/Assembly'));
const Customers = lazy(() => import('@/pages/customers/Customers'));
const Dispatch = lazy(() => import('@/pages/dispatch/Dispatch'));
const Payments = lazy(() => import('@/pages/payments/Payments'));
const Analytics = lazy(() => import('@/pages/analytics/Analytics'));
const Settings = lazy(() => import('@/pages/settings/Settings'));
const Audit = lazy(() => import('@/pages/audit/Audit'));

const PageLoader = () => (
  <div className="flex h-[60vh] items-center justify-center">
    <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

// Layout wrapper component that uses the AdminLayout
const LayoutWrapper = () => (
  <AdminLayout>
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  </AdminLayout>
);

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      
      {/* Admin Protected Routes */}
      <Route element={
        <AuthGuard>
          <LayoutWrapper />
        </AuthGuard>
      }>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/products" element={<Products />} />
        <Route path="/assembly" element={<Assembly />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/map" element={<Dispatch />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/audit" element={<Audit />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
