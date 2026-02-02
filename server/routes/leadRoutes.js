const express = require('express');
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addNote,
  logActivity,
  assignLead,
  getMyLeads,
  getLeadsByProduct,
  getProductLeadStats,
  getUserProductHistory,
  acceptGroupLead,
  declineGroupLead,
  getPendingGroupLeads,
  getSalesTeamStats,
  calculateLeadScore
} = require('../controllers/leadController');
const { getLeadsOptimized, getMyLeadsOptimized } = require('../controllers/leadControllerOptimized');
const { auth } = require('../middleware/auth');
const { handleLeadAssignmentNotification } = require('../middleware/leadNotificationMiddleware');
const { updateLeadViewTime } = require('../middleware/leadViewMiddleware');
const { handleBulkAuth, bulkUploadLeads } = require('../controllers/bulkUploadController');

const router = express.Router();

router.use(auth);

// Non-parameterized routes MUST come before /:id routes
router.get('/my-leads', getMyLeadsOptimized);
router.get('/group-pending', getPendingGroupLeads);
router.get('/stats/sales-team', getSalesTeamStats);
router.get('/stats/products', getProductLeadStats);
router.get('/user/product-history', getUserProductHistory);
router.post('/assign', handleLeadAssignmentNotification, assignLead);
router.get('/product/:productId', getLeadsByProduct);

// Parameterized routes come after
router.route('/')
  .get(getLeadsOptimized)
  .post(createLead);

router.route('/:id')
  .get(updateLeadViewTime, getLeadById)
  .put(updateLead)
  .delete(deleteLead);

router.put('/:id/accept', acceptGroupLead);
router.put('/:id/decline', declineGroupLead);
router.post('/:id/score', calculateLeadScore);

router.post('/:id/notes', addNote);
router.post('/:id/activity', logActivity);
router.post('/bulk-upload', handleBulkAuth, bulkUploadLeads);

module.exports = router;