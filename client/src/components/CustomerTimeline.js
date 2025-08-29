import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  DollarSign,
  Clock,
  Plus,
  ChevronDown,
  ChevronUp,
  Check,
  X
} from 'lucide-react';

const CustomerTimeline = ({ customer, darkMode }) => {
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [activityType, setActivityType] = useState('call');
  const [activityNote, setActivityNote] = useState('');
  const [showAllActivities, setShowAllActivities] = useState(false);

  // Sample timeline data - in a real app, this would come from your API
  const [timelineData, setTimelineData] = useState([
    {
      id: 1,
      type: 'call',
      title: 'Sales Call',
      description: 'Discussed product features and pricing options',
      date: '2023-07-15',
      time: '10:30 AM',
      user: 'Navneet Kumar',
      status: 'completed'
    },
    {
      id: 2,
      type: 'email',
      title: 'Sent Proposal',
      description: 'Sent detailed proposal with pricing and implementation timeline',
      date: '2023-07-18',
      time: '02:15 PM',
      user: 'Navneet Kumar',
      status: 'completed'
    },
    {
      id: 3,
      type: 'meeting',
      title: 'Product Demo',
      description: 'Demonstrated key features and addressed technical questions',
      date: '2023-07-25',
      time: '11:00 AM',
      user: 'Priya Sharma',
      status: 'completed'
    },
    {
      id: 4,
      type: 'note',
      title: 'Follow-up Required',
      description: 'Customer requested additional information about API integration',
      date: '2023-07-26',
      time: '03:45 PM',
      user: 'Navneet Kumar',
      status: 'pending'
    },
    {
      id: 5,
      type: 'proposal',
      title: 'Revised Proposal',
      description: 'Sent updated proposal with 10% discount and extended support',
      date: '2023-08-02',
      time: '09:20 AM',
      user: 'Rahul Singh',
      status: 'completed'
    },
    {
      id: 6,
      type: 'call',
      title: 'Negotiation Call',
      description: 'Discussed final terms and implementation timeline',
      date: '2023-08-10',
      time: '02:00 PM',
      user: 'Navneet Kumar',
      status: 'completed'
    },
    {
      id: 7,
      type: 'deal',
      title: 'Deal Closed',
      description: 'Customer signed the contract for a 1-year subscription',
      date: '2023-08-15',
      time: '04:30 PM',
      user: 'Navneet Kumar',
      status: 'completed'
    }
  ]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'call': return <Phone size={16} />;
      case 'email': return <Mail size={16} />;
      case 'meeting': return <Calendar size={16} />;
      case 'note': return <MessageSquare size={16} />;
      case 'proposal': return <FileText size={16} />;
      case 'deal': return <DollarSign size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'call': return '#3b82f6';
      case 'email': return '#8b5cf6';
      case 'meeting': return '#f59e0b';
      case 'note': return '#6b7280';
      case 'proposal': return '#10b981';
      case 'deal': return '#10b981';
      default: return '#6b7280';
    }
  };

  const handleAddActivity = () => {
    if (!activityNote.trim()) return;

    const newActivity = {
      id: Date.now(),
      type: activityType,
      title: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} Activity`,
      description: activityNote,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: 'Navneet Kumar',
      status: 'completed'
    };

    setTimelineData([newActivity, ...timelineData]);
    setActivityNote('');
    setShowAddActivity(false);
  };

  const displayedActivities = showAllActivities ? timelineData : timelineData.slice(0, 3);

  return (
    <div style={{
      background: darkMode ? '#1f2937' : 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem',
        borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: darkMode ? 'white' : '#1f2937',
          margin: 0
        }}>
          Customer Interaction Timeline
        </h3>
        <button
          onClick={() => setShowAddActivity(!showAddActivity)}
          style={{
            background: showAddActivity ? 
              (darkMode ? '#374151' : '#f3f4f6') : 
              'linear-gradient(135deg, #667eea, #764ba2)',
            color: showAddActivity ? 
              (darkMode ? '#d1d5db' : '#374151') : 
              'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.5rem 0.75rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            cursor: 'pointer'
          }}
        >
          {showAddActivity ? <X size={14} /> : <Plus size={14} />}
          {showAddActivity ? 'Cancel' : 'Add Activity'}
        </button>
      </div>

      {/* Add Activity Form */}
      {showAddActivity && (
        <div style={{
          padding: '1rem',
          borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          background: darkMode ? '#374151' : '#f9fafb'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: darkMode ? '#d1d5db' : '#374151',
              marginBottom: '0.5rem'
            }}>
              Activity Type
            </label>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              {['call', 'email', 'meeting', 'note', 'proposal'].map(type => (
                <button
                  key={type}
                  onClick={() => setActivityType(type)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: activityType === type ? 
                      getActivityColor(type) : 
                      (darkMode ? '#1f2937' : 'white'),
                    color: activityType === type ? 
                      'white' : 
                      (darkMode ? '#d1d5db' : '#374151'),
                    border: `1px solid ${activityType === type ? 
                      getActivityColor(type) : 
                      (darkMode ? '#374151' : '#e5e7eb')}`,
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  {getActivityIcon(type)}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
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
              Notes
            </label>
            <textarea
              value={activityNote}
              onChange={(e) => setActivityNote(e.target.value)}
              placeholder="Enter activity details..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                background: darkMode ? '#1f2937' : 'white',
                color: darkMode ? 'white' : '#1f2937',
                fontSize: '0.875rem',
                minHeight: '100px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleAddActivity}
              disabled={!activityNote.trim()}
              style={{
                padding: '0.5rem 1rem',
                background: activityNote.trim() ? '#10b981' : (darkMode ? '#374151' : '#e5e7eb'),
                color: activityNote.trim() ? 'white' : (darkMode ? '#9ca3af' : '#6b7280'),
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: activityNote.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Check size={14} />
              Save Activity
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div style={{
        padding: '1rem',
        maxHeight: '500px',
        overflowY: 'auto'
      }}>
        {displayedActivities.map((activity, index) => (
          <div
            key={activity.id}
            style={{
              position: 'relative',
              paddingLeft: '2rem',
              paddingBottom: '1.5rem',
              borderLeft: index < displayedActivities.length - 1 ? 
                `2px solid ${darkMode ? '#374151' : '#e5e7eb'}` : 
                'none',
              marginLeft: '0.75rem'
            }}
          >
            <div style={{
              position: 'absolute',
              left: '-0.75rem',
              top: '0',
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: '50%',
              background: getActivityColor(activity.type),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              zIndex: 1
            }}>
              {getActivityIcon(activity.type)}
            </div>

            <div style={{
              background: darkMode ? '#374151' : '#f9fafb',
              borderRadius: '8px',
              padding: '1rem',
              marginLeft: '0.5rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.5rem'
              }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: darkMode ? 'white' : '#1f2937',
                  margin: 0
                }}>
                  {activity.title}
                </h4>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  background: activity.status === 'completed' ? 
                    (darkMode ? '#065f46' : '#d1fae5') : 
                    (darkMode ? '#78350f' : '#fef3c7'),
                  color: activity.status === 'completed' ? 
                    (darkMode ? '#10b981' : '#047857') : 
                    (darkMode ? '#f59e0b' : '#b45309')
                }}>
                  {activity.status === 'completed' ? 'Completed' : 'Pending'}
                </span>
              </div>

              <p style={{
                fontSize: '0.875rem',
                color: darkMode ? '#d1d5db' : '#4b5563',
                margin: '0 0 0.75rem 0'
              }}>
                {activity.description}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                <span>{activity.date} at {activity.time}</span>
                <span>by {activity.user}</span>
              </div>
            </div>
          </div>
        ))}

        {timelineData.length > 3 && (
          <div style={{
            textAlign: 'center',
            marginTop: '1rem'
          }}>
            <button
              onClick={() => setShowAllActivities(!showAllActivities)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#3b82f6',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                margin: '0 auto'
              }}
            >
              {showAllActivities ? (
                <>
                  <ChevronUp size={16} />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Show All ({timelineData.length - 3} more)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerTimeline;