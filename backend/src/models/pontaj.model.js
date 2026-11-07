// Cale: backend/src/models/pontaj.model.js
const mongoose = require('mongoose');

const locationPointSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const pontajSchema = new mongoose.Schema({
  paznicId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  beneficiaryId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // <-- Schimbarea cheie
  ora_intrare: { type: Date, required: true },
  ora_iesire: { type: Date },
  // Cum s-a închis tura. Lipsește la turele vechi (dinainte de această funcție).
  tipInchidere: { type: String, enum: ['cu_pv', 'fara_pv'] },
  motivInchidere: { type: String, maxlength: 300 },
  // Starea emailului cu traseul (lipsește la turele vechi, care nu se retrimit)
  emailStatus: { type: String, enum: ['pending', 'sending', 'sent', 'failed', 'skipped'] },
  emailDueAt: { type: Date },
  emailClaimedAt: { type: Date },
  emailAttempts: { type: Number, default: 0 },
  emailSentTo: [{ type: String }],
  emailSentAt: { type: Date },
  emailLastError: { type: String },
  locationHistory: [locationPointSchema]
}, { timestamps: true });

// Interogarea { paznicId, ora_iesire: null } rulează la aproape fiecare cerere a paznicului
pontajSchema.index({ paznicId: 1, ora_iesire: 1 });
pontajSchema.index({ emailStatus: 1, emailDueAt: 1 });

const Pontaj = mongoose.model('Pontaj', pontajSchema);
module.exports = Pontaj;