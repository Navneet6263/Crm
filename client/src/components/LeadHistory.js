import React, { useState } from 'react';
import { Calendar, Clock, User, Activity, Filter } from 'lucide-react';

const LeadHistory = ({ crmData }) => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [filterStatus, setFilterStatus] = useState('all');

  const leads = Array.isArray(crmData.leads) ? crmData.leads : (crmData.leads?.leads || []);
  
  const filteredLeads = leads.filter(lead => {
    const leadDate = new Date(lead.createdDate);
    const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
    
    const dateMatch = (!startDate || leadDate >= startDate) && (!endDate || leadDate <= endDate);
    const statusMatch = filterStatus === 'all' || lead.leadStatus === filterStatus;
    
    return dateMatch && statusMatch;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'new': return 'status-new';
      case 'contacted': return 'status-contacted';
      case 'qualified': return 'status-qualified';
      case 'converted': return 'status-converted';
      case 'lost': return 'status-lost';
      default: return 'status-default';
    }
  };

  return (
    <div className="lead-history">
      <div className="page-header">
        <h1>Lead History</h1>
        <p>Track lead status and actions over time</p>
      </div>

      <div className="history-filters">
        <div className="date-range">
          <Calendar className="filter-icon" />
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            className="date-input"
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            className="date-input"
          />
        </div>

        <div className="status-filter">
          <Filter className="filter-icon" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      <div className="history-timeline">
        {filteredLeads.map(lead => (
          <div key={lead.id} className="timeline-item">
            <div className="timeline-marker">
              <Clock size={16} />
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <h3>{lead.companyName}</h3>
                <span className={`status-badge ${getStatusColor(lead.leadStatus)}`}>
                  {lead.leadStatus}
                </span>
              </div>
              <div className="timeline-details">
                <p><strong>Contact:</strong> {lead.contactPerson}</p>
                <p><strong>Assigned to:</strong> {lead.assignedTo}</p>
                <p><strong>Created:</strong> {new Date(lead.createdDate).toLocaleDateString()}</p>
                <p><strong>Last Activity:</strong> {new Date(lead.lastActivity).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="no-history">
          <Activity size={48} />
          <h3>No lead history found</h3>
          <p>Try adjusting your date range or filters</p>
        </div>
      )}
    </div>
  );
};

export default LeadHistory;