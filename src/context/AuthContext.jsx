import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/auth.service.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Attempt auto-login with refresh token on startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.tryAutoLogin();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Auto login check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for axios authentication failures (invalid refresh tokens)
    const handleAuthFailure = () => {
      setUser(null);
    };

    window.addEventListener('auth-failure', handleAuthFailure);
    return () => window.removeEventListener('auth-failure', handleAuthFailure);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login details invalid.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be defined inside AuthProvider.');
  }
  return context;
};
