const mongoose = require('mongoose');

const sesizareSchema = new mongoose.Schema({
  titlu: { type: String, required: true },
  descriere: { type: String, required: true },
  status: { type: String, enum: ['preluată', 'inCurs', 'rezolvata'], default: 'preluată' },
  createdByBeneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pasiRezolvare: { type: String },
  dataFinalizare: { type: Date },
}, { timestamps: true });

const Sesizare = mongoose.model('Sesizare', sesizareSchema);
module.exports = Sesizare;