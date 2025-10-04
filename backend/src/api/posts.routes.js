// backend/src/api/posts.routes.js

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const User = require('../models/user.model');

// @desc    Obține TOȚI beneficiarii și punctele de lucru la care paznicul este alocat
// @route   GET /api/posts/my-assigned-workpoints
// @access  Private (Paznic)
router.get('/my-assigned-workpoints', protect, authorize('paznic'), async (req, res) => {
    try {
        const paznicId = req.user._id;

        // Găsește toți beneficiarii la care paznicul este alocat
        const beneficiariAlocati = await User.find({ 
            'profile.assignedPaznici.paznici': paznicId,
            role: 'beneficiar' 
        }).select('_id profile.nume_companie profile.punct_de_lucru');
        
        if (!beneficiariAlocati || beneficiariAlocati.length === 0) {
            return res.status(200).json([]);
        }

        // Formatăm datele pentru a fi ușor de folosit în frontend
        const rezultat = beneficiariAlocati.map(beneficiar => ({
            beneficiarId: beneficiar._id,
            numeCompanie: beneficiar.profile.nume_companie,
            puncteDeLucru: beneficiar.profile.punct_de_lucru || []
        }));
        
        res.status(200).json(rezultat);

    } catch (error) {
        console.error("Eroare la preluarea punctelor de lucru alocate:", error);
        res.status(500).json({ message: 'Eroare de server.' });
    }
});

module.exports = router;