// Application constants
const USER_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES: 'sales',
  SUPPORT: 'support'
};

const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  CLOSED_WON: 'closed-won',
  CLOSED_LOST: 'closed-lost'
};

const LEAD_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

const CUSTOMER_TYPE = {
  INDIVIDUAL: 'individual',
  BUSINESS: 'business',
  ENTERPRISE: 'enterprise'
};

const NOTIFICATION_TYPES = {
  LEAD_ASSIGNED: 'lead_assigned',
  LEAD_CREATED: 'lead_created',
  CUSTOMER_CREATED: 'customer_created',
  TASK_ASSIGNED: 'task_assigned',
  MEETING_SCHEDULED: 'meeting_scheduled',
  SYSTEM_ALERT: 'system_alert'
};

const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const COMMUNICATION_TYPES = {
  EMAIL: 'email',
  CALL: 'call',
  MEETING: 'meeting',
  SMS: 'sms',
  NOTE: 'note'
};

module.exports = {
  USER_ROLES,
  LEAD_STATUS,
  LEAD_PRIORITY,
  CUSTOMER_STATUS,
  CUSTOMER_TYPE,
  NOTIFICATION_TYPES,
  TASK_STATUS,
  COMMUNICATION_TYPES
};