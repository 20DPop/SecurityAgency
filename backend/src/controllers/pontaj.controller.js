// Cale: backend/src/controllers/pontaj.controller.js
const Pontaj = require('../models/pontaj.model');
const User = require('../models/user.model');
const ProcesVerbalPredarePrimire = require('../models/procesVerbalPredarePrimire.model');

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
        'profile.assignedPaznici.paznici': paznicId 
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
    const turaActiva = await Pontaj.findOne({ paznicId, ora_iesire: null });

    if (!turaActiva) {
      return res.status(404).json({ message: 'Nu aveți nicio tură activă pe care să o încheiați.' });
    }

    const pvPredare = await ProcesVerbalPredarePrimire.findOne({ pontajId: turaActiva._id });
    if (!pvPredare) {
        return res.status(400).json({ message: 'EROARE: Procesul Verbal de Predare-Primire nu a fost găsit. Tura nu poate fi încheiată.' });
    }

    turaActiva.ora_iesire = new Date();
    await turaActiva.save();

    res.status(200).json({ message: 'Check-out efectuat cu succes. Tura a fost încheiată.' });
  } catch (error) {
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

const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Coordonate invalide!" });
    }

    // caută pontajul activ al paznicului logat
    const pontaj = await Pontaj.findOne({ paznicId: req.user._id, ora_iesire: null });

    if (!pontaj) {
      return res.status(404).json({ message: "Nu există tura activă pentru acest paznic." });
    }

    pontaj.locationHistory.push({ latitude, longitude, timestamp: new Date() });
    await pontaj.save();

    res.status(200).json({ message: "Locația a fost actualizată." });
  } catch (err) {
    res.status(500).json({ message: "Eroare server: " + err.message });
  }
};

const getLatestLocation = async (req, res) => {
  try {
    const { paznicId } = req.params;

    const pontaj = await Pontaj.findOne({ paznicId, ora_iesire: null });

    if (!pontaj || !pontaj.locationHistory.length) {
      return res.status(404).json({ message: "Nicio locație găsită pentru acest paznic." });
    }

    const latest = pontaj.locationHistory[pontaj.locationHistory.length - 1];

    res.status(200).json(latest);
  } catch (err) {
    res.status(500).json({ message: "Eroare server: " + err.message });
  }
};
const getIstoricPontaje = async (req, res) => {
  try {
    const acum = new Date();
    const acum60zile = new Date();
    acum60zile.setDate(acum.getDate() - 60);

    await Pontaj.deleteMany({ ora_intrare: { $lt: acum60zile } });

    // Preluăm toate pontajele între acum30zile și acum
    const pontaje = await Pontaj.find({
      ora_intrare: { $gte: acum60zile }
    })
      .populate("paznicId", "nume prenume email telefon")
      .populate("beneficiaryId", "profile.nume_companie")
      .sort({ ora_intrare: -1 }); // cele mai recente primele

    res.status(200).json(pontaje);
  } catch (err) {
    console.error("Eroare la preluarea istoricului pontajelor:", err);
    res.status(500).json({ message: "Eroare de server: " + err.message });
  }
};

const getIstoricBeneficiar = async (req, res) => {
  try {
    const beneficiaryId = req.user._id;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60);

    await Pontaj.deleteMany({ beneficiaryId, ora_intrare: { $lt: startDate } });

    const pontaje = await Pontaj.find({
      beneficiaryId,
      ora_intrare: { $gte: startDate }
    })
      .populate("paznicId", "nume prenume email telefon")
      .populate("beneficiaryId", "profile.nume_companie")
      .sort({ ora_intrare: -1 });

    res.status(200).json(pontaje);
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};

module.exports = { checkIn, checkOut, getActivePontaj, getActiveEmployees, getActiveEmployeesForBeneficiar
, updateLocation, getLatestLocation, getIstoricPontaje,getIstoricBeneficiar
 };