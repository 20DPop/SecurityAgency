// Cale: backend/src/controllers/assignment.controller.js
const User = require('../models/user.model');

// @desc    Alocă unul sau mai mulți paznici unui beneficiar într-un punct de lucru
// @route   POST /api/assignments/assign
// @access  Private (Admin)
const assignPaznici = async (req, res) => {
  try {
    const { beneficiaryId, punct, pazniciIds } = req.body;

    if (!beneficiaryId || !punct || !Array.isArray(pazniciIds)) {
      return res.status(400).json({ message: "Date invalide trimise." });
    }

    // Încearcă să actualizezi dacă punctul există deja
    let beneficiar = await User.findOneAndUpdate(
      { _id: beneficiaryId, role: 'beneficiar', "profile.assignedPaznici.punct": punct },
      { $addToSet: { "profile.assignedPaznici.$.paznici": { $each: pazniciIds } } },
      { new: true }
    );

    // Dacă punctul nu exista, îl adăugăm
    if (!beneficiar) {
      beneficiar = await User.findByIdAndUpdate(
        beneficiaryId,
        { $push: { "profile.assignedPaznici": { punct, paznici: pazniciIds } } },
        { new: true }
      );
    }

    if (!beneficiar) {
      return res.status(404).json({ message: "Beneficiarul nu a fost găsit." });
    }

    res.status(200).json({ message: "Paznici alocați cu succes!", beneficiar });
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

// @desc    Dezalocă unul sau mai mulți paznici de la un beneficiar într-un punct de lucru
// @route   POST /api/assignments/unassign
// @access  Private (Admin)
const unassignPaznici = async (req, res) => {
  try {
    const { beneficiaryId, punct, pazniciIds } = req.body;

    if (!beneficiaryId || !punct || !Array.isArray(pazniciIds)) {
      return res.status(400).json({ message: "Date invalide trimise." });
    }

    const beneficiar = await User.findOneAndUpdate(
      { _id: beneficiaryId, role: 'beneficiar', "profile.assignedPaznici.punct": punct },
      { $pull: { "profile.assignedPaznici.$.paznici": { $in: pazniciIds } } },
      { new: true }
    );

    if (!beneficiar) {
      return res.status(404).json({ message: "Beneficiarul sau punctul de lucru nu a fost găsit." });
    }

    res.status(200).json({ message: "Paznici dezalocați cu succes!", beneficiar });
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

// @desc    Preia toți paznicii alocați unui anumit beneficiar într-un punct de lucru
// @route   GET /api/assignments/:beneficiaryId/paznici?punct=...
// @access  Private (Admin)
const getAssignedPaznici = async (req, res) => {
  try {
    const { beneficiaryId } = req.params;
    const { punct } = req.query;

    if (!punct) {
      return res.status(400).json({ message: "Trebuie specificat un punct de lucru." });
    }

    const beneficiar = await User.findById(beneficiaryId)
      .populate({
        path: 'profile.assignedPaznici.paznici',
        model: 'User',
        select: 'nume prenume email profile.nr_legitimatie'
      });

    if (!beneficiar || beneficiar.role !== 'beneficiar') {
      return res.status(404).json({ message: "Beneficiarul nu a fost găsit." });
    }

    // Găsește obiectul pentru punctul cerut
    const punctObj = beneficiar.profile.assignedPaznici.find(p => p.punct === punct);

    if (!punctObj) {
      return res.status(200).json([]); // Dacă nu are paznici alocați la punctul respectiv
    }

    res.status(200).json(punctObj.paznici);
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

module.exports = { assignPaznici, unassignPaznici, getAssignedPaznici };
