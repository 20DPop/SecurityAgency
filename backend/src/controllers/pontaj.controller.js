// Cale: backend/src/controllers/pontaj.controller.js
const Pontaj = require('../models/pontaj.model');
const User = require('../models/user.model');
const ProcesVerbalPredarePrimire = require('../models/procesVerbalPredarePrimire.model');
const { sendEmail } = require('../services/email.service');

// ============================================================
// FUNCȚIE AJUTĂTOARE - Generează URL harta statică Mapbox
// ✅ Gratuit 50.000 req/lună
// ⚠️ Mapbox folosește [longitude, latitude] - ordinea e inversă!
// ============================================================
const genereazaHartaURL = (locationHistory) => {
  if (!locationHistory || locationHistory.length === 0) return null;

  const total = locationHistory.length;
  const step = Math.ceil(total / 100);
  const puncteReduse = locationHistory.filter((_, i) => i % step === 0);

  const primul = locationHistory[0];
  const ultimul = locationHistory[locationHistory.length - 1];

  const coordinates = puncteReduse.map(p => [p.longitude, p.latitude]);

  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { stroke: '#ff0000', 'stroke-width': 3, 'stroke-opacity': 0.9 },
        geometry: { type: 'LineString', coordinates }
      },
      {
        type: 'Feature',
        properties: { 'marker-color': '#00b300', 'marker-size': 'large', 'marker-symbol': 'star' },
        geometry: { type: 'Point', coordinates: [primul.longitude, primul.latitude] }
      },
      {
        type: 'Feature',
        properties: { 'marker-color': '#cc0000', 'marker-size': 'large', 'marker-symbol': 'embassy' },
        geometry: { type: 'Point', coordinates: [ultimul.longitude, ultimul.latitude] }
      }
    ]
  };

  const geojsonEncoded = encodeURIComponent(JSON.stringify(geojson));

  return (
    `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/` +
    `geojson(${geojsonEncoded})/` +
    `auto/800x500?padding=50` +
    `&access_token=${process.env.MAPBOX_TOKEN}`
  );
};

// ============================================================
// FUNCȚIE AJUTĂTOARE - Trimite email cu traseul la check-out
// ============================================================
const trimiteEmailTraseu = async (pontaj) => {
  try {
    const beneficiar = await User.findById(pontaj.beneficiaryId);
    const paznic = await User.findById(pontaj.paznicId);

    if (!beneficiar || !beneficiar.email) {
      console.log('[GPS Email] Beneficiarul nu are email setat, skip.');
      return;
    }
    if (!paznic) {
      console.log('[GPS Email] Paznicul nu a fost găsit, skip.');
      return;
    }
    if (beneficiar.seeUpdates !== 1) {
      console.log('[GPS Email] Beneficiarul nu are acces la funcția GPS, skip.');
      return;
    }

    const { locationHistory } = pontaj;
    if (!locationHistory || locationHistory.length === 0) {
      console.log('[GPS Email] Nu există date GPS pentru această tură, skip.');
      return;
    }

    const hartaURL = genereazaHartaURL(locationHistory);

    const dataAzi = new Date().toLocaleDateString('ro-RO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const oraIntrare = pontaj.ora_intrare
      ? new Date(pontaj.ora_intrare).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
      : 'N/A';
    const oraIesire = pontaj.ora_iesire
      ? new Date(pontaj.ora_iesire).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
      : 'N/A';

    const durataMs = new Date(pontaj.ora_iesire) - new Date(pontaj.ora_intrare);
    const durataOre = Math.floor(durataMs / (1000 * 60 * 60));
    const durataMinute = Math.floor((durataMs % (1000 * 60 * 60)) / (1000 * 60));

    await sendEmail({
      to: beneficiar.email,
      subject: `Raport traseu paznic - ${dataAzi}`,
      senderName: 'SecurityApp',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1a1a2e; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;">🗺️ Raport Traseu Zilnic</h1>
            <p style="color: #aaaaaa; margin: 8px 0 0 0; font-size: 14px;">${dataAzi}</p>
          </div>
          <div style="padding: 28px;">
            <p style="font-size: 16px; color: #333;">Stimate beneficiar,</p>
            <p style="color: #555;">
              Tura paznicului <strong>${paznic.nume} ${paznic.prenume}</strong> a fost încheiată.
            </p>
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;">🕐 Check-in:</td>
                  <td style="padding: 8px 0; font-weight: bold; font-size: 14px;">${oraIntrare}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;">🕕 Check-out:</td>
                  <td style="padding: 8px 0; font-weight: bold; font-size: 14px;">${oraIesire}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;">⏱️ Durata turei:</td>
                  <td style="padding: 8px 0; font-weight: bold; font-size: 14px;">${durataOre}h ${durataMinute}min</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;">📍 Puncte GPS:</td>
                  <td style="padding: 8px 0; font-weight: bold; font-size: 14px;">${locationHistory.length}</td>
                </tr>
              </table>
            </div>
            <p style="font-weight: bold; color: #333; margin-bottom: 10px;">Traseul parcurs:</p>
            ${hartaURL
              ? `<img src="${hartaURL}" style="width:100%;border-radius:8px;border:1px solid #eee;" alt="Harta traseu"/>`
              : `<p style="color:#e74c3c;padding:16px;background:#ffeaea;border-radius:6px;">⚠️ Nu s-au înregistrat date GPS.</p>`
            }
            <p style="color:#999;font-size:12px;margin-top:12px;text-align:center;">
              ⭐ = Start &nbsp;&nbsp; 🔴 = Final &nbsp;&nbsp; Linia roșie = traseul parcurs
            </p>
          </div>
          <div style="background:#f0f0f0;padding:16px;text-align:center;">
            <p style="margin:0;color:#999;font-size:11px;">
              Email generat automat de SecurityApp.<br>
              Datele GPS sunt păstrate 60 de zile.
            </p>
          </div>
        </div>
      `
    });

    console.log(`[GPS Email] Email trimis cu succes la ${beneficiar.email}`);
  } catch (error) {
    console.error('[GPS Email] Eroare:', error.message);
  }
};

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
      return res.status(400).json({ message: 'Aveți deja o tură activă. Faceți check-out mai întâi.' });
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
    const turaActiva = await Pontaj.findOne({ paznicId, ora_iesire: null });

    if (!turaActiva) {
      return res.status(404).json({ message: 'Nu aveți nicio tură activă.' });
    }

    const pvPredare = await ProcesVerbalPredarePrimire.findOne({ pontajId: turaActiva._id });
    if (!pvPredare) {
      return res.status(400).json({ message: 'Procesul Verbal de Predare-Primire lipsește. Tura nu poate fi încheiată.' });
    }

    turaActiva.ora_iesire = new Date();
    await turaActiva.save();

    trimiteEmailTraseu(turaActiva).catch(err =>
      console.error('[GPS Email] Eroare fundal:', err.message)
    );

    res.status(200).json({ message: 'Check-out efectuat cu succes.' });
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
// Returnează TOȚI paznicii activi alocați acestui beneficiar
// ============================================================
const getActiveEmployeesForBeneficiar = async (req, res) => {
  try {
    const beneficiaryId = req.user._id;

    const pontajeActive = await Pontaj.find({ ora_iesire: null, beneficiaryId })
      .populate('paznicId', 'nume prenume email telefon')
      .populate('beneficiaryId', 'profile.nume_companie');

    res.status(200).json(pontajeActive);
  } catch (error) {
    console.error('Eroare backend:', error);
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};

// ============================================================
// UPDATE LOCAȚIE - emite Socket.io live
// ✅ FIX: paznicId trimis ca STRING pentru comparație corectă în frontend
// ============================================================
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Coordonate invalide!' });
    }

    const pontaj = await Pontaj.findOne({ paznicId: req.user._id, ora_iesire: null });
    if (!pontaj) {
      return res.status(404).json({ message: 'Nu există tură activă.' });
    }

    pontaj.locationHistory.push({
      latitude: Number(latitude),
      longitude: Number(longitude),
      timestamp: new Date()
    });
    await pontaj.save();

    // ✅ FIX: .toString() pe paznicId și beneficiaryId
    // Fără toString(), comparația în frontend (data.paznicId === paznicId) eșua
    // când aveai mai mulți paznici activi simultan
    const io = req.app.get('io');
    if (io && pontaj.beneficiaryId) {
      io.to(`beneficiar_${pontaj.beneficiaryId.toString()}`).emit('guard_moved', {
        paznicId: req.user._id.toString(),       // ✅ string, nu ObjectId
        numePaznic: `${req.user.nume} ${req.user.prenume}`,
        lat: Number(latitude),
        lng: Number(longitude),
        timestamp: new Date()
      });
    }

    res.status(200).json({ message: 'Locația actualizată.' });
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
// GET TRASEU COMPLET
// ✅ Verifică că paznicul aparține beneficiarului (oricare punct de lucru)
// ============================================================
const getTraseuComplet = async (req, res) => {
  try {
    const { paznicId } = req.params;

    // Beneficiarul poate vedea doar paznicii alocați lui
    // (indiferent de punctul de lucru - un beneficiar poate avea mai mulți paznici!)
    if (req.user.role === 'beneficiar') {
      const beneficiar = await User.findById(req.user._id);

      // Extragem TOȚI paznicii din TOATE punctele de lucru ale beneficiarului
      const pazniciAlocati = (beneficiar.profile.assignedPaznici || [])
        .flatMap(punct => punct.paznici.map(id => id.toString()));

      if (!pazniciAlocati.includes(paznicId)) {
        return res.status(403).json({ message: 'Acces interzis. Acest paznic nu vă este alocat.' });
      }
    }

    const pontaj = await Pontaj.findOne({ paznicId, ora_iesire: null });

    if (!pontaj) {
      return res.status(200).json({ puncte: [], message: 'Nicio tură activă.' });
    }

    res.status(200).json({
      puncte: pontaj.locationHistory,
      oraIntrare: pontaj.ora_intrare,
      totalPuncte: pontaj.locationHistory.length
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
  getLatestLocation,
  getTraseuComplet,
  getIstoricPontaje,
  getIstoricBeneficiar
};