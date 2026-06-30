import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import usePermissions from '../hooks/usePermissions.js';
import { LayoutDashboard, Box, Users, LogOut, User } from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="layout-logo-badge">
            🔒
          </div>
          <span>SecureAuth</span>
        </div>

        <ul className="sidebar-menu">
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          </li>

          {can('Products', 'read') && (
            <li>
              <NavLink to="/products" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Box size={18} />
                <span>Products</span>
              </NavLink>
            </li>
          )}

          {can('Users', 'read') && (
            <li>
              <NavLink to="/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Users size={18} />
                <span>User Management</span>
              </NavLink>
            </li>
          )}
        </ul>

        {/* Sidebar Footer User Card */}
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">{user.roleId?.name || 'Employee'}</div>
          </div>
        )}
      </aside>

      {/* Main Panel Content Area */}
      <main className="dashboard-main">
        <header className="header">
          <div className="header-title-bar">
            {/* Context title will render from pages */}
          </div>
          
          <div className="header-profile">
            <div className="layout-header-profile-row">
              <User size={18} style={{ color: 'var(--primary)' }} />
              <span className="layout-header-profile-email">{user?.email}</span>
            </div>
            
            <button className="btn btn-secondary btn-sm layout-logout-btn" onClick={handleLogout}>
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
