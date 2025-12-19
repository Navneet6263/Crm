import React, { useState, useEffect } from 'react';
import { UserPlus, Building, Mail, Phone, DollarSign, Save, Send, X } from 'lucide-react';
import { showToast } from './ToastNotification';
import { trackLeadCreated } from '../utils/ga';

const SimpleAddEnquiry = ({ darkMode, onSave, onCancel, user }) => {
  const [formData, setFormData] = useState({
    contactPerson: '',
    email: '',
    phone: '',
    companyName: '',
    industry: '',
    leadSource: 'website',
    customLeadSource: '',
    followUpDate: '',
    estimatedValue: '',
    priority: 'medium',
    requirements: '',
    assignedTo: '',
    status: 'new',
    companyId: 'default-greencall',
    product: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies] = useState([{ _id: 'default-greencall', name: 'GreenCall CRM' }]);
  const [products, setProducts] = useState([]);
  const [userProductHistory, setUserProductHistory] = useState([]);

  // Initialize with default company and fetch products
  useEffect(() => {
    if (user?.role === 'super-admin') {
      setFormData(prev => ({ ...prev, companyId: 'default-greencall' }));
    }
    fetchProducts();
  }, [user]);

  // Lazy load product history after products are loaded
  useEffect(() => {
    if (products.length > 0) {
      fetchUserProductHistory();
    }
  }, [products]);

  const fetchProducts = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
      const response = await fetch(`${apiUrl}/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchUserProductHistory = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
      const response = await fetch(`${apiUrl}/leads/user/product-history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserProductHistory(data || []);
      }
    } catch (error) {
      console.error('Error fetching user product history:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person name is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.product) newErrors.product = 'Product selection is required';
    
    if (user?.role === 'super-admin' && !formData.companyId) {
      newErrors.companyId = 'Please select a company';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    const phoneDigits = formData.phone.replace(/[^\d+]/g, '');
    if (formData.phone && (phoneDigits.length < 7 || phoneDigits.length > 15)) {
      newErrors.phone = 'Please enter a valid phone number (7-15 digits)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSaveAsDraft = () => {
    const leadData = {
      contactPerson: formData.contactPerson,
      companyName: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      industry: formData.industry,
      leadSource: formData.leadSource,
      estimatedValue: formData.estimatedValue ? parseInt(formData.estimatedValue) : 0,
      priority: formData.priority,
      requirements: formData.requirements,
      assignedTo: formData.assignedTo,
      status: 'new',
      isDraft: true
    };
    
    const drafts = JSON.parse(localStorage.getItem('leadDrafts') || '[]');
    drafts.push({ ...leadData, id: Date.now() });
    localStorage.setItem('leadDrafts', JSON.stringify(drafts));
    
    showToast('success', '📝 Lead saved as draft successfully!');
    onCancel();
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    
    if (!validateForm()) {
      showToast('error', '❌ Please fill all required fields correctly');
      return;
    }

    setIsSubmitting(true);
    
    const leadData = {
      contactPerson: formData.contactPerson,
      companyName: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      industry: formData.industry,
      leadSource: formData.leadSource,
      customLeadSource: formData.leadSource === 'other' ? formData.customLeadSource : '',
      followUpDate: formData.followUpDate || null,
      estimatedValue: formData.estimatedValue ? parseInt(formData.estimatedValue) : 0,
      priority: formData.priority,
      requirements: formData.requirements,
      assignedTo: formData.assignedTo,
      status: 'new',
      product: formData.product
    };
    
    if (user?.role === 'super-admin') {
      leadData.companyId = formData.companyId || null;
    }
    
    // Optimistic UI - Close modal immediately
    onCancel();
    
    // Background API call
    onSave(leadData)
      .then(() => {
        // Track lead creation in GA4
        trackLeadCreated({
          source: leadData.leadSource,
          status: leadData.status,
          value: leadData.estimatedValue,
          priority: leadData.priority,
          industry: leadData.industry
        });
      })
      .catch((error) => {
        console.error('Error saving lead:', error);
        showToast('error', '❌ Failed to create lead. Please try again.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
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

  const errorInputStyle = {
    ...inputStyle,
    borderColor: '#ef4444'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: darkMode ? '#d1d5db' : '#374151',
    marginBottom: '0.5rem'
  };

  return (
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
      padding: '1rem'
    }}>
      <div style={{
        background: darkMode ? '#1f2937' : 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '2rem',
          borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #22c55e, #4ade80)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserPlus size={24} color="white" />
            </div>
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Add New Lead
              </h2>
              <p style={{
                color: darkMode ? '#9ca3af' : '#6b7280',
                fontSize: '0.875rem',
                margin: 0
              }}>
                Create a new lead opportunity
              </p>
            </div>
          </div>
          
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Company Selection for SuperAdmin */}
            {user?.role === 'super-admin' && (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>
                  Choose Company <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.companyId}
                  onChange={(e) => handleInputChange('companyId', e.target.value)}
                  style={errors.companyId ? errorInputStyle : inputStyle}
                  required
                >
                  <option value="">Select Company (Required)</option>
                  {companies.map(company => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                {errors.companyId && (
                  <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.companyId}
                  </p>
                )}
              </div>
            )}
            
            {/* Product Selection */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>
                Select Product/Service <span style={{ color: '#ef4444' }}>*</span>
              </label>
              {userProductHistory.length > 0 && (
                <div style={{
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: darkMode ? '#374151' : '#f0f9ff',
                  borderRadius: '6px',
                  border: `1px solid ${darkMode ? '#4b5563' : '#bfdbfe'}`
                }}>
                  <p style={{
                    fontSize: '0.75rem',
                    color: darkMode ? '#60a5fa' : '#3b82f6',
                    margin: '0 0 0.25rem 0',
                    fontWeight: '600'
                  }}>
                    💡 Your recent products:
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {userProductHistory.slice(0, 3).map(history => (
                      <button
                        key={history._id}
                        type="button"
                        onClick={() => handleInputChange('product', history._id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          border: 'none',
                          borderRadius: '12px',
                          backgroundColor: history.productColor || '#22c55e',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        {history.productIcon} {history.productName} ({history.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <select
                value={formData.product}
                onChange={(e) => handleInputChange('product', e.target.value)}
                style={errors.product ? errorInputStyle : inputStyle}
                required
              >
                <option value="">Choose a product/service</option>
                {products.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.icon} {product.name}
                  </option>
                ))}
              </select>
              {errors.product && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.product}
                </p>
              )}
              {user?.role === 'super-admin' && (
                <p style={{
                  fontSize: '0.75rem',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  marginTop: '0.25rem'
                }}>
                  💼 As super admin, you can add new products in Product Management
                </p>
              )}
            </div>
            {/* Contact Person */}
            <div>
              <label style={labelStyle}>
                Contact Person Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                placeholder="Enter full name"
                style={errors.contactPerson ? errorInputStyle : inputStyle}
              />
              {errors.contactPerson && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.contactPerson}
                </p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label style={labelStyle}>
                Company Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter company name"
                style={errors.companyName ? errorInputStyle : inputStyle}
              />
              {errors.companyName && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.companyName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@company.com"
                style={errors.email ? errorInputStyle : inputStyle}
              />
              {errors.email && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label style={labelStyle}>
                Phone Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91 9876543210"
                style={errors.phone ? errorInputStyle : inputStyle}
              />
              {errors.phone && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Industry */}
            <div>
              <label style={labelStyle}>Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Industry</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="education">Education</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="retail">Retail</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Lead Source */}
            <div>
              <label style={labelStyle}>Lead Source</label>
              <select
                value={formData.leadSource}
                onChange={(e) => handleInputChange('leadSource', e.target.value)}
                style={inputStyle}
              >
                <option value="website">Website</option>
                <option value="google">Google</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter</option>
                <option value="youtube">YouTube</option>
                <option value="referral">Referral</option>
                <option value="cold-call">Cold Call</option>
                <option value="email-campaign">Email Campaign</option>
                <option value="trade-show">Trade Show</option>
                <option value="advertisement">Advertisement</option>
                <option value="direct-mail">Direct Mail</option>
                <option value="partner">Partner</option>
                <option value="webinar">Webinar</option>
                <option value="content-marketing">Content Marketing</option>
                <option value="seo">SEO</option>
                <option value="ppc">PPC</option>
                <option value="social-media">Social Media</option>
                <option value="word-of-mouth">Word of Mouth</option>
                <option value="existing-customer">Existing Customer</option>
                <option value="walk-in">Walk-in</option>
                <option value="other">Other</option>
              </select>
              {formData.leadSource === 'other' && (
                <input
                  type="text"
                  placeholder="Specify other source"
                  value={formData.customLeadSource || ''}
                  onChange={(e) => handleInputChange('customLeadSource', e.target.value)}
                  style={{ ...inputStyle, marginTop: '0.5rem' }}
                />
              )}
            </div>

            {/* Follow-up Date */}
            <div>
              <label style={labelStyle}>Follow-up Date</label>
              <input
                type="date"
                value={formData.followUpDate || ''}
                onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                style={inputStyle}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Estimated Value */}
            <div>
              <label style={labelStyle}>Estimated Deal Value (₹)</label>
              <input
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                placeholder="Enter amount"
                style={inputStyle}
              />
            </div>

            {/* Priority */}
            <div>
              <label style={labelStyle}>Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                style={inputStyle}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Requirements */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Requirements / Services Needed</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="Describe the client's requirements..."
                rows="4"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '2rem',
          borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={onCancel}
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
              onClick={handleSaveAsDraft}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6b7280, #9ca3af)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Save size={16} />
              Save as Draft
            </button>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '8px',
              background: isSubmitting 
                ? (darkMode ? '#4b5563' : '#d1d5db')
                : 'linear-gradient(135deg, #22c55e, #4ade80)',
              color: 'white',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            <Send size={16} style={{ 
              animation: isSubmitting ? 'spin 1s linear infinite' : 'none' 
            }} />
            {isSubmitting ? 'Creating...' : 'Create Lead'}
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SimpleAddEnquiry;
