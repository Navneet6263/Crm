import React, { useState } from 'react';
import { Building, Users, Mail, Phone, ArrowRight } from 'lucide-react';
import apiService from '../services/apiService';

const CompanySetup = ({ user, onComplete, darkMode }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    phone: '',
    address: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const [talentId, setTalentId] = useState('');

  // Generate unique talent ID on component mount
  React.useEffect(() => {
    const generateTalentId = () => {
      const timestamp = Date.now().toString().slice(-6);
      const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase();
      const companyPrefix = formData.companyName ? formData.companyName.substr(0, 2).toUpperCase() : 'GC';
      return `${companyPrefix}${timestamp}${randomStr}`;
    };
    setTalentId(generateTalentId());
  }, [formData.companyName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create company via API with talent ID
      const companyData = {
        ...formData,
        userId: user.id,
        talentId: talentId
      };
      
      const response = await apiService.post('/companies/setup', companyData);

      console.log('Company setup successful:', response);
      onComplete({ ...response, talentId });
    } catch (error) {
      console.error('Company setup failed:', error);
      alert('Company setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: darkMode ? 'linear-gradient(135deg, #1e293b, #334155)' : 'linear-gradient(135deg, #667eea, #764ba2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: darkMode ? '#1e293b' : 'white',
        borderRadius: '20px',
        padding: '3rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '600px',
        border: `1px solid ${darkMode ? '#334155' : 'rgba(255, 255, 255, 0.2)'}`
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #22c55e, #4ade80)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 10px 20px rgba(34, 197, 94, 0.3)'
          }}>
            <Building size={40} color="white" />
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: darkMode ? '#f8fafc' : '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Setup Your Company
          </h1>
          <p style={{
            color: darkMode ? '#cbd5e1' : '#6b7280',
            fontSize: '1rem'
          }}>
            Welcome {user.name}! Let's setup your company profile to get started.
          </p>
          {talentId && (
            <div style={{
              background: 'linear-gradient(135deg, #22c55e, #4ade80)',
              color: 'white',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginTop: '1rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              🎯 Your Talent ID: {talentId}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: darkMode ? '#d1d5db' : '#374151',
                marginBottom: '0.5rem'
              }}>
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="Enter your company name"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#1f2937',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Industry
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                    borderRadius: '8px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#1f2937',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select Industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Company Size
                </label>
                <select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                    borderRadius: '8px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#1f2937',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: darkMode ? '#d1d5db' : '#374151',
                marginBottom: '0.5rem'
              }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter company phone number"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
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
                fontWeight: '600',
                color: darkMode ? '#d1d5db' : '#374151',
                marginBottom: '0.5rem'
              }}>
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourcompany.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#1f2937',
                  fontSize: '1rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.companyName}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading || !formData.companyName 
                  ? (darkMode ? '#374151' : '#e5e7eb')
                  : 'linear-gradient(135deg, #22c55e, #4ade80)',
                color: loading || !formData.companyName 
                  ? (darkMode ? '#6b7280' : '#9ca3af')
                  : 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading || !formData.companyName ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1rem',
                boxShadow: loading || !formData.companyName 
                  ? 'none' 
                  : '0 10px 20px rgba(34, 197, 94, 0.3)'
              }}
            >
              {loading ? 'Setting up...' : `Complete Setup with ID: ${talentId}`}
              {!loading && <ArrowRight size={20} />}
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: darkMode ? '#374151' : '#f9fafb',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: darkMode ? '#cbd5e1' : '#6b7280',
            margin: 0,
            marginBottom: '0.5rem'
          }}>
            You can update these details later in your company settings.
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: darkMode ? '#9ca3af' : '#6b7280',
            margin: 0
          }}>
            💡 Your Talent ID will be used for identification and cannot be changed later.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanySetup;