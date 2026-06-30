import React from 'react';
import usePermissions from '../hooks/usePermissions.js';

export const PermissionGuard = ({ module, action, children, fallback = null }) => {
  const { can } = usePermissions();

  const isAllowed = can(module, action);

  if (!isAllowed) {
    if (fallback === 'block') {
      return (
        <div className="card text-center" style={{ margin: '40px auto', maxWidth: '600px', padding: '40px' }}>
          <div style={{ color: 'var(--danger)', fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ marginBottom: '12px' }}>Access Denied</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>
            You do not have the required permissions to view this module. Please contact your system administrator.
          </p>
        </div>
      );
    }
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGuard;
