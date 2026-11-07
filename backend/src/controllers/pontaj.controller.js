// Cale: backend/src/controllers/pontaj.controller.js
const mongoose = require('mongoose');
const Pontaj = require('../models/pontaj.model');
const User = require('../models/user.model');
const ProcesVerbalPredarePrimire = require('../models/procesVerbalPredarePrimire.model');
const { buildMapUrl, programareEmail, retrimiteAcum } = require('../services/traseuEmail.service');

// Punctele pot sosi în loturi, la momente diferite: le ordonăm după timestamp înainte de afișare
const sortPuncte = (h) =>
  [...(h || [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

// (Generarea hărții și trimiterea emailului cu traseul sunt în services/traseuEmail.service.js)

// ============================================================
// CHECK-IN
// ============================================================
const checkIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const paznicId = req.user._id;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Coordonatele GPS sunt obligatorii.' });
    }

    const pontajDeschis = await Pontaj.findOne({ paznicId, ora_iesire: null });
    if (pontajDeschis) {
      return res.status(400).json({ message: 'Aveți deja o tură activă.' });
    }

    const beneficiarAlocat = await User.findOne({
      role: 'beneficiar',
      'profile.assignedPaznici.paznici': paznicId
    });

    if (!beneficiarAlocat) {
      return res.status(404).json({ message: 'Nu sunteți alocat la niciun beneficiar.' });
    }

    const newPontaj = await Pontaj.create({
      paznicId,
      beneficiaryId: beneficiarAlocat._id,
      ora_intrare: new Date(),
      locationHistory: [{ latitude: Number(latitude), longitude: Number(longitude) }]
    });

    res.status(201).json({
      message: `Check-in efectuat la ${beneficiarAlocat.profile.nume_companie}!`,
      pontaj: newPontaj
    });
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};

// ============================================================
// CHECK-OUT
// ============================================================
const checkOut = async (req, res) => {
  try {
    const paznicId = req.user._id;

    // fara_pv: agentul alege explicit să închidă tura fără proces verbal de predare-primire
    const cereFaraPv = req.body?.fara_pv === true || req.body?.fara_pv === 'true';
    const motiv = typeof req.body?.motiv === 'string' ? req.body.motiv.trim().slice(0, 300) : '';

    const turaActiva = await Pontaj.findOne({ paznicId, ora_iesire: null }).select('_id');
    if (!turaActiva) {
      return res.status(404).json({ message: 'Nu aveți nicio tură activă.' });
    }

    const pvPredare = await ProcesVerbalPredarePrimire.findOne({ pontajId: turaActiva._id });

    // Fără cerere explicită, PV-ul rămâne obligatoriu
    if (!pvPredare && !cereFaraPv) {
      return res.status(400).json({ message: 'Procesul Verbal de Predare-Primire lipsește.' });
    }

    // Dacă PV-ul există deja, tura se consideră închisă cu PV, chiar dacă s-a cerut "fără PV"
    const tipInchidere = pvPredare ? 'cu_pv' : 'fara_pv';
    // programareEmail(): emailul cu traseul se trimite de worker, cu retry automat (vezi traseuEmail.service.js)
    const set = { ora_iesire: new Date(), tipInchidere, ...programareEmail() };
    if (tipInchidere === 'fara_pv' && motiv) set.motivInchidere = motiv;

    // Atomic: două cereri simultane nu pot închide tura de două ori
    const pontajInchis = await Pontaj.findOneAndUpdate(
      { _id: turaActiva._id, ora_iesire: null },
      { $set: set },
      { new: true }
    );
    if (!pontajInchis) {
      return res.status(404).json({ message: 'Nu aveți nicio tură activă.' });
    }

    res.status(200).json({ message: 'Check-out efectuat cu succes.', tipInchidere });
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};

// ============================================================
// GET TURĂ ACTIVĂ
// ============================================================
const getActivePontaj = async (req, res) => {
  try {
    const turaActiva = await Pontaj.findOne({ paznicId: req.user._id, ora_iesire: null });
    res.status(200).json(turaActiva || null);
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};

// ============================================================
// GET ANGAJAȚI ACTIVI (admin)
// ============================================================
const getActiveEmployees = async (req, res) => {
  try {
    const pontajeActive = await Pontaj.find({ ora_iesire: null })
      .populate('paznicId', 'nume prenume email telefon')
      .populate('beneficiaryId', 'profile.nume_companie');
    res.status(200).json(pontajeActive);
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};

// ============================================================
// GET ANGAJAȚI ACTIVI (beneficiar)
// ============================================================
const getActiveEmployeesForBeneficiar = async (req, res) => {
  try {
    const beneficiaryId = req.user._id;
    const pontajeActive = await Pontaj.find({ ora_iesire: null, beneficiaryId })
      .populate('paznicId', 'nume prenume email telefon')
      .populate('beneficiaryId', 'profile.nume_companie');
    res.status(200).json(pontajeActive);
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};

// ============================================================
// UPDATE LOCAȚIE
// ============================================================
const updateLocation = async (req, res) => {
  try {
    const lat = Number(req.body.latitude);
    const lng = Number(req.body.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ message: 'Coordonate invalide!' });
    }

    const timestamp = new Date();

    // $push atomic: nu mai încărcăm tot istoricul și nu mai apar conflicte de versiune
    const pontaj = await Pontaj.findOneAndUpdate(
      { paznicId: req.user._id, ora_iesire: null },
      { $push: { locationHistory: { latitude: lat, longitude: lng, timestamp } } },
      { projection: { beneficiaryId: 1 } }
    );
    if (!pontaj) {
      return res.status(404).json({ message: 'Nu există tură activă.' });
    }

    const io = req.app.get('io');
    if (io && pontaj.beneficiaryId) {
      io.to(`beneficiar_${pontaj.beneficiaryId.toString()}`).emit('guard_moved', {
        paznicId: req.user._id.toString(),
        numePaznic: `${req.user.nume} ${req.user.prenume}`,
        lat,
        lng,
        timestamp
      });
    }

    res.status(200).json({ message: 'Locația actualizată.' });
  } catch (err) {
    res.status(500).json({ message: 'Eroare server: ' + err.message });
  }
};

// ============================================================
// UPDATE LOCAȚIE ÎN LOT (coada offline din aplicația mobilă)
// Idempotent: punctele deja existente (același timestamp) sunt ignorate, deci retry-ul e sigur.
// ============================================================
const BATCH_MAX = 500;
const GRATIE_DUPA_INCHIDERE_MS = 48 * 60 * 60 * 1000; // acceptăm puncte întârziate 48h după check-out

const updateLocationBatch = async (req, res) => {
  try {
    const { pontajId, points } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(pontajId) || !Array.isArray(points) || points.length === 0 || points.length > BATCH_MAX) {
      return res.status(400).json({ message: 'Date invalide.' });
    }

    const pontaj = await Pontaj.findById(pontajId)
      .select('paznicId beneficiaryId ora_intrare ora_iesire locationHistory.timestamp');
    if (!pontaj) return res.status(404).json({ message: 'Pontajul nu există.' });
    if (pontaj.paznicId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acest pontaj aparține altui cont.' });
    }
    const acum = Date.now();
    if (pontaj.ora_iesire && acum - pontaj.ora_iesire.getTime() > GRATIE_DUPA_INCHIDERE_MS) {
      return res.status(410).json({ message: 'Tura a fost închisă de prea mult timp.' });
    }

    // Intervalul acceptat: de la intrare (-5 min) până acum (+5 min) sau până la ieșire (+10 min)
    const minTs = pontaj.ora_intrare.getTime() - 5 * 60 * 1000;
    const maxTs = pontaj.ora_iesire
      ? pontaj.ora_iesire.getTime() + 10 * 60 * 1000
      : acum + 5 * 60 * 1000;

    const existente = new Set((pontaj.locationHistory || []).map((p) => new Date(p.timestamp).getTime()));
    const noi = [];
    for (const p of points) {
      const lat = Number(p.latitude);
      const lng = Number(p.longitude);
      const ts = Number(p.timestamp);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(ts)) continue;
      if (Math.abs(lat) > 90 || Math.abs(lng) > 180) continue;
      if (ts < minTs || ts > maxTs) continue;
      if (existente.has(ts)) continue;
      existente.add(ts); // ignoră și duplicatele din același lot
      noi.push({ latitude: lat, longitude: lng, timestamp: new Date(ts) });
    }
    noi.sort((a, b) => a.timestamp - b.timestamp);

    if (noi.length > 0) {
      await Pontaj.updateOne({ _id: pontaj._id }, { $push: { locationHistory: { $each: noi } } });
    }

    // Marker live către beneficiar: doar dacă ultimul punct e recent (nu mutăm markerul pe poziții vechi)
    const ultim = noi[noi.length - 1];
    const io = req.app.get('io');
    if (io && ultim && !pontaj.ora_iesire && acum - ultim.timestamp.getTime() < 2 * 60 * 1000) {
      io.to(`beneficiar_${pontaj.beneficiaryId.toString()}`).emit('guard_moved', {
        paznicId: req.user._id.toString(),
        numePaznic: `${req.user.nume} ${req.user.prenume}`,
        lat: ultim.latitude,
        lng: ultim.longitude,
        timestamp: ultim.timestamp
      });
    }

    res.status(200).json({ received: points.length, saved: noi.length });
  } catch (err) {
    res.status(500).json({ message: 'Eroare server: ' + err.message });
  }
};

// ============================================================
// GET ULTIMA LOCAȚIE
// ============================================================
const getLatestLocation = async (req, res) => {
  try {
    const { paznicId } = req.params;
    const pontaj = await Pontaj.findOne({ paznicId, ora_iesire: null });

    if (!pontaj || !pontaj.locationHistory.length) {
      return res.status(404).json({ message: 'Nicio locație găsită.' });
    }

    const latest = pontaj.locationHistory[pontaj.locationHistory.length - 1];
    res.status(200).json(latest);
  } catch (err) {
    res.status(500).json({ message: 'Eroare server: ' + err.message });
  }
};

// ============================================================
// GET TRASEU COMPLET (tură activă)
// ============================================================
const getTraseuComplet = async (req, res) => {
  try {
    const { paznicId } = req.params;

    if (req.user.role === 'beneficiar') {
      const beneficiar = await User.findById(req.user._id);
      const pazniciAlocati = (beneficiar.profile.assignedPaznici || [])
        .flatMap(punct => punct.paznici.map(id => id.toString()));

      if (!pazniciAlocati.includes(paznicId)) {
        return res.status(403).json({ message: 'Acces interzis.' });
      }
    }

    const pontaj = await Pontaj.findOne({ paznicId, ora_iesire: null });

    if (!pontaj) {
      return res.status(200).json({ puncte: [], message: 'Nicio tură activă.' });
    }

    res.status(200).json({
      puncte: sortPuncte(pontaj.locationHistory),
      oraIntrare: pontaj.ora_intrare,
      totalPuncte: pontaj.locationHistory.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Eroare server: ' + err.message });
  }
};

// ============================================================
// ✅ GET TRASEU ISTORIC - pentru un pontaj încheiat
// Returnează URL-ul hărții Mapbox + info pontaj
// ============================================================
const getTraseuIstoric = async (req, res) => {
  try {
    const { pontajId } = req.params;

    const pontaj = await Pontaj.findById(pontajId)
      .populate('paznicId', 'nume prenume');

    if (!pontaj) {
      return res.status(404).json({ message: 'Pontajul nu a fost găsit.' });
    }

    // Beneficiarul poate vedea doar propriile pontaje
    if (req.user.role === 'beneficiar') {
      if (pontaj.beneficiaryId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Acces interzis.' });
      }
    }

    const hartaURL = buildMapUrl(sortPuncte(pontaj.locationHistory));

    res.status(200).json({
      hartaURL,
      oraIntrare: pontaj.ora_intrare,
      oraIesire: pontaj.ora_iesire,
      totalPuncte: pontaj.locationHistory.length,
      paznic: pontaj.paznicId
    });
  } catch (err) {
    res.status(500).json({ message: 'Eroare server: ' + err.message });
  }
};

// ============================================================
// RETRIMITE EMAILUL CU TRASEUL (admin)
// ============================================================
const retrimiteEmailTraseu = async (req, res) => {
  try {
    const { pontajId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(pontajId)) {
      return res.status(400).json({ message: 'Id invalid.' });
    }
    const rezultat = await retrimiteAcum(pontajId);
    if (!rezultat) {
      return res.status(404).json({ message: 'Pontajul nu există, este încă activ sau emailul se trimite chiar acum.' });
    }
    res.status(200).json({
      emailStatus: rezultat.emailStatus,
      emailSentTo: rezultat.emailSentTo,
      emailLastError: rezultat.emailLastError || null
    });
  } catch (err) {
    res.status(500).json({ message: 'Eroare server: ' + err.message });
  }
};

// ============================================================
// ISTORIC PONTAJE - 60 zile (admin)
// ============================================================
const getIstoricPontaje = async (req, res) => {
  try {
    const acum60zile = new Date();
    acum60zile.setDate(acum60zile.getDate() - 60);

    const pontaje = await Pontaj.find({ ora_intrare: { $gte: acum60zile } })
      .populate('paznicId', 'nume prenume email telefon')
      .populate('beneficiaryId', 'profile.nume_companie')
      .sort({ ora_intrare: -1 });

    res.status(200).json(pontaje);
  } catch (err) {
    res.status(500).json({ message: 'Eroare server: ' + err.message });
  }
};

// ============================================================
// ISTORIC BENEFICIAR - 60 zile
// ============================================================
const getIstoricBeneficiar = async (req, res) => {
  try {
    const beneficiaryId = req.user._id;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60);

    const pontaje = await Pontaj.find({
      beneficiaryId,
      ora_intrare: { $gte: startDate }
    })
      .populate('paznicId', 'nume prenume email telefon')
      .populate('beneficiaryId', 'profile.nume_companie')
      .sort({ ora_intrare: -1 });

    res.status(200).json(pontaje);
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getActivePontaj,
  getActiveEmployees,
  getActiveEmployeesForBeneficiar,
  updateLocation,
  updateLocationBatch,
  getLatestLocation,
  getTraseuComplet,
  getTraseuIstoric,
  retrimiteEmailTraseu,
  getIstoricPontaje,
  getIstoricBeneficiar
};