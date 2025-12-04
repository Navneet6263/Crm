import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const GroupLeads = () => {
  const [groupLeads, setGroupLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupLeads();
  }, []);

  const fetchGroupLeads = async () => {
    try {
      setLoading(true);
      const leads = await apiService.getPendingGroupLeads();
      setGroupLeads(leads);
    } catch (error) {
      console.error('Error fetching group leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (leadId) => {
    try {
      await apiService.acceptGroupLead(leadId);
      // Remove from list after accepting
      setGroupLeads(prev => prev.filter(lead => lead.id !== leadId));
      alert('Lead accepted successfully!');
    } catch (error) {
      console.error('Error accepting lead:', error);
      alert('Failed to accept lead');
    }
  };

  const handleReject = async (leadId) => {
    try {
      await apiService.declineGroupLead(leadId);
      alert('Lead rejected');
    } catch (error) {
      console.error('Error rejecting lead:', error);
      alert('Failed to reject lead');
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading group leads...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Available Group Leads</h2>
      
      {groupLeads.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No pending group leads available</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {groupLeads.map((lead) => (
            <div key={lead.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{lead.companyName || 'No Company'}</h3>
                  <p className="text-gray-600">{lead.contactPerson || 'No Contact'}</p>
                  <p className="text-sm text-gray-500">
                    Phone: {lead.phone || 'N/A'} | Email: {lead.email || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: <span className="font-medium text-orange-600">{lead.status}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Source: {lead.source || 'N/A'} | Value: ₹{lead.leadValue || 0}
                  </p>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleAccept(lead.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(lead.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        Total available leads: {groupLeads.length}
      </div>
    </div>
  );
};

export default GroupLeads;