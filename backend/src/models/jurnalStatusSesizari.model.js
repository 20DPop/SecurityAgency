const mongoose = require('mongoose');

const jurnalStatusSesizariSchema = new mongoose.Schema({
  sesizareId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sesizare', required: true },
  statusVechi: { type: String },
  statusNou: { type: String, enum: ['prelucrata', 'inCurs', 'rezolvata'], required: true },
  modificatDe: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: 'data_schimbare', updatedAt: false } });

const JurnalStatusSesizari = mongoose.model('JurnalStatusSesizari', jurnalStatusSesizariSchema);
module.exports = JurnalStatusSesizari;