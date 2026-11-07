const express = require('express');
const router = express.Router();

const {
  checkIn,
  checkOut,
  getActivePontaj,
  getActiveEmployees,
  getActiveEmployeesForBeneficiar,
  updateLocation,
  updateLocationBatch,
  getLatestLocation,
  getTraseuComplet,
  getTraseuIstoric,
  retrimiteEmailTraseu,
  getIstoricPontaje,
  getIstoricBeneficiar
} = require('../controllers/pontaj.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/check-in', protect, authorize('paznic'), checkIn);

router.post('/check-out', protect, authorize('paznic'), checkOut);

router.get(
  '/active',
  protect,
  authorize('paznic', 'administrator'),
  getActivePontaj
);

router.get(
  '/angajati-activi',
  protect,
  authorize('admin', 'administrator'),
  getActiveEmployees
);

router.get(
  '/angajati-activi-beneficiar',
  protect,
  authorize('beneficiar'),
  getActiveEmployeesForBeneficiar
);

router.post(
  '/update-location',
  protect,
  authorize('paznic'),
  updateLocation
);

// Coada GPS offline din aplicația mobilă (trimitere în loturi)
router.post(
  '/update-location-batch',
  protect,
  authorize('paznic'),
  updateLocationBatch
);

router.get(
  '/locatie/:paznicId',
  protect,
  authorize('admin', 'administrator', 'beneficiar'),
  getLatestLocation
);

// Traseu live
router.get(
  '/traseu/:paznicId',
  protect,
  authorize('admin', 'administrator', 'beneficiar'),
  getTraseuComplet
);

// Traseu istoric
router.get(
  '/traseu-istoric/:pontajId',
  protect,
  authorize('admin', 'administrator', 'beneficiar'),
  getTraseuIstoric
);

// Retrimite emailul cu traseul pentru o tură încheiată (admin)
router.post(
  '/:pontajId/retrimite-email',
  protect,
  authorize('admin', 'administrator'),
  retrimiteEmailTraseu
);

router.get(
  '/istoric-60zile',
  protect,
  authorize('admin', 'administrator'),
  getIstoricPontaje
);

router.get(
  '/istoric-60zile-beneficiar',
  protect,
  authorize('beneficiar'),
  getIstoricBeneficiar
);

module.exports = router;