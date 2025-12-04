const express = require('express');
const { 
  createCommunication, 
  getCommunications, 
  updateCommunication, 
  deleteCommunication,
  sendEmail
} = require('../controllers/communicationController');

const router = express.Router();

// Communication CRUD operations
router.post('/', createCommunication);
router.get('/', getCommunications);
router.put('/:id', updateCommunication);
router.delete('/:id', deleteCommunication);

// Email sending
router.post('/send-email', sendEmail);

module.exports = router;