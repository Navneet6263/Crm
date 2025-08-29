import React, { useState } from 'react';
import { AlertCircle, Send } from 'lucide-react';
import supportService from '../services/supportService';

const SimpleCustomerSupport = ({ darkMode, currentUser, onSubmit }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    type: 'technical'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const ticketData = {
        ...formData,
        createdBy: currentUser?.name || 'Customer',
        customerEmail: currentUser?.email || 'customer@example.com'
      };
      
      const newTicket = await supportService.createTicket(ticketData);
      
      if (onSubmit) {
        onSubmit(newTicket);
      }
      
      // Show success message
      setSuccess(true);
      
      // Reset form
      setFormData({
        subject: '',
        description: '',
        priority: 'medium',
        type: 'technical'
      });
    } catch (err) {
      setError('Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      padding: '1.5rem',
      background: darkMode ? '#111827' : '#f9fafb',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          color: darkMode ? 'white' : '#111827',
          marginBottom: '1rem'
        }}>
          Support Center
        </h1>
        
        <p style={{
          fontSize: '1.125rem',
          color: darkMode ? '#9ca3af' : '#6b7280',
          marginBottom: '2rem'
        }}>
          Need help? Submit a support request and our team will get back to you as soon as possible.
        </p>
        
        <div style={{
          background: darkMode ? '#1f2937' : 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
        }}>
          {success ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: darkMode ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={darkMode ? '#34d399' : '#059669'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#111827',
                marginBottom: '1rem'
              }}>
                Support Request Submitted
              </h2>
              <p style={{
                color: darkMode ? '#9ca3af' : '#6b7280',
                marginBottom: '1.5rem'
              }}>
                Thank you for contacting us. Our support team will review your request and get back to you as soon as possible.
              </p>
              <button
                onClick={() => setSuccess(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  padding: '0.75rem',
                  background: darkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                  color: darkMode ? '#f87171' : '#dc2626',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief description of your issue"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                    borderRadius: '6px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#111827',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Please provide details about your issue"
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                    borderRadius: '6px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#111827',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                      borderRadius: '6px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#111827',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
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
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                      borderRadius: '6px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#111827',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="account">Account Help</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#16a34a',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'Submitting...' : (
                    <>
                      <Send size={16} />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleCustomerSupport;