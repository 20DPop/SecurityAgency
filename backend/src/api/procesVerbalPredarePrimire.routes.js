const express = require('express');
const router = express.Router();
const { createProcesVerbalPredarePrimire } = require('../controllers/procesVerbalPredarePrimire.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/create', protect, authorize('paznic', 'administrator'), createProcesVerbalPredarePrimire);

module.exports = router;