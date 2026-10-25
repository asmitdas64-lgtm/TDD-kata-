import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.data?.user) {
        setUser(res.data.data.user);
        setToken(storedToken);
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success && res.data?.data) {
      const receivedToken = res.data.data.token;
      const receivedUser = res.data.data.user;
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      return { user: receivedUser, token: receivedToken };
    }
    throw new Error(res.data?.error?.message || 'Login failed');
  };

  const register = async (name, email, password, role = 'CUSTOMER') => {
    const res = await api.post('/auth/register', { name, email, password, role });
    if (res.data?.success && res.data?.data) {
      // Auto login after register if backend returns token or call login
      const receivedToken = res.data.data.token;
      const receivedUser = res.data.data.user;
      if (receivedToken) {
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
      }
      return { user: receivedUser, token: receivedToken };
    }
    throw new Error(res.data?.error?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    refreshUser: fetchCurrentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
