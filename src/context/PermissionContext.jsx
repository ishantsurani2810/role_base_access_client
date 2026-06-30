import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext.jsx';

const PermissionContext = createContext(null);

export const PermissionProvider = ({ children }) => {
  const { user } = useAuth();

  const can = (moduleName, actionName) => {
    if (!user) return false;

    // Admin bypasses all checks
    if (user.roleId && user.roleId.name === 'Admin') {
      return true;
    }

    const overrides = user.permissions || [];
    const rolePermissions = user.roleId?.permissions || [];

    // 1. Scan overrides first
    const override = overrides.find(p => p.module === moduleName);
    if (override) {
      return override.actions.includes(actionName);
    }

    // 2. Scan role standard settings
    const rolePermission = rolePermissions.find(p => p.module === moduleName);
    if (rolePermission) {
      return rolePermission.actions.includes(actionName);
    }

    return false;
  };

  return (
    <PermissionContext.Provider value={{ can }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used under a PermissionProvider.');
  }
  return context;
};
