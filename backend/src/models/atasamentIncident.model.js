const mongoose = require('mongoose');

const atasamentIncidentSchema = new mongoose.Schema({
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true },
  numeFisier: { type: String, required: true },
  caleStocare: { type: String, required: true },
  tipFisier: { type: String },
  incarcatDe: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: 'data_incarcare', updatedAt: false } });

const AtasamentIncident = mongoose.model('AtasamentIncident', atasamentIncidentSchema);
module.exports = AtasamentIncident;