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
  locationHistory: [locationPointSchema]
}, { timestamps: true });

const Pontaj = mongoose.model('Pontaj', pontajSchema);
module.exports = Pontaj;