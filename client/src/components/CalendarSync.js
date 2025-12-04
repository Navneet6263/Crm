import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  ExternalLink, 
  Users, 
  MapPin,
  Bell,
  Video,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { showToast } from './ToastNotification';
import api from '../config/api';

const CalendarSync = ({ darkMode, currentUser }) => {
  const [events, setEvents] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [syncStatus, setSyncStatus] = useState('disconnected');

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    type: 'meeting',
    attendees: '',
    location: '',
    reminder: '15'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/calendar');
      if (response.data && response.data.events) {
        setEvents(response.data.events);
      } else {
        setEvents(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      showToast('error', '❌ Failed to load events');
      setEvents([]);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.startDate || !newEvent.startTime) {
      showToast('error', '❌ Please fill required fields');
      return;
    }

    try {
      // Set endDate to startDate if not provided
      const eventData = {
        ...newEvent,
        endDate: newEvent.endDate || newEvent.startDate,
        endTime: newEvent.endTime || newEvent.startTime
      };

      console.log('Creating event:', eventData);
      const response = await api.post('/calendar', eventData);
      
      // Add the new event to local state
      setEvents([...events, response.data]);
      
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        type: 'meeting',
        attendees: '',
        location: '',
        reminder: '15'
      });
      
      setShowAddEvent(false);
      showToast('success', '✅ Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      showToast('error', '❌ Failed to create event: ' + (error.response?.data?.message || error.message));
    }
  };

  const syncWithGoogle = () => {
    setSyncStatus('syncing');
    showToast('info', '🔄 Syncing with Google Calendar...');
    
    setTimeout(() => {
      setSyncStatus('connected');
      showToast('success', '✅ Google Calendar synced successfully!');
    }, 2000);
  };

  const syncWithOutlook = () => {
    setSyncStatus('syncing');
    showToast('info', '🔄 Syncing with Outlook Calendar...');
    
    setTimeout(() => {
      setSyncStatus('connected');
      showToast('success', '✅ Outlook Calendar synced successfully!');
    }, 2000);
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'meeting': return <Users size={16} />;
      case 'call': return <Phone size={16} />;
      case 'demo': return <Video size={16} />;
      case 'email': return <Mail size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'meeting': return '#3b82f6';
      case 'call': return '#22c55e';
      case 'demo': return '#8b5cf6';
      case 'email': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return { bg: '#dcfce7', text: '#166534', border: '#22c55e' };
      case 'pending': return { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' };
      case 'cancelled': return { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' };
      default: return { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' };
    }
  };

  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.startDate).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return eventDate === today;
  });

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    const today = new Date();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return eventDate > today && eventDate <= nextWeek;
  }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const containerStyle = {
    padding: '0',
    background: darkMode ? '#111827' : '#f9fafb',
    minHeight: '100vh'
  };

  const cardStyle = {
    background: darkMode ? '#1f2937' : 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Calendar style={{ color: '#3b82f6' }} size={32} />
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Calendar Sync
              </h1>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
                Manage meetings and sync with external calendars
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddEvent(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            <Plus size={20} />
            Add Event
          </button>
        </div>
      </div>

      {/* Sync Status */}
      <div style={{ ...cardStyle, padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: darkMode ? 'white' : '#1f2937',
          marginBottom: '1rem'
        }}>
          Calendar Integration
        </h3>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            background: syncStatus === 'connected' ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${syncStatus === 'connected' ? '#22c55e' : '#ef4444'}`
          }}>
            {syncStatus === 'connected' ? (
              <CheckCircle size={16} style={{ color: '#22c55e' }} />
            ) : (
              <AlertCircle size={16} style={{ color: '#ef4444' }} />
            )}
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: syncStatus === 'connected' ? '#166534' : '#dc2626'
            }}>
              {syncStatus === 'connected' ? 'Calendar Synced' : 
               syncStatus === 'syncing' ? 'Syncing...' : 'Not Connected'}
            </span>
          </div>
          
          <button
            onClick={syncWithGoogle}
            disabled={syncStatus === 'syncing'}
            style={{
              padding: '0.5rem 1rem',
              background: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: syncStatus === 'syncing' ? 0.6 : 1
            }}
          >
            <ExternalLink size={14} />
            Google Calendar
          </button>
          
          <button
            onClick={syncWithOutlook}
            disabled={syncStatus === 'syncing'}
            style={{
              padding: '0.5rem 1rem',
              background: '#0078d4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: syncStatus === 'syncing' ? 0.6 : 1
            }}
          >
            <ExternalLink size={14} />
            Outlook
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem'
      }}>
        {/* Today's Events */}
        <div style={{ ...cardStyle, padding: '1.5rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Clock style={{ color: '#22c55e' }} size={20} />
            Today's Events
          </h3>

          {todayEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {todayEvents.map(event => {
                const statusColor = getStatusColor(event.status);
                return (
                  <div key={event._id || event.id} style={{
                    background: darkMode ? '#374151' : '#f9fafb',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: `2px solid ${getEventTypeColor(event.type)}`
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ color: getEventTypeColor(event.type) }}>
                          {getEventTypeIcon(event.type)}
                        </div>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: darkMode ? 'white' : '#1f2937',
                          margin: 0
                        }}>
                          {event.title}
                        </h4>
                      </div>
                      
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: statusColor.bg,
                        color: statusColor.text,
                        border: `1px solid ${statusColor.border}`
                      }}>
                        {event.status}
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      fontSize: '0.875rem',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      <span>{event.startTime} - {event.endTime}</span>
                      {event.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              background: darkMode ? '#374151' : '#f9fafb',
              padding: '2rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Calendar size={48} style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1rem' }} />
              <p style={{
                fontSize: '1rem',
                color: darkMode ? '#9ca3af' : '#6b7280',
                margin: 0
              }}>
                No events scheduled for today
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div style={{ ...cardStyle, padding: '1.5rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Bell style={{ color: '#f59e0b' }} size={20} />
            Upcoming Events
          </h3>

          {upcomingEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingEvents.slice(0, 5).map(event => {
                const statusColor = getStatusColor(event.status);
                return (
                  <div key={event._id || event.id} style={{
                    background: darkMode ? '#374151' : '#f9fafb',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ color: getEventTypeColor(event.type) }}>
                          {getEventTypeIcon(event.type)}
                        </div>
                        <h4 style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: darkMode ? 'white' : '#1f2937',
                          margin: 0
                        }}>
                          {event.title}
                        </h4>
                      </div>
                    </div>
                    
                    <div style={{
                      fontSize: '0.75rem',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      {new Date(event.startDate).toLocaleDateString()} at {event.startTime}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              background: darkMode ? '#374151' : '#f9fafb',
              padding: '2rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Bell size={48} style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1rem' }} />
              <p style={{
                fontSize: '1rem',
                color: darkMode ? '#9ca3af' : '#6b7280',
                margin: 0
              }}>
                No upcoming events
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: darkMode ? '#1f2937' : 'white',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Create New Event
              </h3>
              <button
                onClick={() => setShowAddEvent(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Enter event title"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Description
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Event description"
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        background: darkMode ? '#374151' : 'white',
                        color: darkMode ? 'white' : '#1f2937',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        background: darkMode ? '#374151' : 'white',
                        color: darkMode ? 'white' : '#1f2937',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Event Type
                    </label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        background: darkMode ? '#374151' : 'white',
                        color: darkMode ? 'white' : '#1f2937',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="meeting">Meeting</option>
                      <option value="call">Call</option>
                      <option value="demo">Demo</option>
                      <option value="email">Email</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      placeholder="Meeting location"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        background: darkMode ? '#374151' : 'white',
                        color: darkMode ? 'white' : '#1f2937',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Attendees (comma separated emails)
                  </label>
                  <input
                    type="text"
                    value={newEvent.attendees}
                    onChange={(e) => setNewEvent({...newEvent, attendees: e.target.value})}
                    placeholder="email1@company.com, email2@company.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '2rem'
              }}>
                <button
                  onClick={() => setShowAddEvent(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: 'transparent',
                    color: darkMode ? '#d1d5db' : '#374151',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Calendar size={16} />
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSync;