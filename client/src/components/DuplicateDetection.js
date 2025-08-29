import React, { useState } from 'react';
import { Search, AlertTriangle, Merge, Eye, X } from 'lucide-react';

const DuplicateDetection = ({ crmData, updateCrmData }) => {
  const [duplicates, setDuplicates] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDuplicates, setSelectedDuplicates] = useState([]);

  const findDuplicates = () => {
    setIsScanning(true);
    
    setTimeout(() => {
      const leads = crmData.leads || [];
      const duplicateGroups = [];
      
      // Find duplicates by email
      const emailGroups = {};
      leads.forEach(lead => {
        const email = lead.email.toLowerCase();
        if (!emailGroups[email]) {
          emailGroups[email] = [];
        }
        emailGroups[email].push(lead);
      });
      
      Object.values(emailGroups).forEach(group => {
        if (group.length > 1) {
          duplicateGroups.push({
            id: Date.now() + Math.random(),
            type: 'email',
            field: 'Email Address',
            value: group[0].email,
            leads: group,
            confidence: 100
          });
        }
      });
      
      // Find duplicates by phone
      const phoneGroups = {};
      leads.forEach(lead => {
        const phone = lead.phone.replace(/\D/g, '');
        if (phone.length >= 10) {
          if (!phoneGroups[phone]) {
            phoneGroups[phone] = [];
          }
          phoneGroups[phone].push(lead);
        }
      });
      
      Object.values(phoneGroups).forEach(group => {
        if (group.length > 1) {
          duplicateGroups.push({
            id: Date.now() + Math.random(),
            type: 'phone',
            field: 'Phone Number',
            value: group[0].phone,
            leads: group,
            confidence: 95
          });
        }
      });
      
      // Find similar company names
      const companyGroups = {};
      leads.forEach(lead => {
        const company = lead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const similar = Object.keys(companyGroups).find(key => {
          const similarity = calculateSimilarity(key, company);
          return similarity > 0.8;
        });
        
        if (similar) {
          companyGroups[similar].push(lead);
        } else {
          companyGroups[company] = [lead];
        }
      });
      
      Object.values(companyGroups).forEach(group => {
        if (group.length > 1) {
          duplicateGroups.push({
            id: Date.now() + Math.random(),
            type: 'company',
            field: 'Company Name',
            value: group[0].companyName,
            leads: group,
            confidence: 85
          });
        }
      });
      
      setDuplicates(duplicateGroups);
      setIsScanning(false);
    }, 3000);
  };

  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1, str2) => {
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

  const mergeDuplicates = (duplicateGroup) => {
    const leads = crmData.leads || [];
    const leadsToMerge = duplicateGroup.leads;
    
    // Keep the lead with the highest score or most recent
    const primaryLead = leadsToMerge.reduce((best, current) => {
      if (current.score > best.score) return current;
      if (current.score === best.score && new Date(current.createdDate) > new Date(best.createdDate)) {
        return current;
      }
      return best;
    });
    
    // Merge data from other leads
    const mergedLead = {
      ...primaryLead,
      notes: leadsToMerge.map(lead => lead.notes).filter(Boolean).join('\n\n'),
      activities: leadsToMerge.reduce((all, lead) => [...all, ...(lead.activities || [])], []),
      mergedFrom: leadsToMerge.filter(lead => lead.id !== primaryLead.id).map(lead => lead.id),
      mergedDate: new Date().toISOString()
    };
    
    // Remove duplicates and add merged lead
    const idsToRemove = leadsToMerge.map(lead => lead.id);
    const updatedLeads = leads.filter(lead => !idsToRemove.includes(lead.id));
    updatedLeads.push(mergedLead);
    
    updateCrmData({ leads: updatedLeads });
    
    // Remove from duplicates list
    setDuplicates(duplicates.filter(dup => dup.id !== duplicateGroup.id));
    
    alert(`Merged ${leadsToMerge.length} duplicate leads into one`);
  };

  const ignoreDuplicate = (duplicateId) => {
    setDuplicates(duplicates.filter(dup => dup.id !== duplicateId));
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 95) return 'confidence-high';
    if (confidence >= 85) return 'confidence-medium';
    return 'confidence-low';
  };

  return (
    <div className="duplicate-detection">
      <div className="page-header">
        <h1>Duplicate Lead Detection</h1>
        <p>Identify and merge duplicate leads to maintain data quality</p>
      </div>

      <div className="detection-controls">
        <button 
          className="btn-primary"
          onClick={findDuplicates}
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <Search className="spinning" size={16} />
              Scanning...
            </>
          ) : (
            <>
              <Search size={16} />
              Scan for Duplicates
            </>
          )}
        </button>

        {duplicates.length > 0 && (
          <div className="detection-stats">
            <span className="stat">
              Found {duplicates.length} potential duplicate groups
            </span>
            <span className="stat">
              Affecting {duplicates.reduce((sum, dup) => sum + dup.leads.length, 0)} leads
            </span>
          </div>
        )}
      </div>

      {isScanning && (
        <div className="scanning-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p>Analyzing leads for duplicates using fuzzy matching algorithms...</p>
        </div>
      )}

      <div className="duplicates-list">
        {duplicates.map(duplicate => (
          <div key={duplicate.id} className="duplicate-group">
            <div className="duplicate-header">
              <div className="duplicate-info">
                <AlertTriangle className="warning-icon" />
                <div>
                  <h3>Duplicate {duplicate.field}</h3>
                  <p>Value: {duplicate.value}</p>
                </div>
              </div>
              <div className="duplicate-meta">
                <span className={`confidence-badge ${getConfidenceColor(duplicate.confidence)}`}>
                  {duplicate.confidence}% Match
                </span>
                <span className="leads-count">
                  {duplicate.leads.length} leads
                </span>
              </div>
            </div>

            <div className="duplicate-leads">
              {duplicate.leads.map(lead => (
                <div key={lead.id} className="duplicate-lead">
                  <div className="lead-info">
                    <h4>{lead.companyName}</h4>
                    <p>{lead.contactPerson}</p>
                    <p>{lead.email}</p>
                    <p>{lead.phone}</p>
                  </div>
                  <div className="lead-meta">
                    <span className="created-date">
                      Created: {new Date(lead.createdDate).toLocaleDateString()}
                    </span>
                    <span className="lead-score">
                      Score: {lead.score || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="duplicate-actions">
              <button 
                className="btn-secondary"
                onClick={() => ignoreDuplicate(duplicate.id)}
              >
                <X size={16} />
                Ignore
              </button>
              <button 
                className="btn-secondary"
                title="View Details"
              >
                <Eye size={16} />
                Review
              </button>
              <button 
                className="btn-primary"
                onClick={() => mergeDuplicates(duplicate)}
              >
                <Merge size={16} />
                Merge Leads
              </button>
            </div>
          </div>
        ))}
      </div>

      {duplicates.length === 0 && !isScanning && (
        <div className="no-duplicates">
          <Search size={48} />
          <h3>No duplicates found</h3>
          <p>Your lead database appears to be clean</p>
        </div>
      )}

      <div className="detection-info">
        <h3>Detection Methods</h3>
        <div className="methods-grid">
          <div className="method-card">
            <h4>Email Matching</h4>
            <p>Exact email address matches (100% confidence)</p>
          </div>
          <div className="method-card">
            <h4>Phone Matching</h4>
            <p>Phone number matches ignoring formatting (95% confidence)</p>
          </div>
          <div className="method-card">
            <h4>Company Name Similarity</h4>
            <p>Fuzzy matching for similar company names (85% confidence)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateDetection;