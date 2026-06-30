import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

/* Providers */
import { AuthProvider } from './context/AuthContext.jsx';
import { PermissionProvider } from './context/PermissionContext.jsx';

/* Route wrappers */
import ProtectedRoute from './router/ProtectedRoute.jsx';
import PermissionGuard from './router/PermissionGuard.jsx';

/* Layouts */
import DashboardLayout from './layouts/DashboardLayout.jsx';

/* Views */
import Login from './views/auth/Login.jsx';
import AcceptInvitation from './views/auth/AcceptInvitation.jsx';
import DashboardHome from './views/dashboard/DashboardHome.jsx';
import ProductsList from './views/products/ProductsList.jsx';
import UserManagement from './views/users/UserManagement.jsx';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PermissionProvider>
          <Routes>
            {/* Authentications & onboarding - Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/accept-invitation" element={<AcceptInvitation />} />

            {/* Dashboard routes - Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                {/* Default Dashboard landing */}
                <Route path="/dashboard" element={<DashboardHome />} />

                {/* Products CRUD module path - requires Products:read */}
                <Route
                  path="/products"
                  element={
                    <PermissionGuard module="Products" action="read" fallback="block">
                      <ProductsList />
                    </PermissionGuard>
                  }
                />

                {/* User management path - requires Users:read */}
                <Route
                  path="/users"
                  element={
                    <PermissionGuard module="Users" action="read" fallback="block">
                      <UserManagement />
                    </PermissionGuard>
                  }
                />
              </Route>
            </Route>

            {/* Invalidation fallback redirection */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </PermissionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
