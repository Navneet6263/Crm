import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Calendar, Clock, User, Mail, Phone, Building, CheckCircle } from 'lucide-react';
import apiService from '../services/apiService';

const BookDemoModal = ({ darkMode, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    employees: '1-10',
    date: '',
    time: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [modalRoot, setModalRoot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  
  useEffect(() => {
    // Find or create modal root element
    let element = document.getElementById('modal-root');
    if (!element) {
      element = document.createElement('div');
      element.id = 'modal-root';
      document.body.appendChild(element);
    }
    setModalRoot(element);
    
    // Load booked slots
    const demoRequests = JSON.parse(localStorage.getItem('demoRequests') || '[]');
    const booked = demoRequests
      .filter(req => req.status === 'approved')
      .map(req => `${req.date}_${req.time}`);
    setBookedSlots(booked);
    
    // Auto-delete expired demos
    const now = new Date();
    const activeRequests = demoRequests.filter(req => {
      if (req.status !== 'approved') return true;
      const demoTime = new Date(`${req.date} ${req.time}`);
      const expireTime = new Date(demoTime.getTime() + 30 * 60000); // +30 minutes
      return now < expireTime;
    });
    
    if (activeRequests.length !== demoRequests.length) {
      localStorage.setItem('demoRequests', JSON.stringify(activeRequests));
    }
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const getAvailableTimeSlots = () => {
    const selectedDate = formData.date;
    if (!selectedDate) return [];
    
    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();
    
    const allSlots = [
      '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM',
      '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
      '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM'
    ];
    
    let availableSlots = allSlots.filter(slot => {
      const slotKey = `${selectedDate}_${slot}`;
      return !bookedSlots.includes(slotKey);
    });
    
    // If today, filter past times
    if (selectedDate === today) {
      availableSlots = availableSlots.filter(slot => {
        const slotHour = slot.includes('PM') && !slot.startsWith('12') 
          ? parseInt(slot.split(':')[0]) + 12 
          : parseInt(slot.split(':')[0]);
        return slotHour > currentHour;
      });
    }
    
    return availableSlots;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await apiService.createDemoRequest(formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting demo request via API:', error);
      // Fallback to localStorage for demo purposes
      const demoRequests = JSON.parse(localStorage.getItem('demoRequests') || '[]');
      const newRequest = {
        id: Date.now(),
        ...formData,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      demoRequests.push(newRequest);
      localStorage.setItem('demoRequests', JSON.stringify(demoRequests));
      
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };
  
  const modalContent = (
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
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: darkMode ? '#1f2937' : 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        top: 'auto',
        left: 'auto',
        transform: 'none'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem',
          borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#111827',
            margin: 0
          }}>
            Book a Personalized Demo
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: darkMode ? '#9ca3af' : '#6b7280',
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {isSubmitted ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
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
                <CheckCircle size={30} color={darkMode ? '#34d399' : '#059669'} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#111827',
                margin: '0 0 1rem 0'
              }}>
                Demo Request Submitted!
              </h3>
              <p style={{
                color: darkMode ? '#9ca3af' : '#6b7280',
                margin: '0 0 1.5rem 0'
              }}>
                Thank you for your interest in Green Call CRM. Your demo request has been sent to our Super Admin for approval. We will contact you once your request is approved.
              </p>
              <button
                onClick={onClose}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{
                color: darkMode ? '#9ca3af' : '#6b7280',
                margin: '0 0 1.5rem 0'
              }}>
                Schedule a personalized demo with our product experts to see how Green Call CRM can help grow your business.
              </p>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                      borderRadius: '6px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#111827',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                      borderRadius: '6px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#111827',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Phone Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter your phone number"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                      borderRadius: '6px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#111827',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Company Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }} />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    placeholder="Enter your company name"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                      borderRadius: '6px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#111827',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Company Size
                </label>
                <select
                  name="employees"
                  value={formData.employees}
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
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501+">501+ employees</option>
                </select>
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
                    Preferred Date *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }} />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                        borderRadius: '6px',
                        background: darkMode ? '#374151' : 'white',
                        color: darkMode ? 'white' : '#111827',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Preferred Time *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={16} style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }} />
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                        borderRadius: '6px',
                        background: darkMode ? '#374151' : 'white',
                        color: darkMode ? 'white' : '#111827',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="">Select time</option>
                      {getAvailableTimeSlots().map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                      {getAvailableTimeSlots().length === 0 && formData.date && (
                        <option disabled>No slots available for this date</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem'
              }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                    borderRadius: '6px',
                    color: darkMode ? '#d1d5db' : '#374151',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#0ea5e9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Submitting...
                    </>
                  ) : (
                    'Schedule Demo'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Ensure modal is centered */
        :global(#modal-root) {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
  
  return modalRoot ? ReactDOM.createPortal(modalContent, modalRoot) : null;
};

export default BookDemoModal;