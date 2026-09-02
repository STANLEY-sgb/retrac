import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Add Toast Notification
  const addToast = useCallback((title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch Notifications from Server
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      if (res.success && res.data) {
        // Detect newly arrived risk alerts to show toast
        if (notifications.length > 0 && res.data.notifications.length > notifications.length) {
          const newest = res.data.notifications[0];
          if (!newest.is_read) {
            addToast(newest.title, newest.message, newest.type === 'risk_alert' ? 'danger' : 'success');
          }
        }

        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      // Background poll silently ignore
    }
  }, [isAuthenticated, notifications.length, addToast]);

  // Initial fetch and 12-second live polling
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 12000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
      addToast('All Read', 'All notifications marked as read.', 'info');
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      toasts,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      addToast,
      removeToast
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
