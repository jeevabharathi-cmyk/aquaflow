import * as React from 'react';
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/common/AdminLayout';

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

export const AppRouter = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<div className="flex h-screen items-center justify-center">Login Page Placeholder</div>} />
        
        <Route path="/" element={<AdminLayout><Navigate to="/dashboard" replace /></AdminLayout>} />
        
        <Route path="/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/orders" element={<AdminLayout><Orders /></AdminLayout>} />
        <Route path="/suppliers" element={<AdminLayout><Suppliers /></AdminLayout>} />
        <Route path="/inventory" element={<AdminLayout><Inventory /></AdminLayout>} />
        <Route path="/products" element={<AdminLayout><Products /></AdminLayout>} />
        <Route path="/assembly" element={<AdminLayout><Assembly /></AdminLayout>} />
        <Route path="/customers" element={<AdminLayout><Customers /></AdminLayout>} />
        <Route path="/dispatch" element={<AdminLayout><Dispatch /></AdminLayout>} />
        <Route path="/payments" element={<AdminLayout><Payments /></AdminLayout>} />
        <Route path="/analytics" element={<AdminLayout><Analytics /></AdminLayout>} />
        <Route path="/settings" element={<AdminLayout><Settings /></AdminLayout>} />
        <Route path="/audit" element={<AdminLayout><Audit /></AdminLayout>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};
