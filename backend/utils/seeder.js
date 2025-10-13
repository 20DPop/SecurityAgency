// Cale: backend/utils/seeder.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../src/models/user.model');

// Încarcă variabilele de mediu din fișierul .env aflat în folderul /backend
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error('\n❌ EROARE CRITICĂ: Variabila de mediu MONGO_URI nu este setată în fișierul .env!');
        console.error('Asigură-te că ai copiat connection string-ul PUBLIC de la MongoDB (din Railway) în fișierul /backend/.env\n');
        process.exit(1);
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🌱 MongoDB Conectat pentru seeding...');
    } catch (error) {
        console.error(`❌ Eroare la conectare: ${error.message}`);
        process.exit(1);
    }
};

const seedAdmin = async () => {
    try {
        await connectDB();

        // Preluăm datele din variabilele de mediu, cu valori default ca fallback
        const adminEmail = process.env.ADMIN_EMAIL || '16dpop@gmail.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'IsbiBenob1880!';

        const adminExists = await User.findOne({ role: 'administrator' });

        if (adminExists) {
            console.log('\n✅ Contul de administrator există deja în baza de date.');
            console.log(`   Email existent: ${adminExists.email}\n`);
            process.exit(0);
        }

        console.log('⏳ Se creează contul de administrator...');

        await User.create({
            email: adminEmail,
            password: adminPassword, // Modelul se va ocupa de criptare
            role: 'administrator',
            nume: 'Admin',
            prenume: 'Principal',
            telefon: 'N/A',
            esteActiv: true
        });

        console.log('\n✨ Contul de administrator a fost creat cu succes! ✨\n');
        console.log('-------------------------------------------');
        console.log(`  Email: ${adminEmail}`);
        console.log(`  Parolă: ${adminPassword}`);
        console.log('-------------------------------------------');
        console.log('\n🔑 Te poți loga acum în aplicație.\n');
        
        process.exit(0);

    } catch (error) {
        console.error('❌ Eroare critică la crearea contului de administrator:', error);
        process.exit(1);
    }
};

seedAdmin();