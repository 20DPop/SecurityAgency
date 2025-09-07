// backend/src/api/sesizari.routes.js
const express = require("express");
const router = express.Router();
const sesizareController = require("../controllers/sesizare.controller");
const { protect, authorize } = require('../middleware/auth.middleware');

// POST - creare sesizare (folosim protect pentru a avea req.user)
router.post("/", protect, sesizareController.createSesizare);

// GET - listare sesizari beneficiar
router.get("/:beneficiaryId", protect, sesizareController.getSesizariByBeneficiar);

router.get("/", sesizareController.getAllSesizari);

// PATCH - actualizare status
router.patch("/:id/status", sesizareController.updateStatus);

router.patch("/:id", sesizareController.updatePasi);

module.exports = router;
