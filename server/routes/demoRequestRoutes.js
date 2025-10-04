const express = require('express');
const router = express.Router();
const {
  getDemoRequests,
  createDemoRequest,
  approveDemoRequest,
  rejectDemoRequest,
  deleteDemoRequest
} = require('../controllers/demoRequestController');

// Public route - create demo request (no auth required)
router.post('/', createDemoRequest);

// Protected routes - require authentication (auth will be applied at app level)
router.get('/', getDemoRequests);
router.put('/:id/approve', approveDemoRequest);
router.put('/:id/reject', rejectDemoRequest);
router.delete('/:id', deleteDemoRequest);

module.exports = router;