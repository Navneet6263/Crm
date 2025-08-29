const express = require('express');
const router = express.Router();
const { createCompany, getAllCompanies, updateCompanyStatus, suspendCompany, activateCompany } = require('../controllers/companyController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// POST /api/companies - Create new company (Super Admin only)
router.post('/', createCompany);

// GET /api/companies - Get all companies (Super Admin only)
router.get('/', getAllCompanies);

// PUT /api/companies/:companyId/status - Update company status (Super Admin only)
router.put('/:companyId/status', updateCompanyStatus);

// PUT /api/companies/:companyId/suspend - Suspend company (Super Admin only)
router.put('/:companyId/suspend', suspendCompany);

// PUT /api/companies/:companyId/activate - Activate company (Super Admin only)
router.put('/:companyId/activate', activateCompany);

module.exports = router;