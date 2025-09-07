const mongoose = require('mongoose');

const raportEvenimentSchema = new mongoose.Schema({
  paznicId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  
  // Datele din formular
  numarRaport: { type: String },
  dataRaport: { type: Date, required: true },
  numePaznic: { type: String, required: true },
  functiePaznic: { type: String, required: true },
  societate: { type: String, required: true },
  numarPost: { type: String, required: true },
  dataConstatare: { type: Date, required: true },
  oraConstatare: { type: String, required: true },
  numeFaptuitor: { type: String, required: true },
  descriereFapta: { type: String, required: true },
  cazSesizatLa: { type: String, required: true },
  
  // Calea către PDF-ul generat
  caleStocarePDF: { type: String, required: true },
  
}, { timestamps: true });

const RaportEveniment = mongoose.model('RaportEveniment', raportEvenimentSchema);
module.exports = RaportEveniment;