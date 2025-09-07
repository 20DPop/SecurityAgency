const mongoose = require('mongoose');

const procesVerbalPredarePrimireSchema = new mongoose.Schema({
  pontajId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pontaj', required: true, unique: true },
  paznicPredareId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data_incheierii: { type: Date, required: true },
  nume_sef_formatie: { type: String, required: true },
  nume_reprezentant_primire: { type: String, required: true },
  obiecte_predate: { type: String, required: true },
  caleStocarePDF: { type: String, required: true },
}, { timestamps: true });

const ProcesVerbalPredarePrimire = mongoose.model('ProcesVerbalPredarePrimire', procesVerbalPredarePrimireSchema);

module.exports = ProcesVerbalPredarePrimire;