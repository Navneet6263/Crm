const Product = require('../models/Product');
const Lead = require('../models/Lead');

// Get all products
const getProducts = async (req, res) => {
  try {
    // Filter products by company
    const query = { isActive: true };
    
    // Only show products from user's company
    if (req.user.companyId) {
      query.companyId = req.user.companyId;
    }
    
    const products = await Product.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    // Get lead count for each product
    const productsWithCounts = await Promise.all(
      products.map(async (product) => {
        const leadCount = await Lead.countDocuments({ 
          product: product._id, 
          isActive: true 
        });
        return {
          ...product.toObject(),
          leadCount
        };
      })
    );
    
    res.json(productsWithCounts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(400).json({ message: error.message });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    
    // Check if product already exists in this company
    const existingProduct = await Product.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      companyId: req.user.companyId,
      isActive: true 
    });
    
    if (existingProduct) {
      return res.status(400).json({ message: 'Product already exists' });
    }
    
    const product = await Product.create({
      name,
      color: color || '#22c55e',
      icon: icon || '🔵',
      createdBy: req.user._id,
      companyId: req.user.companyId
    });
    
    await product.populate('createdBy', 'name email');
    
    res.status(201).json({
      ...product.toObject(),
      leadCount: 0
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, color, icon },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const leadCount = await Lead.countDocuments({ 
      product: product._id, 
      isActive: true 
    });
    
    res.json({
      ...product.toObject(),
      leadCount
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product has leads
    const leadCount = await Lead.countDocuments({ 
      product: product._id, 
      isActive: true 
    });
    
    if (leadCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete product. It has ${leadCount} active leads.` 
      });
    }
    
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get user's product usage stats
const getUserProductStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await Lead.aggregate([
      {
        $match: {
          createdBy: userId,
          isActive: true
        }
      },
      {
        $group: {
          _id: '$product',
          count: { $sum: 1 },
          lastUsed: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $sort: { count: -1, lastUsed: -1 }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user product stats:', error);
    res.status(400).json({ message: error.message });
  }
};

// Create default products
const createDefaultProducts = async (req, res) => {
  try {
    const defaultProducts = [
      { name: 'Software Development', color: '#3b82f6', icon: '💻' },
      { name: 'Skills Training', color: '#22c55e', icon: '🎓' },
      { name: 'Staffing Solutions', color: '#f59e0b', icon: '👥' },
      { name: 'Digital Marketing', color: '#8b5cf6', icon: '📱' },
      { name: 'Business Consulting', color: '#ef4444', icon: '💼' },
      { name: 'Cloud Services', color: '#06b6d4', icon: '☁️' }
    ];

    const createdProducts = [];
    
    for (const productData of defaultProducts) {
      // Check if product already exists
      const existingProduct = await Product.findOne({ 
        name: { $regex: new RegExp(`^${productData.name}$`, 'i') },
        isActive: true 
      });
      
      if (!existingProduct) {
        const product = await Product.create({
          ...productData,
          createdBy: req.user._id,
          companyId: req.user.companyId
        });
        createdProducts.push(product);
      }
    }
    
    res.json({
      message: `${createdProducts.length} default products created successfully`,
      products: createdProducts
    });
  } catch (error) {
    console.error('Error creating default products:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProductStats,
  createDefaultProducts
};