import React, { useState, useEffect } from 'react';
import PermissionGuard, { PERMISSIONS } from './PermissionGuard';
import CompanyUserManagement from './CompanyUserManagement';
import PlanLimitsDisplay from './PlanLimitsDisplay';
import apiService from '../services/apiService';
import { Users, TrendingUp, Target, Mail } from 'lucide-react';

const AdminDashboard = ({ currentUser, darkMode }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const fetchedLeads = await apiService.getAllLeads();
        setLeads(fetchedLeads);
        console.log('📋 Admin can see leads:', fetchedLeads.length);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, []);
  
  const mockUsage = {
    users: 8,
    managers: 2,
    leads: leads.length,
    reports: 12
  };

  return (
    <div style={{ padding: '2rem', background: darkMode ? '#0f172a' : '#f9fafb', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: darkMode ? 'white' : '#1f2937', marginBottom: '2rem' }}>
        Admin Dashboard
      </h1>
      
      {/* Leads Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: darkMode ? '#1e293b' : 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
              borderRadius: '12px'
            }}>
              <Users size={24} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', color: darkMode ? 'white' : '#1f2937', margin: 0 }}>
                {leads.length}
              </h3>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', margin: 0 }}>Total Leads</p>
            </div>
          </div>
        </div>
        
        <div style={{
          background: darkMode ? '#1e293b' : 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, #22c55e, #4ade80)',
              borderRadius: '12px'
            }}>
              <Target size={24} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', color: darkMode ? 'white' : '#1f2937', margin: 0 }}>
                {leads.filter(l => l.status === 'converted').length}
              </h3>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', margin: 0 }}>Converted</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Leads */}
      <div style={{
        background: darkMode ? '#1e293b' : 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: darkMode ? 'white' : '#1f2937', marginBottom: '1rem' }}>
          Recent Leads
        </h3>
        
        {loading ? (
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Loading leads...</p>
        ) : leads.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {leads.slice(0, 5).map(lead => (
              <div key={lead.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: darkMode ? '#334155' : '#f9fafb',
                borderRadius: '8px'
              }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: darkMode ? 'white' : '#1f2937', margin: 0 }}>
                    {lead.companyName}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280', margin: '0.25rem 0 0 0' }}>
                    {lead.contactPerson} • {lead.email}
                  </p>
                  {lead.createdBy && (
                    <p style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', margin: '0.25rem 0 0 0' }}>
                      Created by: {lead.createdBy}
                    </p>
                  )}
                </div>
                <div style={{
                  padding: '0.5rem 1rem',
                  background: lead.status === 'converted' ? '#22c55e20' : '#3b82f620',
                  color: lead.status === 'converted' ? '#22c55e' : '#3b82f6',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {lead.status || 'New'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>No leads found. Super Admin needs to add some leads first.</p>
        )}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Plan Limits */}
        <PermissionGuard 
          requiredPermission={PERMISSIONS.MANAGE_TEAM}
          userPermissions={currentUser?.permissions || []}
        >
          <PlanLimitsDisplay 
            currentPlan={currentUser?.plan || 'professional'}
            usage={mockUsage}
            darkMode={darkMode}
          />
        </PermissionGuard>

        {/* Team Management */}
        <PermissionGuard 
          requiredPermission={PERMISSIONS.MANAGE_TEAM}
          userPermissions={currentUser?.permissions || []}
        >
          <CompanyUserManagement 
            currentUser={currentUser}
            darkMode={darkMode}
          />
        </PermissionGuard>
      </div>
    </div>
  );
};

export default AdminDashboard;