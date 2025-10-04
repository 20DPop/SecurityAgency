// backend/src/models/procesVerbal.model.js

const mongoose = require('mongoose');

const evenimentSchema = new mongoose.Schema({
  dataOraReceptionarii: { type: Date, required: true },
  tipulAlarmei: { type: String, required: true },
  echipajAlarmat: { type: String, required: true },
  oraSosirii: { type: Date, required: true },
  cauzeleAlarmei: { type: String, required: true },
  modulDeSolutionare: { type: String, required: true },
  observatii: { type: String },
}, { _id: false });

const procesVerbalSchema = new mongoose.Schema({
  pontajId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pontaj', 
  },
  paznicId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // --- MODIFICĂRI APLICATE AICI ---
  beneficiaryId: { // Adăugăm legătura către beneficiar
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  punctDeLucru: { type: String, required: true }, // Adăugăm punctul de lucru
  // Am eliminat complet câmpul 'postId'
  // --- SFÂRȘIT MODIFICĂRI ---

  reprezentant_beneficiar: { type: String },
  ora_declansare_alarma: { type: Date, required: true },
  ora_prezentare_echipaj: { type: Date, required: true },
  ora_incheiere_misiune: { type: Date, required: true },
  observatii_generale: { type: String },
  evenimente: [evenimentSchema],
  expirationDate: { type: Date, default: () => new Date(Date.now() + 60*24*60*60*1000) },
  caleStocarePDF: { type: String, required: true },
}, { 
  timestamps: true
});

const ProcesVerbal = mongoose.model('ProcesVerbal', procesVerbalSchema);
module.exports = ProcesVerbal;