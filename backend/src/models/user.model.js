// Cale: backend/src/models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const profileSchema = new mongoose.Schema({
  nume_firma: { type: String },
  cui: { type: String },
  nume_companie: { type: String },
  punct_de_lucru: { type: String },
  nr_legitimatie: { type: String },
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
  profile: {
    type: profileSchema,
    default: () =>({})
  },
}, { timestamps: true });


// --- ADAUGĂ ACEST COD ÎNAPOI ---
// Criptează parola înainte de a salva utilizatorul
userSchema.pre('save', async function (next) {
  // Rulează funcția doar dacă parola a fost modificată
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Metodă pentru a compara parola introdusă cu cea din baza de date
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// --- SFÂRȘIT COD DE ADĂUGAT ---


const User = mongoose.model('User', userSchema);
module.exports = User;