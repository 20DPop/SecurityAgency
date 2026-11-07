// backend/src/api/procesVerbal.routes.js

const express = require('express');
const router = express.Router();
const { createProcesVerbal } = require('../controllers/procesVerbal.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const ProcesVerbal = require('../models/procesVerbal.model');
const multer = require('multer');

// Pozele vin deja redimensionate din aplicație (~200-500 KB). Le păstrăm în memorie și le încorporăm în PDF.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 3, fileSize: 6 * 1024 * 1024, fieldSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) return cb(null, true);
    cb(new Error('FORMAT_POZA'));
  }
});

// Cererile JSON (fără poze) trec neatinse; multer procesează doar multipart/form-data
const uploadPoze = (req, res, next) => {
  upload.array('poze', 3)(req, res, (err) => {
    if (!err) return next();
    const mesaj =
      err.message === 'FORMAT_POZA' ? 'Pozele trebuie să fie JPG sau PNG.' :
      err.code === 'LIMIT_FILE_SIZE' ? 'O poză este prea mare (maxim 6 MB).' :
      err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE' ? 'Maximum 3 poze.' :
      'Cererea nu a putut fi procesată.';
    return res.status(400).json({ message: mesaj });
  });
};

router.use(protect);

router.post('/create', authorize('paznic', 'administrator'), uploadPoze, createProcesVerbal);

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