import React, { useState, useEffect } from 'react';
import { FileText, Upload, Send, CheckCircle, X, User, Calendar, Building, DollarSign, FileCheck, Download, Trash2 } from 'lucide-react';
import apiService from '../services/apiService';
import config from '../config';

const WorkflowDashboard = ({ darkMode, currentUser }) => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [transferData, setTransferData] = useState({ assignedTo: '', notes: '' });
  const [invoiceData, setInvoiceData] = useState({ invoiceNumber: '', invoiceAmount: '', taxInvoiceNumber: '' });

  const isLegal = currentUser?.role === 'legal-team';
  const isFinance = currentUser?.role === 'finance-team';

  useEffect(() => {
    fetchAssignedLeads();
  }, []);

  const fetchAssignedLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.api.baseUrl}/workflow/my-assigned`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching assigned leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (role) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.api.baseUrl}/workflow/users/${role}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setTeamMembers(data.users || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUploadDocuments = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('documents', file);
      });

      if (isFinance) {
        formData.append('invoiceNumber', invoiceData.invoiceNumber);
        formData.append('invoiceAmount', invoiceData.invoiceAmount);
        formData.append('taxInvoiceNumber', invoiceData.taxInvoiceNumber);
      }

      const token = localStorage.getItem('authToken');
      const endpoint = isLegal ? 'legal/upload' : 'finance/upload';
      
      const response = await fetch(`${config.api.baseUrl}/workflow/${selectedLead._id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        alert('Documents uploaded successfully!');
        setSelectedFiles([]);
        setInvoiceData({ invoiceNumber: '', invoiceAmount: '', taxInvoiceNumber: '' });
        
        // Update selectedLead with new documents
        setSelectedLead(data.lead);
        fetchAssignedLeads();
      } else {
        alert('Failed to upload documents');
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      alert('Error uploading documents');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId, docType) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const endpoint = docType === 'legal' ? 'legal/delete' : 'finance/delete';
      
      const response = await fetch(`${config.api.baseUrl}/workflow/${selectedLead._id}/${endpoint}/${docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert('Document deleted successfully!');
        setSelectedLead(data.lead);
        fetchAssignedLeads();
      } else {
        alert('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document');
    }
  };

  const handleTransfer = async () => {
    if (isLegal && !transferData.assignedTo) {
      alert('Please select a team member');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const endpoint = isLegal ? 'transfer-to-finance' : 'complete';
      
      const response = await fetch(`${config.api.baseUrl}/workflow/${selectedLead._id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transferData)
      });

      if (response.ok) {
        alert(isLegal ? 'Lead transferred to Finance team!' : 'Workflow completed!');
        setShowTransferModal(false);
        setTransferData({ assignedTo: '', notes: '' });
        setSelectedLead(null);
        setTimeout(() => fetchAssignedLeads(), 500);
      } else {
        alert('Failed to transfer lead');
      }
    } catch (error) {
      console.error('Error transferring lead:', error);
      alert('Error transferring lead');
    }
  };

  const openTransferModal = () => {
    fetchTeamMembers(isLegal ? 'finance-team' : 'finance-team');
    setShowTransferModal(true);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        color: darkMode ? '#9ca3af' : '#6b7280'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      padding: '2rem',
      background: darkMode ? '#111827' : '#f9fafb',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: darkMode ? '#f8fafc' : '#111827',
            marginBottom: '0.5rem'
          }}>
            {isLegal ? '⚖️ Legal Team Dashboard' : '💰 Finance Team Dashboard'}
          </h1>
          <p style={{
            color: darkMode ? '#9ca3af' : '#6b7280'
          }}>
            {isLegal ? 'Manage agreements and legal documents' : 'Manage invoices and payments'}
          </p>
        </div>

        {/* Leads Grid */}
        {!selectedLead ? (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: darkMode ? '#f8fafc' : '#111827'
              }}>
                My Assigned Leads ({leads.length})
              </h2>
            </div>

            {leads.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: darkMode ? '#1e293b' : 'white',
                borderRadius: '12px',
                border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`
              }}>
                <FileText size={48} style={{ color: darkMode ? '#4b5563' : '#9ca3af', margin: '0 auto 1rem' }} />
                <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  No leads assigned yet
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem'
              }}>
                {leads.map(lead => (
                  <div
                    key={lead._id}
                    onClick={() => setSelectedLead(lead)}
                    style={{
                      background: darkMode ? '#1e293b' : 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = darkMode ? '0 8px 16px rgba(0,0,0,0.3)' : '0 8px 16px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '1.25rem'
                      }}>
                        {lead.contactPerson?.charAt(0) || 'L'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          color: darkMode ? '#f8fafc' : '#111827',
                          marginBottom: '0.25rem'
                        }}>
                          {lead.contactPerson}
                        </h3>
                        <p style={{
                          fontSize: '0.875rem',
                          color: darkMode ? '#9ca3af' : '#6b7280'
                        }}>
                          {lead.companyName}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        <Building size={14} />
                        {lead.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        <Calendar size={14} />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{
                      marginTop: '1rem',
                      padding: '0.5rem',
                      background: isLegal ? 'rgba(139, 92, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: isLegal ? '#8b5cf6' : '#22c55e'
                    }}>
                      {isLegal ? `${lead.legalDocuments?.length || 0} Documents` : `${lead.financeDocuments?.length || 0} Documents`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Lead Detail Panel */
          <div>
            <button
              onClick={() => setSelectedLead(null)}
              style={{
                marginBottom: '1.5rem',
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '6px',
                color: darkMode ? '#9ca3af' : '#6b7280',
                cursor: 'pointer'
              }}
            >
              ← Back to Leads
            </button>

            <div style={{
              background: darkMode ? '#1e293b' : 'white',
              borderRadius: '12px',
              padding: '2rem',
              border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`
            }}>
              {/* Lead Info */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: darkMode ? '#f8fafc' : '#111827',
                  marginBottom: '0.5rem'
                }}>
                  {selectedLead.contactPerson}
                </h2>
                <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  {selectedLead.companyName} • {selectedLead.email}
                </p>
              </div>

              {/* Upload Section */}
              <div style={{
                background: darkMode ? '#374151' : '#f9fafb',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: darkMode ? '#f8fafc' : '#111827',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Upload size={20} />
                  Upload Documents
                </h3>

                {isFinance && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                    <input
                      type="text"
                      placeholder="Invoice Number"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                      style={{
                        padding: '0.75rem',
                        border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '6px',
                        background: darkMode ? '#1f2937' : 'white',
                        color: darkMode ? 'white' : '#1f2937'
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Invoice Amount"
                      value={invoiceData.invoiceAmount}
                      onChange={(e) => setInvoiceData({ ...invoiceData, invoiceAmount: e.target.value })}
                      style={{
                        padding: '0.75rem',
                        border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '6px',
                        background: darkMode ? '#1f2937' : 'white',
                        color: darkMode ? 'white' : '#1f2937'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Tax Invoice Number"
                      value={invoiceData.taxInvoiceNumber}
                      onChange={(e) => setInvoiceData({ ...invoiceData, taxInvoiceNumber: e.target.value })}
                      style={{
                        padding: '0.75rem',
                        border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '6px',
                        background: darkMode ? '#1f2937' : 'white',
                        color: darkMode ? 'white' : '#1f2937'
                      }}
                    />
                  </div>
                )}

                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    border: `2px dashed ${darkMode ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '6px',
                    width: '100%',
                    background: darkMode ? '#1f2937' : 'white',
                    color: darkMode ? 'white' : '#1f2937'
                  }}
                />

                {selectedFiles.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '0.5rem' }}>
                      Selected files: {selectedFiles.length}
                    </p>
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        • {file.name}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleUploadDocuments}
                  disabled={uploading || selectedFiles.length === 0}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: uploading ? '#9ca3af' : 'linear-gradient(135deg, #22c55e, #4ade80)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload Documents'}
                </button>
              </div>

              {/* Uploaded Documents List */}
              {((isLegal && selectedLead.legalDocuments?.length > 0) || (isFinance && selectedLead.financeDocuments?.length > 0)) && (
                <div style={{
                  background: darkMode ? '#374151' : '#f9fafb',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: darkMode ? '#f8fafc' : '#111827',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FileCheck size={20} />
                    Uploaded Documents ({isLegal ? selectedLead.legalDocuments?.length : selectedLead.financeDocuments?.length})
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(isLegal ? selectedLead.legalDocuments : selectedLead.financeDocuments).map((doc, idx) => (
                      <div key={doc._id || idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        background: darkMode ? '#1f2937' : 'white',
                        borderRadius: '6px',
                        border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: darkMode ? '#f8fafc' : '#111827',
                            marginBottom: '0.25rem'
                          }}>
                            📄 {doc.fileName}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: darkMode ? '#9ca3af' : '#6b7280'
                          }}>
                            {new Date(doc.uploadedAt).toLocaleString()} • {(doc.fileSize / 1024).toFixed(2)} KB
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <a
                            href={`${config.api.baseUrl}${doc.fileUrl}`}
                            download
                            style={{
                              padding: '0.5rem',
                              background: '#3b82f6',
                              color: 'white',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              textDecoration: 'none'
                            }}
                            title="Download"
                          >
                            <Download size={16} />
                          </a>
                          <button
                            onClick={() => handleDeleteDocument(doc._id, isLegal ? 'legal' : 'finance')}
                            style={{
                              padding: '0.5rem',
                              background: '#ef4444',
                              color: 'white',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                {isLegal && (
                  <button
                    onClick={openTransferModal}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Send size={18} />
                    Transfer to Finance
                  </button>
                )}

                {isFinance && (
                  <button
                    onClick={openTransferModal}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <CheckCircle size={18} />
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
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
        }}>
          <div style={{
            background: darkMode ? '#1f2937' : 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: darkMode ? 'white' : '#1f2937',
              marginBottom: '1.5rem'
            }}>
              {isLegal ? 'Transfer to Finance Team' : 'Complete Workflow'}
            </h3>

            {isLegal && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Select Finance Team Member
                </label>
                <select
                  value={transferData.assignedTo}
                  onChange={(e) => setTransferData({ ...transferData, assignedTo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '6px',
                    background: darkMode ? '#374151' : 'white',
                    color: darkMode ? 'white' : '#1f2937'
                  }}
                >
                  <option value="">Select member...</option>
                  {teamMembers.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: darkMode ? '#d1d5db' : '#374151',
                marginBottom: '0.5rem'
              }}>
                Notes (Optional)
              </label>
              <textarea
                value={transferData.notes}
                onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '6px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#1f2937',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowTransferModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '6px',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
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
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowDashboard;
