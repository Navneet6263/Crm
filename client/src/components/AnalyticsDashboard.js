import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  Users,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  Clock,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const AnalyticsDashboard = ({ darkMode }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Sample data - in a real app, this would come from your API
  const leadConversionData = [
    { name: 'Jan', leads: 65, conversions: 42, rate: 64 },
    { name: 'Feb', leads: 78, conversions: 50, rate: 64 },
    { name: 'Mar', leads: 90, conversions: 63, rate: 70 },
    { name: 'Apr', leads: 81, conversions: 53, rate: 65 },
    { name: 'May', leads: 95, conversions: 67, rate: 71 },
    { name: 'Jun', leads: 110, conversions: 80, rate: 73 },
    { name: 'Jul', leads: 100, conversions: 75, rate: 75 },
  ];

  const salesPerformanceData = [
    { name: 'Jan', target: 500000, actual: 425000 },
    { name: 'Feb', target: 500000, actual: 480000 },
    { name: 'Mar', target: 550000, actual: 570000 },
    { name: 'Apr', target: 550000, actual: 540000 },
    { name: 'May', target: 600000, actual: 650000 },
    { name: 'Jun', target: 600000, actual: 700000 },
    { name: 'Jul', target: 650000, actual: 710000 },
  ];

  const leadSourceData = [
    { name: 'Website', value: 35 },
    { name: 'Referral', value: 25 },
    { name: 'Social Media', value: 20 },
    { name: 'Email', value: 15 },
    { name: 'Other', value: 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const customerGrowthData = [
    { name: 'Jan', customers: 120 },
    { name: 'Feb', customers: 135 },
    { name: 'Mar', customers: 148 },
    { name: 'Apr', customers: 156 },
    { name: 'May', customers: 170 },
    { name: 'Jun', customers: 185 },
    { name: 'Jul', customers: 200 },
  ];

  const kpiData = [
    { title: 'Total Leads', value: '583', change: '+12%', icon: Users, color: '#3b82f6' },
    { title: 'Conversion Rate', value: '68%', change: '+5%', icon: TrendingUp, color: '#10b981' },
    { title: 'Avg Deal Size', value: '₹42,500', change: '+8%', icon: DollarSign, color: '#f59e0b' },
    { title: 'Sales Cycle', value: '18 days', change: '-3 days', icon: Clock, color: '#8b5cf6' },
  ];

  const recentActivities = [
    { type: 'call', title: 'Call with Rajesh Kumar', time: '10:30 AM', status: 'completed' },
    { type: 'email', title: 'Proposal sent to Healthcare Solutions', time: '09:15 AM', status: 'completed' },
    { type: 'meeting', title: 'Demo meeting with Digital Marketing Hub', time: '02:00 PM', status: 'upcoming' },
    { type: 'call', title: 'Follow-up call with Amit Patel', time: '04:30 PM', status: 'upcoming' },
  ];

  const refreshData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refreshData();
  }, [timeRange]);

  const containerStyle = {
    padding: '0',
    background: darkMode ? '#111827' : '#f9fafb',
    minHeight: '100vh'
  };

  const cardStyle = {
    background: darkMode ? '#1f2937' : 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'call': return <Phone size={16} />;
      case 'email': return <Mail size={16} />;
      case 'meeting': return <Calendar size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <TrendingUp style={{ color: '#10b981' }} size={32} />
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Analytics Dashboard
              </h1>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
                Track your sales performance and lead conversion metrics
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '0.75rem',
                background: darkMode ? '#374151' : '#f3f4f6',
                color: darkMode ? '#d1d5db' : '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Filter size={16} />
              Filters
            </button>
            <button
              onClick={refreshData}
              style={{
                padding: '0.75rem',
                background: darkMode ? '#374151' : '#f3f4f6',
                color: darkMode ? '#d1d5db' : '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => {}}
              style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Time Range Filter */}
      {showFilters && (
        <div style={{
          ...cardStyle,
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{ color: darkMode ? '#d1d5db' : '#374151', fontWeight: '500' }}>Time Range:</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['week', 'month', 'quarter', 'year'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '0.5rem 1rem',
                  background: timeRange === range ? 
                    'linear-gradient(135deg, #667eea, #764ba2)' : 
                    darkMode ? '#374151' : '#f3f4f6',
                  color: timeRange === range ? 
                    'white' : 
                    darkMode ? '#d1d5db' : '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} style={{ ...cardStyle, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    {kpi.title}
                  </p>
                  <p style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: darkMode ? 'white' : '#1f2937',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {kpi.value}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: kpi.change.startsWith('+') ? '#10b981' : '#ef4444',
                    margin: 0
                  }}>
                    {kpi.change} vs last {timeRange}
                  </p>
                </div>
                <Icon style={{ color: kpi.color }} size={32} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Lead Conversion Chart */}
        <div style={{ ...cardStyle, padding: '1.5rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginTop: 0,
            marginBottom: '1rem'
          }}>
            Lead Conversion Rate
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={leadConversionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{ 
                    background: darkMode ? '#1f2937' : 'white',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    color: darkMode ? 'white' : '#1f2937'
                  }} 
                />
                <Legend />
                <Bar dataKey="leads" name="Total Leads" fill="#3b82f6" />
                <Bar dataKey="conversions" name="Conversions" fill="#10b981" />
                <Line type="monotone" dataKey="rate" name="Rate (%)" stroke="#f59e0b" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Performance Chart */}
        <div style={{ ...cardStyle, padding: '1.5rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginTop: 0,
            marginBottom: '1rem'
          }}>
            Sales Performance
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesPerformanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{ 
                    background: darkMode ? '#1f2937' : 'white',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    color: darkMode ? 'white' : '#1f2937'
                  }} 
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Legend />
                <Line type="monotone" dataKey="target" name="Target" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="actual" name="Actual" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '1.5rem'
      }}>
        {/* Lead Source Distribution */}
        <div style={{ ...cardStyle, padding: '1.5rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginTop: 0,
            marginBottom: '1rem'
          }}>
            Lead Source Distribution
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadSourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {leadSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: darkMode ? '#1f2937' : 'white',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    color: darkMode ? 'white' : '#1f2937'
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div style={{ ...cardStyle, padding: '1.5rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? 'white' : '#1f2937',
            marginTop: 0,
            marginBottom: '1rem'
          }}>
            Recent Activities
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentActivities.map((activity, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '8px',
                background: darkMode ? '#374151' : '#f9fafb',
                borderLeft: `4px solid ${
                  activity.type === 'call' ? '#3b82f6' : 
                  activity.type === 'email' ? '#10b981' : '#f59e0b'
                }`
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: darkMode ? '#1f2937' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: activity.type === 'call' ? '#3b82f6' : 
                         activity.type === 'email' ? '#10b981' : '#f59e0b'
                }}>
                  {getActivityIcon(activity.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? 'white' : '#1f2937',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {activity.title}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    margin: 0
                  }}>
                    {activity.time}
                  </p>
                </div>
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
                  {activity.status === 'completed' ? 'Completed' : 'Upcoming'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;