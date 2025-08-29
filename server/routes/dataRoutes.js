const express = require('express');
const {
  deleteAllData,
  getOriginalLeadData,
  getDataStats
} = require('../controllers/dataController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// Delete all data
router.delete('/delete-all', deleteAllData);

// Get original lead data
router.get('/original-leads', getOriginalLeadData);

// Get data statistics
router.get('/stats', getDataStats);

module.exports = router;