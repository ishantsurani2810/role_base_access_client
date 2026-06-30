import React from 'react';
import useAuth from '../../hooks/useAuth.js';
import usePermissions from '../../hooks/usePermissions.js';
import { ShieldCheck } from 'lucide-react';

export const DashboardHome = () => {
  const { user } = useAuth();
  const { can } = usePermissions();

  const activePermissionsList = [];
  const modulesToCheck = ['Products', 'Users', 'Invitations', 'Roles'];
  const actionsToCheck = ['create', 'read', 'update', 'delete'];

  modulesToCheck.forEach(mod => {
    actionsToCheck.forEach(act => {
      if (can(mod, act)) {
        activePermissionsList.push({ module: mod, action: act });
      }
    });
  });

  return (
    <div>
      <div className="card dashboard-welcome-banner">
        <h2 className="dashboard-title-lg">
          Welcome Back, {user?.name}!
        </h2>
        <p className="dashboard-subtitle-md">
          You are currently signed in. Your enterprise profile is fully active.
        </p>

        <div className="dashboard-stats-container">
          <div className="dashboard-stat-tile">
            <span className="dashboard-stat-caption">Assigned Template Role</span>
            <div className="dashboard-stat-number">
              <ShieldCheck className="text-primary" style={{ color: 'var(--primary)' }} />
              {user?.roleId?.name || 'Employee'}
            </div>
          </div>

          <div className="dashboard-stat-tile">
            <span className="dashboard-stat-caption">Account Status</span>
            <div className="dashboard-stat-number" style={{ color: 'var(--success)' }}>
              <div className="dashboard-status-dot"></div>
              {user?.status}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="dashboard-header-with-icon">
          <ShieldCheck size={20} style={{ color: 'var(--indigo)' }} />
          Your Permissions
        </h3>
        <p className="dashboard-perm-desc">
          These are the actions you are allowed to perform. The interface automatically shows or hides options based on your access.
        </p>

        {activePermissionsList.length > 0 ? (
          <div className="dashboard-permissions-container">
            {modulesToCheck.map(mod => {
              const actionsForMod = activePermissionsList.filter(p => p.module === mod).map(p => p.action);
              if (actionsForMod.length === 0) return null;

              return (
                <div key={mod} className="dashboard-permission-card">
                  <h4 className="dashboard-permission-card-title">
                    {mod} Module
                  </h4>
                  <div className="dashboard-actions-list">
                    {actionsForMod.map(act => (
                      <span key={act} className="badge badge-indigo dashboard-badge-small">
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="alert alert-warning">
            <span>You do not have any active permissions assigned. Access restricted.</span>
          </div>
        )}
      </div>

      {user?.roleId?.name === 'Admin' && (
        <div className="card">
          <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>What Each Role Can Do</h3>
          <table className="table dashboard-rules-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Allowed Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Admin</b></td>
                <td>Full access to everything — can view, create, edit, and delete. Can also invite users and change their permissions.</td>
              </tr>
              <tr>
                <td><b>Manager</b></td>
                <td>Can view, add, and edit Products. Cannot manage users or roles.</td>
              </tr>
              <tr>
                <td><b>Employee</b></td>
                <td>Can only view Products. Cannot add, edit, or delete anything.</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
