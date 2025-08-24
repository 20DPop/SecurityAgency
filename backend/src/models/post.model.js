const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  nume_post: { type: String, required: true },
  adresa_post: { type: String },
  qr_code_identifier: { type: String, required: true, unique: true },
  beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;