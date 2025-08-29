import React, { useState } from 'react';
import { X, User, Building, Mail, Phone, MapPin, Tag, DollarSign } from 'lucide-react';
import customerService from '../services/customerService';

const CustomerFormModal = ({ isOpen, onClose, onCustomerAdded, onCustomerUpdated, darkMode, editCustomer = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    industry: '',
    customerType: 'business',
    totalValue: 0,
    notes: ''
  });

  // Initialize form data when editing
  React.useEffect(() => {
    if (editCustomer) {
      setFormData({
        name: editCustomer.name || '',
        companyName: editCustomer.company || editCustomer.companyName || '',
        email: editCustomer.email || '',
        phone: editCustomer.phone || '',
        address: {
          street: editCustomer.address?.street || '',
          city: editCustomer.address?.city || '',
          state: editCustomer.address?.state || '',
          zipCode: editCustomer.address?.zipCode || '',
          country: editCustomer.address?.country || ''
        },
        industry: editCustomer.industry || '',
        customerType: editCustomer.customerType || 'business',
        totalValue: editCustomer.totalValue || 0,
        notes: editCustomer.notes || ''
      });
    } else {
      setFormData({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        industry: '',
        customerType: 'business',
        totalValue: 0,
        notes: ''
      });
    }
  }, [editCustomer]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Customer name is required';
    if (!formData.companyName.trim()) errors.companyName = 'Company name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate phone number (10 digits starting with 6-9)
    const phoneDigits = formData.phone.replace(/[^\d]/g, '');
    if (formData.phone && phoneDigits.length !== 10) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    } else if (formData.phone && !phoneDigits.match(/^[6-9]/)) {
      errors.phone = 'Phone number must start with 6, 7, 8, or 9';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0]);
      setLoading(false);
      return;
    }

    try {
      const customerData = {
        ...formData,
        phone: formData.phone.replace(/[^\d]/g, ''), // Send only digits
        totalValue: parseFloat(formData.totalValue) || 0,
        notes: formData.notes.trim()
      };
      
      console.log('Submitting customer data:', customerData);
      
      if (editCustomer) {
        // Update existing customer
        const updatedCustomer = await customerService.updateCustomer(editCustomer.id, customerData);
        if (onCustomerUpdated) onCustomerUpdated(updatedCustomer);
      } else {
        // Create new customer
        const newCustomer = await customerService.createCustomer(customerData);
        onCustomerAdded(newCustomer);
      }
      
      onClose();
      
      setFormData({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        industry: '',
        customerType: 'business',
        totalValue: 0,
        notes: ''
      });
    } catch (err) {
      console.error('Customer creation error:', err);
      
      // Check for specific error messages from backend
      if (err.message.includes('already exists')) {
        setError('This email or phone number is already registered. Please use different contact details.');
      } else if (err.message.includes('valid 10-digit phone')) {
        setError('Please enter a valid 10-digit phone number starting with 6-9');
      } else if (err.message.includes('Session expired') || err.message.includes('401')) {
        setError('Your session has expired. Please log in again.');
      } else if (err.message.includes('500')) {
        setError('Server error: Please check if the backend server is running on port 5004');
      } else if (err.message.includes('Network') || err.message.includes('fetch')) {
        setError('Cannot connect to server. Please check if the backend is running on port 5004.');
      } else if (err.message.includes('400')) {
        setError('Validation error: ' + err.message.replace('API request failed: 400 Bad Request', '').trim());
      } else {
        setError(err.message || 'Failed to create customer. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalStyle = {
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
    padding: '1rem'
  };

  const formStyle = {
    background: darkMode ? '#1f2937' : 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
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

  return (
    <div style={modalStyle}>
      <div style={formStyle}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <User size={24} style={{ color: '#22c55e' }} />
            {editCustomer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: darkMode ? '#9ca3af' : '#6b7280',
              padding: '0.5rem'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              padding: '1rem',
              background: darkMode ? '#7f1d1d' : '#fee2e2',
              color: darkMode ? '#fca5a5' : '#dc2626',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '1px solid #ef4444'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Basic Information */}
            <div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <User size={20} />
                Basic Information
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                    placeholder="Enter customer name"
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
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                    placeholder="Enter company name"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Phone size={20} />
                Contact Information
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                    placeholder="customer@company.com"
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
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <MapPin size={20} />
                Address Information
              </h3>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    style={inputStyle}
                    placeholder="Enter street address"
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
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      style={inputStyle}
                      placeholder="City"
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
                      State
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      style={inputStyle}
                      placeholder="State"
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
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                      style={inputStyle}
                      placeholder="ZIP"
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
                      Country
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      style={inputStyle}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Building size={20} />
                Business Information
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    style={inputStyle}
                    placeholder="e.g., Technology"
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
                    Customer Type
                  </label>
                  <select
                    name="customerType"
                    value={formData.customerType}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value="business">Business</option>
                    <option value="individual">Individual</option>
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
                    Total Value (₹)
                  </label>
                  <input
                    type="number"
                    name="totalValue"
                    value={formData.totalValue}
                    onChange={handleInputChange}
                    style={inputStyle}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: darkMode ? '#d1d5db' : '#374151',
                marginBottom: '0.5rem'
              }}>
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                style={{
                  ...inputStyle,
                  resize: 'vertical'
                }}
                placeholder="Additional notes..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                background: 'transparent',
                color: darkMode ? '#d1d5db' : '#374151',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                background: loading ? '#9ca3af' : '#22c55e',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (editCustomer ? 'Updating...' : 'Creating...') : (editCustomer ? 'Update Customer' : 'Create Customer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;