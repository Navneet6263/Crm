import React, { useEffect, useState } from 'react';
import customerService from '../services/customerService';
import CustomerFormModal from './CustomerFormModal';
import { trackCustomerConverted } from '../utils/ga';
import { showToast } from './ToastNotification';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  FileText,
  DollarSign,
  Phone,
  Mail,
  Download,
  Clock,
  CheckSquare,
  Loader,
  Building
} from 'lucide-react';

const CustomerManagement = ({ darkMode, userRole, updateCrmData }) => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [followUpFilter, setFollowUpFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [followUpDraft, setFollowUpDraft] = useState({ title: '', dueDate: '', description: '' });

  const canManageCustomers = ['super-admin', 'admin', 'manager', 'senior-manager', 'sales-manager'].includes(userRole);

  const getCustomerId = (customer) => customer?._id || customer?.id;
  const getCustomerName = (customer) => customer?.name || 'Unknown Customer';
  const getCompanyName = (customer) => customer?.companyName || customer?.company || 'No Company';
  const getStatus = (customer) => customer?.status || 'active';
  const getType = (customer) => customer?.customerType || 'business';
  const getTotalValue = (customer) => Number(customer?.totalValue || 0);
  const getAssigneeLabel = (customer) => {
    if (!customer?.assignedTo) return 'Unassigned';
    if (typeof customer.assignedTo === 'object') return customer.assignedTo.name || customer.assignedTo.email || 'Unassigned';
    return String(customer.assignedTo);
  };
  const getLatestNote = (customer) => {
    if (Array.isArray(customer?.noteHistory) && customer.noteHistory.length > 0) {
      const latest = [...customer.noteHistory].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
      return latest?.content || customer?.notes || '';
    }
    return customer?.notes || '';
  };
  const getPendingFollowUps = (customer) => Array.isArray(customer?.followUps) ? customer.followUps.filter((item) => item?.status === 'pending') : [];
  const getCompletedFollowUps = (customer) => Array.isArray(customer?.followUps) ? customer.followUps.filter((item) => item?.status === 'completed') : [];
  const getNextFollowUp = (customer) => {
    if (customer?.nextFollowUp) return customer.nextFollowUp;
    const nextPending = getPendingFollowUps(customer)
      .filter((item) => item?.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
    return nextPending?.dueDate || null;
  };
  const isOverdue = (dateValue) => {
    if (!dateValue) return false;
    const dueDate = new Date(dateValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !Number.isNaN(dueDate.getTime()) && dueDate < today;
  };
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not set';
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString('en-IN');
  };
  const formatDateTime = (dateValue) => {
    if (!dateValue) return 'Not set';
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString('en-IN');
  };
  const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const syncCustomers = (nextCustomers) => {
    setCustomers(nextCustomers);
    if (typeof updateCrmData === 'function') updateCrmData({ customers: nextCustomers });
  };

  const replaceCustomer = (updatedCustomer) => {
    const updatedId = getCustomerId(updatedCustomer);
    const nextCustomers = customers.some((customer) => getCustomerId(customer) === updatedId)
      ? customers.map((customer) => (getCustomerId(customer) === updatedId ? updatedCustomer : customer))
      : [updatedCustomer, ...customers];
    syncCustomers(nextCustomers);
    if (selectedCustomer && getCustomerId(selectedCustomer) === updatedId) setSelectedCustomer(updatedCustomer);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerService.getCustomers({ limit: 200 });
      const items = Array.isArray(response) ? response : (response?.customers || []);
      syncCustomers(items);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.message);
      syncCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    let nextCustomers = [...customers];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      nextCustomers = nextCustomers.filter((customer) => [
        getCustomerName(customer),
        getCompanyName(customer),
        customer?.email,
        customer?.phone,
        customer?.industry,
        getAssigneeLabel(customer),
        getLatestNote(customer)
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query)));
    }

    if (statusFilter !== 'all') {
      nextCustomers = nextCustomers.filter((customer) => getStatus(customer) === statusFilter);
    }

    if (followUpFilter !== 'all') {
      nextCustomers = nextCustomers.filter((customer) => {
        const pending = getPendingFollowUps(customer);
        if (followUpFilter === 'pending') return pending.length > 0;
        if (followUpFilter === 'completed') return getCompletedFollowUps(customer).length > 0;
        if (followUpFilter === 'overdue') return pending.some((item) => isOverdue(item?.dueDate));
        if (followUpFilter === 'none') return !customer?.followUps || customer.followUps.length === 0;
        return true;
      });
    }

    nextCustomers.sort((a, b) => {
      if (sortBy === 'name') return getCustomerName(a).localeCompare(getCustomerName(b));
      if (sortBy === 'value') return getTotalValue(b) - getTotalValue(a);
      if (sortBy === 'followup') {
        const aDate = getNextFollowUp(a) ? new Date(getNextFollowUp(a)).getTime() : Number.MAX_SAFE_INTEGER;
        const bDate = getNextFollowUp(b) ? new Date(getNextFollowUp(b)).getTime() : Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
      }
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    });

    setFilteredCustomers(nextCustomers);
  }, [customers, searchTerm, statusFilter, followUpFilter, sortBy]);

  const handleViewCustomer = async (customer) => {
    try {
      const detailed = await customerService.getCustomerById(getCustomerId(customer));
      setSelectedCustomer(detailed);
      setShowCustomerModal(true);
      setNoteDraft('');
      setFollowUpDraft({ title: '', dueDate: '', description: '' });
    } catch (err) {
      showToast('error', err.message || 'Failed to load customer details');
    }
  };

  const handleCustomerAdded = async (customer) => {
    replaceCustomer(customer);
    trackCustomerConverted({ value: getTotalValue(customer), source: 'manual_entry', industry: customer.industry || 'General' });
    showToast('success', 'Customer added successfully');
    await fetchCustomers();
  };

  const handleCustomerUpdated = async (customer) => {
    replaceCustomer(customer);
    showToast('success', 'Customer updated successfully');
    await fetchCustomers();
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowAddModal(true);
  };

  const handleDeleteCustomer = async (customer) => {
    if (!window.confirm(`Delete customer "${getCustomerName(customer)}"?`)) return;
    try {
      await customerService.deleteCustomer(getCustomerId(customer));
      const nextCustomers = customers.filter((item) => getCustomerId(item) !== getCustomerId(customer));
      syncCustomers(nextCustomers);
      if (selectedCustomer && getCustomerId(selectedCustomer) === getCustomerId(customer)) {
        setSelectedCustomer(null);
        setShowCustomerModal(false);
      }
      showToast('success', 'Customer deleted successfully');
    } catch (err) {
      showToast('error', err.message || 'Failed to delete customer');
    }
  };

  const handleAddNote = async () => {
    if (!selectedCustomer || !noteDraft.trim()) return;
    try {
      const updated = await customerService.addNote(getCustomerId(selectedCustomer), noteDraft.trim());
      replaceCustomer(updated);
      setSelectedCustomer(updated);
      setNoteDraft('');
      showToast('success', 'Customer note added');
    } catch (err) {
      showToast('error', err.message || 'Failed to add note');
    }
  };

  const handleAddFollowUp = async () => {
    if (!selectedCustomer || !followUpDraft.title.trim() || !followUpDraft.dueDate) {
      showToast('error', 'Follow-up title and due date are required');
      return;
    }
    try {
      const updated = await customerService.addFollowUp(getCustomerId(selectedCustomer), {
        title: followUpDraft.title.trim(),
        dueDate: followUpDraft.dueDate,
        description: followUpDraft.description.trim()
      });
      replaceCustomer(updated);
      setSelectedCustomer(updated);
      setFollowUpDraft({ title: '', dueDate: '', description: '' });
      showToast('success', 'Follow-up added');
    } catch (err) {
      showToast('error', err.message || 'Failed to add follow-up');
    }
  };

  const handleUpdateFollowUpStatus = async (followUpId, status) => {
    try {
      const updated = await customerService.updateFollowUpStatus(getCustomerId(selectedCustomer), followUpId, status);
      replaceCustomer(updated);
      setSelectedCustomer(updated);
      showToast('success', `Follow-up marked as ${status}`);
    } catch (err) {
      showToast('error', err.message || 'Failed to update follow-up');
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getExportRows = () => filteredCustomers.map((customer) => ({
    customerName: getCustomerName(customer),
    companyName: getCompanyName(customer),
    email: customer.email || '',
    phone: customer.phone || '',
    status: getStatus(customer),
    customerType: getType(customer),
    industry: customer.industry || 'N/A',
    assignedTo: getAssigneeLabel(customer),
    totalValue: formatCurrency(getTotalValue(customer)),
    lastInteraction: formatDate(customer.lastInteraction || customer.updatedAt || customer.createdAt),
    nextFollowUp: formatDate(getNextFollowUp(customer)),
    pendingFollowUps: getPendingFollowUps(customer).length,
    completedFollowUps: getCompletedFollowUps(customer).length,
    latestNote: getLatestNote(customer) || 'No notes'
  }));

  const handleExportCsv = () => {
    const rows = getExportRows();
    if (!rows.length) {
      showToast('error', 'No customer data to export');
      return;
    }
    const headers = ['Customer Name', 'Company', 'Email', 'Phone', 'Status', 'Customer Type', 'Industry', 'Assigned To', 'Total Value', 'Last Interaction', 'Next Follow-up', 'Pending Follow-ups', 'Completed Follow-ups', 'Latest Note'];
    const csvRows = [headers, ...rows.map((row) => [row.customerName, row.companyName, row.email, row.phone, row.status, row.customerType, row.industry, row.assignedTo, row.totalValue, row.lastInteraction, row.nextFollowUp, row.pendingFollowUps, row.completedFollowUps, row.latestNote])];
    const csvContent = '\uFEFF' + csvRows.map((row) => row.map((field) => `"${String(field ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    downloadBlob(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), `customers_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('success', `${rows.length} customers exported in CSV`);
  };

  const handleExportExcel = () => {
    const rows = getExportRows();
    if (!rows.length) {
      showToast('error', 'No customer data to export');
      return;
    }
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table border="1"><tr style="background-color:#16a34a;color:white;font-weight:bold;"><th>Customer Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Status</th><th>Customer Type</th><th>Industry</th><th>Assigned To</th><th>Total Value</th><th>Last Interaction</th><th>Next Follow-up</th><th>Pending Follow-ups</th><th>Completed Follow-ups</th><th>Latest Note</th></tr>';
    rows.forEach((row) => {
      html += `<tr><td>${escapeHtml(row.customerName)}</td><td>${escapeHtml(row.companyName)}</td><td>${escapeHtml(row.email)}</td><td>${escapeHtml(row.phone)}</td><td>${escapeHtml(row.status)}</td><td>${escapeHtml(row.customerType)}</td><td>${escapeHtml(row.industry)}</td><td>${escapeHtml(row.assignedTo)}</td><td>${escapeHtml(row.totalValue)}</td><td>${escapeHtml(row.lastInteraction)}</td><td>${escapeHtml(row.nextFollowUp)}</td><td>${escapeHtml(row.pendingFollowUps)}</td><td>${escapeHtml(row.completedFollowUps)}</td><td>${escapeHtml(row.latestNote)}</td></tr>`;
    });
    html += '</table></body></html>';
    downloadBlob(new Blob([html], { type: 'application/vnd.ms-excel' }), `customers_${new Date().toISOString().split('T')[0]}.xls`);
    showToast('success', `${rows.length} customers exported in Excel`);
  };

  const cardStyle = {
    background: darkMode ? '#111827' : 'white',
    borderRadius: '18px',
    border: `1px solid ${darkMode ? '#1f2937' : '#e5e7eb'}`,
    boxShadow: darkMode ? 'none' : '0 10px 25px rgba(15,23,42,0.07)'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: '12px',
    border: `1px solid ${darkMode ? '#334155' : '#dbe4ee'}`,
    background: darkMode ? '#0f172a' : '#f8fafc',
    color: darkMode ? 'white' : '#0f172a',
    outline: 'none'
  };

  const statusColor = (status) => ({
    active: { bg: darkMode ? '#064e3b' : '#dcfce7', text: darkMode ? '#6ee7b7' : '#166534', border: '#22c55e' },
    inactive: { bg: darkMode ? '#7f1d1d' : '#fee2e2', text: darkMode ? '#fca5a5' : '#b91c1c', border: '#ef4444' },
    suspended: { bg: darkMode ? '#78350f' : '#fef3c7', text: darkMode ? '#fcd34d' : '#b45309', border: '#f59e0b' }
  }[status] || { bg: darkMode ? '#064e3b' : '#dcfce7', text: darkMode ? '#6ee7b7' : '#166534', border: '#22c55e' });

  const stats = {
    total: customers.length,
    active: customers.filter((customer) => getStatus(customer) === 'active').length,
    pending: customers.reduce((sum, customer) => sum + getPendingFollowUps(customer).length, 0),
    overdue: customers.reduce((sum, customer) => sum + getPendingFollowUps(customer).filter((item) => isOverdue(item?.dueDate)).length, 0),
    value: customers.reduce((sum, customer) => sum + getTotalValue(customer), 0)
  };

  const detailFollowUps = Array.isArray(selectedCustomer?.followUps) ? [...selectedCustomer.followUps].sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0)) : [];
  const detailNotes = Array.isArray(selectedCustomer?.noteHistory) ? [...selectedCustomer.noteHistory].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)) : [];

  return (
    <div style={{ minHeight: '100vh', background: darkMode ? '#030712' : '#f4f7fb' }}>
      {loading && (
        <div style={{ minHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
          <Loader size={42} style={{ color: '#16a34a', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: darkMode ? '#94a3b8' : '#64748b', margin: 0 }}>Loading customer dashboard...</p>
        </div>
      )}

      {error && !loading && (
        <div style={{ ...cardStyle, padding: '1.5rem', border: '1px solid #ef4444', background: darkMode ? '#3f1518' : '#fef2f2', marginBottom: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#ef4444' }}>Customer module error</h3>
          <p style={{ marginTop: 0, color: darkMode ? '#fecaca' : '#b91c1c' }}>{error}</p>
          <button onClick={fetchCustomers} style={{ padding: '0.75rem 1.25rem', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
            Retry
          </button>
        </div>
      )}

      {!loading && (
        <>
          <div style={{ ...cardStyle, padding: '1.6rem', marginBottom: '1.4rem', background: darkMode ? 'linear-gradient(135deg,#111827,#0f172a)' : 'linear-gradient(135deg,#ffffff,#f8fafc)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg,#16a34a,#4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Users size={28} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.9rem', color: darkMode ? 'white' : '#0f172a' }}>Customer Management</h1>
                  <p style={{ margin: '0.35rem 0 0 0', color: darkMode ? '#94a3b8' : '#475569' }}>
                    Add customers, track follow-ups, complete tasks, manage notes, and export clean customer sheets.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
                <button onClick={handleExportCsv} style={{ padding: '0.85rem 1rem', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#e2e8f0' : '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <Download size={18} />
                  CSV Export
                </button>
                <button onClick={handleExportExcel} style={{ padding: '0.85rem 1rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#166534,#22c55e)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <FileText size={18} />
                  Excel Sheet
                </button>
                {canManageCustomers && (
                  <button onClick={() => {
                    setEditingCustomer(null);
                    setShowAddModal(true);
                  }} style={{ padding: '0.85rem 1.1rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#60a5fa)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                    <Plus size={18} />
                    Add Customer
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '1rem', marginBottom: '1.4rem' }}>
            {[
              { label: 'Total Customers', value: stats.total, icon: Users, color: '#2563eb' },
              { label: 'Active Customers', value: stats.active, icon: Building, color: '#16a34a' },
              { label: 'Pending Follow-ups', value: stats.pending, icon: Clock, color: '#f59e0b' },
              { label: 'Overdue Follow-ups', value: stats.overdue, icon: CheckSquare, color: '#ef4444' },
              { label: 'Customer Value', value: formatCurrency(stats.value), icon: DollarSign, color: '#9333ea' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} style={{ ...cardStyle, padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '0.45rem' }}>{item.label}</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: darkMode ? 'white' : '#0f172a' }}>{item.value}</div>
                    </div>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                      <Icon size={22} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ ...cardStyle, padding: '1.2rem', marginBottom: '1.4rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,1.6fr) repeat(3,minmax(140px,0.65fr))', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', top: '50%', left: '0.9rem', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search customer, company, email, phone..." style={{ ...inputStyle, paddingLeft: '2.8rem' }} />
              </div>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={inputStyle}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <select value={followUpFilter} onChange={(event) => setFollowUpFilter(event.target.value)} style={inputStyle}>
                <option value="all">All Follow-ups</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed</option>
                <option value="none">No Follow-up</option>
              </select>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} style={inputStyle}>
                <option value="recent">Sort: Recent</option>
                <option value="name">Sort: Name</option>
                <option value="value">Sort: Value</option>
                <option value="followup">Sort: Next Follow-up</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '1.1rem' }}>
            {filteredCustomers.map((customer) => {
              const status = statusColor(getStatus(customer));
              const nextFollowUp = getNextFollowUp(customer);
              const pendingCount = getPendingFollowUps(customer).length;
              const completedCount = getCompletedFollowUps(customer).length;

              return (
                <div key={getCustomerId(customer)} style={{ ...cardStyle, padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <h3 style={{ margin: 0, color: darkMode ? 'white' : '#0f172a', fontSize: '1.1rem' }}>{getCustomerName(customer)}</h3>
                      <p style={{ margin: '0.35rem 0 0 0', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.9rem' }}>{getCompanyName(customer)}</p>
                    </div>
                    <span style={{ padding: '0.38rem 0.75rem', borderRadius: '999px', background: status.bg, color: status.text, border: `1px solid ${status.border}`, fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
                      {getStatus(customer)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', color: darkMode ? '#cbd5e1' : '#334155', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={15} /><span>{customer.email || 'No email'}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={15} /><span>{customer.phone || 'No phone'}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building size={15} /><span>{customer.industry || 'General'}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={15} /><span style={{ fontWeight: 700 }}>{formatCurrency(getTotalValue(customer))}</span></div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ padding: '0.8rem', borderRadius: '14px', background: darkMode ? '#0f172a' : '#f8fafc' }}>
                      <div style={{ fontSize: '0.74rem', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '0.25rem' }}>Next Follow-up</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: nextFollowUp && isOverdue(nextFollowUp) ? '#ef4444' : (darkMode ? 'white' : '#0f172a') }}>
                        {nextFollowUp ? formatDate(nextFollowUp) : 'No follow-up'}
                      </div>
                    </div>
                    <div style={{ padding: '0.8rem', borderRadius: '14px', background: darkMode ? '#0f172a' : '#f8fafc' }}>
                      <div style={{ fontSize: '0.74rem', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '0.25rem' }}>Account Owner</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: darkMode ? 'white' : '#0f172a' }}>{getAssigneeLabel(customer)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ padding: '0.34rem 0.7rem', borderRadius: '999px', background: darkMode ? '#172554' : '#dbeafe', color: darkMode ? '#93c5fd' : '#1d4ed8', fontSize: '0.76rem', fontWeight: 700 }}>{pendingCount} Pending</span>
                    <span style={{ padding: '0.34rem 0.7rem', borderRadius: '999px', background: darkMode ? '#052e16' : '#dcfce7', color: darkMode ? '#86efac' : '#166534', fontSize: '0.76rem', fontWeight: 700 }}>{completedCount} Completed</span>
                    <span style={{ padding: '0.34rem 0.7rem', borderRadius: '999px', background: darkMode ? '#3f3f46' : '#f1f5f9', color: darkMode ? '#d4d4d8' : '#334155', fontSize: '0.76rem', fontWeight: 700, textTransform: 'capitalize' }}>{getType(customer)}</span>
                  </div>

                  <div style={{ padding: '0.8rem', borderRadius: '14px', background: darkMode ? '#0f172a' : '#f8fafc', minHeight: '72px' }}>
                    <div style={{ fontSize: '0.74rem', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '0.3rem' }}>Latest Note</div>
                    <div style={{ color: darkMode ? '#e2e8f0' : '#334155', fontSize: '0.88rem', lineHeight: 1.5 }}>{getLatestNote(customer) ? getLatestNote(customer).slice(0, 140) : 'No notes added yet'}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: canManageCustomers ? '1fr 1fr auto' : '1fr', gap: '0.65rem' }}>
                    <button onClick={() => handleViewCustomer(customer)} style={{ padding: '0.82rem', borderRadius: '12px', border: 'none', background: darkMode ? '#1e3a8a' : '#dbeafe', color: darkMode ? '#bfdbfe' : '#1d4ed8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700 }}>
                      <Eye size={16} />
                      View
                    </button>
                    {canManageCustomers && (
                      <>
                        <button onClick={() => handleEditCustomer(customer)} style={{ padding: '0.82rem', borderRadius: '12px', border: 'none', background: darkMode ? '#14532d' : '#dcfce7', color: darkMode ? '#bbf7d0' : '#166534', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700 }}>
                          <Edit size={16} />
                          Edit
                        </button>
                        <button onClick={() => handleDeleteCustomer(customer)} style={{ padding: '0.82rem', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete Customer">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCustomers.length === 0 && (
            <div style={{ ...cardStyle, padding: '3rem', marginTop: '1.5rem', textAlign: 'center' }}>
              <Users size={48} style={{ color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '1rem' }} />
              <h3 style={{ color: darkMode ? 'white' : '#0f172a', marginTop: 0 }}>No customers found</h3>
              <p style={{ color: darkMode ? '#94a3b8' : '#64748b', marginBottom: 0 }}>Try changing the search, filters, or add a new customer to get started.</p>
            </div>
          )}
        </>
      )}
      {showCustomerModal && selectedCustomer && (
        <div
          onClick={() => setShowCustomerModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.72)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '1100px',
              maxHeight: '92vh',
              overflowY: 'auto',
              background: darkMode ? '#020617' : '#ffffff',
              borderRadius: '24px',
              border: `1px solid ${darkMode ? '#1e293b' : '#dbe4ee'}`,
              boxShadow: '0 30px 60px rgba(15, 23, 42, 0.24)',
              padding: '1.4rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ margin: 0, color: darkMode ? 'white' : '#0f172a', fontSize: '1.6rem' }}>{getCustomerName(selectedCustomer)}</h2>
                <p style={{ margin: '0.4rem 0 0 0', color: darkMode ? '#94a3b8' : '#64748b' }}>
                  {getCompanyName(selectedCustomer)} | {selectedCustomer.industry || 'General'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
                {canManageCustomers && (
                  <button
                    onClick={() => {
                      setShowCustomerModal(false);
                      handleEditCustomer(selectedCustomer);
                    }}
                    style={{ padding: '0.8rem 1rem', borderRadius: '12px', border: 'none', background: darkMode ? '#14532d' : '#dcfce7', color: darkMode ? '#bbf7d0' : '#166534', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Edit size={16} />
                    Edit Customer
                  </button>
                )}
                <button
                  onClick={() => setShowCustomerModal(false)}
                  style={{ padding: '0.8rem 1rem', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#dbe4ee'}`, background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#e2e8f0' : '#0f172a', cursor: 'pointer', fontWeight: 700 }}
                >
                  Close
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              {[
                { label: 'Status', value: getStatus(selectedCustomer), tone: statusColor(getStatus(selectedCustomer)).text },
                { label: 'Customer Type', value: getType(selectedCustomer), tone: darkMode ? '#bfdbfe' : '#1d4ed8' },
                { label: 'Total Value', value: formatCurrency(getTotalValue(selectedCustomer)), tone: darkMode ? '#86efac' : '#166534' },
                { label: 'Next Follow-up', value: getNextFollowUp(selectedCustomer) ? formatDate(getNextFollowUp(selectedCustomer)) : 'Not scheduled', tone: getNextFollowUp(selectedCustomer) && isOverdue(getNextFollowUp(selectedCustomer)) ? '#ef4444' : (darkMode ? '#f8fafc' : '#0f172a') },
                { label: 'Assigned To', value: getAssigneeLabel(selectedCustomer), tone: darkMode ? '#e2e8f0' : '#0f172a' },
                { label: 'Last Interaction', value: formatDateTime(selectedCustomer.lastInteraction || selectedCustomer.updatedAt || selectedCustomer.createdAt), tone: darkMode ? '#e2e8f0' : '#0f172a' }
              ].map((item) => (
                <div key={item.label} style={{ ...cardStyle, padding: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '0.35rem' }}>{item.label}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: item.tone, textTransform: item.label === 'Status' || item.label === 'Customer Type' ? 'capitalize' : 'none' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ ...cardStyle, padding: '1rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '0.9rem', color: darkMode ? 'white' : '#0f172a' }}>Contact Details</h3>
                <div style={{ display: 'grid', gap: '0.8rem', color: darkMode ? '#cbd5e1' : '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Mail size={16} />
                    <span>{selectedCustomer.email || 'No email'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Phone size={16} />
                    <span>{selectedCustomer.phone || 'No phone'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Building size={16} />
                    <span>{selectedCustomer.address?.city || selectedCustomer.address?.state || selectedCustomer.address?.country ? [selectedCustomer.address?.city, selectedCustomer.address?.state, selectedCustomer.address?.country].filter(Boolean).join(', ') : 'Address not added'}</span>
                  </div>
                </div>
              </div>

              <div style={{ ...cardStyle, padding: '1rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '0.9rem', color: darkMode ? 'white' : '#0f172a' }}>Quick Follow-up</h3>
                <div style={{ display: 'grid', gap: '0.8rem' }}>
                  <input
                    type="text"
                    value={followUpDraft.title}
                    onChange={(event) => setFollowUpDraft((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Follow-up title"
                    style={inputStyle}
                  />
                  <input
                    type="date"
                    value={followUpDraft.dueDate}
                    onChange={(event) => setFollowUpDraft((prev) => ({ ...prev, dueDate: event.target.value }))}
                    style={inputStyle}
                  />
                  <textarea
                    value={followUpDraft.description}
                    onChange={(event) => setFollowUpDraft((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Action notes or reminder..."
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                  <button
                    onClick={handleAddFollowUp}
                    style={{ padding: '0.85rem 1rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#ea580c,#f59e0b)', color: 'white', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Clock size={16} />
                    Add Follow-up
                  </button>
                </div>
              </div>

              <div style={{ ...cardStyle, padding: '1rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '0.9rem', color: darkMode ? 'white' : '#0f172a' }}>Add Note</h3>
                <div style={{ display: 'grid', gap: '0.8rem' }}>
                  <textarea
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    placeholder="Write what happened with this customer..."
                    rows={6}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                  <button
                    onClick={handleAddNote}
                    style={{ padding: '0.85rem 1rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#60a5fa)', color: 'white', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <FileText size={16} />
                    Save Note
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '1rem' }}>
              <div style={{ ...cardStyle, padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem', marginBottom: '0.9rem' }}>
                  <h3 style={{ margin: 0, color: darkMode ? 'white' : '#0f172a' }}>Follow-up Tracker</h3>
                  <span style={{ fontSize: '0.8rem', color: darkMode ? '#94a3b8' : '#64748b' }}>{detailFollowUps.length} items</span>
                </div>

                <div style={{ display: 'grid', gap: '0.8rem' }}>
                  {detailFollowUps.length === 0 && (
                    <div style={{ padding: '1rem', borderRadius: '14px', background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#94a3b8' : '#64748b' }}>
                      No follow-ups scheduled for this customer.
                    </div>
                  )}

                  {detailFollowUps.map((item) => {
                    const followUpId = item?._id || item?.id;
                    const isPending = item.status === 'pending';
                    const isCompleted = item.status === 'completed';
                    const badgeColor = isCompleted
                      ? { bg: darkMode ? '#052e16' : '#dcfce7', text: darkMode ? '#86efac' : '#166534' }
                      : item.status === 'cancelled'
                        ? { bg: darkMode ? '#3f1518' : '#fee2e2', text: darkMode ? '#fca5a5' : '#b91c1c' }
                        : { bg: darkMode ? '#422006' : '#fef3c7', text: darkMode ? '#fcd34d' : '#b45309' };

                    return (
                      <div key={followUpId} style={{ padding: '0.95rem', borderRadius: '16px', background: darkMode ? '#0f172a' : '#f8fafc', border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', marginBottom: '0.45rem' }}>
                          <div>
                            <div style={{ color: darkMode ? 'white' : '#0f172a', fontWeight: 700 }}>{item.title || 'Follow-up'}</div>
                            <div style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                              Due {formatDate(item.dueDate)} {isOverdue(item.dueDate) && isPending ? '| Overdue' : ''}
                            </div>
                          </div>
                          <span style={{ padding: '0.3rem 0.65rem', borderRadius: '999px', background: badgeColor.bg, color: badgeColor.text, fontSize: '0.74rem', fontWeight: 700, textTransform: 'capitalize', height: 'fit-content' }}>
                            {item.status || 'pending'}
                          </span>
                        </div>

                        <div style={{ color: darkMode ? '#cbd5e1' : '#334155', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '0.8rem' }}>
                          {item.description || 'No extra description added.'}
                        </div>

                        <div style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.76rem', marginBottom: '0.8rem' }}>
                          Created by {item.createdBy?.name || item.createdBy?.email || 'Team'} on {formatDateTime(item.createdAt)}
                          {item.completedAt ? ` | Completed ${formatDateTime(item.completedAt)}` : ''}
                        </div>

                        <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                          {!isCompleted && (
                            <button
                              onClick={() => handleUpdateFollowUpStatus(followUpId, 'completed')}
                              style={{ padding: '0.6rem 0.9rem', borderRadius: '10px', border: 'none', background: darkMode ? '#14532d' : '#dcfce7', color: darkMode ? '#bbf7d0' : '#166534', cursor: 'pointer', fontWeight: 700 }}
                            >
                              Mark Complete
                            </button>
                          )}
                          {item.status !== 'pending' && (
                            <button
                              onClick={() => handleUpdateFollowUpStatus(followUpId, 'pending')}
                              style={{ padding: '0.6rem 0.9rem', borderRadius: '10px', border: 'none', background: darkMode ? '#1e3a8a' : '#dbeafe', color: darkMode ? '#bfdbfe' : '#1d4ed8', cursor: 'pointer', fontWeight: 700 }}
                            >
                              Reopen
                            </button>
                          )}
                          {item.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateFollowUpStatus(followUpId, 'cancelled')}
                              style={{ padding: '0.6rem 0.9rem', borderRadius: '10px', border: 'none', background: darkMode ? '#3f1518' : '#fee2e2', color: darkMode ? '#fecaca' : '#b91c1c', cursor: 'pointer', fontWeight: 700 }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ ...cardStyle, padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem', marginBottom: '0.9rem' }}>
                  <h3 style={{ margin: 0, color: darkMode ? 'white' : '#0f172a' }}>Notes History</h3>
                  <span style={{ fontSize: '0.8rem', color: darkMode ? '#94a3b8' : '#64748b' }}>{detailNotes.length} notes</span>
                </div>

                <div style={{ display: 'grid', gap: '0.8rem' }}>
                  {detailNotes.length === 0 && (
                    <div style={{ padding: '1rem', borderRadius: '14px', background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#94a3b8' : '#64748b' }}>
                      No notes added yet for this customer.
                    </div>
                  )}

                  {detailNotes.map((note) => (
                    <div key={note?._id || note?.id || `${note?.createdAt}-${note?.content}`} style={{ padding: '0.95rem', borderRadius: '16px', background: darkMode ? '#0f172a' : '#f8fafc', border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}` }}>
                      <div style={{ color: darkMode ? '#e2e8f0' : '#334155', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {note.content || 'No content'}
                      </div>
                      <div style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.76rem', marginTop: '0.7rem' }}>
                        {note.createdBy?.name || note.createdBy?.email || 'Team'} | {formatDateTime(note.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CustomerFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingCustomer(null);
        }}
        onCustomerAdded={handleCustomerAdded}
        onCustomerUpdated={handleCustomerUpdated}
        darkMode={darkMode}
        editCustomer={editingCustomer}
      />
    </div>
  );
};

export default CustomerManagement;
