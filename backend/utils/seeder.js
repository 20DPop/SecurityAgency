// Cale: backend/utils/seeder.js (Versiune FINALĂ de RESETARE COMPLETĂ)

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../src/config/database');

// --- PASUL 1: Importăm TOATE modelele necesare ---
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');
const Pontaj = require('../src/models/pontaj.model');
const Sesizare = require('../src/models/sesizare.model');
const Incident = require('../src/models/incident.model');
const ProcesVerbal = require('../src/models/procesVerbal.model');
const JurnalConectari = require('../src/models/jurnalConectari.model');
const JurnalStatusSesizari = require('../src/models/jurnalStatusSesizari.model');
const AtasamentIncident = require('../src/models/atasamentIncident.model');
const Raport = require('../src/models/raport.model');

// --- Funcția de a șterge TOATE datele vechi (inclusiv Userii) ---
const destroyData = async () => {
  try {
    await Raport.deleteMany();
    await AtasamentIncident.deleteMany();
    await JurnalStatusSesizari.deleteMany();
    await JurnalConectari.deleteMany();
    await ProcesVerbal.deleteMany();
    await Incident.deleteMany();
    await Pontaj.deleteMany();
    await Sesizare.deleteMany();
    await Post.deleteMany();
    await User.deleteMany(); // Ștergem și toți userii

    console.log('✅ Baza de date a fost GOLITĂ complet!');
  } catch (error) {
    console.error(`❌ Eroare la ștergerea datelor: ${error.message}`);
    process.exit(1);
  }
};

// --- Funcția principală de import ---
const importData = async () => {
  try {
    console.log('--- Începe crearea datelor de test de la zero ---');
    
    // --- PASUL 2: Creăm utilizatorii cu parole cunoscute ---
    
    const administrator = await User.create({
      email: '16dpop@gmail.com',
      password: 'IsbiBenob1880!',
      role: 'administrator',
      nume: 'Admin',
      prenume: 'Principal (Dev)',
      telefon: '0700000001',
    });

    const adminAgentie = await User.create({
      email: 'admin@test.com',
      password: 'test123',
      role: 'admin',
      nume: 'Admin',
      prenume: 'Agentie',
      profile: { nume_firma: 'Security Agency SRL' },
    });

    const beneficiarClient = await User.create({
      email: 'beneficiar@test.com',
      password: 'test123',
      role: 'beneficiar',
      nume: 'Client',
      prenume: 'NumeClient',
      telefon: '0700000002',
      creatDeAdminId: adminAgentie._id, 
      profile: { 
          nume_companie: 'Client Test SRL',
          punct_de_lucru: ['Str. Victoriei 1'] 
      }
    });
    
    const paznicAngajat = await User.create({
      email: 'paznic@test.com',
      password: 'test123',
      role: 'paznic',
      nume: 'Paznic',
      prenume: 'NumePaznic',
      telefon: '0700000003',
      creatDeAdminId: adminAgentie._id, 
      profile: { nr_legitimatie: 'PZ-123-TEST' }
    });
    
    console.log('✅ 4 utilizatori de test creați (toți au parola: password123)');

    // --- PASUL 3: Facem alocarea Paznicului la Beneficiar ---
    beneficiarClient.profile.assignedPazniciIds.push(paznicAngajat._id);
    await beneficiarClient.save();
    console.log('✅ Paznic alocat la beneficiar!');

    // --- PASUL 4: Creăm restul datelor de test legate ---
    
    const postPrincipal = await Post.create({ nume_post: 'Punct de lucru principal - Client Test SRL', adresa_post: 'Str. Exemplului Nr. 123', qr_code_identifier: 'qr-client-test-principal-xyz', beneficiaryId: beneficiarClient._id, createdByAdminId: adminAgentie._id, assignedPazniciIds: [paznicAngajat._id] });
    console.log('✅ Post de test creat!');

    await Sesizare.create({ titlu: 'Verificare sistem de alarmă', descriere: 'O sesizare de test...', status: 'prelucrata', createdByBeneficiaryId: beneficiarClient._id, assignedAdminId: adminAgentie._id });
    console.log('✅ Sesizare de test creată!');
    
    const pontajIncheiat = await Pontaj.create({ paznicId: paznicAngajat._id, beneficiaryId: beneficiarClient._id, ora_intrare: new Date('2024-05-16T08:00:00Z'), ora_iesire: new Date('2024-05-16T16:00:00Z') });
    console.log('✅ Pontaj de test (încheiat) creat!');
    
    console.log('\n--- BAZA DE DATE A FOST RESETATĂ ȘI POPULATĂ CU SUCCES! ---');
    console.log('\n--- Date de login ---');
    // MODIFICAT: Folosim variabile pentru a afișa datele reale
    console.log(`Administrator: ${administrator.email} / IsbiBenob1880!`);
    console.log(`Admin Agenție: ${adminAgentie.email} / test123`);
    console.log(`Beneficiar:    ${beneficiarClient.email} / test123`);
    console.log(`Paznic:        ${paznicAngajat.email} / test123`);
    
  } catch (error) {
    console.error(`❌ Eroare la importul datelor: ${error.message}`);
  }
};

// --- Logica de rulare a scriptului ---
const run = async () => {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
    await connectDB();
    if (process.argv[2] === '--destroy') {
        await destroyData();
    } else {
        await destroyData(); // Curățăm totul
        await importData(); // Și adăugăm datele proaspete
    }
    await mongoose.connection.close();
    process.exit();
};

run();