// Cale: backend/src/api/assignments.routes.js
const express = require('express');
const router = express.Router();
const { assignPaznici, unassignPaznici, getAssignedPaznici } = require('../controllers/assignment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Toate rutele de aici sunt doar pentru admini
router.use(protect, authorize('admin', 'administrator'));

router.post('/assign', assignPaznici);
router.post('/unassign', unassignPaznici);
router.get('/:beneficiaryId/paznici', getAssignedPaznici);

module.exports = router;