// backend/src/api/raportEveniment.routes.js

const express = require('express');
const router = express.Router();
const { createRaportEveniment } = require('../controllers/raportEveniment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const RaportEveniment = require('../models/raportEveniment.model');

router.post('/create', protect, authorize('paznic', 'administrator'), createRaportEveniment);

router.get('/documente', protect, authorize('admin', 'administrator'), async (req, res) => {
  try {
    const now = new Date();
    
    // --- MODIFICARE APLICATĂ AICI ---
    // Am adăugat `populate` pentru a prelua numele paznicului și numele companiei
    const documente = await RaportEveniment.find({ expirationDate: { $gte: now } })
        .populate('paznicId', 'nume prenume')
        .populate({
            path: 'beneficiaryId',
            select: 'profile.nume_companie'
        });
    // --- SFÂRȘIT MODIFICARE ---

    res.json(documente);
  } catch (error) {
    console.error("Eroare la preluarea documentelor:", error);
    res.status(500).json({ message: "Eroare server." });
  }
});

module.exports = router;