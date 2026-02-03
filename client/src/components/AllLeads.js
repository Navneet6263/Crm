import React, { useState, useEffect, useRef } from 'react';
import { Users, Mail, Phone, Building, Calendar, Star, User, CheckCircle, Clock, Target, Trash2, Upload, Eye, FileText, Edit, MapPin } from 'lucide-react';
import apiService from '../services/apiService';
import BulkUpload from './BulkUpload';

const AllLeads = ({ darkMode = false, crmData = {}, initialFilter = null }) => {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter || 'all');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [productFilter, setProductFilter] = useState('all');
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
  const [originalStatus, setOriginalStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const leadsFetchIdRef = useRef(0);
  const leadsAbortRef = useRef(null);

  // Get current user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(payload);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  // Fetch leads, users, and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      const fetchId = ++leadsFetchIdRef.current;
      if (leadsAbortRef.current) {
        leadsAbortRef.current.abort();
      }
      const controller = new AbortController();
      leadsAbortRef.current = controller;

      setLoading(true);
      setCurrentPage(1);
      setLeads([]);

      const leadsAccumulator = [];
      let firstPageLoaded = false;

      const usersPromise = apiService.getUsers()
        .then((usersResponse) => {
          if (fetchId !== leadsFetchIdRef.current || controller.signal.aborted) return;
          const usersList = usersResponse?.users || usersResponse || [];
          setUsers(Array.isArray(usersList) ? usersList : []);
        })
        .catch((error) => {
          if (controller.signal.aborted) return;
          console.error('Error fetching users:', error);
          if (fetchId === leadsFetchIdRef.current) {
            setUsers([]);
          }
        });

      const productsPromise = fetch(`${apiService.getApiUrl()}/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })
        .then(async (productsResponse) => {
          if (!productsResponse.ok) return;
          const productsData = await productsResponse.json();
          const productsList = Array.isArray(productsData) ? productsData : (productsData.products || productsData || []);
          if (fetchId !== leadsFetchIdRef.current || controller.signal.aborted) return;
          setProducts(productsList);
        })
        .catch((error) => {
          if (controller.signal.aborted) return;
          console.error('Error fetching products:', error);
        });

      try {
        await apiService.fetchPagedLeads({
          path: '/leads',
          params: productFilter !== 'all' ? { product: productFilter } : {},
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

        await Promise.allSettled([usersPromise, productsPromise]);

        if (fetchId !== leadsFetchIdRef.current || controller.signal.aborted) return;
        if (!leadsAccumulator.length) {
          setLeads([]);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Error fetching data:', error);
        if (fetchId === leadsFetchIdRef.current) {
          // Fallback to crmData if API fails
          setLeads(crmData.leads || []);
        }
      } finally {
        if (fetchId === leadsFetchIdRef.current && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Listen for global lead updates
    const handleLeadsUpdate = () => {
      fetchData();
    };

    window.addEventListener('leadsUpdated', handleLeadsUpdate);

    return () => {
      window.removeEventListener('leadsUpdated', handleLeadsUpdate);
      if (leadsAbortRef.current) {
        leadsAbortRef.current.abort();
      }
    };
  }, [productFilter]);

  // Filter leads based on search term, status filter, and product filter
  const filteredLeads = leads.filter(lead => {
    // First apply search filter
    const matchesSearch = !searchTerm || 
      (lead.contactPerson || lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.companyName || lead.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.phone || '').includes(searchTerm) ||
      (lead.status || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Then apply status filter
    let matchesStatus = true;
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'active') {
        matchesStatus = ['qualified', 'proposal', 'negotiation', 'contacted'].includes(lead.status);
      } else if (statusFilter === 'pending') {
        matchesStatus = ['new', 'pending'].includes(lead.status);
      } else if (statusFilter === 'closed-won') {
        matchesStatus = lead.status === 'closed-won';
      } else if (statusFilter === 'closed-lost') {
        matchesStatus = lead.status === 'closed-lost';
      } else if (statusFilter === 'unassigned') {
        matchesStatus = !lead.assignedTo;
      } else if (statusFilter === 'assigned') {
        matchesStatus = !!lead.assignedTo;
      }
    }
    
    // Apply product filter
    let matchesProduct = true;
    if (productFilter && productFilter !== 'all') {
      const leadProductId = lead.product?._id || lead.product;
      matchesProduct = leadProductId === productFilter;
    }
    
    return matchesSearch && matchesStatus && matchesProduct;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  const handleLeadSelect = (leadId) => {
    if (selectedLeadId === leadId) {
      setSelectedLeadId(null);
      setShowAssignDropdown(false);
    } else {
      setSelectedLeadId(leadId);
      setShowAssignDropdown(true);
    }
  };

  const handleBulkSelect = (leadId) => {
    setSelectedLeads(prev => {
      if (prev.includes(leadId)) {
        const newSelection = prev.filter(id => id !== leadId);
        setShowBulkActions(newSelection.length > 0);
        return newSelection;
      } else {
        const newSelection = [...prev, leadId];
        setShowBulkActions(newSelection.length > 0);
        return newSelection;
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
      setShowBulkActions(false);
    } else {
      const allIds = filteredLeads.map(lead => lead._id || lead.id);
      setSelectedLeads(allIds);
      setShowBulkActions(true);
    }
  };

  const handleBulkAssign = async (assignedUserId) => {
    if (!assignedUserId || selectedLeads.length === 0) return;
    
    try {
      const assignedUser = users.find(u => u._id === assignedUserId);
      
      // Assign all selected leads
      await Promise.all(
        selectedLeads.map(leadId => apiService.assignLead(leadId, assignedUserId))
      );
      
      // Update local state
      setLeads(prevLeads => 
        prevLeads.map(lead => {
          const leadId = lead._id || lead.id;
          return selectedLeads.includes(leadId)
            ? { ...lead, assignedTo: assignedUser }
            : lead;
        })
      );
      
      if (window.showToast) {
        window.showToast('success', `✅ ${selectedLeads.length} leads assigned to ${assignedUser?.name} successfully!`);
      } else {
        alert(`✅ ${selectedLeads.length} leads assigned to ${assignedUser?.name} successfully!`);
      }
      
      setSelectedLeads([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error bulk assigning leads:', error);
      if (window.showToast) {
        window.showToast('error', '❌ Failed to assign leads. Please try again.');
      } else {
        alert('❌ Failed to assign leads. Please try again.');
      }
    }
  };

  const handleBulkAssignToGroup = async () => {
    if (selectedLeads.length === 0) return;
    
    try {
      // Assign all selected leads to BD/Sales group
      await Promise.all(
        selectedLeads.map(leadId => apiService.assignLeadToGroup(leadId, 'sales'))
      );
      
      // Update local state
      setLeads(prevLeads => 
        prevLeads.map(lead => {
          const leadId = lead._id || lead.id;
          return selectedLeads.includes(leadId)
            ? { ...lead, assignedToGroup: 'sales', status: 'pending-acceptance' }
            : lead;
        })
      );
      
      if (window.showToast) {
        window.showToast('success', `🎯 ${selectedLeads.length} leads assigned to BD/Sales team for acceptance!`);
      } else {
        alert(`🎯 ${selectedLeads.length} leads assigned to BD/Sales team for acceptance!`);
      }
      
      setSelectedLeads([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error bulk assigning to group:', error);
      if (window.showToast) {
        window.showToast('error', '❌ Failed to assign leads to group. Please try again.');
      } else {
        alert('❌ Failed to assign leads to group. Please try again.');
      }
    }
  };

  const handleBulkUnassign = async () => {
    if (selectedLeads.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to unassign ${selectedLeads.length} leads?`)) {
      return;
    }
    
    try {
      // Unassign all selected leads by setting assignedTo to null
      await Promise.all(
        selectedLeads.map(leadId => 
          fetch(`${apiService.getApiUrl()}/leads/${leadId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ assignedTo: null })
          })
        )
      );
      
      // Update local state
      setLeads(prevLeads => 
        prevLeads.map(lead => {
          const leadId = lead._id || lead.id;
          return selectedLeads.includes(leadId)
            ? { ...lead, assignedTo: null }
            : lead;
        })
      );
      
      if (window.showToast) {
        window.showToast('success', `✅ ${selectedLeads.length} leads unassigned successfully!`);
      } else {
        alert(`✅ ${selectedLeads.length} leads unassigned successfully!`);
      }
      
      setSelectedLeads([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error bulk unassigning leads:', error);
      if (window.showToast) {
        window.showToast('error', '❌ Failed to unassign leads. Please try again.');
      } else {
        alert('❌ Failed to unassign leads. Please try again.');
      }
    }
  };

  const assignLeadHandler = async (e) => {
    const assignedUserId = e.target.value;
    if (assignedUserId && selectedLeadId) {
      try {
        const assignedUser = users.find(u => u._id === assignedUserId);
        
        // Call API to assign lead
        await apiService.assignLead(selectedLeadId, assignedUserId);
        
        // Update local state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            (lead._id || lead.id) === selectedLeadId 
              ? { ...lead, assignedTo: assignedUser }
              : lead
          )
        );
        
        // Show success notification
        if (window.showToast) {
          window.showToast('success', `✅ Lead assigned to ${assignedUser?.name} successfully!`);
        } else {
          alert(`✅ Lead assigned to ${assignedUser?.name} successfully!`);
        }
      } catch (error) {
        console.error('Error assigning lead:', error);
        if (window.showToast) {
          window.showToast('error', '❌ Failed to assign lead. Please try again.');
        } else {
          alert('❌ Failed to assign lead. Please try again.');
        }
      }
      
      setShowAssignDropdown(false);
      setSelectedLeadId(null);
    }
  };

  const handleDeleteLead = async (leadId, leadName) => {
    if (window.confirm(`Are you sure you want to delete lead "${leadName}"? This action cannot be undone.`)) {
      try {
        await apiService.deleteLead(leadId);
        setLeads(prevLeads => prevLeads.filter(lead => (lead._id || lead.id) !== leadId));
        if (window.showToast) {
          window.showToast('success', '✅ Lead deleted successfully!');
        } else {
          alert('✅ Lead deleted successfully!');
        }
        
        // Clear selection if deleted lead was selected
        if (selectedLeadId === leadId) {
          setSelectedLeadId(null);
          setShowAssignDropdown(false);
        }
      } catch (error) {
        console.error('Error deleting lead:', error);
        if (window.showToast) {
          window.showToast('error', '❌ Failed to delete lead. Please try again.');
        } else {
          alert('❌ Failed to delete lead. Please try again.');
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
        ...originalLead, // Keep all existing data
        contactPerson: editData.contactPerson,
        name: editData.contactPerson, // For backward compatibility
        companyName: editData.companyName,
        company: editData.companyName, // For backward compatibility
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
        lastUpdatedBy: currentUser?.name || currentUser?.email || 'User'
      };
      
      // Update lead in backend
      await apiService.updateLead(leadId, updatedLeadData);
      
      // Update local state immediately (no need to refetch)
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          (lead._id || lead.id) === leadId ? updatedLeadData : lead
        )
      );
      
      // Add update history note if there were changes
      if (changes.length > 0) {
        const updateNote = `Lead updated by ${currentUser?.name || currentUser?.email || 'User'} at ${new Date().toLocaleString('en-IN')}:\n\nChanges made:\n${changes.map(change => `• ${change}`).join('\n')}`;
        try {
          await apiService.addLeadNote(leadId, updateNote);
          // Update notes in local state too
          const newNoteObj = {
            content: updateNote,
            createdAt: new Date().toISOString(),
            createdBy: { name: currentUser?.name || currentUser?.email || 'User' }
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
            createdBy: { name: currentUser?.name || currentUser?.email || 'User' }
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
      'qualified': { bg: '#dcfce7', text: '#16a34a' },
      'contacted': { bg: '#dbeafe', text: '#2563eb' }, 
      'proposal': { bg: '#fef3c7', text: '#d97706' },
      'new': { bg: '#f3f4f6', text: '#6b7280' }
    };
    return colors[status] || { bg: '#f3f4f6', text: '#6b7280' };
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': { bg: '#fee2e2', text: '#dc2626' },
      'medium': { bg: '#fef3c7', text: '#d97706' },
      'low': { bg: '#f0f9ff', text: '#0284c7' }
    };
    return colors[priority] || { bg: '#f3f4f6', text: '#6b7280' };
  };

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <Users size={32} color={darkMode ? '#60a5fa' : '#3b82f6'} />
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: darkMode ? 'white' : '#111827',
              margin: 0
            }}>
              {statusFilter === 'all' ? 'All Leads' :
               statusFilter === 'active' ? 'Active Leads' :
               statusFilter === 'pending' ? 'Pending Leads' :
               statusFilter === 'closed-won' ? 'Closed Won Leads' :
               statusFilter === 'closed-lost' ? 'Closed Lost Leads' :
               statusFilter === 'unassigned' ? 'Unassigned Leads' :
               statusFilter === 'assigned' ? 'Assigned Leads' : 'All Leads'}
            </h1>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <p style={{
                fontSize: '18px',
                color: darkMode ? '#d1d5db' : '#6b7280',
                margin: 0
              }}>
                {statusFilter === 'all' ? 
                  (currentUser && ['admin', 'super-admin', 'manager'].includes(currentUser.role) 
                    ? 'Select a lead to assign to team members' 
                    : 'All leads in the system') :
                 statusFilter === 'active' ? 'Leads that are actively being worked on' :
                 statusFilter === 'pending' ? 'New leads that need attention' :
                 statusFilter === 'closed-won' ? 'Successfully closed deals' :
                 statusFilter === 'closed-lost' ? 'Lost opportunities' :
                 statusFilter === 'unassigned' ? 'Leads waiting for assignment' :
                 statusFilter === 'assigned' ? 'Leads assigned to team members' : 'Filtered leads'}
              </p>
              
              {/* Bulk Upload Button */}
              <button
                onClick={() => {
                  if (window.showToast) {
                    window.showToast('info', '🚀 Coming Soon! Bulk upload feature is under development.');
                  } else {
                    alert('🚀 Coming Soon! Bulk upload feature is under development.');
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <Upload size={16} />
                Bulk Upload
              </button>
            </div>
            
            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Product Filter Dropdown */}
              <select
                value={productFilter}
                onChange={(e) => {
                  setProductFilter(e.target.value);
                }}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  backgroundColor: darkMode ? '#1f2937' : 'white',
                  color: darkMode ? 'white' : '#374151',
                  fontSize: '14px',
                  minWidth: '180px',
                  marginRight: '0.5rem'
                }}
              >
                <option value="all">All Products ({leads.length})</option>
                {products.map(product => {
                  const count = leads.filter(l => {
                    const productId = l.product?._id || l.product;
                    return productId === product._id;
                  }).length;
                  return (
                    <option key={product._id} value={product._id}>
                      {product.icon} {product.name} ({count})
                    </option>
                  );
                })}
              </select>
              
              {/* Status Filter Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  backgroundColor: darkMode ? '#1f2937' : 'white',
                  color: darkMode ? 'white' : '#374151',
                  fontSize: '14px',
                  minWidth: '150px'
                }}
              >
                <option value="all">All Status ({leads.length})</option>
                <option value="active">Active ({leads.filter(l => ['qualified', 'proposal', 'negotiation', 'contacted'].includes(l.status)).length})</option>
                <option value="pending">Pending ({leads.filter(l => ['new', 'pending'].includes(l.status)).length})</option>
                <option value="closed-won">Closed Won ({leads.filter(l => l.status === 'closed-won').length})</option>
                <option value="closed-lost">Closed Lost ({leads.filter(l => l.status === 'closed-lost').length})</option>
                <option value="assigned">Assigned ({leads.filter(l => l.assignedTo).length})</option>
                <option value="unassigned">Unassigned ({leads.filter(l => !l.assignedTo).length})</option>
              </select>
              
              {/* Search Bar */}
              <div style={{ position: 'relative', width: '300px' }}>
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '8px',
                    backgroundColor: darkMode ? '#1f2937' : 'white',
                    color: darkMode ? 'white' : '#374151',
                    fontSize: '14px'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}>
                  🔍
                </div>
              </div>
            </div>
          </div>
          
          {/* Bulk Actions - Only for admin/super-admin/manager */}
          {showBulkActions && currentUser && ['admin', 'super-admin', 'manager'].includes(currentUser.role) && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
              borderRadius: '12px',
              border: `2px solid ${darkMode ? '#60a5fa' : '#3b82f6'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: darkMode ? '#d1d5db' : '#374151',
                  margin: 0
                }}>
                  {selectedLeads.length} leads selected
                </p>
                <select 
                  onChange={(e) => {
                    if (e.target.value === 'bd-group') {
                      handleBulkAssignToGroup();
                    } else {
                      handleBulkAssign(e.target.value);
                    }
                    e.target.value = '';
                  }}
                  style={{
                    padding: '0.5rem',
                    border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                    borderRadius: '8px',
                    backgroundColor: darkMode ? '#1f2937' : 'white',
                    color: darkMode ? 'white' : '#374151'
                  }}
                >
                  <option value="">Bulk assign to...</option>
                  <option value="bd-group">🎯 BD/Sales Team (Group)</option>
                  <optgroup label="Individual Assignment">
                    {users.filter(u => ['sales', 'manager', 'senior-manager'].includes(u.role)).map(user => (
                      <option key={user._id} value={user._id}>
                        👤 {user.name} ({user.role})
                      </option>
                    ))}
                  </optgroup>
                </select>
                <button
                  onClick={handleBulkUnassign}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Unassign All
                </button>
                <button
                  onClick={() => {
                    setSelectedLeads([]);
                    setShowBulkActions(false);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    color: darkMode ? '#d1d5db' : '#374151',
                    border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
          
          {/* Single Lead Assign Dropdown - Only for admin/super-admin/manager */}
          {showAssignDropdown && selectedLeadId && currentUser && ['admin', 'super-admin', 'manager'].includes(currentUser.role) && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
              borderRadius: '12px',
              border: `2px solid ${darkMode ? '#60a5fa' : '#3b82f6'}`
            }}>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: darkMode ? '#d1d5db' : '#374151',
                marginBottom: '0.5rem'
              }}>
                Assign Lead #{selectedLeadId} to:
              </p>
              <select 
                onChange={assignLeadHandler}
                style={{
                  width: '200px',
                  padding: '0.5rem',
                  border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                  borderRadius: '8px',
                  backgroundColor: darkMode ? '#1f2937' : 'white',
                  color: darkMode ? 'white' : '#374151'
                }}
              >
                <option value="">Select team member</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
              {filteredLeads.length}
            </div>
            <div style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
              {searchTerm ? 'Found Leads' : 'Total Leads'}
            </div>
          </div>
          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#22c55e' }}>
              {filteredLeads.filter(l => l.assignedTo).length}
            </div>
            <div style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>Assigned</div>
          </div>
          <div style={{
            backgroundColor: darkMode ? '#374151' : 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
              {filteredLeads.filter(l => !l.assignedTo).length}
            </div>
            <div style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>Unassigned</div>
          </div>
        </div>

        {/* Leads List */}
        <div style={{
          backgroundColor: darkMode ? '#374151' : 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {/* Bulk Select Header - Only for admin/super-admin/manager */}
          {currentUser && ['admin', 'super-admin', 'manager'].includes(currentUser.role) && filteredLeads.length > 0 && (
            <div style={{
              padding: '1rem',
              borderBottom: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
              backgroundColor: darkMode ? '#4b5563' : '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: darkMode ? '#d1d5db' : '#374151'
              }}>
                <input
                  type="checkbox"
                  checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                  onChange={handleSelectAll}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                Select All ({filteredLeads.length} leads)
              </label>
              {selectedLeads.length > 0 && (
                <span style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {selectedLeads.length} selected
                </span>
              )}
            </div>
          )}
          {loading ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Loading leads...</h3>
            </div>
          ) : (
            paginatedLeads.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>No leads found</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {searchTerm ? `No results for "${searchTerm}"` : 'No leads available'}
              </p>
            </div>
          ) : paginatedLeads.map((lead, index) => {
            const leadId = lead._id || lead.id;
            return (
            <div 
              key={leadId}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px',
                borderBottom: index < paginatedLeads.length - 1 ? `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}` : 'none',
                transition: 'all 0.2s',
                backgroundColor: selectedLeadId === leadId 
                  ? (darkMode ? '#4b5563' : '#f0f9ff') 
                  : selectedLeads.includes(leadId)
                  ? (darkMode ? '#3b82f620' : '#dbeafe')
                  : 'transparent',
                borderLeft: selectedLeadId === leadId 
                  ? `4px solid ${darkMode ? '#60a5fa' : '#3b82f6'}` 
                  : selectedLeads.includes(leadId)
                  ? `4px solid ${darkMode ? '#3b82f6' : '#60a5fa'}`
                  : '4px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (selectedLeadId !== leadId && !selectedLeads.includes(leadId)) {
                  e.currentTarget.style.backgroundColor = darkMode ? '#4b556320' : '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedLeadId !== leadId && !selectedLeads.includes(leadId)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {/* Bulk Select Checkbox - Only for admin/super-admin/manager */}
              {currentUser && ['admin', 'super-admin', 'manager'].includes(currentUser.role) && (
                <div style={{ marginRight: '12px' }}>
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(leadId)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleBulkSelect(leadId);
                    }}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              )}
              {/* Avatar */}
              <div 
                onClick={() => currentUser && ['admin', 'super-admin', 'manager'].includes(currentUser.role) ? handleLeadSelect(leadId) : null}
                style={{
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
                  flexShrink: 0,
                  cursor: currentUser && ['admin', 'super-admin', 'manager'].includes(currentUser.role) ? 'pointer' : 'default'
                }}>
                {(lead.contactPerson || lead.name || 'U').split(' ').map(n => n[0]).join('')}
              </div>

              {/* Lead Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  {/* Product Badge */}
                  {lead.product && (
                    <span 
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: (typeof lead.product === 'object' && lead.product.color) || 
                                       (products.find(p => p._id === lead.product)?.color) || '#22c55e',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={`Product ID: ${typeof lead.product === 'object' ? lead.product._id : lead.product}`}
                    >
                      {(typeof lead.product === 'object' && lead.product.icon) || 
                       (products.find(p => p._id === lead.product)?.icon) || '🔵'} 
                      {(typeof lead.product === 'object' && lead.product.name) || 
                       (products.find(p => p._id === lead.product)?.name) || 'Product'}
                    </span>
                  )}
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: darkMode ? 'white' : '#111827',
                    margin: 0
                  }}>
                    {lead.contactPerson || lead.name}
                  </h3>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: getStatusColor(lead.status).bg,
                    color: getStatusColor(lead.status).text
                  }}>
                    {lead.status.toUpperCase()}
                  </span>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: getPriorityColor(lead.priority).bg,
                    color: getPriorityColor(lead.priority).text
                  }}>
                    {lead.priority.toUpperCase()}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`mailto:${lead.email}`, '_blank');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        borderRadius: '4px',
                        color: darkMode ? '#60a5fa' : '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={`Send email to ${lead.email}`}
                    >
                      <Mail size={14} />
                      <span>{lead.email}</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`tel:${lead.phone}`, '_self');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        borderRadius: '4px',
                        color: darkMode ? '#34d399' : '#22c55e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={`Call ${lead.phone}`}
                    >
                      <Phone size={14} />
                      <span>{lead.phone}</span>
                    </button>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '13px',
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}>
                  <span>Source: {lead.leadSource || lead.source}</span>
                  <span>Value: ₹{lead.estimatedValue ? Number(lead.estimatedValue).toLocaleString() : (lead.value || '0')}</span>
                  <span>Created: {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
                  {lead.createdBy && (
                    <span>By: {typeof lead.createdBy === 'object' ? lead.createdBy.name : lead.createdBy}</span>
                  )}
                  {lead.notes && lead.notes.length > 0 && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      background: darkMode ? '#3b82f620' : '#dbeafe',
                      color: darkMode ? '#60a5fa' : '#3b82f6',
                      borderRadius: '12px',
                      fontWeight: '600'
                    }}>
                      <FileText size={12} />
                      {lead.notes.length} {lead.notes.length === 1 ? 'note' : 'notes'}
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

              {/* Assignment Status & Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: '16px'
              }}>
                {/* View Details Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLead(lead);
                    setShowLeadDetails(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    color: darkMode ? '#60a5fa' : '#3b82f6',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkMode ? '#3b82f620' : '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="View Lead Details"
                >
                  <Eye size={16} />
                </button>
                
                {/* Edit Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditLead(lead);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    color: darkMode ? '#f59e0b' : '#d97706',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkMode ? '#f59e0b20' : '#fef3c7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="Edit Lead"
                >
                  <Edit size={16} />
                </button>
                {lead.assignedTo ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#22c55e',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <User size={16} />
                    <span>{typeof lead.assignedTo === 'object' ? lead.assignedTo.name : lead.assignedTo}</span>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    fontSize: '14px'
                  }}>
                    <Clock size={16} />
                    <span>Unassigned</span>
                  </div>
                )}
                
                {/* Delete Button - Only show if user is admin/super-admin/manager OR owner of the lead */}
                {currentUser && (
                  (['admin', 'super-admin', 'manager'].includes(currentUser.role) || 
                   (lead.createdBy && (lead.createdBy._id || lead.createdBy) === currentUser.id))
                ) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLead(leadId, lead.contactPerson || lead.name);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      color: '#ef4444',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = darkMode ? '#7f1d1d20' : '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Delete Lead"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                
                {selectedLeadId === leadId && (
                  <CheckCircle size={20} color="#3b82f6" />
                )}
              </div>
            </div>
          );
        }))}
        
        {/* Pagination */}
        {filteredLeads.length > 0 && totalPages > 1 && (
          <div style={{
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            borderTop: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
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
        </div>
        
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
                  
                  {/* Notes History */}
                  {selectedLead.notes && selectedLead.notes.length > 0 && (
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#374151', display: 'block', marginBottom: '0.5rem' }}>
                        Activity Notes ({selectedLead.notes.length})
                      </label>
                      <div style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        padding: '0.5rem'
                      }}>
                        {selectedLead.notes.slice().reverse().map((note, index) => (
                          <div key={index} style={{
                            padding: '0.75rem',
                            marginBottom: '0.5rem',
                            background: darkMode ? '#4b5563' : '#f9fafb',
                            borderRadius: '6px',
                            borderLeft: '3px solid #3b82f6'
                          }}>
                            <div style={{
                              fontSize: '0.75rem',
                              color: darkMode ? '#9ca3af' : '#6b7280',
                              marginBottom: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span style={{ fontWeight: '600' }}>{note.createdBy?.name || 'User'}</span>
                              <span>•</span>
                              <span>{new Date(note.createdAt).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{
                              fontSize: '0.875rem',
                              color: darkMode ? '#d1d5db' : '#374151',
                              lineHeight: '1.5'
                            }}>
                              {note.content}
                            </div>
                          </div>
                        ))}
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

              <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                  
                  <div>
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
                      Add New Note {editData.status !== originalStatus && <span style={{ color: '#ef4444' }}>* (Required)</span>}
                    </label>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note about this lead..."
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
                  </div>

                  {/* Address Section */}
                  <div style={{
                    paddingTop: '1rem',
                    borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    marginTop: '1rem'
                  }}>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: darkMode ? '#d1d5db' : '#374151',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      📍 Address Information
                    </h4>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: darkMode ? '#d1d5db' : '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        Street Address
                      </label>
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
                          fontSize: '1rem',
                          marginBottom: '1rem'
                        }}
                        placeholder="Enter street address"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: darkMode ? '#d1d5db' : '#374151',
                          marginBottom: '0.5rem'
                        }}>
                          City
                        </label>
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
                        }}>
                          State
                        </label>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: darkMode ? '#d1d5db' : '#374151',
                          marginBottom: '0.5rem'
                        }}>
                          Postal Code
                        </label>
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
                        }}>
                          Country
                        </label>
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
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '1rem',
                  marginTop: '1.5rem'
                }}>
                  <button
                    onClick={() => setShowEditModal(false)}
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
                    onClick={saveEditLead}
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
        
        {/* Bulk Upload Modal */}
        {showBulkUpload && (
          <BulkUpload
            darkMode={darkMode}
            onClose={() => setShowBulkUpload(false)}
            onUploadComplete={() => {
              setShowBulkUpload(false);
              // Refresh leads after upload
              const fetchLeads = async () => {
                try {
                  const leadsResponse = await apiService.getLeads();
                  const leadsData = leadsResponse.leads || leadsResponse || [];
                  setLeads(Array.isArray(leadsData) ? leadsData : []);
                } catch (error) {
                  console.error('Error refreshing leads:', error);
                }
              };
              fetchLeads();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AllLeads;
