const express = require('express');
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addNote,
  assignLead,
  getMyLeads
} = require('../controllers/leadController');
const { auth } = require('../middleware/auth');
const { handleLeadAssignmentNotification } = require('../middleware/leadNotificationMiddleware');
const { updateLeadViewTime } = require('../middleware/leadViewMiddleware');

const router = express.Router();

router.use(auth);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.get('/my-leads', getMyLeads);
router.post('/assign', handleLeadAssignmentNotification, assignLead);

router.route('/:id')
  .get(updateLeadViewTime, getLeadById)
  .put(updateLead)
  .delete(deleteLead);

router.post('/:id/notes', addNote);
// Remove auth middleware for bulk upload as it has its own auth handling
const bulkUploadRouter = express.Router();
bulkUploadRouter.post('/bulk-upload', require('../controllers/bulkUploadController').handleBulkAuth, require('../controllers/bulkUploadController').bulkUploadLeads);

// Mount bulk upload without auth middleware
router.use('/', bulkUploadRouter);

module.exports = router;