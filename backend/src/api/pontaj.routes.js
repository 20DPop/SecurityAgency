// Cale: backend/src/api/pontaj.routes.js
const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getActivePontaj, getActiveEmployees, getActiveEmployeesForBeneficiar,updateLocation,
  getLatestLocation, getIstoricPontaje, getIstoricBeneficiar  } = require('../controllers/pontaj.controller');
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

// 🔹 Paznicul își trimite locația
router.post("/update-location", protect, authorize("paznic"), updateLocation);

// 🔹 Admin/beneficiar vede ultima locație
router.get("/locatie/:paznicId", protect, authorize("admin", "administrator", "beneficiar"), getLatestLocation);

// Ruta pentru istoric 30 zile
router.get("/istoric-60zile", protect, authorize("admin", "administrator"), getIstoricPontaje);

router.get(
  "/istoric-60zile-beneficiar",
  protect,
  authorize("beneficiar"),
  getIstoricBeneficiar
);

module.exports = router;