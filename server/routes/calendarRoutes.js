const express = require('express');
const { 
  createEvent, 
  getEvents, 
  updateEvent, 
  deleteEvent, 
  getTodayEvents, 
  getUpcomingEvents 
} = require('../controllers/calendarController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Calendar CRUD operations
router.post('/', createEvent);
router.get('/', getEvents);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

// Special calendar endpoints
router.get('/today', getTodayEvents);
router.get('/upcoming', getUpcomingEvents);

module.exports = router;