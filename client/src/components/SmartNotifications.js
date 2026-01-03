import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  User, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import apiService from '../services/apiService';

const SmartNotifications = ({ darkMode, setActiveView, currentUser }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
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
        setNotifications(response);
        setUnreadCount(response.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await apiService.markNotificationAsRead(notification.id);
        const updatedNotifications = notifications.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        );
        setNotifications(updatedNotifications);
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Navigate to lead if leadId exists
      if (notification.leadId) {
        // Store leadId in sessionStorage for highlighting
        sessionStorage.setItem('highlightLeadId', notification.leadId);
        setActiveView('my-leads');
        setShowNotifications(false);
        return;
      }
      
      // Handle action if actionable
      if (notification.actionable && notification.actionView) {
        setActiveView(notification.actionView);
        setShowNotifications(false);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'lead_assigned':
      case 'lead_created':
        return <User size={16} />;
      case 'meeting_reminder':
        return <Calendar size={16} />;
      case 'task_due':
      case 'follow_up_due':
        return <Clock size={16} />;
      case 'lead_update':
        return <FileText size={16} />;
      case 'message':
        return <MessageSquare size={16} />;
      case 'call_scheduled':
        return <Phone size={16} />;
      case 'email_sent':
        return <Mail size={16} />;
      case 'system':
        return <AlertTriangle size={16} />;
      default:
        return <Bell size={16} />;
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
  
  const getNotificationColor = (priority) => {
    switch(priority) {
      case 'high':
        return darkMode ? '#ef4444' : '#dc2626';
      case 'medium':
        return darkMode ? '#f59e0b' : '#d97706';
      case 'low':
        return darkMode ? '#3b82f6' : '#2563eb';
      case 'info':
        return darkMode ? '#6b7280' : '#4b5563';
      default:
        return darkMode ? '#6b7280' : '#4b5563';
    }
  };
  
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        style={{
          position: 'relative',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: darkMode ? '#1f2937' : '#f3f4f6',
          border: 'none',
          cursor: 'pointer',
          color: darkMode ? '#d1d5db' : '#4b5563'
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#ef4444',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unreadCount}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <>
          {/* Click outside overlay */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 49
            }}
            onClick={() => setShowNotifications(false)}
          />
          
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: '0',
            width: '350px',
            background: darkMode ? '#1f2937' : 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            overflow: 'hidden',
            animation: 'slideDown 0.2s ease-out'
          }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#111827',
              margin: 0
            }}>
              Notifications
            </h3>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: darkMode ? '#3b82f6' : '#2563eb',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  <Check size={14} />
                  Mark all as read
                </button>
              )}
              
              <button
                onClick={() => setShowNotifications(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: darkMode ? '#374151' : '#f3f4f6',
                  border: 'none',
                  color: darkMode ? '#d1d5db' : '#4b5563',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
          
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {loading ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '1rem',
                    borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    background: notification.isRead ? 'transparent' : (darkMode ? '#111827' : '#f9fafb'),
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = darkMode ? '#374151' : '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notification.isRead ? 
                      'transparent' : 
                      (darkMode ? '#111827' : '#f9fafb');
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: `${getNotificationColor(notification.priority || 'medium')}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: getNotificationColor(notification.priority || 'medium'),
                    flexShrink: 0
                  }}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.25rem'
                    }}>
                      <h4 style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: darkMode ? 'white' : '#111827',
                        margin: 0
                      }}>
                        {notification.title}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          color: darkMode ? '#9ca3af' : '#6b7280'
                        }}>
                          {formatTime(notification.createdAt)}
                        </span>
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
                    
                    <p style={{
                      fontSize: '0.875rem',
                      color: darkMode ? '#d1d5db' : '#4b5563',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {notification.message}
                    </p>
                    
                    {notification.actionable && (
                      <button style={{
                        padding: '0.25rem 0.5rem',
                        background: darkMode ? '#3b82f6' : '#2563eb',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}>
                        {notification.action || 'View Details'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div style={{
            padding: '0.75rem',
            textAlign: 'center',
            borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
          }}>
            <button
              onClick={() => {
                setActiveView('settings');
                setShowNotifications(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: darkMode ? '#3b82f6' : '#2563eb',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Notification Settings
            </button>
          </div>
        </div>
        </>
      )}
      
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SmartNotifications;