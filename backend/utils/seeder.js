// Cale: backend/utils/seeder.js (Versiune care NU se atinge de Users)

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../src/config/database');

// Importăm modelele necesare
const User = require('../src/models/user.model'); // Îl importăm DOAR pentru a CĂUTA
const Post = require('../src/models/post.model');
const Pontaj = require('../src/models/pontaj.model');
const ProcesVerbal = require('../src/models/procesVerbal.model');


// --- Funcția de a șterge DOAR datele de test, NU și userii ---
const destroyTestData = async () => {
  try {
    // Ștergem DOAR datele care NU sunt utilizatori
    await ProcesVerbal.deleteMany();
    await Pontaj.deleteMany();
    await Post.deleteMany();
    console.log('✅ Datele de test vechi (Post, Pontaj, ProcesVerbal) au fost șterse!');
  } catch (error) {
    console.error(`❌ Eroare la ștergerea datelor de test: ${error.message}`);
    process.exit(1);
  }
};

// --- Funcția principală care adaugă datele de test ---
const importTestData = async () => {
  try {
    console.log('--- Se adaugă date de test (Post, Pontaj, Proces Verbal...) ---');
    
    // --- PASUL 1: Căutăm utilizatorii ESENȚIALI care TREBUIE să existe deja ---
    // NOTĂ: Dacă nu ai un admin de test, îl poți adăuga manual o singură dată.
    const adminAgentie = await User.findOne({ email: 'admin@agentie.com' });
    const beneficiarClient = await User.findOne({ email: 'denisaghiriti7@gmail.com' });
    const paznicAngajat = await User.findOne({ email: 'panicexemplu@gmail.com' });

    // --- VERIFICARE CRITICĂ ---
    if (!adminAgentie || !beneficiarClient || !paznicAngajat) {
      console.error('❌ EROARE FATALĂ: Unul dintre utilizatorii de bază (admin@agentie.com, denisaghiriti7@gmail.com, panicexemplu@gmail.com) nu a fost găsit în baza de date.');
      console.error('Asigură-te că acești utilizatori există înainte de a rula scriptul.');
      return; // Oprește execuția funcției
    }
    console.log('✅ Utilizatorii de bază au fost găsiți.');
    
    // --- PASUL 2: Creăm un Post de test, legat de userii găsiți ---
    const postData = {
      nume_post: 'Punct de lucru de test pentru PV',
      qr_code_identifier: 'qr-pv-test-unic-12345',
      beneficiaryId: beneficiarClient._id,
      createdByAdminId: adminAgentie._id
    };
    // Folosim findOneAndUpdate cu upsert:true pentru a crea doar dacă nu există
    const postDeTest = await Post.findOneAndUpdate({ qr_code_identifier: postData.qr_code_identifier }, postData, { new: true, upsert: true });
    console.log('✅ Post de test creat sau găsit.');

    // --- PASUL 3: Creăm un Pontaj de test ---
    const pontajData = {
      paznicId: paznicAngajat._id,
      postId: postDeTest._id,
      ora_intrare: new Date('2024-05-20T08:00:00Z'),
      ora_iesire: new Date('2024-05-20T16:00:00Z')
    };
    const pontajDeTest = await Pontaj.findOneAndUpdate({ paznicId: pontajData.paznicId, ora_intrare: pontajData.ora_intrare }, pontajData, { new: true, upsert: true });
    console.log('✅ Pontaj de test creat sau găsit.');

    // --- PASUL 4: Creăm Procesul Verbal ---
    const pvData = {
        pontajId: pontajDeTest._id,
        paznicId: paznicAngajat._id,
        postId: postDeTest._id,
        reprezentant_beneficiar: 'Manager de tura',
        ora_declansare_alarma: new Date('2024-05-20T11:30:00Z'),
        // ... restul datelor pentru PV ...
        caleStocarePDF: '/uploads/procese-verbale/pv_exemplu_seeder.pdf'
    };
    await ProcesVerbal.findOneAndUpdate({ pontajId: pvData.pontajId }, pvData, { new: true, upsert: true });
    console.log('✅ Proces Verbal de test creat sau găsit!');

    // --- PASUL 5 (CEL MAI IMPORTANT): Afișăm ID-ul de care ai nevoie ---
    console.log('\n----------------------------------------------------');
    console.log('--- ID DE PONTAJ VALID PENTRU TESTARE PDF ---');
    console.log(pontajDeTest._id.toString());
    console.log('----------------------------------------------------');
    
    console.log('\n--- Scriptul a terminat de adăugat datele de test. ---');
    
  } catch (error) {
    console.error(`❌ Eroare la importul datelor de test: ${error.message}`);
  }
};

// --- Logica de rulare a scriptului ---
const run = async () => {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
    await connectDB();
    if (process.argv[2] === '--destroy') {
        await destroyTestData();
    } else {
        await importTestData();
    }
    await mongoose.connection.close();
    process.exit();
};

run();