import React, { useState, useEffect } from 'react';
import { Bell, X, Check, User, Phone, Mail, Calendar, AlertTriangle, Info } from 'lucide-react';
import apiService from '../services/apiService';

const NotificationSystem = ({ darkMode }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await apiService.getNotifications();
      if (response && Array.isArray(response)) {
        // Map _id to id for consistency
        const mappedNotifications = response.map(n => ({
          ...n,
          id: n._id || n.id
        }));
        setNotifications(mappedNotifications);
        setUnreadCount(mappedNotifications.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await apiService.deleteNotification(id);
      const updatedNotifications = notifications.filter(notification => notification.id !== id);
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(notification => !notification.isRead).length);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'lead_created': return '#3b82f6';
      case 'meeting_reminder': return '#f59e0b';
      case 'call_scheduled': return '#10b981';
      case 'email_sent': return '#8b5cf6';
      case 'follow_up_due': return '#ef4444';
      case 'lead_assigned': return '#22c55e'; // Green for assignments
      case 'task_due': return '#f97316';
      default: return '#6b7280';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'lead_created':
      case 'lead_assigned':
        return User;
      case 'meeting_reminder':
        return Calendar;
      case 'call_scheduled':
        return Phone;
      case 'email_sent':
        return Mail;
      case 'follow_up_due':
      case 'task_due':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    // Close notification panel
    setShowNotifications(false);
    
    // Navigate to lead detail page with highlight using hash
    if (notification.leadId) {
      window.location.hash = `lead/${notification.leadId}?highlight=true`;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          padding: '0.5rem',
          cursor: 'pointer',
          color: darkMode ? 'white' : '#1f2937'
        }}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 0.5rem)',
          right: '0',
          width: '350px',
          background: darkMode ? '#1f2937' : 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          zIndex: 50,
          maxHeight: '500px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '1rem',
            borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              margin: 0
            }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Check size={14} />
                Mark all as read
              </button>
            )}
          </div>

          <div style={{
            overflowY: 'auto',
            flex: 1,
            padding: '0.5rem'
          }}>
            {loading ? (
              <div style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map(notification => {
                const IconComponent = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    onClick={() => notification.leadId && handleNotificationClick(notification)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      marginBottom: '0.5rem',
                      background: notification.isRead ? 'transparent' : (darkMode ? '#374151' : '#f9fafb'),
                      borderLeft: `3px solid ${getTypeColor(notification.type)}`,
                      position: 'relative',
                      cursor: notification.leadId ? 'pointer' : 'default',
                      transition: 'all 0.2s ease',
                      ':hover': {
                        transform: notification.leadId ? 'translateX(4px)' : 'none'
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (notification.leadId) {
                        e.currentTarget.style.background = darkMode ? '#4b5563' : '#e5e7eb';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = notification.isRead ? 'transparent' : (darkMode ? '#374151' : '#f9fafb');
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: getTypeColor(notification.type),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0
                      }}>
                        <IconComponent size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: notification.isRead ? '500' : '600',
                          color: darkMode ? 'white' : '#1f2937',
                          margin: '0 0 0.25rem 0'
                        }}>
                          {notification.title}
                          {notification.type === 'lead_assigned' && (
                            <span style={{
                              marginLeft: '0.5rem',
                              fontSize: '0.75rem',
                              background: '#22c55e',
                              color: 'white',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '0.25rem'
                            }}>
                              NEW ASSIGNMENT
                            </span>
                          )}
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: darkMode ? '#9ca3af' : '#6b7280',
                          margin: '0 0 0.5rem 0'
                        }}>
                          {notification.message}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{
                            fontSize: '0.75rem',
                            color: darkMode ? '#6b7280' : '#9ca3af',
                            margin: 0
                          }}>
                            {formatTime(notification.createdAt)}
                          </p>
                          {notification.leadId && (
                            <span style={{
                              fontSize: '0.75rem',
                              color: '#3b82f6',
                              background: darkMode ? '#1e3a8a' : '#dbeafe',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '0.25rem'
                            }}>
                              ID: {notification.leadId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      display: 'flex',
                      gap: '0.5rem'
                    }}>
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '0.25rem',
                            cursor: 'pointer',
                            color: darkMode ? '#9ca3af' : '#6b7280',
                            borderRadius: '4px'
                          }}
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '0.25rem',
                          cursor: 'pointer',
                          color: darkMode ? '#9ca3af' : '#6b7280',
                          borderRadius: '4px'
                        }}
                        title="Delete notification"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{
            padding: '0.75rem',
            borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
            textAlign: 'center'
          }}>
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: '#3b82f6',
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px'
              }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;