const express = require('express');
const router = express.Router();
const { createRaportEveniment } = require('../controllers/raportEveniment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/create', protect, authorize('paznic', 'administrator'), createRaportEveniment);

module.exports = router;