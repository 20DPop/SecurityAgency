const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { 
  getIncidenteByBeneficiar, 
  getIncidente, 
  createIncident, 
  restabilireIncident, 
  deleteIncident 
} = require("../controllers/incident.controller");

// Rute pentru incidente
router.post("/", protect, createIncident);
router.get("/", protect, getIncidente);
router.get("/beneficiar", protect, getIncidenteByBeneficiar);
router.post("/:id/restabilire", protect, restabilireIncident);
router.delete("/:id", protect, deleteIncident);

module.exports = router;
