import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

import { showToast } from './ToastNotification';

const Settings = ({ darkMode, toggleDarkMode, currentUser }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  const [settings, setSettings] = useState({
    profile: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      leadAlerts: true,
      taskReminders: true,
      weeklyReports: false,
      marketingEmails: false
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorAuth: false
    },
    preferences: {
      language: 'en',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      currency: 'INR'
    }
  });

  // Load settings from localStorage on component mount
  React.useEffect(() => {
    if (currentUser) {
      const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      const savedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      setSettings(prev => ({
        ...prev,
        profile: {
          name: savedUser.name || currentUser.name || '',
          email: savedUser.email || currentUser.email || '',
          phone: savedUser.phone || currentUser.phone || ''
        },
        notifications: savedSettings.notifications || prev.notifications,
        preferences: savedSettings.preferences || prev.preferences
      }));
    }
  }, [currentUser]);

  const handleSave = async (section) => {
    setLoading(true);
    setSaveStatus('Saving...');
    
    try {
      // Simulate API delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (section === 'profile') {
        const updatedUser = { 
          ...currentUser, 
          name: settings.profile.name,
          email: settings.profile.email,
          phone: settings.profile.phone
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        setSaveStatus('Profile saved!');
        showToast('success', '✅ Profile updated successfully!');
      } else if (section === 'security') {
        if (settings.security.newPassword !== settings.security.confirmPassword) {
          setSaveStatus('Error: Passwords do not match!');
          showToast('error', '❌ New passwords do not match!');
          setLoading(false);
          return;
        }
        
        if (!settings.security.currentPassword || !settings.security.newPassword) {
          setSaveStatus('Error: Please fill all fields!');
          showToast('error', '❌ Please fill all password fields!');
          setLoading(false);
          return;
        }
        
        localStorage.setItem('userPassword', settings.security.newPassword);
        
        setSettings(prev => ({
          ...prev,
          security: {
            ...prev.security,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        }));
        
        setSaveStatus('Password changed!');
        showToast('success', '✅ Password changed successfully!');
      } else if (section === 'notifications') {
        const existingSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        const updatedSettings = { ...existingSettings, notifications: settings.notifications };
        localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
        
        setSaveStatus('Notifications saved!');
        showToast('success', '✅ Notification preferences saved successfully!');
      } else if (section === 'preferences') {
        const existingSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        const updatedSettings = { ...existingSettings, preferences: settings.preferences };
        localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
        
        setSaveStatus('Preferences saved!');
        showToast('success', '✅ Preferences saved successfully!');
      }
      
      setTimeout(() => setSaveStatus(''), 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('Error saving settings!');
      showToast('error', `❌ Failed to save ${section} settings`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette }
  ];

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

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    background: darkMode ? '#374151' : 'white',
    color: darkMode ? 'white' : '#1f2937',
    fontSize: '1rem',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: darkMode ? '#d1d5db' : '#374151',
    marginBottom: '0.5rem'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <SettingsIcon style={{ color: '#6b7280' }} size={32} />
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: darkMode ? 'white' : '#1f2937',
              margin: 0
            }}>
              Settings
            </h1>
            <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '2rem'
      }}>
        {/* Sidebar */}
        <div style={{ ...cardStyle, padding: '1.5rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: isActive 
                      ? 'linear-gradient(135deg, #22c55e, #4ade80)'
                      : 'transparent',
                    color: isActive ? 'white' : (darkMode ? '#d1d5db' : '#374151'),
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ ...cardStyle, padding: '2rem' }}>
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                marginBottom: '1.5rem'
              }}>
                Profile Information
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text"
                    value={settings.profile.name}
                    onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => handleSave('profile')}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 2rem',
                    background: loading ? '#9ca3af' : 'linear-gradient(135deg, #22c55e, #4ade80)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                {saveStatus && (
                  <span style={{
                    color: saveStatus.includes('Error') ? '#ef4444' : '#22c55e',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {saveStatus}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                marginBottom: '1.5rem'
              }}>
                Notification Preferences
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'leadAlerts', label: 'Lead Alerts', desc: 'Get notified about new leads' },
                  { key: 'taskReminders', label: 'Task Reminders', desc: 'Reminders for upcoming tasks' },
                  { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly performance reports' },
                  { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Product updates and newsletters' }
                ].map(item => (
                  <div key={item.key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: darkMode ? '#374151' : '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: darkMode ? 'white' : '#1f2937',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {item.label}
                      </h4>
                      <p style={{
                        fontSize: '0.875rem',
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        margin: 0
                      }}>
                        {item.desc}
                      </p>
                    </div>
                    
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '50px',
                      height: '24px'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.notifications[item.key]}
                        onChange={(e) => handleInputChange('notifications', item.key, e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: settings.notifications[item.key] ? '#22c55e' : '#d1d5db',
                        borderRadius: '24px',
                        transition: '0.4s'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '',
                          height: '18px',
                          width: '18px',
                          left: settings.notifications[item.key] ? '29px' : '3px',
                          bottom: '3px',
                          background: 'white',
                          borderRadius: '50%',
                          transition: '0.4s'
                        }} />
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => handleSave('notifications')}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 2rem',
                    background: loading ? '#9ca3af' : 'linear-gradient(135deg, #22c55e, #4ade80)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
                {saveStatus && (
                  <span style={{
                    color: saveStatus.includes('Error') ? '#ef4444' : '#22c55e',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {saveStatus}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                marginBottom: '1.5rem'
              }}>
                Security Settings
              </h2>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  marginBottom: '1rem'
                }}>
                  Change Password
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={labelStyle}>Current Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={settings.security.currentPassword}
                        onChange={(e) => handleInputChange('security', 'currentPassword', e.target.value)}
                        style={inputStyle}
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: darkMode ? '#9ca3af' : '#6b7280'
                        }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>New Password</label>
                    <input
                      type="password"
                      value={settings.security.newPassword}
                      onChange={(e) => handleInputChange('security', 'newPassword', e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Confirm New Password</label>
                    <input
                      type="password"
                      value={settings.security.confirmPassword}
                      onChange={(e) => handleInputChange('security', 'confirmPassword', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: darkMode ? '#374151' : '#f9fafb',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: darkMode ? 'white' : '#1f2937',
                      margin: '0 0 0.25rem 0'
                    }}>
                      Two-Factor Authentication
                    </h4>
                    <p style={{
                      fontSize: '0.875rem',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      margin: 0
                    }}>
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  
                  <label style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '50px',
                    height: '24px'
                  }}>
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: settings.security.twoFactorAuth ? '#22c55e' : '#d1d5db',
                      borderRadius: '24px',
                      transition: '0.4s'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '18px',
                        width: '18px',
                        left: settings.security.twoFactorAuth ? '29px' : '3px',
                        bottom: '3px',
                        background: 'white',
                        borderRadius: '50%',
                        transition: '0.4s'
                      }} />
                    </span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => handleSave('security')}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 2rem',
                    background: loading ? '#9ca3af' : 'linear-gradient(135deg, #22c55e, #4ade80)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Shield size={16} />
                  {loading ? 'Updating...' : 'Update Security'}
                </button>
                {saveStatus && (
                  <span style={{
                    color: saveStatus.includes('Error') ? '#ef4444' : '#22c55e',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {saveStatus}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                marginBottom: '1.5rem'
              }}>
                Application Preferences
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div>
                  <label style={labelStyle}>Language</label>
                  <select
                    value={settings.preferences.language}
                    onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Timezone</label>
                  <select
                    value={settings.preferences.timezone}
                    onChange={(e) => handleInputChange('preferences', 'timezone', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Date Format</label>
                  <select
                    value={settings.preferences.dateFormat}
                    onChange={(e) => handleInputChange('preferences', 'dateFormat', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Currency</label>
                  <select
                    value={settings.preferences.currency}
                    onChange={(e) => handleInputChange('preferences', 'currency', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: darkMode ? '#374151' : '#f9fafb',
                borderRadius: '8px',
                marginBottom: '2rem'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: darkMode ? 'white' : '#1f2937',
                    margin: '0 0 0.25rem 0'
                  }}>
                    Dark Mode
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    margin: 0
                  }}>
                    Switch between light and dark themes
                  </p>
                </div>
                
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: darkMode ? '#22c55e' : '#d1d5db',
                    borderRadius: '24px',
                    transition: '0.4s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '18px',
                      width: '18px',
                      left: darkMode ? '29px' : '3px',
                      bottom: '3px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: '0.4s'
                    }} />
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => handleSave('preferences')}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 2rem',
                    background: loading ? '#9ca3af' : 'linear-gradient(135deg, #22c55e, #4ade80)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Palette size={16} />
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
                {saveStatus && (
                  <span style={{
                    color: saveStatus.includes('Error') ? '#ef4444' : '#22c55e',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {saveStatus}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;