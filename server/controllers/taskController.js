const Task = require('../models/Task');
const Lead = require('../models/Lead');

const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user._id
    };

    const task = await Task.create(taskData);
    await task.populate('createdBy', 'name email');

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo, relatedTo, relatedId, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (req.user.role !== 'super-admin' && req.user.role !== 'admin') {
      query.$or = [
        { createdBy: req.user._id },
        { assignedTo: req.user.name }
      ];
    }
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (relatedTo) query.relatedTo = relatedTo;
    if (relatedId) query.relatedId = relatedId;

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1, priority: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(400).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    const isAdminOrSuperAdmin = ['admin', 'super-admin'].includes(req.user.role);
    const isOwner = task.createdBy.toString() === req.user._id.toString();
    
    if (!isAdminOrSuperAdmin && !isOwner) {
      return res.status(403).json({ 
        message: 'Access denied. You can only delete your own tasks.' 
      });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(400).json({ message: error.message });
  }
};

const getTaskStats = async (req, res) => {
  try {
    let query = {};
    
    // Role-based filtering
    if (req.user.role !== 'super-admin' && req.user.role !== 'admin') {
      query.$or = [
        { createdBy: req.user._id },
        { assignedTo: req.user.name }
      ];
    }

    const stats = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      statusStats: stats,
      priorityStats: priorityStats
    });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTaskStats
};