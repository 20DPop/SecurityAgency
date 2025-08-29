// Cale: backend/src/models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const profileSchema = new mongoose.Schema({
  nume_firma: { type: String },
  cui: { type: String },
  nume_companie: { type: String },
  punct_de_lucru: { type: String },
  nr_legitimatie: { type: String },
  // --- AICI ESTE MODIFICAREA CHEIE ---
  assignedPazniciIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
}, { _id: false }); 

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['administrator', 'admin', 'beneficiar', 'paznic'], required: true },
  nume: { type: String, required: true },
  prenume: { type: String, required: true },
  telefon: { type: String },
  esteActiv: { type: Boolean, default: true },
  creatDeAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  profile: profileSchema, 
}, { timestamps: true });

// Funcțiile de hash și de comparare a parolei rămân neschimbate
userSchema.pre('save', async function (next) { /* ... codul tău existent ... */ });
userSchema.methods.matchPassword = async function (enteredPassword) { /* ... codul tău existent ... */ };

const User = mongoose.model('User', userSchema);
module.exports = User;