// Cale: backend/src/controllers/pontaj.controller.js
const Pontaj = require('../models/pontaj.model');
const User = require('../models/user.model');

// @desc    Începe o nouă tură (check-in)
// @route   POST /api/pontaj/check-in
// @access  Private (Paznic)
const checkIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const paznicId = req.user._id;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Datele de localizare sunt obligatorii pentru a începe tura.' });
    }
    
    const pontajDeschis = await Pontaj.findOne({ paznicId, ora_iesire: null });
    if (pontajDeschis) {
      return res.status(400).json({ message: 'Aveți deja o tură activă. Vă rugăm să faceți check-out mai întâi.' });
    }

    const beneficiarAlocat = await User.findOne({ 
        role: 'beneficiar', 
        'profile.assignedPazniciIds': paznicId 
    });

    if (!beneficiarAlocat) {
        return res.status(404).json({ message: 'Nu sunteți alocat la niciun beneficiar. Vă rugăm contactați administratorul.' });
    }

    const newPontaj = await Pontaj.create({
      paznicId,
      beneficiaryId: beneficiarAlocat._id,
      ora_intrare: new Date(),
      locationHistory: [{ latitude, longitude }]
    });

    res.status(201).json({ 
        message: `Check-in efectuat cu succes la ${beneficiarAlocat.profile.nume_companie}!`, 
        pontaj: newPontaj 
    });
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

// @desc    Încheie tura curentă (check-out)
// @route   POST /api/pontaj/check-out
// @access  Private (Paznic)
const checkOut = async (req, res) => {
  try {
    const paznicId = req.user._id;

    // Căutăm tura activă (cea care nu are o oră de ieșire setată)
    const turaActiva = await Pontaj.findOne({ 
      paznicId, 
      ora_iesire: null 
    });

    // Verificăm dacă a fost găsită o tură activă
    if (!turaActiva) {
      return res.status(404).json({ message: 'Nu aveți nicio tură activă pe care să o încheiați.' });
    }

    // Setăm ora de ieșire la momentul actual
    turaActiva.ora_iesire = new Date();
    
    // Salvăm modificările în baza de date
    await turaActiva.save();

    // Trimitem un răspuns de succes înapoi la client
    res.status(200).json({ 
        message: 'Check-out efectuat cu succes. Tura a fost încheiată.',
        pontaj: turaActiva 
    });

  } catch (error) {
    // În caz de eroare, trimitem un răspuns de eroare
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

// @desc    Preia tura activă pentru paznicul logat
// @route   GET /api/pontaj/active
// @access  Private (Paznic)
const getActivePontaj = async (req, res) => {
    try {
        const paznicId = req.user._id;
        const turaActiva = await Pontaj.findOne({ paznicId, ora_iesire: null });

        if (turaActiva) {
            res.status(200).json(turaActiva);
        } else {
            res.status(200).json(null); // Trimitem null dacă nu există o tură activă
        }
    } catch (error) {
        res.status(500).json({ message: `Eroare de server: ${error.message}` });
    }
};

const getActiveEmployees = async (req, res) => {
  try {
    const pontajeActive = await Pontaj.find({ ora_iesire: null })
      .populate("paznicId", "nume prenume email telefon") // preia datele paznicului
      .populate("beneficiaryId", "profile.nume_companie"); // preia compania beneficiarului

    res.status(200).json(pontajeActive);
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

const getActiveEmployeesForBeneficiar = async (req, res) => {
  try {
    const beneficiaryId = req.user._id;

    // Preluăm doar pontajele active pentru beneficiar
    const pontajeActive = await Pontaj.find({ ora_iesire: null, beneficiaryId })
      .populate("paznicId", "nume prenume email telefon") // datele paznicului
      .populate("beneficiaryId", "profile.nume_companie"); // datele firmei

    res.status(200).json(pontajeActive);
  } catch (error) {
    console.error("Eroare backend:", error);
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

module.exports = { checkIn, checkOut, getActivePontaj, getActiveEmployees, getActiveEmployeesForBeneficiar };