import React, { useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, Mail, FileText, Send, X, Download, Trash2 } from 'lucide-react';
import config from '../config';

const WorkflowDocuments = ({ currentUser, darkMode }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [documentType, setDocumentType] = useState('link');
  const [documentLink, setDocumentLink] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);

  const isLegalTeam = currentUser?.role === 'legal-team';

  useEffect(() => {
    fetchLeadsAndDocuments();
  }, []);

  const fetchLeadsAndDocuments = async () => {
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
      
      // Extract all documents from all leads
      const allDocs = [];
      (data.leads || []).forEach(lead => {
        const docs = isLegalTeam ? lead.legalDocuments : lead.financeDocuments;
        if (docs && docs.length > 0) {
          docs.forEach(doc => {
            allDocs.push({
              ...doc,
              id: doc._id,
              leadId: lead._id,
              leadName: lead.contactPerson,
              uploadedAt: new Date(doc.uploadedAt).toLocaleString(),
              size: `${(doc.fileSize / 1024).toFixed(2)} KB`
            });
          });
        }
      });
      setUploadedDocuments(allDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = () => {
    setShowUploadModal(true);
  };

  const handleSaveDocument = async () => {
    if (!selectedLead) {
      alert('Please select a lead first');
      return;
    }

    if (documentType === 'link' && (!documentLink || !documentName)) {
      alert('Please provide document name and link');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('authToken');
      const endpoint = isLegalTeam ? 'legal/upload' : 'finance/upload';
      
      // For now, just create a mock file from link
      const formData = new FormData();
      const blob = new Blob([documentLink], { type: 'text/plain' });
      const file = new File([blob], documentName, { type: 'text/plain' });
      formData.append('documents', file);

      const response = await fetch(`${config.api.baseUrl}/workflow/${selectedLead}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        alert('Document uploaded successfully!');
        setShowUploadModal(false);
        setDocumentLink('');
        setDocumentName('');
        setSelectedLead(null);
        fetchLeadsAndDocuments();
      } else {
        alert('Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  const handleEmailDocument = (doc) => {
    setSelectedDocument(doc);
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!customerEmail) {
      alert('Please enter customer email');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.api.baseUrl}/workflow/send-document-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId: selectedDocument.id,
          leadId: selectedDocument.leadId,
          customerEmail: customerEmail,
          documentName: selectedDocument.fileName || selectedDocument.name,
          documentUrl: selectedDocument.fileUrl,
          teamType: isLegalTeam ? 'legal' : 'finance'
        })
      });

      if (response.ok) {
        alert(`Email sent successfully to ${customerEmail}!`);
        setShowEmailModal(false);
        setCustomerEmail('');
        setSelectedDocument(null);
      } else {
        alert('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email');
    }
  };

  const handleDeleteDocument = async (doc) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const endpoint = isLegalTeam ? 'legal/delete' : 'finance/delete';
      
      const response = await fetch(`${config.api.baseUrl}/workflow/${doc.leadId}/${endpoint}/${doc.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Document deleted successfully!');
        fetchLeadsAndDocuments();
      } else {
        alert('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: darkMode ? '#374151' : 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0,
                marginBottom: '0.5rem'
              }}>
                {isLegalTeam ? '⚖️ Legal Documents' : '💰 Finance Documents'}
              </h1>
              <p style={{
                color: darkMode ? '#9ca3af' : '#6b7280',
                margin: 0,
                fontSize: '0.875rem'
              }}>
                Select a lead before uploading documents
              </p>
              <p style={{
                color: darkMode ? '#9ca3af' : '#6b7280',
                margin: 0
              }}>
                {isLegalTeam ? 'Upload agreements and legal documents' : 'Upload invoices and payment documents'}
              </p>
            </div>
            <button
              onClick={handleUploadDocument}
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <Upload size={20} />
              Upload Document
            </button>
          </div>
        </div>

        {/* Uploaded Documents List */}
        <div style={{
          backgroundColor: darkMode ? '#374151' : 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FileText size={24} />
            Uploaded Documents ({uploadedDocuments.length})
          </h2>

          {loading ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              <p>Loading documents...</p>
            </div>
          ) : uploadedDocuments.length === 0 ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No documents uploaded yet. Click "Upload Document" to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {uploadedDocuments.map((doc) => (
                <div key={doc.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#1f2937' : '#f9fafb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <FileText size={24} style={{ color: '#3b82f6' }} />
                    <div>
                      <div style={{
                        fontWeight: '600',
                        color: darkMode ? 'white' : '#1f2937',
                        marginBottom: '0.25rem'
                      }}>
                        {doc.fileName || doc.name}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}>
                        {doc.leadName} • {doc.uploadedAt} • {doc.size}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a
                      href={`${config.api.baseUrl}${doc.fileUrl}`}
                      download
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <Download size={16} />
                    </a>
                    <button
                      onClick={() => handleEmailDocument(doc)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <Mail size={16} />
                      Email
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc)}
                      style={{
                        padding: '0.5rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
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
            borderRadius: '16px',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Upload {isLegalTeam ? 'Agreement' : 'Invoice'}
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: darkMode ? '#d1d5db' : '#374151',
                marginBottom: '0.5rem'
              }}>
                Select Lead
              </label>
              <select
                value={selectedLead || ''}
                onChange={(e) => setSelectedLead(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#1f2937',
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <option value="">Choose a lead...</option>
                {leads.map(lead => (
                  <option key={lead._id} value={lead._id}>
                    {lead.contactPerson} - {lead.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: darkMode ? '#d1d5db' : '#374151',
                marginBottom: '0.5rem'
              }}>
                Document Type
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setDocumentType('link')}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    border: `2px solid ${documentType === 'link' ? '#3b82f6' : (darkMode ? '#374151' : '#e5e7eb')}`,
                    borderRadius: '8px',
                    background: documentType === 'link' ? '#3b82f620' : 'transparent',
                    color: darkMode ? 'white' : '#1f2937',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <LinkIcon size={24} />
                  <span>Drive Link</span>
                </button>
                <button
                  onClick={() => setDocumentType('file')}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    border: `2px solid ${documentType === 'file' ? '#3b82f6' : (darkMode ? '#374151' : '#e5e7eb')}`,
                    borderRadius: '8px',
                    background: documentType === 'file' ? '#3b82f620' : 'transparent',
                    color: darkMode ? 'white' : '#1f2937',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <FileText size={24} />
                  <span>Upload File</span>
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>(Coming Soon)</span>
                </button>
              </div>
            </div>

            {documentType === 'link' && (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Document Name
                  </label>
                  <input
                    type="text"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder={isLegalTeam ? "Agreement Name" : "Invoice Name"}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '1rem'
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
                  }}>
                    Google Drive Link
                  </label>
                  <input
                    type="url"
                    value={documentLink}
                    onChange={(e) => setDocumentLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </>
            )}

            {documentType === 'file' && (
              <div style={{
                padding: '2rem',
                border: `2px dashed ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '1.5rem',
                background: darkMode ? '#37415120' : '#f9fafb'
              }}>
                <Upload size={48} style={{ color: '#9ca3af', margin: '0 auto 1rem' }} />
                <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', margin: 0 }}>
                  File upload feature coming soon!
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  background: 'transparent',
                  color: darkMode ? '#d1d5db' : '#374151',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDocument}
                disabled={uploading || !selectedLead || (documentType === 'link' && (!documentLink || !documentName))}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: (uploading || !selectedLead || (documentType === 'link' && (!documentLink || !documentName))) ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  cursor: (uploading || !selectedLead || (documentType === 'link' && (!documentLink || !documentName))) ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Upload size={16} />
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
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
          zIndex: 1001
        }}>
          <div style={{
            background: darkMode ? '#1f2937' : 'white',
            borderRadius: '16px',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Send to Customer
              </h3>
              <button
                onClick={() => setShowEmailModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{
              padding: '1rem',
              background: darkMode ? '#37415120' : '#f0f9ff',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: `1px solid ${darkMode ? '#374151' : '#bfdbfe'}`
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: darkMode ? '#9ca3af' : '#6b7280',
                margin: 0
              }}>
                📄 Document: <strong>{selectedDocument?.name}</strong>
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: darkMode ? '#d1d5db' : '#374151',
                marginBottom: '0.5rem'
              }}>
                Customer Email
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#374151' : 'white',
                  color: darkMode ? 'white' : '#1f2937',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setSelectedDocument(null);
                  setCustomerEmail('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  background: 'transparent',
                  color: darkMode ? '#d1d5db' : '#374151',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={!customerEmail}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: !customerEmail ? '#9ca3af' : '#22c55e',
                  color: 'white',
                  cursor: !customerEmail ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Send size={16} />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowDocuments;
