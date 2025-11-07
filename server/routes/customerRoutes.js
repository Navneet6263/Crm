const express = require('express');
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addNote
} = require('../controllers/customerController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.route('/:id')
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(deleteCustomer);

router.post('/:id/notes', addNote);
// Remove auth middleware for bulk upload as it has its own auth handling
const bulkUploadRouter = express.Router();
bulkUploadRouter.post('/bulk-upload', require('../controllers/bulkUploadController').handleBulkAuth, require('../controllers/bulkUploadController').bulkUploadCustomers);

// Mount bulk upload without auth middleware
router.use('/', bulkUploadRouter);

module.exports = router;