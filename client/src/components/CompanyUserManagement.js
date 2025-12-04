import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaUserShield, FaUserTie, FaEye, FaEyeSlash } from 'react-icons/fa';
import apiService from '../services/apiService';
import { showSuccess, showError, confirmAction } from '../utils/notifications';
import { validateUserData, sanitizeUserData } from '../utils/validation';

const CompanyUserManagement = ({ currentUser, darkMode }) => {
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [limits, setLimits] = useState({ current: 0, max: 5, canAdd: false });

  // Load team members from backend with cleanup
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    
    const loadData = async () => {
      if (isMounted) {
        await loadTeamMembers();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTeamMembers();
      if (response && response.success) {
        // Ensure team is an array and filter out invalid entries
        const teamMembers = Array.isArray(response.team) ? response.team.filter(user => 
          user && user._id && user.email
        ) : [];
        
        setUsers(teamMembers);
        setCompanyInfo(response.company || null);
        setLimits(response.limits || { current: teamMembers.length, max: 5, canAdd: false });
      } else {
        console.warn('Invalid response format:', response);
        setUsers([]);
        setCompanyInfo(null);
        setLimits({ current: 0, max: 5, canAdd: false });
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      showError(`Failed to load team members: ${errorMessage}`);
      setUsers([]);
      setCompanyInfo(null);
      setLimits({ current: 0, max: 5, canAdd: false });
    } finally {
      setLoading(false);
    }
  };

  // Get plan info from company data or current user
  const currentPlan = companyInfo?.plan?.name || currentUser?.company?.plan?.name || 'basic';
  const currentUserCount = users.length;
  const currentManagerCount = users.filter(u => u.role === 'manager').length;
  
  // Debug logging
  console.log('🏢 Company Info:', companyInfo);
  console.log('👤 Current User:', currentUser);
  console.log('📊 Limits:', limits);
  console.log('📋 Plan:', currentPlan);

  const roles = [
    { value: 'manager', label: 'Manager', icon: FaUserShield, color: '#667eea' },
    { value: 'sales', label: 'Sales Representative', icon: FaUserTie, color: '#22c55e' },
    { value: 'support', label: 'Support', icon: FaEye, color: '#f59e0b' },
    { value: 'user', label: 'User', icon: FaUsers, color: '#6b7280' }
  ];

  const permissions = {
    manager: ['view_all_leads', 'edit_all_leads', 'delete_leads', 'view_reports', 'manage_team'],
    sales: ['view_leads', 'edit_own_leads', 'add_leads', 'view_own_reports'],
    support: ['view_leads', 'view_reports', 'customer_support'],
    user: ['view_leads', 'view_reports']
  };

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'sales',
    department: '',
    password: '',
    managerName: '',
    managerEmail: ''
  });

  const handleAddUser = async () => {
    // Validate permissions
    if (currentUser?.role !== 'super-admin' && !['admin', 'manager'].includes(currentUser?.role)) {
      showError('You need Admin or Manager role to add team members.');
      return;
    }

    // Check plan limits
    if (currentUser?.role !== 'super-admin' && !limits.canAdd) {
      showError(`Your ${currentPlan} plan allows only ${limits.max} users. Please upgrade your plan.`);
      return;
    }

    // Validate and sanitize user data
    const sanitizedData = sanitizeUserData(newUser);
    const validation = validateUserData(sanitizedData);
    
    if (!validation.isValid) {
      showError(`Validation failed:\n${validation.errors.join('\n')}`);
      return;
    }

    try {
      const userData = sanitizedData;

      const response = await apiService.createTeamMember(userData);

      if (response && response.success) {
        const roleDisplay = roles.find(r => r.value === response.user.role)?.label || response.user.role;
        const tempPasswordMsg = response.user.tempPassword ? 
          `\n\n🔑 Temporary Password: ${response.user.tempPassword}\n\nPlease share this with the new team member securely.` : '';
        
        showSuccess(`✅ Team member added successfully!\n👤 Name: ${response.user.name}\n📧 Email: ${response.user.email}\n🎭 Role: ${roleDisplay}${tempPasswordMsg}`);
        
        // Reset form
        setNewUser({ name: '', email: '', role: 'sales', department: '', password: '', managerName: '', managerEmail: '' });
        setShowAddModal(false);
        
        // Reload the list
        await loadTeamMembers();
      } else {
        throw new Error(response?.message || 'Invalid response from server');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      showError(`Failed to add team member: ${errorMessage}`);
    }
  };

  const handleDeleteUser = (userId) => {
    if (!userId) {
      showError('Invalid user ID');
      return;
    }

    const user = users.find(u => u._id === userId);
    const userName = user?.name || 'this user';

    confirmAction(
      `Are you sure you want to delete ${userName}? This action cannot be undone and will permanently remove all their data.`,
      async () => {
        try {
          const response = await apiService.deleteTeamMember(userId);
          
          if (response && response.success) {
            showSuccess(`✅ Team member "${userName}" deleted successfully!`);
            await loadTeamMembers(); // Reload the list
          } else {
            throw new Error(response?.message || 'Delete operation failed');
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          const errorMessage = error.message || 'Unknown error occurred';
          showError(`Failed to delete team member: ${errorMessage}`);
        }
      }
    );
  };

  const toggleUserStatus = async (userId) => {
    if (!userId) {
      showError('Invalid user ID');
      return;
    }

    const user = users.find(u => u._id === userId);
    if (!user) {
      showError('User not found');
      return;
    }

    const action = user.isActive ? 'deactivate' : 'activate';
    const userName = user.name || 'this user';

    try {
      const response = await apiService.toggleTeamMemberStatus(userId);
      
      if (response && response.success) {
        showSuccess(`✅ Team member "${userName}" ${action}d successfully!`);
        await loadTeamMembers(); // Reload the list
      } else {
        throw new Error(response?.message || 'Status update failed');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      showError(`Failed to ${action} team member: ${errorMessage}`);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || '',
      password: '',
      managerName: user.managerName || '',
      managerEmail: user.managerEmail || ''
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editingUser._id) {
      showError('No user selected for editing');
      return;
    }

    // Validate and sanitize user data
    const sanitizedData = sanitizeUserData(newUser);
    const validation = validateUserData(sanitizedData);
    
    if (!validation.isValid) {
      showError(`Validation failed:\n${validation.errors.join('\n')}`);
      return;
    }

    try {
      const updateData = sanitizedData;

      const response = await apiService.updateTeamMember(editingUser._id, updateData);

      if (response && response.success) {
        const roleDisplay = roles.find(r => r.value === response.user.role)?.label || response.user.role;
        showSuccess(`✅ Team member "${response.user.name}" updated successfully!\n🎭 New Role: ${roleDisplay}`);
        
        // Reset form and close modal
        setEditingUser(null);
        setNewUser({ name: '', email: '', role: 'sales', department: '', password: '', managerName: '', managerEmail: '' });
        
        // Reload the list
        await loadTeamMembers();
      } else {
        throw new Error(response?.message || 'Update operation failed');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      showError(`Failed to update team member: ${errorMessage}`);
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setNewUser({ name: '', email: '', role: 'sales', department: '', password: '', managerName: '', managerEmail: '' });
  };

  const filteredUsers = users.filter(user => {
    if (!user || typeof user !== 'object') return false;
    
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true;
    
    const name = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const department = (user.department || '').toLowerCase();
    const role = (user.role || '').toLowerCase();
    
    return name.includes(searchLower) || 
           email.includes(searchLower) || 
           department.includes(searchLower) ||
           role.includes(searchLower);
  });

  return (
    <div style={{
      padding: '2rem',
      background: darkMode ? '#1f2937' : 'white',
      borderRadius: '12px',
      boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: darkMode ? 'white' : '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <FaUsers style={{ color: '#3b82f6' }} />
            Team Management
          </h2>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            Users: {limits.current}/{limits.max} | Plan: {currentPlan.toUpperCase()}
            {companyInfo?.name && ` | Company: ${companyInfo.name}`}
          </p>
        </div>
        <button
          onClick={() => {
            // Check permissions and limits before opening modal (skip for super-admin)
            if (currentUser?.role !== 'super-admin' && !['admin', 'manager'].includes(currentUser?.role)) {
              showError('You need Admin or Manager role to add team members.');
              return;
            }
            if (currentUser?.role !== 'super-admin' && !limits.canAdd) {
              showError(`Your ${currentPlan} plan allows only ${limits.max} users. Please upgrade your plan.`);
              return;
            }
            setShowAddModal(true);
          }}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            ':hover': {
              background: '#2563eb'
            }
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#2563eb';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#3b82f6';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <FaPlus /> Add User
        </button>
      </div>

      {/* Access Control Warning */}
      {currentUser?.role !== 'super-admin' && !['admin', 'manager'].includes(currentUser?.role) && (
        <div style={{
          background: darkMode ? '#7c2d12' : '#fef3c7',
          border: '1px solid #f59e0b',
          color: darkMode ? '#fbbf24' : '#92400e',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          🔒 You need Admin or Manager role to manage team members.
        </div>
      )}

      {/* Plan Limit Warning */}
      {currentUser?.role !== 'super-admin' && limits.current >= limits.max * 0.8 && limits.max !== -1 && (
        <div style={{
          background: darkMode ? '#451a03' : '#fef3c7',
          border: '1px solid #f59e0b',
          color: darkMode ? '#fbbf24' : '#92400e',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          ⚠️ You are approaching your user limit ({limits.current}/{limits.max}). It's time to upgrade your plan!
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: darkMode ? '#9ca3af' : '#6b7280'
        }}>
          Loading team members...
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
            borderRadius: '8px',
            background: darkMode ? '#374151' : 'white',
            color: darkMode ? 'white' : '#1f2937',
            fontSize: '0.875rem'
          }}
        />
      </div>

      {/* Users Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: darkMode ? '#374151' : '#f9fafb' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem', fontWeight: '600' }}>Role</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem', fontWeight: '600' }}>Department</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem', fontWeight: '600' }}>Manager</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const roleInfo = roles.find(r => r.value === user.role);
              const RoleIcon = roleInfo?.icon || FaUsers;
              
              return (
                <tr key={user._id} style={{ borderBottom: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}` }}>
                  <td style={{ padding: '0.75rem', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem' }}>{user.name}</td>
                  <td style={{ padding: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>{user.email}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: roleInfo?.color, fontSize: '0.875rem' }}>
                      <RoleIcon />
                      {roleInfo?.label}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>{user.department || 'N/A'}</td>
                  <td style={{ padding: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
                    {user.managerName ? (
                      <div>
                        <div>{user.managerName}</div>
                        <div style={{ fontSize: '0.75rem', color: darkMode ? '#6b7280' : '#9ca3af' }}>{user.managerEmail}</div>
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      background: user.isActive 
                        ? (darkMode ? '#065f46' : '#dcfce7')
                        : (darkMode ? '#7f1d1d' : '#fee2e2'),
                      color: user.isActive
                        ? (darkMode ? '#34d399' : '#166534')
                        : (darkMode ? '#fca5a5' : '#dc2626')
                    }}>
                      {user.isActive ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          if (currentUser?.role !== 'super-admin' && !['admin', 'manager'].includes(currentUser?.role)) {
                            showError('You need Admin or Manager role to edit team members.');
                            return;
                          }
                          handleEditUser(user);
                        }}
                        style={{ 
                          color: '#3b82f6', 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          padding: '0.5rem',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease'
                        }}
                        title="Edit User"
                        onMouseEnter={(e) => {
                          e.target.style.background = darkMode ? '#1e40af20' : '#3b82f620';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'none';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => {
                          if (currentUser?.role !== 'super-admin' && !['admin', 'manager'].includes(currentUser?.role)) {
                            showError('You need Admin or Manager role to change user status.');
                            return;
                          }
                          toggleUserStatus(user._id);
                        }}
                        style={{ 
                          color: '#f59e0b', 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          padding: '0.5rem',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease'
                        }}
                        title={user.isActive ? 'Deactivate User' : 'Activate User'}
                        onMouseEnter={(e) => {
                          e.target.style.background = darkMode ? '#f59e0b20' : '#f59e0b20';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'none';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        {user.isActive ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button
                        onClick={() => {
                          if (currentUser?.role !== 'super-admin' && !['admin', 'manager'].includes(currentUser?.role)) {
                            showError('You need Admin or Manager role to delete team members.');
                            return;
                          }
                          handleDeleteUser(user._id);
                        }}
                        style={{ 
                          color: '#ef4444', 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          padding: '0.5rem',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease'
                        }}
                        title="Delete User"
                        onMouseEnter={(e) => {
                          e.target.style.background = darkMode ? '#ef444420' : '#ef444420';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'none';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      {(showAddModal || editingUser) && (
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
          zIndex: 50
        }}>
          <div style={{
            background: darkMode ? '#1f2937' : 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '400px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              color: darkMode ? 'white' : '#1f2937'
            }}>{editingUser ? 'Edit User' : 'Add New User'}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#1f2937'
                }}
              />
              
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#1f2937'
                }}
              />
              
              <input
                type="password"
                placeholder="Temporary Password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#1f2937'
                }}
              />
              
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#1f2937'
                }}
              >
                <option value="sales">Sales Representative</option>
                <option value="manager">Manager</option>
                <option value="support">Support</option>
              </select>
              
              <input
                type="text"
                placeholder="Department"
                value={newUser.department}
                onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#1f2937'
                }}
              />
              
              <input
                type="text"
                placeholder="Manager Name (for lead reminders)"
                value={newUser.managerName}
                onChange={(e) => setNewUser({...newUser, managerName: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#1f2937'
                }}
              />
              
              <input
                type="email"
                placeholder="Manager Email (for lead reminders)"
                value={newUser.managerEmail}
                onChange={(e) => setNewUser({...newUser, managerEmail: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#1f2937'
                }}
              />

              {/* Role Description */}
              <div style={{
                background: darkMode ? '#374151' : '#f9fafb',
                padding: '1rem',
                borderRadius: '8px'
              }}>
                <h4 style={{
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>Role Description:</h4>
                <p style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  {newUser.role === 'manager' && 'Can manage team members, view all leads, and access reports.'}
                  {newUser.role === 'sales' && 'Can manage own leads, create new leads, and view basic reports.'}
                  {newUser.role === 'support' && 'Can view leads, provide customer support, and access help desk.'}
                </p>
                {(newUser.role === 'sales' || newUser.role === 'support') && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: darkMode ? '#1f2937' : '#fef3c7',
                    borderRadius: '4px',
                    border: '1px solid #f59e0b'
                  }}>
                    <p style={{ fontSize: '0.75rem', color: darkMode ? '#fbbf24' : '#92400e', margin: 0 }}>
                      💡 <strong>Manager Info:</strong> If no activity on assigned leads for 48 hours, reminder emails will be sent to the specified manager.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                style={{
                  flex: 1,
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#059669';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#10b981';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {editingUser ? 'Update User' : 'Add User'}
              </button>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  if (editingUser) {
                    cancelEdit();
                  }
                  setNewUser({ name: '', email: '', role: 'sales', department: '', password: '', managerName: '', managerEmail: '' });
                }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = darkMode ? '#374151' : '#f3f4f6';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyUserManagement;