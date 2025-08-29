// Cale: backend/utils/seeder.js (Versiune FINALĂ și SIGURĂ pentru toate entitățile)

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../src/config/database');

// Importăm TOATE modelele
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');
const Pontaj = require('../src/models/pontaj.model');
const ProcesVerbal = require('../src/models/procesVerbal.model');
// ... poți adăuga și celelalte modele dacă vrei să le populezi

// --- Funcție "inteligentă" de creare, care NU șterge ---
const createIfNotExists = async (model, query, data) => {
  try {
    const doc = await model.findOne(query);
    if (!doc) {
      const newDoc = await model.create(data);
      console.log(`✅ Creat: Un nou document în colecția '${model.modelName}'`);
      return newDoc;
    } else {
      console.log(`🟡 Ignorat: Documentul care se potrivește cu ${JSON.stringify(query)} există deja în '${model.modelName}'.`);
      return doc;
    }
  } catch (error) {
    if (error.code === 11000) { // Gestionează eroarea de duplicat dacă apare între findOne și create
      console.log(`🟡 Ignorat: Documentul care se potrivește cu ${JSON.stringify(query)} există deja în '${model.modelName}'.`);
      return model.findOne(query);
    }
    throw error;
  }
};

// --- Funcția de a șterge DOAR datele de test, NU și userii ---
const destroyTestData = async () => {
  try {
    await ProcesVerbal.deleteMany();
    await Pontaj.deleteMany();
    // await Sesizare.deleteMany(); // Poți decomenta dacă vrei să ștergi și sesizările
    await Post.deleteMany();
    console.log('✅ Datele de test vechi (Post, Pontaj, etc.) au fost șterse!');
  } catch (error) {
    console.error(`❌ Eroare la ștergerea datelor de test: ${error.message}`);
    process.exit(1);
  }
};

// --- Funcția principală de import ---
const importTestData = async () => {
  try {
    console.log('--- Se adaugă date de test (mod sigur) ---');
    
    // --- PASUL 1: Căutăm utilizatorii ESENȚIALI ---
    const adminAgentie = await User.findOne({ email: 'admin@agentie.com' });
    const beneficiarClient = await User.findOne({ email: 'denisaghiriti7@gmail.com' });
    const paznicAngajat = await User.findOne({ email: 'panicexemplu@gmail.com' });

    if (!adminAgentie || !beneficiarClient || !paznicAngajat) {
      console.error('❌ EROARE FATALĂ: Unul dintre utilizatorii de bază nu a fost găsit. Rulează seeder-ul original pentru useri dacă e nevoie.');
      process.exit(1);
    }
    console.log('✅ Utilizatorii de bază au fost găsiți.');
    
    // --- PASUL 2: Creăm un Post doar dacă nu există ---
    const postPrincipal = await createIfNotExists(Post, { qr_code_identifier: 'qr-client-test-principal-xyz' }, {
      nume_post: 'Punct de lucru principal - Client Test SRL',
      adresa_post: 'Str. Exemplului Nr. 123',
      qr_code_identifier: 'qr-client-test-principal-xyz',
      beneficiaryId: beneficiarClient._id,
      createdByAdminId: adminAgentie._id,
      assignedPazniciIds: [paznicAngajat._id]
    });

    // --- PASUL 3: Creăm un Pontaj doar dacă nu există ---
    const pontajIncheiat = await createIfNotExists(Pontaj, { paznicId: paznicAngajat._id, ora_intrare: new Date('2024-05-16T08:00:00Z') }, {
      paznicId: paznicAngajat._id,
      postId: postPrincipal._id,
      ora_intrare: new Date('2024-05-16T08:00:00Z'),
      ora_iesire: new Date('2024-05-16T16:00:00Z')
    });
    
    // --- PASUL 4: Creăm un Proces Verbal doar dacă nu există unul pentru acest pontaj ---
    await createIfNotExists(ProcesVerbal, { pontajId: pontajIncheiat._id }, {
      pontajId: pontajIncheiat._id,
      paznicId: paznicAngajat._id,
      postId: postPrincipal._id,
      // ... restul datelor pentru proces verbal
      reprezentant_beneficiar: 'Manager Magazin',
      ora_declansare_alarma: new Date('2024-05-16T10:00:00Z'),
      ora_prezentare_echipaj: new Date('2024-05-16T10:05:00Z'),
      ora_incheiere_misiune: new Date('2024-05-16T10:20:00Z'),
      caleStocarePDF: '/uploads/procese-verbale/pv_exemplu_seeder.pdf'
    });
    
    console.log('\n--- Scriptul a terminat de adăugat datele de test. ---');
    
  } catch (error) {
    console.error(`❌ Eroare la importul datelor de test: ${error.message}`);
  }
};

// --- Logica de rulare ---
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