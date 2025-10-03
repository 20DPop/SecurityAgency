const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { 
  getUserProfile, 
  createUser, 
  getUsersByRole, 
  createAdminAccount,
  updateUser,
  deleteUser,
  getBeneficiari
  // changePassword // Aceasta este exportată, dar nu ai o rută directă pentru ea în fișierul `routes`
} = require('../controllers/user.controller');

const User = require('../models/user.model'); // Adaugă User aici pentru a-l folosi în rutele inline

// Ruta pentru a obține profilul utilizatorului logat
router.get('/profile', protect, getUserProfile);

// Ruta pentru a crea un utilizator nou (paznic, beneficiar) de către un admin
router.post('/create', protect, authorize('admin', 'administrator'), createUser);

router.delete("/:id", protect, authorize("admin", "administrator"), deleteUser);

// Ruta pentru a lista utilizatorii după rol (folosită în pagina de Alocări)
router.get('/list/:role', protect, authorize('admin', 'administrator'), getUsersByRole);
router.get('/paznici', protect, async (req,res)=>{
  try {
    let paznici;
    if(req.user.role === 'admin' || req.user.role === 'administrator'){
      paznici = await User.find({ role: 'paznic' }).select('-password');
    } else if(req.user.role === 'paznic'){
      paznici = await User.find({ _id: req.user.id }).select('-password'); // doar ei înșiși
    } else {
      return res.status(403).json({ message: 'Acces interzis' });
    }
    res.json(paznici);
  } catch(err){
    res.status(500).json({ message: err.message });
  }
});

// router.get('/beneficiari', protect, authorize('administrator', 'paznic'), getBeneficiari);

// router.get('/beneficiari', protect, authorize('admin', 'administrator'), async (req, res) => {
//   try {
//     const beneficiari = await User.find({ role: "beneficiar" }).select('-password');
//     res.json(beneficiari);
//   } catch (err) {
//     console.error("Eroare la obținerea beneficiari:", err);
//     res.status(500).json({ message: "Eroare la obținerea utilizatorilor" });
//   }
// });
router.get('/beneficiari', protect, async (req, res) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'administrator') {
      // admin vede toți beneficiarii
      const beneficiari = await User.find({ role: "beneficiar" }).select('-password');
      return res.json(beneficiari);
    }

    if (req.user.role === 'paznic') {
      // paznic -> poate vedea doar beneficiarii la care e alocat
      // logica ta din getBeneficiari
      return getBeneficiari(req, res);
    }

    return res.status(403).json({ message: "Acces interzis" });
  } catch (err) {
    console.error("Eroare la obținerea beneficiari:", err);
    res.status(500).json({ message: "Eroare la obținerea utilizatorilor" });
  }
});

// --- ADAUGĂ ACEASTĂ RUTĂ NOUĂ PENTRU A OBȚINE DETALIILE UNUI UTILIZATOR DUPĂ ID ---
router.get('/:id', protect, authorize('admin', 'administrator', 'beneficiar'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // Exclude parola

    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });
    }

    // Logică de verificare suplimentară pentru rolul 'beneficiar':
    // Un beneficiar poate vedea detalii doar despre paznicii care îi sunt alocați
    // SAU despre propriul profil (dacă ID-ul este al lui).
    if (req.user.role === 'beneficiar') {
      const beneficiarLogat = await User.findById(req.user.id);

      const pazniciAlocati = (beneficiarLogat.profile.assignedPaznici || [])
        .flatMap(punct => punct.paznici.map(id => id.toString()));

      const isAssignedPaznic = pazniciAlocati.includes(req.params.id);
      const isOwnProfile = req.user.id === req.params.id;

      if (!isAssignedPaznic && !isOwnProfile) {
        return res.status(403).json({ message: 'Acces interzis. Nu ai permisiunea de a vizualiza detaliile acestui angajat.' });
      }
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Eroare la obținerea detaliilor utilizatorului:", error);
    res.status(500).json({ message: error.message || "Eroare internă de server." });
  }
});
// ---------------------------------------------------------------------------------
// Ruta pentru a lista beneficiarii (trebuie să fie înainte de '/:id')

// Ruta pentru a actualiza un utilizator (de către un admin)
router.put('/:id', protect, authorize('admin', 'administrator'), updateUser);

// router.get('/beneficiari', async (req, res) => {
//   try {
//     const beneficiari = await User.find({ role: "beneficiar" }); // ✅ corect
//     res.json(beneficiari);
//   } catch (err) {
//     console.error("Eroare la obținerea beneficiari:", err);
//     res.status(500).json({ message: "Eroare la obținerea utilizatorilor" });
//   }
// });

router.put('/:id/password', protect, authorize('admin','administrator'), async (req, res) => {
  // const User = require('../models/user.model'); // Nu mai este necesar aici dacă ai declarat-o sus

  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Parola trebuie să aibă minim 6 caractere." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });

    user.password = newPassword; 

    await user.save(); 
    res.status(200).json({ message: 'Parola a fost schimbată cu succes.' });
  } catch (error) {
    console.error("Eroare la schimbarea parolei:", error); 
    res.status(500).json({ message: error.message || "Eroare internă de server." });
  }
});

router.get('/beneficiar/angajati', protect, authorize('beneficiar'), async (req, res) => {

  try {
    const beneficiarId = req.user.id;

    const beneficiar = await User.findById(beneficiarId);

    if (!beneficiar) {
      return res.status(404).json({ message: 'Beneficiarul nu a fost găsit.' });
    }

    // Extragem toate ObjectId-urile paznicilor din toate punctele de lucru
    const pazniciIds = (beneficiar.profile.assignedPaznici || [])
      .flatMap(punct => punct.paznici);

    // Populate pentru a aduce datele paznicilor
    const paznici = await User.find({ _id: { $in: pazniciIds } }).select('-password');

    res.status(200).json(paznici);
  } catch (error) {
    console.error("Eroare la obținerea angajaților beneficiarului:", error);
    res.status(500).json({ message: "Eroare server." });
  }
});




router.post(
  '/create-admin',
  protect,
  authorize('administrator'),
  createAdminAccount
);

module.exports = router;