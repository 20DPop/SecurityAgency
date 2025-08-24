const mongoose = require('mongoose');

const pontajSchema = new mongoose.Schema({
  paznicId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  postId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Post' },
  ora_intrare: { type: Date, required: true },
  ora_iesire: { type: Date },
}, { timestamps: { createdAt: true, updatedAt: false } });

const Pontaj = mongoose.model('Pontaj', pontajSchema);
module.exports = Pontaj;