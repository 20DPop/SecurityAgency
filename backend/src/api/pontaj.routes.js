// Cale: backend/src/api/pontaj.routes.js
const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getActivePontaj, getActiveEmployees, getActiveEmployeesForBeneficiar  } = require('../controllers/pontaj.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// router.use(protect, authorize('paznic', 'administrator'));

// router.post('/check-in', checkIn);
// router.post('/check-out', checkOut);
// router.get('/active', getActivePontaj);
// router.get("/angajati-activi", protect, authorize("admin", "administrator"), getActiveEmployees);
// Paznic / Administrator pentru check-in/check-out
router.post('/check-in', protect, authorize('paznic'), checkIn);
router.post('/check-out', protect, authorize('paznic'), checkOut);

// Paznic / Administrator pentru tura activă
router.get('/active', protect, authorize('paznic', 'administrator'), getActivePontaj);

// DOAR admin/administrator pentru lista de angajați activi
router.get("/angajati-activi", protect, authorize("admin", "administrator"), getActiveEmployees);

// Ruta pentru beneficiari
router.get("/angajati-activi-beneficiar", protect, authorize("beneficiar"), getActiveEmployeesForBeneficiar);

module.exports = router;