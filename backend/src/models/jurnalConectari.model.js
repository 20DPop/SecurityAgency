const mongoose = require('mongoose');

const jurnalConectariSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adresaIp: { type: String },
  agentUtilizator: { type: String },
  status: { type: String, enum: ['succes', 'esuat'], required: true },
}, { timestamps: { createdAt: 'data_logare', updatedAt: false } });

const JurnalConectari = mongoose.model('JurnalConectari', jurnalConectariSchema);
module.exports = JurnalConectari;