const express = require('express');
const { 
  createCommunication, 
  getCommunications, 
  updateCommunication, 
  deleteCommunication 
} = require('../controllers/communicationController');

const router = express.Router();

// Communication CRUD operations
router.post('/', createCommunication);
router.get('/', getCommunications);
router.put('/:id', updateCommunication);
router.delete('/:id', deleteCommunication);

module.exports = router;