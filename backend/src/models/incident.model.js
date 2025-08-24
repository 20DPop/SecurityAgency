const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  titlu: { type: String, required: true },
  descriere: { type: String, required: true },
  data_incident: { type: Date, default: Date.now },
  paznicId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
}, { timestamps: true });

const Incident = mongoose.model('Incident', incidentSchema);
module.exports = Incident;