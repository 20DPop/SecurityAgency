const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const User = require('../src/models/user.model');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Conectat pentru seeder...');
  } catch (error) {
    console.error(`Eroare la conectare: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await User.deleteMany();
    const superAdmin = {
      email: '16dpop@gmail.com',
      password: 'IsbiBenob1880<<!', // Alege o parolă sigură
      role: 'administrator',
      nume: 'Pop',
      prenume: 'Denisa',
      telefon: '0747553586'
    };

    const Beneficiar = {
      email: 'denisaghiriti7@gmail.com',
      password: 'IsBeneficiar123', // Alege o parolă sigură
      role: 'beneficiar',
      nume: 'Ghiriti',
      prenume: 'Denisa',
      telefon: '0724034031'
    };

    const Paznic = {
      email: 'panicexemplu@gmail.com',
      password: 'IsPaznic::1', // Alege o parolă sigură
      role: 'paznic',
      nume: 'Pop',
      prenume: 'Ioan',
      telefon: '0744444444'
    };

    await User.create(superAdmin);
    console.log('Super Admin a fost creat cu succes!');
    console.log('-----------------------------------');
    console.log('Email: superadmin@example.com');
    console.log('Parola: supersecretpassword');
    console.log('-----------------------------------');

    await User.create(Beneficiar);
    console.log('Beneficiar a fost creat cu succes!');
    console.log('-----------------------------------');
    console.log(`Email: ${Beneficiar.email}`);
    console.log(`Parola: ${Beneficiar.password}`);
    console.log('-----------------------------------');

    await User.create(Paznic);
    console.log('Paznicul a fost creat cu succes!');
    console.log('-----------------------------------');
    console.log(`Email: ${Paznic.email}`);
    console.log(`Parola: ${Paznic.password}`);
    console.log('-----------------------------------');

    process.exit();
  } catch (error) {
    console.error(`Eroare la importul datelor: ${error.message}`);
    process.exit(1);
  }
};
connectDB().then(() => {
  importData();
});