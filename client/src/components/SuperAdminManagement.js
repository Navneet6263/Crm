import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { Shield, Users, AlertTriangle, CheckCircle, XCircle, Key, UserPlus, Eye, EyeOff } from 'lucide-react';

const SuperAdminManagement = ({ darkMode = false }) => {
  const [safetyStatus, setSafetyStatus] = useState(null);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(null);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [resetPassword, setResetPassword] = useState({ userId: '', newPassword: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchSafetyStatus();
    fetchSuperAdmins();
  }, []);

  const fetchSafetyStatus = async () => {
    try {
      const response = await apiService.get('/super-admin/safety-status');
      console.log('Safety Status Response:', response);
      setSafetyStatus(response.data || response);
    } catch (error) {
      console.error('Error fetching safety status:', error);
      // Set mock data for testing
      setSafetyStatus({
        isSafe: false,
        totalSuperAdmins: 5,
        activeSuperAdmins: 5,
        inactiveSuperAdmins: 0,
        maxAllowed: 4,
        canCreateMore: false,
        safetyLevel: 'HIGH'
      });
    }
  };

  const fetchSuperAdmins = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/super-admin/users');
      console.log('Super Admins Response:', response);
      setSuperAdmins(response.data || response || []);
    } catch (error) {
      console.error('Error fetching super admins:', error);
      // Set mock data for testing - based on actual database
      setSuperAdmins([
        {
          _id: '1',
          name: 'Navneet Kumar',
          email: 'navneet@greencall.com',
          role: 'super-admin',
          isActive: true,
          createdAt: '2025-08-20T08:16:55.000Z'
        },
        {
          _id: '2', 
          name: 'Navneet Kumar',
          email: 'navneet@greencrm.com',
          role: 'super-admin',
          isActive: true,
          createdAt: '2025-08-28T07:19:23.000Z'
        },
        {
          _id: '3',
          name: 'Super Admin 2',
          email: 'superadmin2@greencrm.com', 
          role: 'super-admin',
          isActive: true,
          createdAt: '2025-08-28T07:19:23.000Z'
        },
        {
          _id: '4',
          name: 'Super Admin 3',
          email: 'superadmin3@greencrm.com',
          role: 'super-admin', 
          isActive: true,
          createdAt: '2025-08-28T07:19:23.000Z'
        },
        {
          _id: '5',
          name: 'Super Admin 4',
          email: 'superadmin4@greencrm.com',
          role: 'super-admin',
          isActive: true,
          createdAt: '2025-08-28T07:19:23.000Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuperAdmin = async (e) => {
    e.preventDefault();
    try {
      await apiService.post('/super-admin/create-super-admin', newAdmin);
      alert('✅ Super Admin created successfully!');
      setNewAdmin({ name: '', email: '', password: '' });
      setShowCreateForm(false);
      fetchSafetyStatus();
      fetchSuperAdmins();
    } catch (error) {
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeactivateUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to deactivate ${userName}? This action requires at least 2 Super Admins to remain active.`)) {
      return;
    }
    
    try {
      await apiService.put(`/super-admin/deactivate/${userId}`);
      alert('✅ User deactivated successfully!');
      fetchSafetyStatus();
      fetchSuperAdmins();
    } catch (error) {
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleActivateUser = async (userId, userName) => {
    try {
      await apiService.put(`/super-admin/activate/${userId}`);
      alert(`✅ ${userName} activated successfully!`);
      fetchSafetyStatus();
      fetchSuperAdmins();
    } catch (error) {
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await apiService.put(`/super-admin/reset-password/${resetPassword.userId}`, {
        newPassword: resetPassword.newPassword
      });
      alert('✅ Password reset successfully!');
      setResetPassword({ userId: '', newPassword: '' });
      setShowPasswordForm(null);
    } catch (error) {
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const getSafetyColor = (level) => {
    switch (level) {
      case 'HIGH': return '#10b981';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      background: darkMode ? '#0f172a' : 'transparent',
      minHeight: '100vh',
      color: darkMode ? '#f8fafc' : '#111827'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          color: darkMode ? '#f8fafc' : '#111827',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Shield size={32} style={{ color: '#10b981' }} />
          Super Admin Safety Management
        </h1>
        <p style={{ color: darkMode ? '#cbd5e1' : '#6b7280' }}>
          Manage the 4 Super Admin safety net system
        </p>
      </div>

      {/* Safety Status Card */}
      {safetyStatus && (
        <div style={{
          background: darkMode ? '#1e293b' : 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: `2px solid ${getSafetyColor(safetyStatus.safetyLevel)}20`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: darkMode ? '#f8fafc' : '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertTriangle size={24} style={{ color: getSafetyColor(safetyStatus.safetyLevel) }} />
              Safety Status: {safetyStatus.safetyLevel}
            </h2>
            <div style={{
              padding: '0.5rem 1rem',
              background: `${getSafetyColor(safetyStatus.safetyLevel)}20`,
              color: getSafetyColor(safetyStatus.safetyLevel),
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {safetyStatus.isSafe ? '✅ SAFE' : '⚠️ RISK'}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              padding: '1rem',
              background: darkMode ? '#334155' : '#f8fafc',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                {safetyStatus.activeSuperAdmins}
              </div>
              <div style={{ fontSize: '0.875rem', color: darkMode ? '#cbd5e1' : '#6b7280' }}>
                Active Super Admins
              </div>
            </div>
            <div style={{
              padding: '1rem',
              background: darkMode ? '#334155' : '#f8fafc',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
                {safetyStatus.inactiveSuperAdmins}
              </div>
              <div style={{ fontSize: '0.875rem', color: darkMode ? '#cbd5e1' : '#6b7280' }}>
                Inactive Super Admins
              </div>
            </div>
            <div style={{
              padding: '1rem',
              background: darkMode ? '#334155' : '#f8fafc',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
                {safetyStatus.maxAllowed - safetyStatus.totalSuperAdmins}
              </div>
              <div style={{ fontSize: '0.875rem', color: darkMode ? '#cbd5e1' : '#6b7280' }}>
                Slots Available
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Super Admin Button - Always Show for Testing */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={!safetyStatus?.canCreateMore && safetyStatus !== null}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: (safetyStatus?.canCreateMore || safetyStatus === null) 
              ? 'linear-gradient(135deg, #10b981, #34d399)' 
              : 'linear-gradient(135deg, #6b7280, #9ca3af)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: (safetyStatus?.canCreateMore || safetyStatus === null) ? 'pointer' : 'not-allowed',
            fontSize: '0.875rem',
            fontWeight: '600',
            opacity: (safetyStatus?.canCreateMore || safetyStatus === null) ? 1 : 0.6
          }}
        >
          <UserPlus size={16} />
          {showCreateForm ? 'Cancel' : 'Create New Super Admin'}
          {!safetyStatus?.canCreateMore && safetyStatus !== null && ' (Limit Reached)'}
        </button>
        {!safetyStatus?.canCreateMore && safetyStatus !== null && (
          <p style={{
            fontSize: '0.75rem',
            color: '#ef4444',
            marginTop: '0.5rem',
            marginBottom: 0
          }}>
            Maximum 4 Super Admins allowed. Deactivate existing ones to create new.
          </p>
        )}
      </div>

      {/* Create Super Admin Form */}
      {showCreateForm && (
        <div style={{
          background: darkMode ? '#1e293b' : 'white',
          borderRadius: '8px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: darkMode ? '#f8fafc' : '#111827',
            marginBottom: '1.5rem'
          }}>Create New Super Admin</h3>
          
          <form onSubmit={handleCreateSuperAdmin}>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: darkMode ? '#f8fafc' : '#111827',
                  marginBottom: '0.5rem'
                }}>Name</label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '6px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#111827',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: darkMode ? '#f8fafc' : '#111827',
                  marginBottom: '0.5rem'
                }}>Email</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '6px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#111827',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: darkMode ? '#f8fafc' : '#111827',
                  marginBottom: '0.5rem'
                }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      paddingRight: '3rem',
                      border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '6px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#111827',
                      fontSize: '0.875rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Create Super Admin
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Super Admins List */}
      <div style={{
        background: darkMode ? '#1e293b' : 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: darkMode ? '#f8fafc' : '#111827',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Users size={20} />
          Super Admins ({superAdmins.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: darkMode ? '#cbd5e1' : '#6b7280' }}>
            Loading super admins...
          </div>
        ) : superAdmins.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: darkMode ? '#cbd5e1' : '#6b7280' }}>
            No super admins found
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {superAdmins.map((admin, index) => (
              <div key={admin._id || index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.5rem',
                background: darkMode ? '#334155' : '#f8fafc',
                borderRadius: '8px',
                border: `1px solid ${admin.isActive ? '#10b981' : '#ef4444'}20`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: admin.isActive ? 'linear-gradient(135deg, #10b981, #34d399)' : 'linear-gradient(135deg, #ef4444, #f87171)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '1.25rem'
                  }}>
                    {admin.name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: darkMode ? '#f8fafc' : '#111827',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {admin.name}
                      {admin.isActive ? (
                        <CheckCircle size={16} style={{ color: '#10b981' }} />
                      ) : (
                        <XCircle size={16} style={{ color: '#ef4444' }} />
                      )}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: darkMode ? '#cbd5e1' : '#6b7280'
                    }}>
                      {admin.email}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      marginTop: '0.25rem'
                    }}>
                      Created: {new Date(admin.createdAt).toLocaleDateString()}
                      {admin.lastLogin && ` • Last Login: ${new Date(admin.lastLogin).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    padding: '0.5rem 1rem',
                    background: admin.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: admin.isActive ? '#10b981' : '#ef4444',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {admin.isActive ? 'Active' : 'Inactive'}
                  </div>
                  
                  {admin.isActive ? (
                    <button
                      onClick={() => handleDeactivateUser(admin._id, admin.name)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #ef4444, #f87171)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <XCircle size={12} />
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivateUser(admin._id, admin.name)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #10b981, #34d399)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <CheckCircle size={12} />
                      Activate
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowPasswordForm(admin._id)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Key size={12} />
                    Reset Password
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {showPasswordForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowPasswordForm(null)}>
          <div style={{
            background: darkMode ? '#1e293b' : 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: darkMode ? '#f8fafc' : '#111827',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Key size={20} />
              Reset Password
            </h3>
            
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: darkMode ? '#f8fafc' : '#111827',
                  marginBottom: '0.5rem'
                }}>New Password</label>
                <input
                  type="password"
                  value={resetPassword.newPassword}
                  onChange={(e) => setResetPassword({...resetPassword, userId: showPasswordForm, newPassword: e.target.value})}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '6px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#111827',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(null)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: darkMode ? '#334155' : '#f1f5f9',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: darkMode ? '#cbd5e1' : '#6b7280'
      }}>
        <strong>Debug Info:</strong><br/>
        Can Create More: {safetyStatus?.canCreateMore ? 'Yes' : 'No'}<br/>
        Total Super Admins: {safetyStatus?.totalSuperAdmins || 0}<br/>
        Active Super Admins: {safetyStatus?.activeSuperAdmins || 0}<br/>
        Max Allowed: {safetyStatus?.maxAllowed || 4}
      </div>
    </div>
  );
};

export default SuperAdminManagement;