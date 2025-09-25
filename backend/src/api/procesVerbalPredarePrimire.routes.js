// 
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const ProcesVerbalPredarePrimire = require('../models/procesVerbalPredarePrimire.model');
const { createProcesVerbalPredarePrimire } = require('../controllers/procesVerbalPredarePrimire.controller');

router.post('/create', protect, authorize('paznic', 'administrator'), createProcesVerbalPredarePrimire);

// Ruta nouă pentru admin
router.get('/documente', protect, authorize('admin', 'administrator'), async (req, res) => {
  try {
    const now = new Date();
    const documente = await ProcesVerbalPredarePrimire.find({ expirationDate: { $gte: now } });
    res.json(documente);
  } catch (error) {
    console.error("Eroare la preluarea documentelor:", error);
    res.status(500).json({ message: "Eroare server." });
  }
});

module.exports = router;
