import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Building, Calendar, Clock, CheckCircle, AlertCircle, Eye, FileText, Edit, Search, Filter, DollarSign, Target, TrendingUp, MessageCircle, Send, MapPin } from 'lucide-react';
import apiService from '../services/apiService';

const MyLeads = ({ darkMode = false, crmData, user, updateCrmData, onNavigate }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [highlightedLeadId, setHighlightedLeadId] = useState(null);
  const leadsFetchIdRef = useRef(0);
  const leadsAbortRef = useRef(null);
  const leadsRef = useRef([]);

  useEffect(() => {
    leadsRef.current = leads;
  }, [leads]);

  // Check sessionStorage for leadId from notification
  useEffect(() => {
    const leadIdFromNotification = sessionStorage.getItem('highlightLeadId');
    if (!leadIdFromNotification) return;

    const leadExists = leads.some(lead => (lead._id || lead.id) === leadIdFromNotification);
    if (!leadExists) return;

    setHighlightedLeadId(leadIdFromNotification);
    sessionStorage.removeItem('highlightLeadId');
    
    // Remove highlight after 2 seconds
    setTimeout(() => {
      setHighlightedLeadId(null);
    }, 2000);
    
    // Scroll to element after a short delay
    setTimeout(() => {
      const element = document.getElementById(`lead-${leadIdFromNotification}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  }, [leads]);
  
  // Continuously check for new highlight requests (for when already on My Leads page)
  useEffect(() => {
    const checkHighlight = setInterval(() => {
      const leadIdFromNotification = sessionStorage.getItem('highlightLeadId');
      if (!leadIdFromNotification) return;

      const leadExists = leadsRef.current.some(lead => (lead._id || lead.id) === leadIdFromNotification);
      if (!leadExists) return;

      setHighlightedLeadId(leadIdFromNotification);
      sessionStorage.removeItem('highlightLeadId');
      
      // Remove highlight after 2 seconds
      setTimeout(() => {
        setHighlightedLeadId(null);
      }, 2000);
      
      // Scroll to element
      setTimeout(() => {
        const element = document.getElementById(`lead-${leadIdFromNotification}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }, 500); // Check every 500ms
    
    return () => clearInterval(checkHighlight);
  }, []);
  const [editData, setEditData] = useState({
    contactPerson: '',
    companyName: '',
    email: '',
    phone: '',
    industry: '',
    leadSource: '',
    status: '',
    priority: '',
    estimatedValue: '',
    requirements: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    }
  });
  const [newNote, setNewNote] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferLeadId, setTransferLeadId] = useState(null);
  const [originalStatus, setOriginalStatus] = useState('');

  const handleAcceptLead = async (leadId) => {
    try {
      await apiService.acceptGroupLead(leadId);
      
      // Update the accepted lead in local state
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          (lead._id || lead.id) === leadId 
            ? { ...lead, status: 'contacted', assignedTo: user, assignedToGroup: null }
            : lead
        )
      );
      
      // Trigger global refresh event
      window.dispatchEvent(new CustomEvent('leadsUpdated'));
      
      if (window.showToast) {
        window.showToast('success', '✅ Lead accepted successfully!');
      } else {
        alert('✅ Lead accepted successfully!');
      }
    } catch (error) {
      console.error('Error accepting lead:', error);
      alert('❌ Failed to accept lead. Please try again.');
    }
  };

  const handleDeclineLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to decline this lead?')) return;
    
    try {
      await apiService.declineGroupLead(leadId);
      
      // Remove from current user's view
      setLeads(prevLeads => 
        prevLeads.filter(lead => (lead._id || lead.id) !== leadId)
      );
      
      // Trigger global refresh event
      window.dispatchEvent(new CustomEvent('leadsUpdated'));
      
      if (window.showToast) {
        window.showToast('info', '📝 Lead declined and returned to pool');
      } else {
        alert('📝 Lead declined and returned to pool');
      }
    } catch (error) {
      console.error('Error declining lead:', error);
      alert('❌ Failed to decline lead. Please try again.');
    }
  };

  const handleTransferToLegal = async () => {
    try {
      // Get first available legal team member
      const legalUsersResponse = await fetch(`${apiService.getApiUrl()}/workflow/users/legal-team`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!legalUsersResponse.ok) throw new Error('Failed to fetch legal team');
      
      const { users } = await legalUsersResponse.json();
      const assignedToLegal = users && users.length > 0 ? users[0]._id : null;
      
      if (!assignedToLegal) {
        alert('❌ No legal team members available');
        return;
      }
      
      const response = await fetch(`${apiService.getApiUrl()}/workflow/${transferLeadId}/transfer-to-legal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          assignedToLegal,
          notes: 'Transferred from sales to legal team'
        })
      });
      
      if (!response.ok) throw new Error('Transfer failed');
      
      setShowTransferModal(false);
      setTransferLeadId(null);
      
      if (window.showToast) {
        window.showToast('success', '✅ Lead transferred to Legal Team');
      } else {
        alert('✅ Lead transferred to Legal Team');
      }
      
      // Refresh leads
      window.dispatchEvent(new CustomEvent('leadsUpdated'));
    } catch (error) {
      console.error('Error transferring lead:', error);
      alert('❌ Failed to transfer lead');
    }
  };

  useEffect(() => {
    const fetchMyLeads = async () => {
      const fetchId = ++leadsFetchIdRef.current;
      if (leadsAbortRef.current) {
        leadsAbortRef.current.abort();
      }
      const controller = new AbortController();
      leadsAbortRef.current = controller;

      try {
        setLoading(true);
        setCurrentPage(1);
        setLeads([]);

        let firstPageLoaded = false;
        const leadsAccumulator = [];
        
        // For legal-team and finance-team, fetch their assigned leads
        if (user?.role === 'legal-team' || user?.role === 'finance-team') {
          const response = await fetch(`${apiService.getApiUrl()}/workflow/my-assigned`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          });
          const data = await response.json();
          const leadsData = data.leads || [];
          if (fetchId !== leadsFetchIdRef.current || controller.signal.aborted) return;
          setLeads(leadsData);
        } else {
          await apiService.fetchPagedLeads({
            path: '/leads/my-leads',
            pageSize: 200,
            signal: controller.signal,
            onPage: (pageLeads) => {
              if (fetchId !== leadsFetchIdRef.current || controller.signal.aborted) return;
              leadsAccumulator.push(...pageLeads);
              setLeads([...leadsAccumulator]);
              if (!firstPageLoaded) {
                setLoading(false);
                firstPageLoaded = true;
              }
            }
          });
          if (fetchId !== leadsFetchIdRef.current || controller.signal.aborted) return;
          if (!leadsAccumulator.length) {
            setLeads([]);
          }
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Error fetching my leads:', error);
        if (fetchId === leadsFetchIdRef.current) {
          setLeads([]);
        }
      } finally {
        if (fetchId === leadsFetchIdRef.current && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchMyLeads();
    
    // Listen for global lead updates
    const handleLeadsUpdate = () => {
      console.log('MyLeads: Received leadsUpdated event');
      fetchMyLeads();
    };
    
    window.addEventListener('leadsUpdated', handleLeadsUpdate);
    
    return () => {
      window.removeEventListener('leadsUpdated', handleLeadsUpdate);
      if (leadsAbortRef.current) {
        leadsAbortRef.current.abort();
      }
    };
  }, [crmData, user]);

  // Enhanced filtering with priority
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = (lead.contactPerson || lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.companyName || lead.company || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  const updateLeadStatus = async (leadId, newStatus) => {
    const lead = leads.find(l => (l._id || l.id) === leadId);
    const oldStatus = lead?.status;
    
    // If status is changing, ask for reason/activity note
    if (oldStatus !== newStatus) {
      const reason = prompt(`Status changing from "${oldStatus}" to "${newStatus}".\n\nPlease provide reason/activity (minimum 10 words):`);
      
      if (!reason) {
        if (window.showToast) {
          window.showToast('error', '❌ Status change cancelled');
        }
        return;
      }
      

      
      try {
        // Update immediately in local state (optimistic update)
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            (lead._id || lead.id) === leadId ? { ...lead, status: newStatus } : lead
          )
        );
        
        // Update in backend
        await apiService.updateLead(leadId, { status: newStatus });
        
        // Add history note for status change
        const statusNote = `Status changed from "${oldStatus}" to "${newStatus}" by ${user?.name || user?.email || 'User'} at ${new Date().toLocaleString('en-IN')}\n\nReason: ${reason}`;
        await apiService.addLeadNote(leadId, statusNote);
        
        // Show success toast
        if (window.showToast) {
          window.showToast('success', `✅ Status updated to ${newStatus}`);
        }
      } catch (error) {
        console.error('Error updating lead status:', error);
        // Revert on error
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            (lead._id || lead.id) === leadId ? { ...lead, status: oldStatus } : lead
          )
        );
        if (window.showToast) {
          window.showToast('error', `❌ Failed to update status`);
        }
      }
    }
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setOriginalStatus(lead.status || 'new');
    setEditData({
      contactPerson: lead.contactPerson || lead.name || '',
      companyName: lead.companyName || lead.company || '',
      email: lead.email || '',
      phone: lead.phone || '',
      industry: lead.industry || '',
      leadSource: lead.leadSource || '',
      status: lead.status || 'new',
      priority: lead.priority || 'medium',
      estimatedValue: lead.estimatedValue || '',
      requirements: lead.requirements || '',
      address: {
        street: lead.address?.street || '',
        city: lead.address?.city || '',
        state: lead.address?.state || '',
        postalCode: lead.address?.postalCode || '',
        country: lead.address?.country || 'India'
      }
    });
    setNewNote('');
    setShowEditModal(true);
  };

  const saveEditLead = async () => {
    try {
      const leadId = selectedLead._id || selectedLead.id;
      
      // Check if status changed and note is required
      if (editData.status !== originalStatus) {
        if (!newNote.trim()) {
          alert('❌ Status changed! Please add a note explaining the reason.');
          return;
        }
      }
      
      // Track what fields were changed
      const changes = [];
      const originalLead = selectedLead;
      
      if (editData.contactPerson !== (originalLead.contactPerson || originalLead.name || '')) {
        changes.push(`Contact Person: "${originalLead.contactPerson || originalLead.name || ''}" → "${editData.contactPerson}"`);
      }
      if (editData.companyName !== (originalLead.companyName || originalLead.company || '')) {
        changes.push(`Company: "${originalLead.companyName || originalLead.company || ''}" → "${editData.companyName}"`);
      }
      if (editData.email !== (originalLead.email || '')) {
        changes.push(`Email: "${originalLead.email || ''}" → "${editData.email}"`);
      }
      if (editData.phone !== (originalLead.phone || '')) {
        changes.push(`Phone: "${originalLead.phone || ''}" → "${editData.phone}"`);
      }
      if (editData.industry !== (originalLead.industry || '')) {
        changes.push(`Industry: "${originalLead.industry || ''}" → "${editData.industry}"`);
      }
      if (editData.leadSource !== (originalLead.leadSource || '')) {
        changes.push(`Lead Source: "${originalLead.leadSource || ''}" → "${editData.leadSource}"`);
      }
      if (editData.status !== (originalLead.status || '')) {
        changes.push(`Status: "${originalLead.status || ''}" → "${editData.status}"`);
      }
      if (editData.priority !== (originalLead.priority || '')) {
        changes.push(`Priority: "${originalLead.priority || ''}" → "${editData.priority}"`);
      }
      if (editData.estimatedValue !== (originalLead.estimatedValue || '')) {
        changes.push(`Estimated Value: "₹${originalLead.estimatedValue || '0'}" → "₹${editData.estimatedValue}"`);
      }
      if (editData.requirements !== (originalLead.requirements || '')) {
        changes.push(`Requirements updated`);
      }
      
      // Create updated lead object with all fields
      const updatedLeadData = {
        ...originalLead,
        contactPerson: editData.contactPerson,
        name: editData.contactPerson,
        companyName: editData.companyName,
        company: editData.companyName,
        email: editData.email,
        phone: editData.phone,
        industry: editData.industry,
        leadSource: editData.leadSource,
        status: editData.status,
        priority: editData.priority,
        estimatedValue: editData.estimatedValue,
        requirements: editData.requirements,
        address: {
          street: editData.address.street,
          city: editData.address.city,
          state: editData.address.state,
          postalCode: editData.address.postalCode,
          country: editData.address.country
        },
        lastActivity: new Date().toISOString(),
        lastUpdatedBy: user?.name || user?.email || 'User'
      };
      
      // Update lead in backend
      await apiService.updateLead(leadId, updatedLeadData);
      
      // Refresh global data
      if (updateCrmData) {
        const allLeads = await apiService.getAllLeads();
        updateCrmData({ leads: allLeads });
      }
      
      // Update local state immediately (no need to refetch)
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          (lead._id || lead.id) === leadId ? updatedLeadData : lead
        )
      );
      
      // Add update history note if there were changes
      if (changes.length > 0) {
        const updateNote = `Lead updated by ${user?.name || user?.email || 'User'} at ${new Date().toLocaleString('en-IN')}:\n\nChanges made:\n${changes.map(change => `• ${change}`).join('\n')}`;
        try {
          await apiService.addLeadNote(leadId, updateNote);
          // Update notes in local state too
          const newNoteObj = {
            content: updateNote,
            createdAt: new Date().toISOString(),
            createdBy: { name: user?.name || user?.email || 'User' }
          };
          setLeads(prevLeads => 
            prevLeads.map(lead => {
              if ((lead._id || lead.id) === leadId) {
                return {
                  ...lead,
                  notes: [...(lead.notes || []), newNoteObj]
                };
              }
              return lead;
            })
          );
        } catch (noteError) {
          console.error('Error adding update note:', noteError);
        }
      }
      
      // Add additional note if provided
      if (newNote.trim()) {
        try {
          await apiService.addLeadNote(leadId, newNote);
          // Update notes in local state
          const newNoteObj = {
            content: newNote,
            createdAt: new Date().toISOString(),
            createdBy: { name: user?.name || user?.email || 'User' }
          };
          setLeads(prevLeads => 
            prevLeads.map(lead => {
              if ((lead._id || lead.id) === leadId) {
                return {
                  ...lead,
                  notes: [...(lead.notes || []), newNoteObj]
                };
              }
              return lead;
            })
          );
        } catch (noteError) {
          console.error('Error adding note:', noteError);
        }
      }
      
      // Close modal and reset
      setShowEditModal(false);
      setSelectedLead(null);
      setNewNote('');
      
      alert('Lead updated successfully!');
      
    } catch (error) {
      console.error('Error updating lead:', error);
      alert(`Error updating lead: ${error.message}`);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': { bg: '#f3f4f6', text: '#6b7280', icon: Clock },
      'contacted': { bg: '#dbeafe', text: '#2563eb', icon: Phone },
      'qualified': { bg: '#dcfce7', text: '#16a34a', icon: CheckCircle },
      'proposal': { bg: '#fef3c7', text: '#d97706', icon: AlertCircle },
      'negotiation': { bg: '#fde68a', text: '#d97706', icon: AlertCircle },
      'closed-won': { bg: '#dcfce7', text: '#16a34a', icon: CheckCircle },
      'closed-lost': { bg: '#fee2e2', text: '#dc2626', icon: AlertCircle }
    };
    return colors[status] || colors['new'];
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'converted', label: 'Converted' },
    { value: 'closed-won', label: 'Closed Won' },
    { value: 'closed-lost', label: 'Closed Lost' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      'low': { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' },
      'medium': { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' },
      'high': { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' },
      'urgent': { bg: '#fecaca', text: '#991b1b', border: '#dc2626' }
    };
    return colors[priority] || colors['medium'];
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: darkMode ? '#9ca3af' : '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h3>Loading your leads...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: darkMode ? '#374151' : 'white',
          borderRadius: '16px',
          boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          marginBottom: '32px',
          border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <User size={32} color={darkMode ? '#60a5fa' : '#3b82f6'} />
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: darkMode ? 'white' : '#111827',
                  margin: 0
                }}>
                  {user?.role === 'legal-team' ? '⚖️ Legal Team - My Leads' : user?.role === 'finance-team' ? '💰 Finance Team - My Leads' : 'My Leads'}
                </h1>
                <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
                  {user?.role === 'legal-team' ? 'Manage agreements and legal documents' : user?.role === 'finance-team' ? 'Manage invoices and payments' : 'Manage your assigned leads and track your sales pipeline'}
                </p>
              </div>
            </div>
            
            {user?.role !== 'legal-team' && user?.role !== 'finance-team' && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'grid' ? '#3b82f6' : (darkMode ? '#4b5563' : '#f3f4f6'),
                  color: viewMode === 'grid' ? 'white' : (darkMode ? '#d1d5db' : '#374151'),
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'list' ? '#3b82f6' : (darkMode ? '#4b5563' : '#f3f4f6'),
                  color: viewMode === 'list' ? 'white' : (darkMode ? '#d1d5db' : '#374151'),
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                List
              </button>
            </div>
            )}
          </div>
          
          {user?.role !== 'legal-team' && user?.role !== 'finance-team' && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }} />
              <input
                type="text"
                placeholder="Search your leads..."
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

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
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
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          )}
        </div>

        {user?.role !== 'legal-team' && user?.role !== 'finance-team' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {[
            { 
              label: 'Total Leads', 
              value: leads.length,
              icon: Target, 
              color: '#3b82f6' 
            },
            { 
              label: 'High Priority', 
              value: leads.filter(l => l.priority === 'high' || l.priority === 'urgent').length,
              icon: TrendingUp, 
              color: '#ef4444' 
            },
            { 
              label: 'This Week', 
              value: leads.filter(l => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(l.createdAt || l.createdDate) > weekAgo;
              }).length,
              icon: Calendar, 
              color: '#22c55e' 
            },
            { 
              label: 'Pipeline Value', 
              value: `₹${((leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)) / 100000).toFixed(1)}L`,
              icon: DollarSign, 
              color: '#f59e0b' 
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} style={{
                backgroundColor: darkMode ? '#374151' : 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
              }}>
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
          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#22c55e' }}>
              {filteredLeads.filter(l => ['qualified', 'proposal', 'negotiation'].includes(l.status)).length}
            </div>
            <div style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>Active Opportunities</div>
          </div>
          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
              {filteredLeads.filter(l => l.status === 'closed-won').length}
            </div>
            <div style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>Closed Won</div>
          </div>
        </div>
        )}

        {/* Leads Display */}
        <div style={{
          display: viewMode === 'grid' ? 'grid' : 'block',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(420px, 1fr))' : '1fr',
          gap: viewMode === 'grid' ? '1.5rem' : '0',
          backgroundColor: viewMode === 'list' ? (darkMode ? '#374151' : 'white') : 'transparent',
          borderRadius: viewMode === 'list' ? '16px' : '0',
          overflow: viewMode === 'list' ? 'hidden' : 'visible',
          boxShadow: viewMode === 'list' ? (darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)') : 'none',
          border: viewMode === 'list' ? (darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb') : 'none'
        }}>
          {filteredLeads.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>No leads found</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No leads assigned to you yet'}
              </p>
            </div>
          ) : (
            paginatedLeads.map((lead, index) => {
              const statusInfo = getStatusColor(lead.status);
              const priorityInfo = getPriorityColor(lead.priority);
              const StatusIcon = statusInfo.icon;
              
              if (viewMode === 'grid') {
                return (
                  <div 
                    key={lead._id || lead.id}
                    id={`lead-${lead._id || lead.id}`}
                    style={{
                      backgroundColor: highlightedLeadId === (lead._id || lead.id) ? (darkMode ? '#1e3a5f' : '#dbeafe') : (darkMode ? '#374151' : 'white'),
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: highlightedLeadId === (lead._id || lead.id) ? '0 0 0 3px #3b82f6' : (darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'),
                      border: highlightedLeadId === (lead._id || lead.id) ? '2px solid #3b82f6' : (darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'),
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = darkMode ? '0 8px 25px -8px rgba(0, 0, 0, 0.4)' : '0 8px 25px -8px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    {/* Priority Indicator */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '4px',
                      height: '100%',
                      background: priorityInfo.border
                    }} />
                    
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}>
                          {(lead.contactPerson || lead.name || 'U').split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 
                              onClick={(e) => {
                              e.stopPropagation();
                              if (onNavigate) {
                                onNavigate('lead-detail', { leadId: lead._id || lead.id, initialLead: lead });
                              }
                            }}
                            style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#3b82f6',
                            margin: 0,
                            marginBottom: '4px',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                            onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                            onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
                          >
                            {lead.contactPerson || lead.name}
                          </h3>
                          <p style={{
                            fontSize: '14px',
                            color: darkMode ? '#9ca3af' : '#6b7280',
                            margin: 0
                          }}>
                            {lead.companyName || lead.company}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: statusInfo.bg,
                          color: statusInfo.text,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <StatusIcon size={12} />
                          {lead.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Contact Info */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        fontSize: '14px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: darkMode ? '#d1d5db' : '#6b7280' }}>
                          <Mail size={16} style={{ color: '#3b82f6' }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: darkMode ? '#d1d5db' : '#6b7280' }}>
                          <Phone size={16} style={{ color: '#22c55e' }} />
                          <span>{lead.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Value & Priority */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: darkMode ? '#4b556320' : '#f8fafc',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <p style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280', margin: 0 }}>Estimated Value</p>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e', margin: 0 }}>
                          ₹{lead.estimatedValue ? Number(lead.estimatedValue).toLocaleString() : '0'}
                        </p>
                      </div>
                      <div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          backgroundColor: priorityInfo.bg,
                          color: priorityInfo.text,
                          border: `1px solid ${priorityInfo.border}`
                        }}>
                          {lead.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLead(lead);
                                setShowLeadDetails(true);
                              }}
                              style={{
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                              onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                            >
                              <Eye size={14} />
                              View
                            </button>
                            
                            
                            {lead.status === 'closed-won' && !lead.workflowStatus && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTransferLeadId(lead._id || lead.id);
                                  setShowTransferModal(true);
                                }}
                                style={{
                                  background: '#8b5cf6',
                                  color: 'white',
                                  border: 'none',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#7c3aed'}
                                onMouseLeave={(e) => e.target.style.background = '#8b5cf6'}
                              >
                                <Send size={14} />
                                Legal
                              </button>
                            )}
                      </div>
                      
                    </div>
                  </div>
                );
              } else {
                // List View
                return (
                  <div 
                    key={lead._id || lead.id}
                    id={`lead-${lead._id || lead.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '20px',
                      backgroundColor: highlightedLeadId === (lead._id || lead.id) ? (darkMode ? '#1e3a5f' : '#dbeafe') : 'transparent',
                      borderBottom: index < paginatedLeads.length - 1 ? `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}` : 'none',
                      borderLeft: highlightedLeadId === (lead._id || lead.id) ? '4px solid #3b82f6' : 'none',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                  {/* Avatar */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    marginRight: '16px',
                    flexShrink: 0
                  }}>
                    {(lead.contactPerson || lead.name || 'U').split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Lead Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigate) {
                            onNavigate('lead-detail', { leadId: lead._id || lead.id, initialLead: lead });
                          }
                        }}
                        style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#3b82f6',
                        margin: 0,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                        onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                        onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
                      >
                        {lead.contactPerson || lead.name}
                      </h3>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.text,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <StatusIcon size={12} />
                        {lead.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      marginBottom: '8px',
                      fontSize: '14px',
                      color: darkMode ? '#d1d5db' : '#6b7280'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={14} />
                        <span>{lead.companyName || lead.company}</span>
                      </div>
                      {lead.address?.city && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} />
                          <span>{lead.address.city}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={14} />
                        <span>{lead.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} />
                        <span>{lead.phone}</span>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '13px',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      <span>Value: ₹{lead.estimatedValue ? Number(lead.estimatedValue).toLocaleString() : '0'}</span>
                      <span>Created: {new Date(lead.createdAt).toLocaleDateString()}</span>
                      {lead.nextFollowUp && (
                        <span style={{ color: '#f59e0b' }}>
                          Next Follow-up: {new Date(lead.nextFollowUp).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {/* Requirements Preview */}
                    {lead.requirements && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        backgroundColor: darkMode ? '#4b556320' : '#f8fafc',
                        borderRadius: '6px',
                        border: `1px solid ${darkMode ? '#4b5563' : '#e2e8f0'}`,
                        fontSize: '13px',
                        color: darkMode ? '#d1d5db' : '#64748b'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <FileText size={12} />
                          <span style={{ fontWeight: '600' }}>Requirements:</span>
                        </div>
                        <div style={{ 
                          maxHeight: '40px', 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {lead.requirements}
                        </div>
                      </div>
                    )}
                  </div>

                    {/* Actions */}
                    <div style={{ 
                      marginLeft: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      position: 'relative',
                      zIndex: 10
                    }}>
                      {/* View Details Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                          setShowLeadDetails(true);
                        }}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                        onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                        title="View Lead Details"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      
                      {/* Edit Button */}
                      {lead.workflowStage !== 'completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLead(lead);
                        }}
                        style={{
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#d97706'}
                        onMouseLeave={(e) => e.target.style.background = '#f59e0b'}
                        title="Edit Lead"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      )}
                      
                      {lead.status === 'closed-won' && !lead.workflowStatus && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTransferLeadId(lead._id || lead.id);
                            setShowTransferModal(true);
                          }}
                          style={{
                            background: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#7c3aed'}
                          onMouseLeave={(e) => e.target.style.background = '#8b5cf6'}
                          title="Transfer to Legal Team"
                        >
                          <Send size={14} />
                          Legal
                        </button>
                      )}
                      
                      {/* Status Update */}
                    </div>
                  </div>
                );
              }
            })
          )}
        </div>
        
        {/* Pagination */}
        {filteredLeads.length > 0 && totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '2rem',
            padding: '1rem'
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: currentPage === 1 ? (darkMode ? '#4b5563' : '#e5e7eb') : '#3b82f6',
                color: currentPage === 1 ? (darkMode ? '#9ca3af' : '#6b7280') : 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: currentPage === pageNum ? '#3b82f6' : (darkMode ? '#374151' : 'white'),
                      color: currentPage === pageNum ? 'white' : (darkMode ? '#d1d5db' : '#374151'),
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: currentPage === pageNum ? '600' : '400',
                      minWidth: '40px'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                return <span key={pageNum} style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>...</span>;
              }
              return null;
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: currentPage === totalPages ? (darkMode ? '#4b5563' : '#e5e7eb') : '#3b82f6',
                color: currentPage === totalPages ? (darkMode ? '#9ca3af' : '#6b7280') : 'white',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Next
            </button>
            
            <span style={{
              marginLeft: '1rem',
              color: darkMode ? '#d1d5db' : '#6b7280',
              fontSize: '14px'
            }}>
              Page {currentPage} of {totalPages} ({filteredLeads.length} leads)
            </span>
          </div>
        )}
        
        {/* Lead Details Modal */}
        {showLeadDetails && selectedLead && (
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
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: darkMode ? '#1f2937' : 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              {/* Header */}
              <div style={{
                padding: '2rem',
                borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: darkMode ? 'white' : '#1f2937',
                    margin: 0
                  }}>
                    Lead Details
                  </h2>
                  <p style={{
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    fontSize: '0.875rem',
                    margin: 0
                  }}>
                    {selectedLead.contactPerson} - {selectedLead.companyName}
                  </p>
                </div>
                <button
                  onClick={() => setShowLeadDetails(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>
              
              {/* Content */}
              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Contact Person</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.contactPerson}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Company</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.companyName}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Email</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.email}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Phone</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.phone}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Industry</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.industry || 'Not specified'}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Lead Source</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.leadSource}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Status</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.status}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Priority</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.priority}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Estimated Value</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>₹{selectedLead.estimatedValue ? Number(selectedLead.estimatedValue).toLocaleString() : '0'}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Assigned To</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.assignedTo ? (typeof selectedLead.assignedTo === 'object' ? selectedLead.assignedTo.name : selectedLead.assignedTo) : 'Unassigned'}</p>
                    </div>
                  </div>
                  
                  {/* Requirements Section */}
                  {selectedLead.requirements && (
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151', display: 'block', marginBottom: '0.5rem' }}>Requirements / Services Needed</label>
                      <div style={{
                        padding: '1rem',
                        backgroundColor: darkMode ? '#374151' : '#f8fafc',
                        borderRadius: '8px',
                        border: `1px solid ${darkMode ? '#4b5563' : '#e2e8f0'}`,
                        color: darkMode ? '#d1d5db' : '#374151',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {selectedLead.requirements}
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Created Date</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151' }}>Created By</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? 'white' : '#1f2937' }}>{selectedLead.createdBy ? (typeof selectedLead.createdBy === 'object' ? selectedLead.createdBy.name : selectedLead.createdBy) : 'N/A'}</p>
                    </div>
                  </div>
                  
                  {/* Edit Button */}
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        console.log('Edit button clicked in modal for lead:', selectedLead._id);
                        setShowLeadDetails(false);
                        handleEditLead(selectedLead);
                      }}
                      style={{
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        background: '#3b82f6',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Edit size={16} />
                      Edit Lead
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Lead Modal */}
        {showEditModal && selectedLead && (
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
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: darkMode ? '#1f2937' : 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              {/* Header */}
              <div style={{
                padding: '1.5rem',
                borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  margin: 0
                }}>
                  Edit Lead: {selectedLead.companyName}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Contact Information */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: darkMode ? '#f3f4f6' : '#1f2937',
                    marginBottom: '1rem',
                    borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    paddingBottom: '0.5rem'
                  }}>Contact Information</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: darkMode ? '#d1d5db' : '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        value={editData.contactPerson}
                        onChange={(e) => setEditData({...editData, contactPerson: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          background: darkMode ? '#374151' : 'white',
                          color: darkMode ? 'white' : '#1f2937',
                          fontSize: '1rem'
                        }}
                        placeholder="Enter contact person name"
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: darkMode ? '#d1d5db' : '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={editData.companyName}
                        onChange={(e) => setEditData({...editData, companyName: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          background: darkMode ? '#374151' : 'white',
                          color: darkMode ? 'white' : '#1f2937',
                          fontSize: '1rem'
                        }}
                        placeholder="Enter company name"
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: darkMode ? '#d1d5db' : '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          background: darkMode ? '#374151' : 'white',
                          color: darkMode ? 'white' : '#1f2937',
                          fontSize: '1rem'
                        }}
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: darkMode ? '#d1d5db' : '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          background: darkMode ? '#374151' : 'white',
                          color: darkMode ? 'white' : '#1f2937',
                          fontSize: '1rem'
                        }}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Business Information */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: darkMode ? '#f3f4f6' : '#1f2937',
                    marginBottom: '1rem',
                    borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    paddingBottom: '0.5rem'
                  }}>Business Information</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: darkMode ? '#d1d5db' : '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        Industry
                      </label>
                      <input
                        type="text"
                        value={editData.industry}
                        onChange={(e) => setEditData({...editData, industry: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          background: darkMode ? '#374151' : 'white',
                          color: darkMode ? 'white' : '#1f2937',
                          fontSize: '1rem'
                        }}
                        placeholder="e.g., Technology, Healthcare"
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: darkMode ? '#d1d5db' : '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        Lead Source
                      </label>
                      <select
                        value={editData.leadSource}
                        onChange={(e) => setEditData({...editData, leadSource: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          background: darkMode ? '#374151' : 'white',
                          color: darkMode ? 'white' : '#1f2937',
                          fontSize: '1rem'
                        }}
                      >
                        <option value="">Select source</option>
                        <option value="website">Website</option>
                        <option value="google">Google</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="twitter">Twitter</option>
                        <option value="youtube">YouTube</option>
                        <option value="referral">Referral</option>
                        <option value="cold-call">Cold Call</option>
                        <option value="email-campaign">Email Campaign</option>
                        <option value="trade-show">Trade Show</option>
                        <option value="advertisement">Advertisement</option>
                        <option value="direct-mail">Direct Mail</option>
                        <option value="partner">Partner</option>
                        <option value="webinar">Webinar</option>
                        <option value="content-marketing">Content Marketing</option>
                        <option value="seo">SEO</option>
                        <option value="ppc">PPC</option>
                        <option value="social-media">Social Media</option>
                        <option value="word-of-mouth">Word of Mouth</option>
                        <option value="existing-customer">Existing Customer</option>
                        <option value="walk-in">Walk-in</option>
                        <option value="other">Other</option>
                      </select>
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
                      Estimated Value (₹)
                    </label>
                    <input
                      type="number"
                      value={editData.estimatedValue}
                      onChange={(e) => setEditData({...editData, estimatedValue: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        background: darkMode ? '#374151' : 'white',
                        color: darkMode ? 'white' : '#1f2937',
                        fontSize: '1rem'
                      }}
                      placeholder="Enter estimated deal value"
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
                      Requirements / Services Needed
                    </label>
                    <textarea
                      value={editData.requirements}
                      onChange={(e) => setEditData({...editData, requirements: e.target.value})}
                      rows="4"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        background: darkMode ? '#374151' : 'white',
                        color: darkMode ? 'white' : '#1f2937',
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                      placeholder="Describe the services or products they need..."
                    />
                  </div>
                </div>
                
                {/* Lead Management */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: darkMode ? '#f3f4f6' : '#1f2937',
                    marginBottom: '1rem',
                    borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    paddingBottom: '0.5rem'
                  }}>Lead Management</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: darkMode ? '#d1d5db' : '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        Status
                      </label>
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData({...editData, status: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          background: darkMode ? '#374151' : 'white',
                          color: darkMode ? 'white' : '#1f2937',
                          fontSize: '1rem'
                        }}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="proposal">Proposal</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="closed-won">Closed Won</option>
                        <option value="closed-lost">Closed Lost</option>
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
                        Priority
                      </label>
                      <select
                        value={editData.priority}
                        onChange={(e) => setEditData({...editData, priority: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          background: darkMode ? '#374151' : 'white',
                          color: darkMode ? 'white' : '#1f2937',
                          fontSize: '1rem'
                        }}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notes History */}
                {selectedLead.notes && selectedLead.notes.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Notes History ({selectedLead.notes.length})
                    </label>
                    <div style={{
                      maxHeight: '150px',
                      overflowY: 'auto',
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      padding: '0.5rem'
                    }}>
                      {selectedLead.notes.slice().reverse().map((note, index) => (
                        <div key={index} style={{
                          padding: '0.5rem',
                          marginBottom: '0.5rem',
                          background: darkMode ? '#4b5563' : '#f9fafb',
                          borderRadius: '6px',
                          borderLeft: '3px solid #3b82f6'
                        }}>
                          <div style={{
                            fontSize: '0.75rem',
                            color: darkMode ? '#9ca3af' : '#6b7280',
                            marginBottom: '0.25rem'
                          }}>
                            {note.createdBy?.name || 'User'} • {new Date(note.createdAt).toLocaleString('en-IN')}
                          </div>
                          <div style={{
                            fontSize: '0.875rem',
                            color: darkMode ? '#d1d5db' : '#374151'
                          }}>
                            {note.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Address Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: darkMode ? '#f3f4f6' : '#1f2937',
                    marginBottom: '1rem',
                    borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    paddingBottom: '0.5rem'
                  }}>📍 Address Information</h4>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '0.5rem'
                    }}>Street Address</label>
                    <input
                      type="text"
                      value={editData.address.street}
                      onChange={(e) => setEditData({...editData, address: {...editData.address, street: e.target.value}})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        background: darkMode ? '#374151' : 'white',
                        color: darkMode ? 'white' : '#1f2937',
                        fontSize: '1rem'
                      }}
                      placeholder="Enter street address"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: darkMode ? '#d1d5db' : '#374151',
                        marginBottom: '0.5rem'
                      }}>City</label>
                      <input
                        type="text"
                        value={editData.address.city}
                        onChange={(e) => setEditData({...editData, address: {...editData.address, city: e.target.value}})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          background: darkMode ? '#374151' : 'white',
                          color: darkMode ? 'white' : '#1f2937',
                          fontSize: '1rem'
                        }}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: darkMode ? '#d1d5db' : '#374151',
                        marginBottom: '0.5rem'
                      }}>State</label>
                      <input
                        type="text"
                        value={editData.address.state}
                        onChange={(e) => setEditData({...editData, address: {...editData.address, state: e.target.value}})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          background: darkMode ? '#374151' : 'white',
                          color: darkMode ? 'white' : '#1f2937',
                          fontSize: '1rem'
                        }}
                        placeholder="Enter state"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: darkMode ? '#d1d5db' : '#374151',
                        marginBottom: '0.5rem'
                      }}>Postal Code</label>
                      <input
                        type="text"
                        value={editData.address.postalCode}
                        onChange={(e) => setEditData({...editData, address: {...editData.address, postalCode: e.target.value}})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          background: darkMode ? '#374151' : 'white',
                          color: darkMode ? 'white' : '#1f2937',
                          fontSize: '1rem'
                        }}
                        placeholder="Enter postal code"
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: darkMode ? '#d1d5db' : '#374151',
                        marginBottom: '0.5rem'
                      }}>Country</label>
                      <input
                        type="text"
                        value={editData.address.country}
                        onChange={(e) => setEditData({...editData, address: {...editData.address, country: e.target.value}})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          background: darkMode ? '#374151' : 'white',
                          color: darkMode ? 'white' : '#1f2937',
                          fontSize: '1rem'
                        }}
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </div>

                {/* Add New Note */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Add New Note {editData.status !== originalStatus && <span style={{ color: '#ef4444' }}>* (Required)</span>}
                  </label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="e.g., Called today, no response. Will try again tomorrow."
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${editData.status !== originalStatus && !newNote.trim() ? '#ef4444' : (darkMode ? '#374151' : '#e5e7eb')}`,
                      borderRadius: '8px',
                      background: darkMode ? '#374151' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                  {editData.status !== originalStatus && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: newNote.trim().split(/\s+/).length >= 10 ? '#22c55e' : '#ef4444',
                      marginTop: '0.25rem'
                    }}>
                      {newNote.trim() ? `${newNote.trim().split(/\s+/).length} words` : 'Status changed - note is required'}
                    </div>
                  )}
                  <div style={{
                    fontSize: '0.75rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    marginTop: '0.25rem'
                  }}>
                    💡 Adding notes shows you're actively working on this lead
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '1rem'
                }}>
                  <button
                    onClick={() => {
                      console.log('Cancel clicked');
                      setShowEditModal(false);
                    }}
                    style={{
                      padding: '12px 24px',
                      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      background: 'transparent',
                      color: darkMode ? '#d1d5db' : '#374151',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Basic validation
                      if (!editData.contactPerson.trim()) {
                        alert('Contact Person is required');
                        return;
                      }
                      if (!editData.companyName.trim()) {
                        alert('Company Name is required');
                        return;
                      }
                      if (!editData.email.trim()) {
                        alert('Email is required');
                        return;
                      }
                      if (!editData.phone.trim()) {
                        alert('Phone is required');
                        return;
                      }
                      
                      console.log('Save clicked');
                      saveEditLead();
                    }}
                    disabled={editData.status !== originalStatus && !newNote.trim()}
                    style={{
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '8px',
                      background: (editData.status !== originalStatus && !newNote.trim()) ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      cursor: (editData.status !== originalStatus && !newNote.trim()) ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: (editData.status !== originalStatus && !newNote.trim()) ? 0.6 : 1
                    }}
                  >
                    <Edit size={16} />
                    Update Lead
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Transfer to Legal Modal */}
        {showTransferModal && (
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
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                marginBottom: '1rem'
              }}>
                Transfer to Legal Team?
              </h3>
              <p style={{
                color: darkMode ? '#9ca3af' : '#6b7280',
                marginBottom: '1.5rem'
              }}>
                This will transfer the lead to the Legal Team for agreement processing.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowTransferModal(false);
                    setTransferLeadId(null);
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
                  onClick={handleTransferToLegal}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#8b5cf6',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLeads;
