import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set Authorization header for all API calls in apiClient
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }

  // Load current user on app load if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiClient.get('/auth/me');
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
      } catch (err) {
        console.error('Failed to load user session', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  // Register User
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/auth/register', userData);
      const { token: userToken, user: newUser } = res.data;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(userToken);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      let errMsg = err.message || 'Unable to register.';
      if (err.details && Array.isArray(err.details) && err.details.length > 0) {
        errMsg += `: ${err.details.join(', ')}`;
      }
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { token: userToken, user: newUser } = res.data;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(userToken);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      let errMsg = err.message || 'Invalid credentials';
      if (err.details && Array.isArray(err.details) && err.details.length > 0) {
        errMsg += `: ${err.details.join(', ')}`;
      }
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setError(null);
    }
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    try {
      const res = await apiClient.put('/auth/profile', profileData);
      setUser(res.data.data);
      localStorage.setItem('user', JSON.stringify(res.data.data));
      return { success: true };
    } catch (err) {
      let errMsg = err.message || 'Failed to update profile';
      if (err.details && Array.isArray(err.details) && err.details.length > 0) {
        errMsg += `: ${err.details.join(', ')}`;
      }
      return { success: false, error: errMsg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
