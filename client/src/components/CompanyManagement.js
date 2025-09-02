import React, { useState, useEffect } from 'react';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaCopy, FaCheck, FaUsers, FaCrown, FaEnvelope, FaBan, FaPlay } from 'react-icons/fa';
import apiService from '../services/apiService';
import { showSuccess, showError, confirmAction } from '../utils/notifications';

const CompanyManagement = ({ darkMode }) => {
  const [companies, setCompanies] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedField, setCopiedField] = useState('');

  // Load companies from backend
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await apiService.getCompanies();
      if (response.success) {
        setCompanies(response.companies || []);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      // Keep empty array if API fails
      setCompanies([]);
    }
  };

  const plans = [
    { value: 'basic', label: 'Basic Plan', price: '₹999/month', color: '#22c55e' },
    { value: 'professional', label: 'Professional Plan', price: '₹2999/month', color: '#3b82f6' },
    { value: 'enterprise', label: 'Enterprise Plan', price: '₹9999/month', color: '#f59e0b' }
  ];

  const [newCompany, setNewCompany] = useState({
    name: '',
    domain: '',
    email: '',
    phone: '',
    plan: 'basic',
    contactPerson: '',
    address: ''
  });

  const generateCompanyId = () => {
    const lastId = companies.length > 0 ? 
      Math.max(...companies.map(c => parseInt(c.id.replace('COMP', '')))) : 0;
    return `COMP${String(lastId + 1).padStart(3, '0')}`;
  };

  const generateCredentials = (companyName, domain) => {
    const username = `${domain.toLowerCase()}_admin`;
    const password = `${companyName.substring(0, 2).toUpperCase()}@2024#${Math.random().toString(36).substring(2, 6)}`;
    return { username, password };
  };

  const handleAddCompany = async () => {
    try {
      const response = await apiService.createCompany({
        name: newCompany.name,
        contactEmail: newCompany.email,
        contactPhone: newCompany.phone,
        plan: {
          name: newCompany.plan,
          leadsLimit: newCompany.plan === 'basic' ? 1000 : newCompany.plan === 'professional' ? 5000 : 10000,
          usersLimit: newCompany.plan === 'basic' ? 5 : newCompany.plan === 'professional' ? 20 : 50
        }
      });

      if (response.success) {
        // Show credentials modal
        setGeneratedCredentials({
          companyId: response.company.id,
          companyName: response.company.name,
          username: response.admin.email,
          password: response.admin.tempPassword
        });
        
        // Reset form
        setNewCompany({
          name: '', domain: '', email: '', phone: '', plan: 'basic', contactPerson: '', address: ''
        });
        
        setShowAddModal(false);
        setShowCredentialsModal(true);
        
        // Reload companies list
        loadCompanies();
        showSuccess('Company created successfully!');
      }
    } catch (error) {
      console.error('Error creating company:', error);
      showError('Error creating company: ' + error.message);
    }
  };

  const toggleCompanyStatus = async (companyId) => {
    try {
      const company = companies.find(c => c._id === companyId);
      const newStatus = company.status === 'active' ? 'inactive' : 'active';
      
      await apiService.updateCompanyStatus(companyId, newStatus);
      loadCompanies(); // Reload list
      showSuccess(`Company status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating company status:', error);
      showError('Error updating company status: ' + error.message);
    }
  };

  const suspendCompany = async (companyId) => {
    confirmAction(
      'Are you sure you want to suspend this company? All users will be deactivated.',
      async () => {
        try {
          console.log('⏸️ Suspending company:', companyId);
          const response = await apiService.suspendCompany(companyId);
          console.log('✅ Suspend response:', response);
          
          if (response.success) {
            loadCompanies();
            showSuccess('Company suspended successfully!');
          } else {
            throw new Error(response.message || 'Failed to suspend company');
          }
        } catch (error) {
          console.error('❌ Error suspending company:', error);
          showError('Error suspending company: ' + error.message);
        }
      }
    );
  };

  const activateCompany = async (companyId) => {
    confirmAction(
      'Are you sure you want to activate this company? All users will be reactivated.',
      async () => {
        try {
          console.log('▶️ Activating company:', companyId);
          const response = await apiService.activateCompany(companyId);
          console.log('✅ Activate response:', response);
          
          if (response.success) {
            loadCompanies();
            showSuccess('Company activated successfully!');
          } else {
            throw new Error(response.message || 'Failed to activate company');
          }
        } catch (error) {
          console.error('❌ Error activating company:', error);
          showError('Error activating company: ' + error.message);
        }
      }
    );
  };

  const handleDeleteCompany = async (companyId) => {
    confirmAction(
      'Are you sure you want to delete this company? This will permanently delete all company data, users, leads, and customers. This action cannot be undone.',
      async () => {
        try {
          console.log('🗑️ Deleting company:', companyId);
          const response = await apiService.deleteCompany(companyId);
          console.log('✅ Delete response:', response);
          
          if (response.success) {
            loadCompanies();
            showSuccess('Company deleted successfully!');
          } else {
            throw new Error(response.message || 'Failed to delete company');
          }
        } catch (error) {
          console.error('❌ Error deleting company:', error);
          showError('Error deleting company: ' + error.message);
        }
      }
    );
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showSuccess('Copied to clipboard!');
    setTimeout(() => setCopiedField(''), 2000);
  };

  const sendCredentialsEmail = (company) => {
    // Mock email sending
    showSuccess(`Credentials email sent to ${company.contactEmail || company.email} successfully!`);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            <FaBuilding style={{ color: '#3b82f6' }} />
            Company Management
          </h2>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            Manage client companies and generate admin credentials
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
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
            fontWeight: '500'
          }}
        >
          <FaPlus /> Add Company
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: darkMode ? '#374151' : '#f9fafb',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {companies.length}
          </div>
          <div style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
            Total Companies
          </div>
        </div>
        <div style={{
          background: darkMode ? '#374151' : '#f9fafb',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {companies.filter(c => c.status === 'active').length}
          </div>
          <div style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
            Active Companies
          </div>
        </div>
        <div style={{
          background: darkMode ? '#374151' : '#f9fafb',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {companies.reduce((sum, c) => sum + c.users, 0)}
          </div>
          <div style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
            Total Users
          </div>
        </div>
        <div style={{
          background: darkMode ? '#374151' : '#f9fafb',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {companies.reduce((sum, c) => sum + c.leads, 0)}
          </div>
          <div style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
            Total Leads
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search companies..."
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

      {/* Companies Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: darkMode ? '#374151' : '#f9fafb' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem', fontWeight: '600' }}>Company</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem', fontWeight: '600' }}>Domain</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem', fontWeight: '600' }}>Plan</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem', fontWeight: '600' }}>Users</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map(company => {
              const planInfo = plans.find(p => p.value === company.plan);
              return (
                <tr key={company._id || company.id} style={{ borderBottom: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}` }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div>
                      <div style={{ color: darkMode ? 'white' : '#1f2937', fontSize: '0.875rem', fontWeight: '500' }}>
                        {company.name}
                      </div>
                      <div style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.75rem' }}>
                        {company._id || company.id} • {company.contactEmail || company.email}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
                    {company.slug || company.domain}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      background: planInfo?.color + '20',
                      color: planInfo?.color,
                      fontWeight: '500'
                    }}>
                      {planInfo?.label || (company.plan?.name || company.plan)}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
                    <FaUsers style={{ marginRight: '0.25rem' }} />
                    {company.userCount || company.users || 0}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      background: company.status === 'active' 
                        ? (darkMode ? '#065f46' : '#dcfce7')
                        : company.status === 'suspended'
                        ? (darkMode ? '#7c2d12' : '#fed7aa')
                        : (darkMode ? '#7f1d1d' : '#fee2e2'),
                      color: company.status === 'active'
                        ? (darkMode ? '#34d399' : '#166534')
                        : company.status === 'suspended'
                        ? (darkMode ? '#fb923c' : '#ea580c')
                        : (darkMode ? '#fca5a5' : '#dc2626')
                    }}>
                      {company.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setGeneratedCredentials({
                            ...company.adminCredentials,
                            companyId: company.id,
                            companyName: company.name
                          });
                          setShowCredentialsModal(true);
                        }}
                        style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                        title="View Credentials"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => sendCredentialsEmail(company)}
                        style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                        title="Send Email"
                      >
                        <FaEnvelope />
                      </button>
                      {company.status === 'suspended' ? (
                        <button
                          onClick={() => activateCompany(company._id || company.id)}
                          style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                          title="Activate Company"
                        >
                          <FaPlay />
                        </button>
                      ) : (
                        <button
                          onClick={() => suspendCompany(company._id || company.id)}
                          style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                          title="Suspend Company"
                        >
                          <FaBan />
                        </button>
                      )}
                      <button
                        onClick={() => toggleCompanyStatus(company._id || company.id)}
                        style={{ color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                        title="Toggle Active/Inactive"
                      >
                        {company.status === 'active' ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(company._id || company.id)}
                        style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                        title="Delete Company"
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

      {/* Add Company Modal */}
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
            width: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              color: darkMode ? 'white' : '#1f2937'
            }}>Add New Company</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Company Name"
                value={newCompany.name}
                onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
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
                placeholder="Domain (e.g., techcorp)"
                value={newCompany.domain}
                onChange={(e) => setNewCompany({...newCompany, domain: e.target.value})}
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
                placeholder="Admin Email"
                value={newCompany.email}
                onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
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
                type="tel"
                placeholder="Phone Number"
                value={newCompany.phone}
                onChange={(e) => setNewCompany({...newCompany, phone: e.target.value})}
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
                placeholder="Contact Person"
                value={newCompany.contactPerson}
                onChange={(e) => setNewCompany({...newCompany, contactPerson: e.target.value})}
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
                value={newCompany.plan}
                onChange={(e) => setNewCompany({...newCompany, plan: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#1f2937'
                }}
              >
                {plans.map(plan => (
                  <option key={plan.value} value={plan.value}>
                    {plan.label} - {plan.price}
                  </option>
                ))}
              </select>
              
              <textarea
                placeholder="Address"
                value={newCompany.address}
                onChange={(e) => setNewCompany({...newCompany, address: e.target.value})}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#1f2937',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                onClick={handleAddCompany}
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
                Create Company
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

      {/* Credentials Modal */}
      {showCredentialsModal && generatedCredentials && (
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
            width: '450px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: darkMode ? 'white' : '#1f2937'
            }}>Company Created Successfully!</h3>
            
            <p style={{
              color: darkMode ? '#9ca3af' : '#6b7280',
              marginBottom: '2rem',
              fontSize: '0.875rem'
            }}>
              Admin credentials for <strong>{generatedCredentials.companyName}</strong>
            </p>
            
            <div style={{
              background: darkMode ? '#374151' : '#f9fafb',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  COMPANY ID
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={generatedCredentials.companyId}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '6px',
                      background: darkMode ? '#4b5563' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '0.875rem'
                    }}
                  />
                  <button
                    onClick={() => copyToClipboard(generatedCredentials.companyId, 'companyId')}
                    style={{
                      padding: '0.5rem',
                      background: 'transparent',
                      border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}
                  >
                    {copiedField === 'companyId' ? <FaCheck style={{ color: '#10b981' }} /> : <FaCopy />}
                  </button>
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  USERNAME
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={generatedCredentials.username}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '6px',
                      background: darkMode ? '#4b5563' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '0.875rem'
                    }}
                  />
                  <button
                    onClick={() => copyToClipboard(generatedCredentials.username, 'username')}
                    style={{
                      padding: '0.5rem',
                      background: 'transparent',
                      border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}
                  >
                    {copiedField === 'username' ? <FaCheck style={{ color: '#10b981' }} /> : <FaCopy />}
                  </button>
                </div>
              </div>
              
              <div>
                <label style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  PASSWORD
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={generatedCredentials.password}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '6px',
                      background: darkMode ? '#4b5563' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '0.875rem'
                    }}
                  />
                  <button
                    onClick={() => copyToClipboard(generatedCredentials.password, 'password')}
                    style={{
                      padding: '0.5rem',
                      background: 'transparent',
                      border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}
                  >
                    {copiedField === 'password' ? <FaCheck style={{ color: '#10b981' }} /> : <FaCopy />}
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{
              background: darkMode ? '#065f46' : '#dcfce7',
              color: darkMode ? '#34d399' : '#166534',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              ⚠️ Please save these credentials securely. They cannot be recovered later.
            </div>
            
            <button 
              onClick={() => {
                setShowCredentialsModal(false);
                setGeneratedCredentials(null);
              }}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;