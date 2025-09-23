const Incident = require('../models/incident.model');

// GET toate incidentele (admin)
const getIncidente = async (req, res) => {
  try {
    const incidente = await Incident.find();
    res.status(200).json(incidente);
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};

// GET incidente pentru beneficiarul logat
const getIncidenteByBeneficiar = async (req, res) => {
  try {
    const userId = req.user._id; // utilizatorul logat
    if (!userId) return res.status(400).json({ message: "Userul nu este autentificat." });

    const incidente = await Incident.find({ companieId: req.user._id });

    res.status(200).json(incidente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la preluarea incidentelor beneficiarului." });
  }
};

// POST creare incident
const createIncident = async (req, res) => {
  try {
    const { titlu, descriere, punctDeLucru, companieId } = req.body;

    if (!companieId) {
      return res.status(400).json({ message: "Trebuie specificat companieId pentru incident." });
    }

    const incident = await Incident.create({
      titlu,
      descriere,
      companieId,  // ✅ se salvează corect pe firma beneficiarului
      punctDeLucru,
    });

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};

// DELETE incident
const deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: "Incidentul nu a fost găsit." });

    await incident.deleteOne();
    res.status(200).json({ message: "Incident șters cu succes!" });
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};

// POST restabilire incident
const restabilireIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: "Incidentul nu a fost găsit." });

    // Creează incident verde
    const incidentRestabilit = await Incident.create({
      titlu: `Restabilire: ${incident.titlu}`,
      descriere: incident.descriere,
      companieId: incident.companieId,
      punctDeLucru: incident.punctDeLucru,
      restabilit: true,
      istoric: true,
    });

    // Marchează originalul ca istoric
    incident.istoric = true;
    await incident.save();

    res.status(201).json(incidentRestabilit);
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};

// GET incidente din istoric
const getIstoricIncidente = async (req, res) => {
  try {
    const incidente = await Incident.find({ istoric: true });
    res.status(200).json(incidente);
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};

module.exports = { 
  getIncidente, 
  createIncident, 
  deleteIncident, 
  restabilireIncident, 
  getIncidenteByBeneficiar ,
  getIstoricIncidente
};
