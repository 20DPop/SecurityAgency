const mongoose = require('mongoose');

const raportSchema = new mongoose.Schema({
  tipRaport: { type: String, enum: ['pontaj', 'incident', 'sesizare'], required: true },
  generatDe: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parametrii: { type: mongoose.Schema.Types.Mixed },
  caleStocare: { type: String, required: true },
  dataExpirare: { type: Date, required: true },
}, { timestamps: { createdAt: 'data_generare', updatedAt: false } });

raportSchema.index({ "dataExpirare": 1 }, { expireAfterSeconds: 0 });

const Raport = mongoose.model('Raport', raportSchema);
module.exports = Raport;