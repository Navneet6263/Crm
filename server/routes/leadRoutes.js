const express = require('express');
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addNote,
  assignLead,
  getMyLeads
} = require('../controllers/leadController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.get('/my-leads', getMyLeads);
router.post('/assign', assignLead);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

router.post('/:id/notes', addNote);

module.exports = router;