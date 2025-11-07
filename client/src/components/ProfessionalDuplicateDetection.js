import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Merge, 
  Trash2,
  Eye,
  Filter,
  RefreshCw,
  Users,
  Mail,
  Phone,
  Building
} from 'lucide-react';
import { showToast } from './ToastNotification';
import apiService from '../services/apiService';

const ProfessionalDuplicateDetection = ({ darkMode, crmData, updateCrmData }) => {
  const [duplicates, setDuplicates] = useState([]);
  const [selectedDuplicates, setSelectedDuplicates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const fetchDuplicates = async () => {
    try {
      const leads = await apiService.getLeads();
      const detectedDuplicates = detectDuplicates(leads);
      setDuplicates(detectedDuplicates);
    } catch (error) {
      console.error('Error fetching leads for duplicate detection:', error);
      showToast('error', 'Failed to load data for duplicate detection');
    }
  };

  const detectDuplicates = (leads) => {
    const duplicateGroups = [];
    const processed = new Set();
    let groupId = 1;

    leads.forEach((lead, index) => {
      if (processed.has(lead.id)) return;

      const duplicates = leads.filter((otherLead, otherIndex) => {
        if (index === otherIndex || processed.has(otherLead.id)) return false;
        return calculateSimilarity(lead, otherLead) > 0.7;
      });

      if (duplicates.length > 0) {
        const allRecords = [lead, ...duplicates];
        allRecords.forEach(record => processed.add(record.id));

        const { type, field, value, confidence } = analyzeDuplicateGroup(allRecords);

        duplicateGroups.push({
          id: groupId++,
          type,
          field,
          value,
          records: allRecords.map(record => ({
            id: record.id,
            contactPerson: record.name || record.contactPerson || 'Unknown',
            companyName: record.company || record.companyName || 'Unknown Company',
            email: record.email || '',
            phone: record.phone || '',
            createdDate: record.createdAt || record.dateCreated || new Date().toISOString(),
            source: record.source || 'Unknown'
          })),
          confidence,
          status: 'pending'
        });
      }
    });

    return duplicateGroups;
  };

  const calculateSimilarity = (lead1, lead2) => {
    let score = 0;
    let factors = 0;

    if (lead1.email && lead2.email) {
      factors++;
      if (lead1.email.toLowerCase() === lead2.email.toLowerCase()) {
        score += 0.4;
      }
    }

    if (lead1.phone && lead2.phone) {
      factors++;
      const phone1 = lead1.phone.replace(/\D/g, '');
      const phone2 = lead2.phone.replace(/\D/g, '');
      if (phone1 === phone2) {
        score += 0.3;
      }
    }

    if (lead1.name && lead2.name) {
      factors++;
      const nameSimilarity = stringSimilarity(lead1.name, lead2.name);
      if (nameSimilarity > 0.8) {
        score += 0.2;
      }
    }

    if (lead1.company && lead2.company) {
      factors++;
      const companySimilarity = stringSimilarity(lead1.company, lead2.company);
      if (companySimilarity > 0.8) {
        score += 0.1;
      }
    }

    return factors > 0 ? score : 0;
  };

  const stringSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1.0;
    return (longer.length - editDistance(longer, shorter)) / longer.length;
  };

  const editDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  const analyzeDuplicateGroup = (records) => {
    const emails = records.map(r => r.email).filter(Boolean);
    const uniqueEmails = [...new Set(emails)];
    if (uniqueEmails.length === 1 && emails.length > 1) {
      return { type: 'email', field: 'email', value: uniqueEmails[0], confidence: 95 };
    }

    const phones = records.map(r => r.phone?.replace(/\D/g, '')).filter(Boolean);
    const uniquePhones = [...new Set(phones)];
    if (uniquePhones.length === 1 && phones.length > 1) {
      return { type: 'phone', field: 'phone', value: records.find(r => r.phone)?.phone || '', confidence: 90 };
    }

    const companies = records.map(r => r.company || r.companyName).filter(Boolean);
    if (companies.length > 1) {
      return { type: 'company', field: 'companyName', value: companies[0], confidence: 80 };
    }

    return { type: 'name', field: 'name', value: records[0]?.name || 'Similar Names', confidence: 75 };
  };

  const scanForDuplicates = async () => {
    setIsScanning(true);
    showToast('info', '🔍 Scanning for duplicates...');
    
    try {
      await fetchDuplicates();
      showToast('success', `✅ Scan complete! Found ${duplicates.length} potential duplicates`);
    } catch (error) {
      showToast('error', 'Failed to scan for duplicates');
    } finally {
      setIsScanning(false);
    }
  };

  const mergeDuplicates = async (duplicateGroup) => {
    try {
      const sortedRecords = duplicateGroup.records.sort((a, b) => 
        new Date(a.createdDate) - new Date(b.createdDate)
      );
      
      const primaryRecord = sortedRecords[0];
      const duplicateIds = sortedRecords.slice(1).map(r => r.id);
      
      const mergedData = {
        name: primaryRecord.contactPerson,
        email: primaryRecord.email || sortedRecords.find(r => r.email)?.email,
        phone: primaryRecord.phone || sortedRecords.find(r => r.phone)?.phone,
        company: primaryRecord.companyName
      };
      
      await apiService.updateLead(primaryRecord.id, mergedData);
      
      for (const duplicateId of duplicateIds) {
        await apiService.deleteLead(duplicateId);
      }
      
      setDuplicates(prev => prev.filter(d => d.id !== duplicateGroup.id));
      showToast('success', `✅ Merged ${duplicateGroup.records.length} duplicate records`);
    } catch (error) {
      console.error('Error merging duplicates:', error);
      showToast('error', 'Failed to merge duplicate records');
    }
  };

  const ignoreDuplicate = (duplicateId) => {
    setDuplicates(prev => prev.map(d => 
      d.id === duplicateId ? { ...d, status: 'ignored' } : d
    ));
    showToast('info', '👁️ Duplicate marked as ignored');
  };

  const deleteDuplicate = async (duplicateGroup, recordId) => {
    try {
      await apiService.deleteLead(recordId);
      
      const updatedRecords = duplicateGroup.records.filter(r => r.id !== recordId);
      
      if (updatedRecords.length < 2) {
        setDuplicates(prev => prev.filter(d => d.id !== duplicateGroup.id));
      } else {
        setDuplicates(prev => prev.map(d => 
          d.id === duplicateGroup.id ? { ...d, records: updatedRecords } : d
        ));
      }
      
      showToast('success', '🗑️ Record deleted successfully');
    } catch (error) {
      console.error('Error deleting record:', error);
      showToast('error', 'Failed to delete record');
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' };
    if (confidence >= 70) return { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' };
    return { bg: '#dbeafe', text: '#1d4ed8', border: '#3b82f6' };
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email': return <Mail size={16} />;
      case 'phone': return <Phone size={16} />;
      case 'company': return <Building size={16} />;
      default: return <Copy size={16} />;
    }
  };

  const filteredDuplicates = duplicates.filter(duplicate => {
    const matchesSearch = duplicate.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         duplicate.records.some(record => 
                           record.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.companyName.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'high' && duplicate.confidence >= 90) ||
                         (filterType === 'medium' && duplicate.confidence >= 70 && duplicate.confidence < 90) ||
                         (filterType === 'low' && duplicate.confidence < 70) ||
                         (filterType === 'pending' && duplicate.status === 'pending') ||
                         (filterType === 'ignored' && duplicate.status === 'ignored');
    
    return matchesSearch && matchesFilter;
  });

  const containerStyle = {
    padding: '0',
    background: darkMode ? '#111827' : '#f9fafb',
    minHeight: '100vh'
  };

  const cardStyle = {
    background: darkMode ? '#1f2937' : 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Copy style={{ color: '#ef4444' }} size={32} />
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Duplicate Detection
              </h1>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
                Identify and manage duplicate records in your CRM database
              </p>
            </div>
          </div>
          
          <button
            onClick={scanForDuplicates}
            disabled={isScanning}
            style={{
              padding: '0.75rem 1.5rem',
              background: isScanning 
                ? (darkMode ? '#4b5563' : '#d1d5db')
                : 'linear-gradient(135deg, #ef4444, #f87171)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: isScanning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            <RefreshCw size={20} style={{ 
              animation: isScanning ? 'spin 1s linear infinite' : 'none' 
            }} />
            {isScanning ? 'Scanning...' : 'Scan for Duplicates'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {[
          { 
            label: 'Total Duplicates', 
            value: duplicates.length,
            icon: Copy, 
            color: '#ef4444' 
          },
          { 
            label: 'High Confidence', 
            value: duplicates.filter(d => d.confidence >= 90).length,
            icon: AlertTriangle, 
            color: '#dc2626' 
          },
          { 
            label: 'Pending Review', 
            value: duplicates.filter(d => d.status === 'pending').length,
            icon: Eye, 
            color: '#f59e0b' 
          },
          { 
            label: 'Records Affected', 
            value: duplicates.reduce((sum, d) => sum + d.records.length, 0),
            icon: Users, 
            color: '#8b5cf6' 
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} style={{ ...cardStyle, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    {stat.label}
                  </p>
                  <p style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: darkMode ? 'white' : '#1f2937'
                  }}>
                    {stat.value}
                  </p>
                </div>
                <Icon style={{ color: stat.color }} size={28} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ ...cardStyle, padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search duplicates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? 'white' : '#1f2937',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={20} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '0.75rem',
                border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                background: darkMode ? '#374151' : 'white',
                color: darkMode ? 'white' : '#1f2937',
                fontSize: '1rem',
                outline: 'none'
              }}
            >
              <option value="all">All Duplicates</option>
              <option value="high">High Confidence (90%+)</option>
              <option value="medium">Medium Confidence (70-89%)</option>
              <option value="low">Low Confidence (&lt;70%)</option>
              <option value="pending">Pending Review</option>
              <option value="ignored">Ignored</option>
            </select>
          </div>
        </div>
      </div>

      {/* Duplicates List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredDuplicates.map(duplicate => {
          const confidenceColor = getConfidenceColor(duplicate.confidence);
          
          return (
            <div key={duplicate.id} style={{ ...cardStyle, padding: '1.5rem' }}>
              {/* Duplicate Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    padding: '0.75rem',
                    background: confidenceColor.bg,
                    borderRadius: '50%',
                    border: `2px solid ${confidenceColor.border}`
                  }}>
                    {getTypeIcon(duplicate.type)}
                  </div>
                  
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: darkMode ? 'white' : '#1f2937',
                      margin: '0 0 0.25rem 0'
                    }}>
                      Duplicate {duplicate.type.charAt(0).toUpperCase() + duplicate.type.slice(1)}
                    </h3>
                    <p style={{
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      fontSize: '0.875rem',
                      margin: 0
                    }}>
                      {duplicate.value} • {duplicate.records.length} records
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    background: confidenceColor.bg,
                    color: confidenceColor.text,
                    border: `1px solid ${confidenceColor.border}`
                  }}>
                    {duplicate.confidence}% Match
                  </span>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => mergeDuplicates(duplicate)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Merge size={14} />
                      Merge
                    </button>
                    
                    <button
                      onClick={() => ignoreDuplicate(duplicate.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: darkMode ? '#374151' : '#f3f4f6',
                        color: darkMode ? '#d1d5db' : '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              </div>

              {/* Records Comparison */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem'
              }}>
                {duplicate.records.map((record, index) => (
                  <div key={record.id} style={{
                    background: darkMode ? '#374151' : '#f9fafb',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: index === 0 ? '2px solid #22c55e' : `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
                  }}>
                    {index === 0 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.75rem'
                      }}>
                        <CheckCircle size={16} style={{ color: '#22c55e' }} />
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#22c55e'
                        }}>
                          PRIMARY RECORD
                        </span>
                      </div>
                    )}
                    
                    <div style={{ marginBottom: '0.75rem' }}>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: darkMode ? 'white' : '#1f2937',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {record.contactPerson}
                      </h4>
                      <p style={{
                        fontSize: '0.875rem',
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        margin: 0
                      }}>
                        {record.companyName}
                      </p>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={14} style={{ color: '#3b82f6' }} />
                        <span style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                          {record.email}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={14} style={{ color: '#22c55e' }} />
                        <span style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                          {record.phone}
                        </span>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.5rem',
                        paddingTop: '0.5rem',
                        borderTop: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
                      }}>
                        <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                          {new Date(record.createdDate).toLocaleDateString()}
                        </span>
                        
                        {index > 0 && (
                          <button
                            onClick={() => deleteDuplicate(duplicate, record.id)}
                            style={{
                              padding: '0.25rem',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            title="Delete Record"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDuplicates.length === 0 && (
        <div style={{
          ...cardStyle,
          padding: '3rem',
          textAlign: 'center'
        }}>
          <CheckCircle size={48} style={{ color: '#22c55e', marginBottom: '1rem' }} />
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginBottom: '0.5rem'
          }}>
            No duplicates found
          </h3>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Your database is clean! Run a scan to check for new duplicates.'
            }
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalDuplicateDetection;