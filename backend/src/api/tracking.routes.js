const express = require('express');
const router = express.Router();
const { updateLocation } = require('../controllers/tracking.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/update', protect, authorize('paznic'), updateLocation);

module.exports = router;