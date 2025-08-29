// Cale: backend/src/api/procesVerbal.routes.js (Versiune de test)
const express = require('express');
const router = express.Router();
const { createProcesVerbal } = require('../controllers/procesVerbal.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('paznic', 'administrator'));

// Am schimbat ruta. Nu mai are parametru.
router.post('/create', createProcesVerbal);

module.exports = router;