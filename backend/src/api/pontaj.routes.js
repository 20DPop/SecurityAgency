const express = require('express');
const router = express.Router();
const { checkIn, checkOut } = require('../controllers/pontaj.controller');
const { protect, authorize } = require('../middleware/auth.middleware');


router.use(protect, authorize('paznic', 'administrator'));

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);

module.exports = router;