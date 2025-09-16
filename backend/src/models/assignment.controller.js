// Cale: backend/src/controllers/assignment.controller.js
const User = require('../models/user.model');

// @desc    Alocă unul sau mai mulți paznici unui beneficiar
// @route   POST /api/assignments/assign
// @access  Private (Admin)
const assignPaznici = async (req, res) => {
  try {
    const { beneficiaryId, pazniciIds } = req.body;

    // Găsim beneficiarul și adăugăm ID-urile paznicilor în lista sa,
    // folosind $addToSet pentru a preveni duplicatele.
    const beneficiar = await User.findByIdAndUpdate(
      beneficiaryId,
      { 
        $setOnInsert: { 'profile.assignedPazniciIds': [] }, // ⚡ array gol dacă nu există
        $addToSet: { 'profile.assignedPazniciIds': { $each: pazniciIds } } 
      },
      { new: true, upsert: true }
    );

    if (!beneficiar || beneficiar.role !== 'beneficiar') {
      return res.status(404).json({ message: 'Beneficiarul nu a fost găsit.' });
    }

    res.status(200).json({ message: 'Paznici alocați cu succes.', beneficiar });
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

// @desc    Dezalocă unul sau mai mulți paznici de la un beneficiar
// @route   POST /api/assignments/unassign
// @access  Private (Admin)
const unassignPaznici = async (req, res) => {
  try {
    const { beneficiaryId, pazniciIds } = req.body;

    // Găsim beneficiarul și scoatem ID-urile paznicilor din lista sa
    const beneficiar = await User.findByIdAndUpdate(
      beneficiaryId,
      { $pull: { 'profile.assignedPazniciIds': { $in: pazniciIds } } }, // $pull cu $in pentru a scoate mai mulți
      { new: true }
    );

    if (!beneficiar || beneficiar.role !== 'beneficiar') {
      return res.status(404).json({ message: 'Beneficiarul nu a fost găsit.' });
    }

    res.status(200).json({ message: 'Paznici dezalocați cu succes.', beneficiar });
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

// @desc    Preia toți paznicii alocați unui anumit beneficiar
// @route   GET /api/assignments/:beneficiaryId/paznici
// @access  Private (Admin)
const getAssignedPaznici = async (req, res) => {
    try {
        const { beneficiaryId } = req.params;
        const beneficiar = await User.findById(beneficiaryId)
            .populate({
                path: 'profile.assignedPazniciIds',
                model: 'User',
                select: 'nume prenume email profile.nr_legitimatie' // Selectăm ce date vrem despre paznici
            });

        if (!beneficiar || beneficiar.role !== 'beneficiar') {
            return res.status(404).json({ message: 'Beneficiarul nu a fost găsit.' });
        }

        res.status(200).json(beneficiar.profile.assignedPazniciIds);
    } catch (error) {
        res.status(500).json({ message: `Eroare de server: ${error.message}` });
    }
};

module.exports = { assignPaznici, unassignPaznici, getAssignedPaznici };