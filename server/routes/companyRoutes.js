const express = require('express');
const router = express.Router();
const { 
  createCompany, 
  setupCompany,
  getAllCompanies, 
  updateCompanyStatus, 
  suspendCompany, 
  activateCompany,
  deleteCompany,
  getCompanyDashboard,
  updateCompanyPlan,
  getCompanyTeam,
  addTeamMember,
  removeTeamMember,
  getPlanConfigs,
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  toggleTeamMemberStatus,
  deleteTeamMember,
  getMyCompanyPlan,
  getBillingData,
  getCompaniesForSuperAdmin,
  createDefaultCompany
} = require('../controllers/companyController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Company Management Routes
router.post('/', createCompany); // Create new company (Super Admin only)
router.post('/setup', setupCompany); // Setup company after registration
router.get('/', getAllCompanies); // Get all companies (Super Admin only)
router.get('/plans', getPlanConfigs); // Get plan configurations

// Company Status Management
router.put('/:companyId/status', updateCompanyStatus); // Update company status
router.put('/:companyId/suspend', suspendCompany); // Suspend company
router.put('/:companyId/activate', activateCompany); // Activate company
router.delete('/:companyId', deleteCompany); // Delete company
router.put('/:companyId/plan', updateCompanyPlan); // Update company plan

// Company Dashboard & Analytics
router.get('/:companyId/dashboard', getCompanyDashboard); // Get company dashboard

// Team Management Routes
router.get('/:companyId/team', getCompanyTeam); // Get company team members
router.post('/:companyId/team', addTeamMember); // Add team member
router.delete('/:companyId/team/:userId', removeTeamMember); // Remove team member

// New Team Management Routes for current user's company
router.get('/my/team', getTeamMembers); // Get team members for current user's company
router.post('/my/team', createTeamMember); // Create team member for current user's company
router.put('/my/team/:userId', updateTeamMember); // Update team member
router.put('/my/team/:userId/toggle', toggleTeamMemberStatus); // Toggle team member status
router.delete('/my/team/:userId', deleteTeamMember); // Delete team member

// Get current user's company plan details
router.get('/my/plan', getMyCompanyPlan); // Get current user's company plan and usage details
router.get('/my/billing', getBillingData); // Get current user's billing data

// SuperAdmin specific routes
router.get('/superadmin/list', getCompaniesForSuperAdmin); // Get companies for SuperAdmin dropdown
router.post('/superadmin/default', createDefaultCompany); // Create default company for SuperAdmin

module.exports = router;