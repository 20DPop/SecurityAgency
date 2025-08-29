// Cale: backend/src/controllers/pontaj.controller.js
const Pontaj = require('../models/pontaj.model');
const User = require('../models/user.model');

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
        return res.status(404).json({ message: 'Nu sunteți alocat la niciun post. Vă rugăm contactați administratorul.' });
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

const checkOut = async (req, res) => { /* ... codul tău existent, este corect ... */ };
const getActivePontaj = async (req, res) => { /* ... codul tău existent, este corect ... */ };

module.exports = { checkIn, checkOut, getActivePontaj };