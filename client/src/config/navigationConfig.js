// Centralized navigation configuration for sidebar and global search
// Complete menu structure from ProfessionalSidebar for full search functionality

import { 
  BarChart3, 
  Users, 
  User,
  UserPlus, 
  TrendingUp, 
  Settings, 
  Phone, 
  Clock, 
  Target, 
  Star, 
  Zap, 
  Search, 
  Database, 
  FileText, 
  DollarSign, 
  CheckSquare, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Brain,
  Copy,
  Building,
  Activity,
  Shield,
  Briefcase,
  Server
} from 'lucide-react';

export const menuSections = [
  {
    title: 'Dashboard',
    items: [
      { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: '#3b82f6' },
      { id: 'role-dashboard', icon: User, label: 'My Dashboard', color: '#22c55e' }
    ]
  },
  {
    title: 'Lead Management',
    items: [
      { id: 'add-enquiry', icon: UserPlus, label: 'Add Lead', color: '#22c55e' },
      { id: 'my-leads', icon: Users, label: 'My Leads', color: '#8b5cf6' },
      { id: 'leads', icon: Target, label: 'All Leads', color: '#f59e0b' },
      { id: 'lead-history', icon: Clock, label: 'Lead History', color: '#6b7280' },
      { id: 'lead-tracker', icon: Activity, label: 'Lead Tracker', color: '#ef4444' }
    ]
  },
  {
    title: 'AI & Analytics',
    items: [
      { id: 'ai-assistant', icon: Brain, label: 'AI Assistant', color: '#8b5cf6' },
      { id: 'lead-scoring', icon: Star, label: 'AI Lead Scoring', color: '#f59e0b', adminOnly: true },
      { id: 'analytics', icon: TrendingUp, label: 'Analytics', color: '#22c55e' },
      { id: 'automation', icon: Zap, label: 'Automation', color: '#f59e0b' }
    ]
  },
  {
    title: 'Data Management',
    items: [
      { id: 'customers', icon: Building, label: 'Customers', color: '#3b82f6' },
      { id: 'data-table', icon: Database, label: 'Data Table', color: '#6b7280' },
      { id: 'sales-pipeline', icon: Target, label: 'Sales Pipeline', color: '#22c55e' },
      { id: 'auto-assignment', icon: Users, label: 'Auto Assignment', color: '#8b5cf6', adminOnly: true },
      { id: 'duplicate-detection', icon: Copy, label: 'Duplicate Detection', color: '#ef4444', adminOnly: true }
    ]
  },
  {
    title: 'Communication',
    items: [
      { id: 'communication', icon: MessageCircle, label: 'Communication', color: '#22c55e' },
      { id: 'tasks', icon: CheckSquare, label: 'Tasks', color: '#f59e0b' },
      { id: 'calendar', icon: Calendar, label: 'Calendar', color: '#8b5cf6' }
    ]
  },
  {
    title: 'Tools & Resources',
    items: [
      { id: 'location', icon: MapPin, label: 'Location', color: '#ef4444' },
      { id: 'documents', icon: FileText, label: 'Documents', color: '#3b82f6' }
    ]
  },

  {
    title: 'Business',
    items: [
      { id: 'billing', icon: DollarSign, label: 'Billing & Payments', color: '#22c55e' }
    ]
  },
  {
    title: 'System',
    items: [
      { id: 'company-management', icon: Building, label: 'Company Management', color: '#3b82f6', superAdminOnly: true },
      { id: 'team-management', icon: Users, label: 'Team Management', color: '#8b5cf6', adminOnly: true },
      { id: 'plan-limits', icon: Shield, label: 'Plan & Limits', color: '#f59e0b', adminOnly: true },
      { id: 'settings', icon: Settings, label: 'Settings', color: '#6b7280' },
      { id: 'api-test', icon: Server, label: 'API Testing', color: '#3b82f6' },
      { id: 'connection-test', icon: Activity, label: 'Backend Connection', color: '#22c55e' },
      { id: 'support', icon: MessageCircle, label: 'Support Center', color: '#22c55e' }
    ]
  }
];

// Each item.id should correspond to a valid view handled in AppContent.changeView
