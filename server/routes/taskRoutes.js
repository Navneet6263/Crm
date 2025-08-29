const express = require('express');
const { 
  createTask, 
  getTasks, 
  updateTask, 
  deleteTask, 
  getTaskStats 
} = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Task CRUD operations
router.post('/', createTask);
router.get('/', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// Task statistics
router.get('/stats', getTaskStats);

module.exports = router;