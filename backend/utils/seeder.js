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
      prenume: 'Daniel',
      telefon: '0747553586'
    };

    await User.create(superAdmin);
    console.log('Super Admin a fost creat cu succes!');
    console.log('-----------------------------------');
    console.log('Email: superadmin@example.com');
    console.log('Parola: supersecretpassword');
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