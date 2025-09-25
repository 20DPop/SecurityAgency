// // Cale: backend/src/api/procesVerbal.routes.js (Versiune de test)
// const express = require('express');
// const router = express.Router();
// const { createProcesVerbal } = require('../controllers/procesVerbal.controller');
// const { protect, authorize } = require('../middleware/auth.middleware');

// router.use(protect, authorize('paznic', 'administrator'));

// // Am schimbat ruta. Nu mai are parametru.
// router.post('/create', createProcesVerbal);

// // ✅ Noua rută pentru admin: listare documente intervenție
// router.get('/documente', protect, authorize('admin', 'administrator'), async (req, res) => {
//   try {
//     const now = new Date();
//     const documente = await ProcesVerbal.find({ expirationDate: { $gte: now } })
//       .populate('paznicId', 'nume prenume')
//       .populate('postId', 'nume_post');
//     res.json(documente);
//   } catch (error) {
//     console.error("Eroare la preluarea documentelor de intervenție:", error);
//     res.status(500).json({ message: "Eroare server." });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const { createProcesVerbal } = require('../controllers/procesVerbal.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const ProcesVerbal = require('../models/procesVerbal.model'); // <<< adaugă asta

router.use(protect);

router.post('/create', authorize('paznic', 'administrator'), createProcesVerbal);

// Ruta pentru listarea documentelor de intervenție
router.get('/documente', protect, authorize('admin', 'administrator'), async (req, res) => {
  try {
    const now = new Date();
    const documente = await ProcesVerbal.find({ expirationDate: { $gte: now } })
      .populate('paznicId', 'nume prenume')
      .populate('postId', 'nume_post');

    res.json(documente);
  } catch (error) {
    console.error("Eroare la preluarea documentelor de intervenție:", error);
    res.status(500).json({ message: "Eroare server." });
  }
});

module.exports = router;

