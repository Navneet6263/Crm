const { body, validationResult } = require('express-validator');

// Validation rules
const validateUser = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required')
];

const validateLead = [
  body('contactPerson').trim().isLength({ min: 2 }).withMessage('Contact person name required'),
  body('companyName').trim().isLength({ min: 2 }).withMessage('Company name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').isMobilePhone().withMessage('Valid phone number required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
];

const validateCustomer = [
  body('name').trim().isLength({ min: 2 }).withMessage('Customer name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').isMobilePhone().withMessage('Valid phone number required'),
  body('companyName').optional().trim().isLength({ min: 2 }).withMessage('Company name too short')
];

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateUser,
  validateLead,
  validateCustomer,
  handleValidationErrors
};