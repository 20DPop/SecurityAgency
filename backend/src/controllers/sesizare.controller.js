// backend/src/controllers/sesizare.controller.js
const Sesizare = require('../models/sesizare.model');
const User = require('../models/user.model');

// Creare Sesizare
exports.createSesizare = async (req, res) => {
  try {
    const { titlu, descriere } = req.body;
    if (!titlu || !descriere) {
      return res.status(400).json({ message: "Titlu și descriere sunt obligatorii." });
    }

    const beneficiaryId = req.user?._id || req.body.createdByBeneficiaryId;

    const admin = await User.findOne({ role: { $in: ["admin", "administrator"] } });
    if (!admin) {
      return res.status(500).json({ message: "Nu există niciun admin în sistem." });
    }

    const newSesizare = await Sesizare.create({
      titlu,
      descriere,
      createdByBeneficiaryId: beneficiaryId,
      assignedAdminId: admin._id,
      
    });

    res.status(201).json({ message: "Sesizare înregistrată cu succes!", data: newSesizare });
  } catch (error) {
    res.status(500).json({ message: "Eroare server la crearea sesizării." });
  }
};

// Listare sesizări pentru un beneficiar
exports.getSesizariByBeneficiar = async (req, res) => {
  try {
    const beneficiaryId = req.user?._id || req.params.beneficiaryId;

    const sesizari = await Sesizare.find({ createdByBeneficiaryId: beneficiaryId })
      .populate('assignedAdminId', 'email nume prenume');

    res.json(sesizari);
  } catch (error) {
    res.status(500).json({ message: "Eroare la obținerea sesizărilor." });
  }
};

exports.getAllSesizari = async (req, res) => {
  try {
    const sesizari = await Sesizare.find()
      .populate({
    path: 'createdByBeneficiaryId',
    select: 'profile'
  }) // nu specifica 'profile'
      .populate('assignedAdminId', 'email nume prenume')
      .lean();

    res.json(sesizari);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la obținerea tuturor sesizărilor." });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const sesizare = await Sesizare.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!sesizare) {
      return res.status(404).json({ message: "Sesizare nu a fost găsită." });
    }

    res.json({ message: "Status actualizat cu succes!", data: sesizare });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la actualizarea statusului." });
  }
};

exports.updatePasi = async (req, res) => {
  try {
    const { id } = req.params;
    const { pasiRezolvare } = req.body;

    const sesizare = await Sesizare.findByIdAndUpdate(
      id,
      { pasiRezolvare },
      { new: true }
    );

    if (!sesizare) return res.status(404).json({ message: "Sesizare negăsită." });

    res.json({ message: "Pași de rezolvare actualizați!", data: sesizare });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la actualizarea pașilor." });
  }
};
