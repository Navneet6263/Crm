import React, { useState, useEffect } from 'react';
import { History, User, Mail, Calendar, FileText, Download } from 'lucide-react';
import config from '../config';

const WorkflowHistory = ({ darkMode, currentUser }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLegal = currentUser?.role === 'legal-team';
  const isFinance = currentUser?.role === 'finance-team';

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.api.baseUrl}/workflow/my-history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
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
        Loading history...
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
        maxWidth: '1200px',
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
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <History size={32} />
            {isLegal ? '⚖️ Legal Team - Work History' : '💰 Finance Team - Work History'}
          </h1>
          <p style={{
            color: darkMode ? '#9ca3af' : '#6b7280'
          }}>
            View all leads you've worked on
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: darkMode ? '#1e293b' : 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#3b82f6',
              marginBottom: '0.5rem'
            }}>
              {history.length}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              Total Leads Processed
            </div>
          </div>

          <div style={{
            background: darkMode ? '#1e293b' : 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#22c55e',
              marginBottom: '0.5rem'
            }}>
              {history.reduce((sum, item) => sum + (isLegal ? item.legalDocuments?.length || 0 : item.financeDocuments?.length || 0), 0)}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              Documents Uploaded
            </div>
          </div>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: darkMode ? '#1e293b' : 'white',
            borderRadius: '12px',
            border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`
          }}>
            <History size={48} style={{ color: darkMode ? '#4b5563' : '#9ca3af', margin: '0 auto 1rem' }} />
            <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
              No work history yet
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {history.map((item) => (
              <div
                key={item._id}
                style={{
                  background: darkMode ? '#1e293b' : 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`
                }}
              >
                {/* Lead Info */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: darkMode ? '#f8fafc' : '#111827',
                      marginBottom: '0.5rem'
                    }}>
                      {item.contactPerson}
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={14} />
                        {item.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={14} />
                        Assigned by: {item.assignedByName || 'N/A'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={14} />
                        {new Date(item.assignedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '0.5rem 1rem',
                    background: item.workflowStage === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    color: item.workflowStage === 'completed' ? '#22c55e' : '#3b82f6',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {item.workflowStage === 'completed' ? '✓ Completed' : 'In Progress'}
                  </div>
                </div>

                {/* Documents */}
                {((isLegal && item.legalDocuments?.length > 0) || (isFinance && item.financeDocuments?.length > 0)) && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: darkMode ? '#374151' : '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#f8fafc' : '#111827',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FileText size={16} />
                      Uploaded Documents ({isLegal ? item.legalDocuments?.length : item.financeDocuments?.length})
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      {(isLegal ? item.legalDocuments : item.financeDocuments).map((doc, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem',
                            background: darkMode ? '#1f2937' : 'white',
                            borderRadius: '6px',
                            fontSize: '0.75rem'
                          }}
                        >
                          <span style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                            📄 {doc.fileName}
                          </span>
                          <a
                            href={`${config.api.baseUrl}${doc.fileUrl}`}
                            download
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: '#3b82f6',
                              color: 'white',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <Download size={12} />
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowHistory;
