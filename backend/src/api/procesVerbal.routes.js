const express = require('express');
const router = express.Router();
const { createProcesVerbal } = require('../controllers/procesVerbal.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('paznic', 'administrator'));
router.post('/:pontajId', createProcesVerbal);

module.exports = router;