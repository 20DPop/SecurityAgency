// backend/src/api/cleanup.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const ProcesVerbal = require('../models/procesVerbal.model');
const ProcesVerbalPredarePrimire = require('../models/procesVerbalPredarePrimire.model');
const RaportEveniment = require('../models/raportEveniment.model');

router.delete('/documente-expirate', protect, authorize('admin', 'administrator'), async (req, res) => {
  try {
    const now = new Date();

    const deletedPV = await ProcesVerbal.deleteMany({ expirationDate: { $lt: now } });
    const deletedPredare = await ProcesVerbalPredarePrimire.deleteMany({ expirationDate: { $lt: now } });
    const deletedRapoarte = await RaportEveniment.deleteMany({ expirationDate: { $lt: now } });

    res.json({
      message: 'Documente expirate șterse.',
      procesVerbal: deletedPV.deletedCount,
      predarePrimire: deletedPredare.deletedCount,
      rapoarteEveniment: deletedRapoarte.deletedCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Eroare server.' });
  }
});

module.exports = router;
