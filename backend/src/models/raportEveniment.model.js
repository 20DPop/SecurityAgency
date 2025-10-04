// backend/src/models/raportEveniment.model.js

const mongoose = require('mongoose');

const raportEvenimentSchema = new mongoose.Schema({
  paznicId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // --- Câmpuri actualizate pentru noua logică ---
  beneficiaryId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  punctDeLucru: { // Va stoca ce introduce paznicul în câmpul "La postul Nr."
    type: String, 
    required: true 
  },
  // --- Sfârșit câmpuri actualizate ---
  
  numarRaport: { type: String },
  dataRaport: { type: Date, required: true },
  numePaznic: { type: String, required: true },
  functiePaznic: { type: String, required: true },
  societate: { type: String, required: true },
  dataConstatare: { type: Date, required: true },
  oraConstatare: { type: String, required: true },
  numeFaptuitor: { type: String, required: true },
  descriereFapta: { type: String, required: true },
  cazSesizatLa: { type: String, required: true },
  expirationDate: { type: Date, default: () => new Date(Date.now() + 60*24*60*60*1000) },
  caleStocarePDF: { type: String, required: true },
  
}, { timestamps: true });

const RaportEveniment = mongoose.model('RaportEveniment', raportEvenimentSchema);
module.exports = RaportEveniment;