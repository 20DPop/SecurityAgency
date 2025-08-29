// Cale: backend/src/api/pontaj.routes.js
const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getActivePontaj } = require('../controllers/pontaj.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('paznic', 'administrator'));

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/active', getActivePontaj);

module.exports = router;