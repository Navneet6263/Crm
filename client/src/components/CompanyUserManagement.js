import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaUserShield, FaUserTie, FaEye, FaEyeSlash } from 'react-icons/fa';

const CompanyUserManagement = ({ currentUser, darkMode }) => {
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with API calls
  useEffect(() => {
    const mockUsers = [
      {
        id: 1,
        name: 'Rahul Sharma',
        email: 'rahul@company.com',
        role: 'manager',
        department: 'Sales',
        status: 'active',
        joinDate: '2024-01-15',
        permissions: ['view_leads', 'edit_leads', 'view_reports']
      },
      {
        id: 2,
        name: 'Priya Singh',
        email: 'priya@company.com',
        role: 'sales_rep',
        department: 'Sales',
        status: 'active',
        joinDate: '2024-02-01',
        permissions: ['view_leads', 'edit_own_leads']
      }
    ];
    setUsers(mockUsers);
  }, []);

  // Plan limits
  const planLimits = {
    basic: { maxUsers: 5, maxManagers: 1 },
    professional: { maxUsers: 25, maxManagers: 5 },
    enterprise: { maxUsers: 100, maxManagers: 20 }
  };

  const currentPlan = currentUser?.plan || 'basic';
  const limits = planLimits[currentPlan];
  const currentUserCount = users.length;
  const currentManagerCount = users.filter(u => u.role === 'manager').length;

  const roles = [
    { value: 'manager', label: 'Manager', icon: FaUserShield, color: '#667eea' },
    { value: 'sales_rep', label: 'Sales Representative', icon: FaUserTie, color: '#22c55e' },
    { value: 'viewer', label: 'Viewer Only', icon: FaEye, color: '#f59e0b' }
  ];

  const permissions = {
    manager: ['view_all_leads', 'edit_all_leads', 'delete_leads', 'view_reports', 'manage_team'],
    sales_rep: ['view_leads', 'edit_own_leads', 'add_leads', 'view_own_reports'],
    viewer: ['view_leads', 'view_reports']
  };

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'sales_rep',
    department: '',
    password: ''
  });

  const handleAddUser = () => {
    if (currentUserCount >= limits.maxUsers) {
      alert(`Your ${currentPlan} plan allows only ${limits.maxUsers} users. Please upgrade your plan.`);
      return;
    }

    if (newUser.role === 'manager' && currentManagerCount >= limits.maxManagers) {
      alert(`Your ${currentPlan} plan allows only ${limits.maxManagers} managers. Please upgrade your plan.`);
      return;
    }

    const user = {
      id: Date.now(),
      ...newUser,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      permissions: permissions[newUser.role]
    };

    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'sales_rep', department: '', password: '' });
    setShowAddModal(false);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Users: {currentUserCount}/{limits.maxUsers} | Managers: {currentManagerCount}/{limits.maxManagers}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={currentUserCount >= limits.maxUsers}
          style={{
            background: currentUserCount >= limits.maxUsers ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: currentUserCount >= limits.maxUsers ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          <FaPlus /> Add User
        </button>
      </div>

      {/* Plan Limit Warning */}
      {currentUserCount >= limits.maxUsers * 0.8 && (
        <div style={{
          background: darkMode ? '#451a03' : '#fef3c7',
          border: '1px solid #f59e0b',
          color: darkMode ? '#fbbf24' : '#92400e',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          ⚠️ You are approaching your user limit. It's time to upgrade your plan!
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
              <th style={{ padding: '0.75rem', textAlign: 'left', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const roleInfo = roles.find(r => r.value === user.role);
              const RoleIcon = roleInfo?.icon || FaUsers;
              
              return (
                <tr key={user.id} style={{ borderBottom: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}` }}>
                  <td style={{ padding: '0.75rem', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem' }}>{user.name}</td>
                  <td style={{ padding: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>{user.email}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: roleInfo?.color, fontSize: '0.875rem' }}>
                      <RoleIcon />
                      {roleInfo?.label}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>{user.department}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      background: user.status === 'active' 
                        ? (darkMode ? '#065f46' : '#dcfce7')
                        : (darkMode ? '#7f1d1d' : '#fee2e2'),
                      color: user.status === 'active'
                        ? (darkMode ? '#34d399' : '#166534')
                        : (darkMode ? '#fca5a5' : '#dc2626')
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setEditingUser(user)}
                        style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        style={{ color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                      >
                        {user.status === 'active' ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
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

      {/* Add User Modal */}
      {showAddModal && (
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
            }}>Add New User</h3>
            
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
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
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

              {/* Permissions Preview */}
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
                }}>Permissions:</h4>
                <ul style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  {permissions[newUser.role]?.map(perm => (
                    <li key={perm} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></span>
                      {perm.replace(/_/g, ' ').toUpperCase()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                onClick={handleAddUser}
                style={{
                  flex: 1,
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Add User
              </button>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
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