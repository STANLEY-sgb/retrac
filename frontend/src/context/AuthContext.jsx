import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('retrac_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    async function fetchUser() {
      const storedToken = localStorage.getItem('retrac_token');
      const storedUser = localStorage.getItem('retrac_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Refresh from server in background
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('retrac_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session refresh warning:', err.message);
        }
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('retrac_token', res.token);
      localStorage.setItem('retrac_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const quickLogin = async (role) => {
    let email = 'sulait.bwambale@retrac.ug'; // Default Caseworker
    if (role === 'admin') email = 'admin@retrac.ug';
    if (role === 'caseworker_sarah') email = 'sarah.namukasa@retrac.ug';
    if (role === 'employer') email = 'employer@kampalaskills.ug';

    return await login(email, 'Password123!');
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // Ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('retrac_token');
      localStorage.removeItem('retrac_user');
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user && !!token,
      role: user?.role || null,
      login,
      quickLogin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
