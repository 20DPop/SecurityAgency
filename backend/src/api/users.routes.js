const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { 
  getUserProfile, 
  createUser, 
  getUsersByRole, 
  createAdminAccount 
} = require('../controllers/user.controller');

// Ruta pentru a obține profilul utilizatorului logat
// Este o practică bună să o avem, deși nu e cauza problemei
router.get('/profile', protect, getUserProfile);

// Ruta pentru a crea un utilizator nou (paznic, beneficiar) de către un admin
router.post('/create', protect, authorize('admin', 'administrator'), createUser);

// Ruta pentru a lista utilizatorii după rol (folosită în pagina de Alocări)
router.get('/list/:role', protect, authorize('admin', 'administrator'), getUsersByRole);

// Ruta pentru a crea un cont de 'admin' (de către un 'administrator')
// --- AICI A FOST CORECTURA PRINCIPALĂ ---
router.post(
  '/create-admin',
  protect,
  authorize('administrator'),
  createAdminAccount // Am adăugat funcția controller care lipsea
);

module.exports = router;