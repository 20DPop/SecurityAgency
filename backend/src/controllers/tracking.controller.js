const Pontaj = require('../models/pontaj.model');

const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const paznicId = req.user._id;

    const turaActiva = await Pontaj.findOne({ paznicId, ora_iesire: null });

    if (!turaActiva) {
      return res.status(404).json({ message: 'Nicio tură activă găsită. Tracking oprit.' });
    }

    turaActiva.locationHistory.push({ latitude, longitude });
    await turaActiva.save();
    
    res.status(200).json({ message: 'Locație actualizată cu succes.' });

  } catch (error) {
    res.status(500).json({ message: 'Eroare de server.' });
  }
};

module.exports = { updateLocation };