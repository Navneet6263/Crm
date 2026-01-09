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
  X,
  Calendar,
  Check,
  FileText,
  Download,
  CheckCircle
} from 'lucide-react';
import apiService from '../services/apiService';
import { showToast } from './ToastNotification';
import config from '../config';

const LeadDetailPage = ({ leadId, darkMode = false, onBack }) => {
  const navigate = onBack || (() => window.history.back());
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [activityType, setActivityType] = useState('call');
  const [activityDescription, setActivityDescription] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    type: 'call',
    priority: 'medium',
    dueDate: '',
    dueTime: '',
    assignedTo: '',
    emailNotification: false,
    browserNotification: true,
    reminderTime: '15',
    isRecurring: false,
    recurringPattern: 'daily',
    recurringEndDate: ''
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchLeadDetails();
    loadUsers();
  }, [leadId]);

  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers();
      setUsers(response || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleAddTask = async () => {
    if (!taskData.title.trim()) {
      showToast('error', '❌ Task title is required');
      return;
    }
    
    if (!taskData.dueDate) {
      showToast('error', '❌ Due date is required');
      return;
    }

    if (!taskData.dueTime) {
      showToast('error', '❌ Time is required');
      return;
    }
    
    try {
      const newTask = {
        ...taskData,
        relatedTo: 'lead',
        relatedId: leadId,
        status: 'pending',
        emailNotification: false,
        browserNotification: true,
        notificationsSent: {
          fifteenMin: false,
          tenMin: false,
          fiveMin: false
        }
      };
      
      await apiService.createTask(newTask);
      
      // Add activity entry
      const activityDescription = `Task scheduled: "${taskData.title}" on ${new Date(taskData.dueDate).toLocaleDateString()} at ${taskData.dueTime}`;
      await apiService.addLeadActivity(leadId, { 
        type: 'task', 
        description: activityDescription 
      });
      
      // Reset form
      setTaskData({
        title: '',
        description: '',
        type: 'call',
        priority: 'medium',
        dueDate: '',
        dueTime: '',
        assignedTo: '',
        emailNotification: false,
        browserNotification: true,
        reminderTime: '15',
        isRecurring: false,
        recurringPattern: 'daily',
        recurringEndDate: ''
      });
      setShowAddTask(false);
      fetchLeadDetails(); // Refresh to show new activity
      showToast('success', '✅ Task scheduled successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      showToast('error', '❌ Failed to schedule task');
    }
  };

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

              <button onClick={() => setShowAddTask(true)} style={{ flex: 1, padding: '1rem', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Calendar size={20} />
                Schedule Task
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

          {/* Workflow Progress */}
          {lead.workflowStage && lead.workflowStage !== 'sales' && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={24} />
                Workflow Progress
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontWeight: '600' }}>✓</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>Sales</div>
                </div>
                <div style={{ flex: 1, height: '2px', background: lead.workflowStage === 'legal' || lead.workflowStage === 'finance' || lead.workflowStage === 'completed' ? '#22c55e' : '#e5e7eb' }}></div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: lead.workflowStage === 'legal' || lead.workflowStage === 'finance' || lead.workflowStage === 'completed' ? '#22c55e' : '#e5e7eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontWeight: '600' }}>{lead.workflowStage === 'legal' || lead.workflowStage === 'finance' || lead.workflowStage === 'completed' ? '✓' : '2'}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>Legal</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{lead.legalDocuments?.length || 0} docs</div>
                </div>
                <div style={{ flex: 1, height: '2px', background: lead.workflowStage === 'finance' || lead.workflowStage === 'completed' ? '#22c55e' : '#e5e7eb' }}></div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: lead.workflowStage === 'finance' || lead.workflowStage === 'completed' ? '#22c55e' : '#e5e7eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontWeight: '600' }}>{lead.workflowStage === 'finance' || lead.workflowStage === 'completed' ? '✓' : '3'}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>Finance</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{lead.financeDocuments?.length || 0} docs</div>
                </div>
                <div style={{ flex: 1, height: '2px', background: lead.workflowStage === 'completed' ? '#22c55e' : '#e5e7eb' }}></div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: lead.workflowStage === 'completed' ? '#22c55e' : '#e5e7eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontWeight: '600' }}>{lead.workflowStage === 'completed' ? '✓' : '4'}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>Completed</div>
                </div>
              </div>

              {lead.legalDocuments && lead.legalDocuments.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>📄 Legal Documents ({lead.legalDocuments.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {lead.legalDocuments.map((doc, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{doc.fileName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{new Date(doc.uploadedAt).toLocaleString()}</div>
                        </div>
                        <a href={`${config.api.baseUrl}${doc.fileUrl}`} download style={{ padding: '0.5rem', background: '#3b82f6', color: 'white', borderRadius: '6px', textDecoration: 'none' }}>
                          <Download size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lead.financeDocuments && lead.financeDocuments.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>💰 Finance Documents ({lead.financeDocuments.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {lead.financeDocuments.map((doc, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{doc.fileName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{new Date(doc.uploadedAt).toLocaleString()}</div>
                        </div>
                        <a href={`${config.api.baseUrl}${doc.fileUrl}`} download style={{ padding: '0.5rem', background: '#3b82f6', color: 'white', borderRadius: '6px', textDecoration: 'none' }}>
                          <Download size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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

      {/* Add Task Modal */}
      {showAddTask && (
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
            background: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              padding: '1rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Schedule Task for {lead?.contactPerson}
              </h3>
              <button
                onClick={() => setShowAddTask(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={taskData.title}
                  onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                  placeholder="Enter task title"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Description
                </label>
                <textarea
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  placeholder="Enter task description"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    fontSize: '0.875rem',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Type
                  </label>
                  <select
                    value={taskData.type}
                    onChange={(e) => setTaskData({ ...taskData, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="demo">Demo</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Priority
                  </label>
                  <select
                    value={taskData.priority}
                    onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Due Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={taskData.dueDate}
                    onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Time <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="time"
                    value={taskData.dueTime}
                    onChange={(e) => setTaskData({ ...taskData, dueTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
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
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Assignee
                </label>
                <select
                  value={taskData.assignedTo}
                  onChange={(e) => setTaskData({ ...taskData, assignedTo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="">Select Assignee</option>
                  {Array.isArray(users) && users.map(user => (
                    <option key={user._id} value={user.name}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Related Lead
                </label>
                <input
                  type="text"
                  value={`${lead?.contactPerson} - ${lead?.companyName}`}
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    fontSize: '0.875rem',
                    background: '#f9fafb',
                    color: '#6b7280'
                  }}
                />
              </div>

              <div style={{
                marginBottom: '1rem',
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.1)'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.75rem'
                }}>
                  <input
                    type="checkbox"
                    checked={taskData.emailNotification}
                    onChange={(e) => setTaskData({ ...taskData, emailNotification: e.target.checked })}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#3b82f6'
                    }}
                  />
                  <span>📧 Send Email Notifications</span>
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  <input
                    type="checkbox"
                    checked={taskData.browserNotification}
                    onChange={(e) => setTaskData({ ...taskData, browserNotification: e.target.checked })}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#10b981'
                    }}
                  />
                  <span>🔔 Browser Notifications</span>
                </label>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  margin: '0.5rem 0 0 2rem'
                }}>
                  Get reminders 15, 10, and 5 minutes before task due time
                </p>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '1rem'
              }}>
                <button
                  onClick={() => setShowAddTask(false)}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  style={{
                    padding: '0.75rem 1rem',
                    background: '#8b5cf6',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Check size={16} />
                  Schedule Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetailPage;
