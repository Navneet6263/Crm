const Lead = require('../models/Lead');

// Delete all data
const deleteAllData = async (req, res) => {
  try {
    console.log('Deleting all data...');
    
    const result = await Lead.deleteMany({});
    
    console.log(`Deleted ${result.deletedCount} records`);
    res.json({ 
      message: 'All data deleted successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting all data:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get original lead data (all leads)
const getOriginalLeadData = async (req, res) => {
  try {
    console.log('Fetching original lead data...');
    
    const leads = await Lead.find({})
      .populate('createdBy assignedTo', 'name email')
      .sort({ createdAt: -1 });

    console.log(`Found ${leads.length} leads`);
    res.json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    console.error('Error fetching original lead data:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get data statistics
const getDataStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments({});
    const activeLeads = await Lead.countDocuments({ isActive: true });
    const inactiveLeads = await Lead.countDocuments({ isActive: false });
    
    const statusStats = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const priorityStats = await Lead.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalLeads,
        active: activeLeads,
        inactive: inactiveLeads,
        byStatus: statusStats,
        byPriority: priorityStats
      }
    });
  } catch (error) {
    console.error('Error fetching data stats:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  deleteAllData,
  getOriginalLeadData,
  getDataStats
};