// backend/src/api/procesVerbal.routes.js

const express = require('express');
const router = express.Router();
const { createProcesVerbal } = require('../controllers/procesVerbal.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const ProcesVerbal = require('../models/procesVerbal.model');

router.use(protect);

router.post('/create', authorize('paznic', 'administrator'), createProcesVerbal);

router.get('/documente', authorize('admin', 'administrator'), async (req, res) => {
  try {
    const now = new Date();
    
    // --- MODIFICARE APLICATĂ AICI ---
    // Populăm întregul obiect `paznicId` și `beneficiaryId` pentru a avea acces la toate datele în frontend
    const documente = await ProcesVerbal.find({ expirationDate: { $gte: now } })
      .populate('paznicId', 'nume prenume')
      .populate({
        path: 'beneficiaryId',
        select: 'profile.nume_companie'
      });
    // --- SFÂRȘIT MODIFICARE ---

    res.json(documente);
  } catch (error) {
    console.error("Eroare la preluarea documentelor de intervenție:", error);
    res.status(500).json({ message: "Eroare server." });
  }
});

module.exports = router;