import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  User, 
  Building, 
  Clock,
  Activity,
  MessageSquare,
  Plus,
  X
} from 'lucide-react';
import apiService from '../services/apiService';

const LeadDetailPage = ({ leadId, darkMode = false, onBack }) => {
  const navigate = onBack || (() => window.history.back());
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [activityType, setActivityType] = useState('call');
  const [activityDescription, setActivityDescription] = useState('');

  useEffect(() => {
    fetchLeadDetails();
  }, [leadId]);

  const fetchLeadDetails = async () => {
    if (!leadId) {
      setLoading(false);
      return;
    }
    try {
      const response = await apiService.getLeadById(leadId);
      setLead(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lead:', error);
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (lead?.phone) {
      const confirmed = window.confirm(`Do you want to call ${lead.contactPerson} at ${lead.phone}?`);
      if (confirmed) {
        const cleanNumber = lead.phone.replace(/[^0-9]/g, '');
        window.location.href = `tel:+91${cleanNumber}`;
        logActivity('call', `Called ${lead.contactPerson} at ${lead.phone}`);
      }
    }
  };

  const handleEmail = () => {
    if (lead?.email) {
      const confirmed = window.confirm(`Do you want to send email to ${lead.contactPerson} at ${lead.email}?`);
      if (confirmed) {
        window.location.href = `mailto:${lead.email}`;
        logActivity('email', `Sent email to ${lead.contactPerson} at ${lead.email}`);
      }
    }
  };

  const logActivity = async (type, description) => {
    try {
      await apiService.addLeadActivity(leadId, { type, description });
      fetchLeadDetails();
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await apiService.addLeadNote(leadId, newNote);
      setNewNote('');
      fetchLeadDetails();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleAddActivity = async () => {
    if (!activityDescription.trim()) return;
    
    try {
      await apiService.addLeadActivity(leadId, { type: activityType, description: activityDescription });
      setActivityDescription('');
      setShowAddActivity(false);
      fetchLeadDetails();
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: darkMode ? '#1f2937' : '#f9fafb' }}>
        <div style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Loading lead details...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: darkMode ? '#1f2937' : '#f9fafb', minHeight: '100vh' }}>
        <h2 style={{ color: darkMode ? '#d1d5db' : '#374151' }}>Lead not found</h2>
        <button onClick={navigate} style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: darkMode ? '#1f2937' : '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={navigate}
          style={{
            padding: '0.5rem',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>{lead.contactPerson}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column */}
        <div>
          {/* Lead Info Card */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Lead Information</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>
                  <Building size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Company
                </label>
                <p style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>{lead.companyName}</p>
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>
                  <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Contact Person
                </label>
                <p style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>{lead.contactPerson}</p>
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>
                  <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Phone
                </label>
                <p style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>{lead.phone}</p>
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>
                  <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Email
                </label>
                <p style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>{lead.email}</p>
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>Status</label>
                <span style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600', background: '#dbeafe', color: '#1d4ed8' }}>
                  {lead.status}
                </span>
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>Priority</label>
                <span style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600', background: '#fef3c7', color: '#d97706' }}>
                  {lead.priority}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={handleCall} style={{ flex: 1, padding: '1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Phone size={20} />
                Call Now
              </button>

              <button onClick={handleEmail} style={{ flex: 1, padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Mail size={20} />
                Send Email
              </button>
            </div>
          </div>

          {/* Activity History */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={24} />
                Activity History
              </h2>
              <button
                onClick={() => setShowAddActivity(true)}
                style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}
              >
                <Plus size={16} />
                Add Activity
              </button>
            </div>

            {/* Add Activity Form */}
            {showAddActivity && (
              <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '2px solid #3b82f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Add New Activity</h3>
                  <button onClick={() => setShowAddActivity(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>
                
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '1rem' }}
                >
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="note">Note</option>
                  <option value="status_change">Status Change</option>
                </select>

                <textarea
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  placeholder="Activity description..."
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', minHeight: '80px', resize: 'vertical', marginBottom: '0.75rem' }}
                />

                <button
                  onClick={handleAddActivity}
                  style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%' }}
                >
                  Save Activity
                </button>
              </div>
            )}

            {/* Timeline */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '0', bottom: '0', width: '2px', background: '#e5e7eb' }}></div>

              {lead.notes && lead.notes.filter(note => note.content.startsWith('[ACTIVITY:')).length > 0 ? (
                lead.notes.filter(note => note.content.startsWith('[ACTIVITY:')).map((activity, index) => {
                  // Parse activity: [ACTIVITY:CALL] Description
                  const match = activity.content.match(/\[ACTIVITY:(\w+)\]\s*(.+)/);
                  const activityType = match ? match[1] : 'NOTE';
                  const description = match ? match[2] : activity.content;
                  
                  return (
                    <div key={index} style={{ position: 'relative', paddingLeft: '3rem', paddingBottom: '1.5rem' }}>
                      <div style={{ position: 'absolute', left: '0.5rem', top: '0.25rem', width: '1rem', height: '1rem', borderRadius: '50%', background: '#3b82f6', border: '3px solid white' }}></div>
                      <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', background: activityType === 'CALL' ? '#dcfce7' : activityType === 'EMAIL' ? '#dbeafe' : '#fef3c7', color: activityType === 'CALL' ? '#16a34a' : activityType === 'EMAIL' ? '#2563eb' : '#d97706' }}>
                            {activityType}
                          </span>
                        </div>
                        <p style={{ fontWeight: '600', margin: '0 0 0.5rem 0', color: '#1f2937' }}>{description}</p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={14} />
                          {formatDate(activity.createdAt)}
                          {activity.createdBy && ` • ${activity.createdBy.name || activity.createdBy.email}`}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No activity yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Notes */}
        <div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={24} />
              Notes
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', minHeight: '100px', resize: 'vertical' }}
              />
              <button
                onClick={handleAddNote}
                style={{ marginTop: '0.5rem', padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                Add Note
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {lead.notes && lead.notes.filter(note => !note.content.startsWith('[ACTIVITY:')).length > 0 ? (
                lead.notes.filter(note => !note.content.startsWith('[ACTIVITY:')).map((note, index) => (
                  <div key={index} style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#1f2937', whiteSpace: 'pre-wrap' }}>{note.content}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                      {note.createdBy?.name || note.createdBy?.email || 'User'} • {formatDate(note.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No notes yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailPage;
