const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  beneficiaryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', 
  },
  nume_post: {
    type: String,
    required: true,
  },
  adresa_post: {
    type: String,
  },
  qr_code_identifier: {
    type: String,
    required: true,
    unique: true,
  },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;