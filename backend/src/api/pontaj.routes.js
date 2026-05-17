// Cale: backend/src/api/pontaj.routes.js
const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getActivePontaj,
  getActiveEmployees,
  getActiveEmployeesForBeneficiar,
  updateLocation,
  getLatestLocation,
  getTraseuComplet,
  getIstoricPontaje,
  getIstoricBeneficiar
} = require('../controllers/pontaj.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { featureGPS } = require('../middleware/featureFlag.middleware');

// Check-in / Check-out
router.post('/check-in', protect, authorize('paznic'), checkIn);
router.post('/check-out', protect, authorize('paznic'), checkOut);

// Tură activă
router.get('/active', protect, authorize('paznic', 'administrator'), getActivePontaj);

// Angajați activi (admin)
router.get('/angajati-activi', protect, authorize('admin', 'administrator'), getActiveEmployees);

// Angajați activi (beneficiar)
router.get('/angajati-activi-beneficiar', protect, authorize('beneficiar'), getActiveEmployeesForBeneficiar);

// Update locație (paznic trimite coordonatele)
router.post('/update-location', protect, authorize('paznic'), updateLocation);

// Ultima locație
router.get('/locatie/:paznicId', protect, authorize('admin', 'administrator', 'beneficiar'), getLatestLocation);

// ✅ RUTĂ NOUĂ - Traseu complet al turei active (cu feature flag)
router.get(
  '/traseu/:paznicId',
  protect,
  authorize('admin', 'administrator', 'beneficiar'),
  featureGPS,
  getTraseuComplet
);

// Istoric 60 zile (admin)
router.get('/istoric-60zile', protect, authorize('admin', 'administrator'), getIstoricPontaje);

// Istoric 60 zile (beneficiar)
router.get('/istoric-60zile-beneficiar', protect, authorize('beneficiar'), getIstoricBeneficiar);

module.exports = router;