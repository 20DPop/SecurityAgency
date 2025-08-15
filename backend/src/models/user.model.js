const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const profileSchema = new mongoose.Schema({
  nume_firma: { type: String },
  cui: { type: String },
  nume_companie: { type: String },
  punct_de_lucru: { type: String },
  nr_legitimatie: { type: String },
}, { _id: false }); 

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Emailul este obligatoriu.'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Parola este obligatorie.'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['administrator', 'admin', 'beneficiar', 'paznic'],
    required: true,
  },
  nume: { type: String, required: true },
  prenume: { type: String, required: true },
  telefon: { type: String },
  esteActiv: { type: Boolean, default: true },
  creatDeAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },
  profile: profileSchema, 
}, {
  timestamps: true, 
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;