import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { TrendingUp, Users, DollarSign, Phone, ArrowUp, ArrowDown, Check, X, Calendar, Search, User, Mail, CreditCard, Shield } from 'lucide-react';
import BookDemoModal from './BookDemoModal';
import SuperAdminManagement from './SuperAdminManagement';

// Employee Management Component
const EmployeeManagement = ({ darkMode }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales'
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, filters]);

  const applyFilters = () => {
    let filtered = employees;
    
    if (filters.role) {
      filtered = filtered.filter(emp => emp.role === filters.role);
    }
    
    if (filters.status) {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(emp => emp.isActive === isActive);
    }
    
    if (filters.search) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        emp.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const getAccessLevel = (role) => {
    const access = {
      'super-admin': 'Full System Access, Manage All Companies & Users',
      'admin': 'Company Management, All Leads & Customers, Team Management',
      'manager': 'Team Leads, Assigned Customers, Reports',
      'senior-manager': 'Multiple Teams, Advanced Reports, Lead Assignment',
      'sales': 'Own Leads, Assigned Customers, Basic Reports'
    };
    return access[role] || 'Limited Access';
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5004/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.users || data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployeeStatus = async (userId, currentStatus) => {
    try {
      console.log('Toggling status for user:', userId, 'Current status:', currentStatus);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5004/api/auth/users/${userId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Toggle response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Toggle result:', result);
        fetchEmployees(); // Refresh list
        alert(`Employee ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
      } else {
        const errorText = await response.text();
        console.error('Toggle error response:', errorText);
        alert('Failed to update employee status');
      }
    } catch (error) {
      console.error('Error toggling employee status:', error);
      alert('Failed to update employee status');
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    console.log('Sending employee data:', formData);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5004/api/auth/create-employee', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        fetchEmployees();
        setShowAddForm(false);
        setFormData({ name: '', email: '', password: '', role: 'sales' });
        alert('Employee created successfully!');
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert('Failed to create employee');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      alert('Failed to create employee');
    }
  };

  const roleColors = {
    'super-admin': '#ef4444',
    'admin': '#f59e0b',
    'manager': '#3b82f6',
    'sales': '#10b981'
  };

  return (
    <div style={{
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      boxShadow: darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: darkMode ? '#f8fafc' : '#111827',
          margin: 0
        }}>Employee Management ({filteredEmployees.length}/{employees.length})</h2>
        
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            padding: '0.5rem 1rem',
            background: 'linear-gradient(135deg, #22c55e, #4ade80)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          + Add Employee
        </button>
      </div>
      
      {/* Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '1rem',
        background: darkMode ? '#374151' : '#f9fafb',
        borderRadius: '8px'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: darkMode ? '#d1d5db' : '#374151',
            marginBottom: '0.25rem'
          }}>Search</label>
          <input
            type="text"
            placeholder="Name or email..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '4px',
              background: darkMode ? '#1f2937' : 'white',
              color: darkMode ? 'white' : '#1f2937',
              fontSize: '0.875rem'
            }}
          />
        </div>
        
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: darkMode ? '#d1d5db' : '#374151',
            marginBottom: '0.25rem'
          }}>Role</label>
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '4px',
              background: darkMode ? '#1f2937' : 'white',
              color: darkMode ? 'white' : '#1f2937',
              fontSize: '0.875rem'
            }}
          >
            <option value="">All Roles</option>
            <option value="sales">Sales</option>
            <option value="manager">Manager</option>
            <option value="senior-manager">Senior Manager</option>
            <option value="admin">Admin</option>
            <option value="super-admin">Super Admin</option>
          </select>
        </div>
        
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: darkMode ? '#d1d5db' : '#374151',
            marginBottom: '0.25rem'
          }}>Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '4px',
              background: darkMode ? '#1f2937' : 'white',
              color: darkMode ? 'white' : '#1f2937',
              fontSize: '0.875rem'
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: darkMode ? '#cbd5e1' : '#6b7280' }}>
          Loading employees...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`, textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem', color: darkMode ? '#cbd5e1' : '#6b7280', fontWeight: '500' }}>Name</th>
                <th style={{ padding: '0.75rem 1rem', color: darkMode ? '#cbd5e1' : '#6b7280', fontWeight: '500' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem', color: darkMode ? '#cbd5e1' : '#6b7280', fontWeight: '500' }}>Role</th>
                <th style={{ padding: '0.75rem 1rem', color: darkMode ? '#cbd5e1' : '#6b7280', fontWeight: '500' }}>Access Level</th>
                <th style={{ padding: '0.75rem 1rem', color: darkMode ? '#cbd5e1' : '#6b7280', fontWeight: '500' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', color: darkMode ? '#cbd5e1' : '#6b7280', fontWeight: '500' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.map((employee) => (
                <tr key={employee._id} style={{ borderBottom: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}` }}>
                  <td style={{ padding: '1rem', color: darkMode ? '#f8fafc' : '#111827' }}>
                    {employee.name}
                  </td>
                  <td style={{ padding: '1rem', color: darkMode ? '#f8fafc' : '#111827' }}>
                    {employee.email}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: `${roleColors[employee.role] || '#6b7280'}20`,
                      color: roleColors[employee.role] || '#6b7280'
                    }}>
                      {employee.role?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: darkMode ? '#f8fafc' : '#111827', fontSize: '0.75rem' }}>
                    {getAccessLevel(employee.role)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: employee.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: employee.isActive ? '#10b981' : '#ef4444'
                    }}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => {
                        console.log('Button clicked for employee:', employee._id, employee.name);
                        toggleEmployeeStatus(employee._id, employee.isActive);
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        border: 'none',
                        borderRadius: '6px',
                        background: employee.isActive ? '#ef4444' : '#10b981',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}
                    >
                      {employee.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* No Results Message */}
      {filteredEmployees.length === 0 && employees.length > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: darkMode ? '#cbd5e1' : '#6b7280'
        }}>
          No employees found matching current filters
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '1rem',
          padding: '1rem'
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              background: currentPage === 1 ? (darkMode ? '#374151' : '#e5e7eb') : 'linear-gradient(135deg, #22c55e, #4ade80)',
              color: currentPage === 1 ? (darkMode ? '#6b7280' : '#9ca3af') : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Previous
          </button>
          
          <span style={{
            padding: '0.5rem 1rem',
            color: darkMode ? '#d1d5db' : '#374151',
            fontSize: '0.875rem'
          }}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              background: currentPage === totalPages ? (darkMode ? '#374151' : '#e5e7eb') : 'linear-gradient(135deg, #22c55e, #4ade80)',
              color: currentPage === totalPages ? (darkMode ? '#6b7280' : '#9ca3af') : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Next
          </button>
        </div>
      )}
      
      {/* Add Employee Modal */}
      {showAddForm && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: darkMode ? '#1f2937' : 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '1.5rem'
            }}>Add New Employee</h3>
            
            <form onSubmit={handleAddEmployee}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                    borderRadius: '6px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#1f2937'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                    borderRadius: '6px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#1f2937'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                    borderRadius: '6px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#1f2937'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                    borderRadius: '6px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#1f2937'
                  }}
                >
                  <option value="sales">Sales</option>
                  <option value="manager">Manager</option>
                  <option value="senior-manager">Senior Manager</option>
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'transparent',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// User Plan Manager Component
const UserPlanManager = ({ darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [users] = useState([]);

  const plans = [
    { name: 'Starter', price: 999, color: '#3b82f6' },
    { name: 'Professional', price: 2499, color: '#22c55e' },
    { name: 'Enterprise', price: 4999, color: '#8b5cf6' }
  ];

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlanUpgrade = (user, newPlan) => {
    // Update user plan logic here
    console.log(`Upgrading ${user.name} to ${newPlan.name} plan`);
    alert(`✅ ${user.name}'s plan upgraded to ${newPlan.name} successfully!`);
    setShowPlanModal(false);
    setSelectedUser(null);
  };

  return (
    <div>
      {/* Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          position: 'relative',
          flex: 1
        }}>
          <Search size={20} style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: darkMode ? '#9ca3af' : '#6b7280'
          }} />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
              borderRadius: '8px',
              background: darkMode ? '#374151' : 'white',
              color: darkMode ? 'white' : '#1f2937',
              fontSize: '0.875rem'
            }}
          />
        </div>
      </div>

      {/* Users List */}
      <div style={{
        display: 'grid',
        gap: '1rem',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {filteredUsers.map(user => {
          const currentPlan = plans.find(p => p.name === user.currentPlan);
          return (
            <div key={user.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: darkMode ? '#374151' : '#f9fafb',
              borderRadius: '8px',
              border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: darkMode ? 'white' : '#1f2937'
                  }}>
                    {user.name}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    {user.email} • {user.company}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  padding: '0.5rem 1rem',
                  background: `${currentPlan?.color}20`,
                  color: currentPlan?.color,
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {user.currentPlan}
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowPlanModal(true);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && searchTerm && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: darkMode ? '#9ca3af' : '#6b7280'
        }}>
          No users found matching "{searchTerm}"
        </div>
      )}

      {/* Plan Upgrade Modal */}
      {showPlanModal && selectedUser && (
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
        }} onClick={() => setShowPlanModal(false)}>
          <div style={{
            background: darkMode ? '#1f2937' : 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '1rem'
            }}>
              Upgrade Plan for {selectedUser.name}
            </h3>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
              padding: '1rem',
              background: darkMode ? '#374151' : '#f9fafb',
              borderRadius: '8px'
            }}>
              <Mail size={16} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
              <span style={{ color: darkMode ? '#d1d5db' : '#374151' }}>{selectedUser.email}</span>
            </div>

            <div style={{
              display: 'grid',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {plans.map(plan => (
                <button
                  key={plan.name}
                  onClick={() => handlePlanUpgrade(selectedUser, plan)}
                  disabled={selectedUser.currentPlan === plan.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: selectedUser.currentPlan === plan.name 
                      ? (darkMode ? '#4b5563' : '#e5e7eb')
                      : (darkMode ? '#374151' : 'white'),
                    border: `1px solid ${plan.color}`,
                    borderRadius: '8px',
                    cursor: selectedUser.currentPlan === plan.name ? 'not-allowed' : 'pointer',
                    opacity: selectedUser.currentPlan === plan.name ? 0.6 : 1
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: darkMode ? 'white' : '#1f2937'
                    }}>
                      {plan.name}
                      {selectedUser.currentPlan === plan.name && ' (Current)'}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: plan.color,
                      fontWeight: '600'
                    }}>
                      ₹{plan.price.toLocaleString()}/month
                    </div>
                  </div>
                  <CreditCard size={20} style={{ color: plan.color }} />
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowPlanModal(false)}
              style={{
                width: '100%',
                padding: '0.75rem',
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
        </div>
      )}
    </div>
  );
};

const SuperAdminDashboard = ({ darkMode = false, currentUser }) => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const handleStatClick = (stat) => {
    console.log('Stat clicked:', stat.title);
    setModalTitle(stat.title);
    
    // No mock data - will show empty state
    let data = [];
    
    setModalData(data);
    setIsStatModalOpen(true);
  };
  
  const leadsArray = Array.isArray(leads) ? leads : (leads?.leads ? leads.leads : []);
  const stats = [
    { title: 'Total Leads', value: leadsArray.length.toString(), change: '+12.5%', trend: 'up', icon: Users },
    { title: 'Active Leads', value: leadsArray.filter(l => ['qualified', 'proposal', 'negotiation'].includes(l.status)).length.toString(), change: '+8.2%', trend: 'up', icon: TrendingUp },
    { title: 'Closed Won', value: leadsArray.filter(l => l.status === 'closed-won').length.toString(), change: '+5.7%', trend: 'up', icon: DollarSign },
    { title: 'Pending Leads', value: leadsArray.filter(l => ['new', 'contacted'].includes(l.status)).length.toString(), change: '-3.1%', trend: 'down', icon: Phone }
  ];

  // Demo requests that need approval
  const [demoRequests, setDemoRequests] = useState([]);

  useEffect(() => {
    fetchDemoRequests();
    fetchLeads();
    
    // Auto-cleanup every 1 minute
    const cleanupInterval = setInterval(() => {
      const localRequests = JSON.parse(localStorage.getItem('demoRequests') || '[]');
      const now = new Date();
      
      const activeRequests = localRequests.filter(req => {
        if (req.status !== 'approved') return true;
        
        // Parse demo date and time properly
        const demoDateTime = new Date(`${req.date}T${req.time}`);
        const expireTime = new Date(demoDateTime.getTime() + 30 * 60000); // Demo time + 30 minutes
        
        if (now >= expireTime) {
          console.log(`🗑️ Auto-deleting completed demo: ${req.name} (${req.date} ${req.time})`);
          return false;
        }
        return true;
      });
      
      if (activeRequests.length !== localRequests.length) {
        localStorage.setItem('demoRequests', JSON.stringify(activeRequests));
        setDemoRequests(activeRequests);
        console.log('🗑️ Expired demos auto-deleted');
      }
    }, 60000); // Check every 1 minute
    
    return () => clearInterval(cleanupInterval);
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllLeads();
      const leadsData = response?.leads || response || [];
      setLeads(Array.isArray(leadsData) ? leadsData : []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const assignLead = async (leadId, assignTo) => {
    try {
      await apiService.assignLead(leadId, assignTo);
      fetchLeads(); // Refresh leads
      alert(`✅ Lead assigned to ${assignTo} successfully!`);
    } catch (error) {
      console.error('Error assigning lead:', error);
      alert('❌ Failed to assign lead');
    }
  };

  const fetchDemoRequests = async () => {
    try {
      // Try to get from API first
      const requests = await apiService.getDemoRequests();
      setDemoRequests(requests);
    } catch (error) {
      console.error('Error fetching demo requests from API:', error);
      // Fallback to localStorage for demo purposes
      const localRequests = JSON.parse(localStorage.getItem('demoRequests') || '[]');
      
      // Auto-delete expired approved demos (30 minutes after scheduled time)
      const now = new Date();
      const activeRequests = localRequests.filter(req => {
        if (req.status !== 'approved') return true;
        const demoTime = new Date(`${req.date}T${req.time}`);
        const expireTime = new Date(demoTime.getTime() + 30 * 60000); // +30 minutes
        return now < expireTime;
      });
      
      if (activeRequests.length !== localRequests.length) {
        localStorage.setItem('demoRequests', JSON.stringify(activeRequests));
        console.log('🗑️ Expired demos automatically deleted');
      }
      
      setDemoRequests(activeRequests);
    }
  };



  const handleApprove = async (id) => {
    if (!id) {
      console.error('❌ Cannot approve demo request: ID is undefined');
      alert('Error: Cannot approve demo request. Invalid ID.');
      return;
    }
    
    console.log('✅ Approving demo request:', id);
    
    try {
      const result = await apiService.approveDemoRequest(id);
      console.log('✅ Demo request approved successfully:', result);
      
      fetchDemoRequests();
      alert('✅ Demo approved! Email with Google Meet link has been sent!');
    } catch (error) {
      console.error('Error approving demo request via API:', error);
      const localRequests = JSON.parse(localStorage.getItem('demoRequests') || '[]');
      const updatedRequests = localRequests.map(request => 
        request.id === id ? { ...request, status: 'approved' } : request
      );
      localStorage.setItem('demoRequests', JSON.stringify(updatedRequests));
      setDemoRequests(updatedRequests);
      alert('✅ Demo approved locally!');
    }
  };

  const handleReject = async (id) => {
    if (!id) {
      console.error('❌ Cannot reject demo request: ID is undefined');
      alert('Error: Cannot reject demo request. Invalid ID.');
      return;
    }
    
    console.log('❌ Rejecting demo request:', id);
    
    try {
      await apiService.rejectDemoRequest(id);
      fetchDemoRequests();
    } catch (error) {
      console.error('Error rejecting demo request via API:', error);
      // Fallback to localStorage
      const localRequests = JSON.parse(localStorage.getItem('demoRequests') || '[]');
      const updatedRequests = localRequests.map(request => 
        request.id === id ? { ...request, status: 'rejected' } : request
      );
      localStorage.setItem('demoRequests', JSON.stringify(updatedRequests));
      setDemoRequests(updatedRequests);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this demo request?')) return;
    
    try {
      await apiService.deleteDemoRequest(id);
      await fetchDemoRequests();
      alert('✅ Demo request deleted!');
    } catch (error) {
      console.error('Error deleting demo request via API:', error);
      // Fallback to localStorage
      const localRequests = JSON.parse(localStorage.getItem('demoRequests') || '[]');
      const updatedRequests = localRequests.filter(request => 
        (request.id || request._id) !== id
      );
      localStorage.setItem('demoRequests', JSON.stringify(updatedRequests));
      setDemoRequests(updatedRequests);
      alert('✅ Demo request deleted!');
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
      <div style={{
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          color: darkMode ? '#f8fafc' : '#111827',
          marginBottom: '0.5rem'
        }}>{currentUser?.role === 'super-admin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}</h1>
        <p style={{
          color: darkMode ? '#cbd5e1' : '#6b7280'
        }}>Welcome back! Here's what's happening with your business today.</p>
        
        {/* Tab Navigation */}
        {currentUser?.role === 'super-admin' && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1.5rem',
            borderBottom: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
            paddingBottom: '0.5rem'
          }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                padding: '0.5rem 1rem',
                background: activeTab === 'dashboard' ? 'linear-gradient(135deg, #10b981, #34d399)' : 'transparent',
                color: activeTab === 'dashboard' ? 'white' : (darkMode ? '#cbd5e1' : '#6b7280'),
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <TrendingUp size={16} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('management')}
              style={{
                padding: '0.5rem 1rem',
                background: activeTab === 'management' ? 'linear-gradient(135deg, #10b981, #34d399)' : 'transparent',
                color: activeTab === 'management' ? 'white' : (darkMode ? '#cbd5e1' : '#6b7280'),
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Shield size={16} />
              Super Admin Management
            </button>
          </div>
        )}
      </div>

      {/* Render based on active tab */}
      {activeTab === 'management' && currentUser?.role === 'super-admin' ? (
        <SuperAdminManagement darkMode={darkMode} />
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              onClick={() => handleStatClick(stat)}
              style={{
                background: darkMode ? '#1e293b' : 'linear-gradient(135deg, white, #f8fafc)',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: `1px solid ${darkMode ? '#334155' : 'rgba(0, 0, 0, 0.05)'}`,
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = darkMode ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 20px 40px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.background = darkMode ? '#334155' : 'linear-gradient(135deg, #ffffff, #f1f5f9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = darkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.background = darkMode ? '#1e293b' : 'linear-gradient(135deg, white, #f8fafc)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: `linear-gradient(135deg, ${stat.trend === 'up' ? '#10b981' : '#ef4444'}20, ${stat.trend === 'up' ? '#10b981' : '#ef4444'}10)`,
                borderRadius: '50%',
                opacity: 0.3
              }} />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                position: 'relative',
                zIndex: 1
              }}>
                <div>
                  <h3 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    color: darkMode ? '#f8fafc' : '#111827',
                    marginBottom: '0.5rem'
                  }}>{stat.value}</h3>
                  <p style={{
                    color: darkMode ? '#cbd5e1' : '#6b7280',
                    fontSize: '1rem',
                    margin: '0',
                    fontWeight: '600'
                  }}>{stat.title}</p>
                </div>
                <div style={{
                  background: `linear-gradient(135deg, ${stat.trend === 'up' ? '#10b981' : '#ef4444'}, ${stat.trend === 'up' ? '#34d399' : '#f87171'})`,
                  borderRadius: '16px',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: `0 8px 20px ${stat.trend === 'up' ? '#10b981' : '#ef4444'}40`
                }}>
                  <Icon size={28} />
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '1.5rem',
                padding: '0.75rem 1rem',
                background: stat.trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderRadius: '12px',
                color: stat.trend === 'up' ? '#10b981' : '#ef4444',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {stat.trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                <span style={{ marginLeft: '0.5rem' }}>{stat.change}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.7 }}>vs last month</span>
              </div>
            </div>
          );
        })}
      </div>



      {/* Employee Management Section */}
      <EmployeeManagement darkMode={darkMode} />

      {/* User Management Section */}
      <div style={{
        background: darkMode ? '#1e293b' : 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        boxShadow: darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: darkMode ? '#f8fafc' : '#111827',
          marginBottom: '1.5rem'
        }}>User Plan Management</h2>
        
        <UserPlanManager darkMode={darkMode} />
      </div>

      <div style={{
        background: darkMode ? '#1e293b' : 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        boxShadow: darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: darkMode ? '#f8fafc' : '#111827',
          marginBottom: '1.5rem'
        }}>Demo Requests Pending Approval</h2>
        
        <div style={{
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                borderBottom: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
                textAlign: 'left'
              }}>
                <th style={{ padding: '0.75rem 1rem', color: darkMode ? '#cbd5e1' : '#6b7280', fontWeight: '500' }}>Name</th>
                <th style={{ padding: '0.75rem 1rem', color: darkMode ? '#cbd5e1' : '#6b7280', fontWeight: '500' }}>Company</th>
                <th style={{ padding: '0.75rem 1rem', color: darkMode ? '#cbd5e1' : '#6b7280', fontWeight: '500' }}>Contact</th>
                <th style={{ padding: '0.75rem 1rem', color: darkMode ? '#cbd5e1' : '#6b7280', fontWeight: '500' }}>Date & Time</th>
                <th style={{ padding: '0.75rem 1rem', color: darkMode ? '#cbd5e1' : '#6b7280', fontWeight: '500' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', color: darkMode ? '#cbd5e1' : '#6b7280', fontWeight: '500' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demoRequests.map((request, index) => (
                <tr key={request.id || index} style={{
                  borderBottom: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`
                }}>
                  <td style={{ padding: '1rem', color: darkMode ? '#f8fafc' : '#111827' }}>{request.name}</td>
                  <td style={{ padding: '1rem', color: darkMode ? '#f8fafc' : '#111827' }}>
                    {request.company}
                    <div style={{ fontSize: '0.75rem', color: darkMode ? '#cbd5e1' : '#6b7280' }}>{request.employees} employees</div>
                  </td>
                  <td style={{ padding: '1rem', color: darkMode ? '#f8fafc' : '#111827' }}>
                    {request.email}
                    <div style={{ fontSize: '0.75rem', color: darkMode ? '#cbd5e1' : '#6b7280' }}>{request.phone}</div>
                  </td>
                  <td style={{ padding: '1rem', color: darkMode ? '#f8fafc' : '#111827' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Calendar size={16} style={{ marginRight: '0.5rem', color: '#6b7280' }} />
                      {new Date(request.date).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{request.time}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: request.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 
                                 request.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 
                                 'rgba(245, 158, 11, 0.1)',
                      color: request.status === 'approved' ? '#10b981' : 
                             request.status === 'rejected' ? '#ef4444' : 
                             '#f59e0b'
                    }}>
                      {request.status === 'approved' ? 'Approved' : 
                       request.status === 'rejected' ? 'Rejected' : 
                       'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {request.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleApprove(request.id || request._id || index)}
                          title="Approve & Send Email"
                          style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => handleReject(request.id || request._id || index)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    {request.status === 'approved' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            const googleMeetLink = 'https://meet.google.com/uqk-sjqx-vde';
                            navigator.clipboard.writeText(googleMeetLink);
                            window.open(googleMeetLink, '_blank');
                            alert(`📞 Connecting with ${request.name}\n\nGoogle Meet opened!\nLink copied to clipboard.`);
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}
                        >
                          Connect
                        </button>
                        <button
                          onClick={() => handleDelete(request.id || request._id || index)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                    {request.status === 'rejected' && (
                      <button
                        onClick={() => handleDelete(request.id || request._id || index)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {demoRequests.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: darkMode ? '#cbd5e1' : '#6b7280' }}>
                    No pending demo requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Stat Modal */}
      {isStatModalOpen && (
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
        }} onClick={() => setIsStatModalOpen(false)}>
          <div style={{
            background: darkMode ? '#1e293b' : 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                margin: 0
              }}>{modalTitle} Details</h3>
              <button 
                onClick={() => setIsStatModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >&times;</button>
            </div>
            
            <div>
              {modalData.map((item, index) => (
                <div key={index} style={{
                  padding: '1rem',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#111827' }}>{item.name}</div>
                    {item.company && <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.company}</div>}
                    {item.customer && <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.customer}</div>}
                    {item.leads && <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.leads}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {item.amount && <div style={{ fontWeight: '600', color: '#10b981' }}>{item.amount}</div>}
                    {item.status && <div style={{ color: '#10b981' }}>{item.status}</div>}
                    {item.duration && <div style={{ color: '#6b7280' }}>{item.duration}</div>}
                    {item.rate && <div style={{ fontWeight: '600', color: '#3b82f6' }}>{item.rate}</div>}
                    {item.date && <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.date}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboard;