import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { showToast } from './ToastNotification';

const LocationTracker = ({ darkMode, currentUser }) => {
  const [location, setLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [checkIns, setCheckIns] = useState([]);
  const [currentAddress, setCurrentAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved check-ins
    const savedCheckIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
    setCheckIns(savedCheckIns);
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      showToast('error', '❌ Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        
        // Reverse geocoding to get address
        try {
          const address = await reverseGeocode(latitude, longitude);
          setCurrentAddress(address);
          showToast('success', '📍 Location updated successfully');
        } catch (error) {
          setCurrentAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
        
        setLoading(false);
      },
      (error) => {
        showToast('error', '❌ Unable to get location');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const reverseGeocode = async (lat, lng) => {
    // Mock reverse geocoding - in real app, use Google Maps API
    const mockAddresses = [
      'Green Valley Business Park, Sector 18, Gurgaon',
      'Cyber City, DLF Phase 2, Gurgaon',
      'MG Road, Connaught Place, New Delhi',
      'Bandra Kurla Complex, Mumbai',
      'Electronic City, Bangalore'
    ];
    
    return mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
  };

  const handleCheckIn = async () => {
    if (!location) {
      showToast('error', '❌ Please get location first');
      return;
    }

    const checkIn = {
      id: Date.now(),
      userId: currentUser?.name || 'Unknown',
      location: location,
      address: currentAddress,
      timestamp: new Date().toISOString(),
      type: 'check-in'
    };

    const updatedCheckIns = [checkIn, ...checkIns];
    setCheckIns(updatedCheckIns);
    localStorage.setItem('checkIns', JSON.stringify(updatedCheckIns));
    
    showToast('success', '✅ Checked in successfully!');
  };

  const handleCheckOut = async () => {
    if (!location) {
      showToast('error', '❌ Please get location first');
      return;
    }

    const checkOut = {
      id: Date.now(),
      userId: currentUser?.name || 'Unknown',
      location: location,
      address: currentAddress,
      timestamp: new Date().toISOString(),
      type: 'check-out'
    };

    const updatedCheckIns = [checkOut, ...checkIns];
    setCheckIns(updatedCheckIns);
    localStorage.setItem('checkIns', JSON.stringify(updatedCheckIns));
    
    showToast('success', '✅ Checked out successfully!');
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      showToast('error', '❌ Geolocation not supported');
      return;
    }

    setIsTracking(true);
    showToast('info', '📍 Location tracking started');

    // Update location every 5 minutes
    const trackingInterval = setInterval(() => {
      getCurrentLocation();
    }, 300000); // 5 minutes

    // Store interval ID to clear later
    window.trackingInterval = trackingInterval;
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (window.trackingInterval) {
      clearInterval(window.trackingInterval);
    }
    showToast('info', '⏹️ Location tracking stopped');
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <MapPin style={{ color: '#22c55e' }} size={32} />
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: darkMode ? 'white' : '#1f2937',
              margin: 0
            }}>
              Location Tracker
            </h1>
            <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
              Track field sales team locations and check-ins
            </p>
          </div>
        </div>
      </div>

      {/* Current Location Card */}
      <div style={{ ...cardStyle, padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Navigation style={{ color: '#22c55e' }} size={20} />
            Current Location
          </h3>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={getCurrentLocation}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #22c55e, #4ade80)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <MapPin size={16} />
              {loading ? 'Getting...' : 'Get Location'}
            </button>
            
            {!isTracking ? (
              <button
                onClick={startTracking}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Start Tracking
              </button>
            ) : (
              <button
                onClick={stopTracking}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #ef4444, #f87171)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Stop Tracking
              </button>
            )}
          </div>
        </div>

        {location ? (
          <div style={{
            background: darkMode ? '#374151' : '#f9fafb',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CheckCircle style={{ color: '#22c55e' }} size={20} />
              <span style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#22c55e'
              }}>
                Location Available
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  Latitude
                </p>
                <p style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  margin: 0
                }}>
                  {location.lat.toFixed(6)}
                </p>
              </div>
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  Longitude
                </p>
                <p style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  margin: 0
                }}>
                  {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
            
            <div>
              <p style={{
                fontSize: '0.875rem',
                color: darkMode ? '#9ca3af' : '#6b7280',
                marginBottom: '0.25rem'
              }}>
                Address
              </p>
              <p style={{
                fontSize: '1rem',
                fontWeight: '500',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                {currentAddress || 'Getting address...'}
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            background: darkMode ? '#374151' : '#f9fafb',
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle style={{ color: '#f59e0b', marginBottom: '1rem' }} size={48} />
            <p style={{
              fontSize: '1rem',
              color: darkMode ? '#9ca3af' : '#6b7280',
              margin: 0
            }}>
              Click "Get Location" to access your current position
            </p>
          </div>
        )}

        {/* Check-in/Check-out Buttons */}
        {location && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleCheckIn}
              style={{
                flex: 1,
                padding: '1rem',
                background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <CheckCircle size={20} />
              Check In
            </button>
            
            <button
              onClick={handleCheckOut}
              style={{
                flex: 1,
                padding: '1rem',
                background: 'linear-gradient(135deg, #ef4444, #f87171)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={20} />
              Check Out
            </button>
          </div>
        )}
      </div>

      {/* Check-in History */}
      <div style={{ ...cardStyle, padding: '2rem' }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: darkMode ? 'white' : '#1f2937',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Clock style={{ color: '#3b82f6' }} size={20} />
          Check-in History
        </h3>

        {checkIns.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {checkIns.slice(0, 10).map(checkIn => (
              <div key={checkIn.id} style={{
                background: darkMode ? '#374151' : '#f9fafb',
                padding: '1.5rem',
                borderRadius: '12px',
                border: `2px solid ${checkIn.type === 'check-in' ? '#22c55e' : '#ef4444'}`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {checkIn.type === 'check-in' ? (
                      <CheckCircle style={{ color: '#22c55e' }} size={20} />
                    ) : (
                      <AlertCircle style={{ color: '#ef4444' }} size={20} />
                    )}
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: checkIn.type === 'check-in' ? '#22c55e' : '#ef4444',
                      textTransform: 'capitalize'
                    }}>
                      {checkIn.type.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <span style={{
                    fontSize: '0.875rem',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    {new Date(checkIn.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <User size={16} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
                  <span style={{
                    fontSize: '0.875rem',
                    color: darkMode ? '#d1d5db' : '#374151'
                  }}>
                    {checkIn.userId}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
                  <span style={{
                    fontSize: '0.875rem',
                    color: darkMode ? '#d1d5db' : '#374151'
                  }}>
                    {checkIn.address}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: darkMode ? '#374151' : '#f9fafb',
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <Clock style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1rem' }} size={48} />
            <p style={{
              fontSize: '1rem',
              color: darkMode ? '#9ca3af' : '#6b7280',
              margin: 0
            }}>
              No check-ins recorded yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationTracker;