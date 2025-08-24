// // Cale: backend/utils/seeder.js (Versiune FINALĂ, cu TOȚI userii tăi și toate 9 colecțiile)

// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const path = require('path');
// const connectDB = require('../src/config/database');

// // --- PASUL 1: Importăm TOATE 9 modelele ---
// const User = require('../src/models/user.model');
// const Post = require('../src/models/post.model');
// const Pontaj = require('../src/models/pontaj.model');
// const Sesizare = require('../src/models/sesizare.model');
// const Incident = require('../src/models/incident.model');
// const JurnalConectari = require('../src/models/jurnalConectari.model');
// const JurnalStatusSesizari = require('../src/models/jurnalStatusSesizari.model');
// const AtasamentIncident = require('../src/models/atasamentIncident.model');
// const Raport = require('../src/models/raport.model');

// // --- Funcția de a șterge toate datele vechi ---
// const destroyData = async () => {
//   try {
//     await Raport.deleteMany();
//     await AtasamentIncident.deleteMany();
//     await JurnalStatusSesizari.deleteMany();
//     await JurnalConectari.deleteMany();
//     await Incident.deleteMany();
//     await Pontaj.deleteMany();
//     await Sesizare.deleteMany();
//     await Post.deleteMany();
//     await User.deleteMany();
//     console.log('✅ Datele vechi au fost șterse!');
//   } catch (error) {
//     console.error(`❌ Eroare la ștergerea datelor: ${error.message}`);
//     process.exit(1);
//   }
// };

// // --- Funcția principală de import ---
// const importData = async () => {
//   try {
//     // --- PASUL 2: Creăm TOȚI utilizatorii definiți de tine, plus un Admin ---
    
//     // 2a. Utilizatorul tău ADMINISTRATOR
//     const administrator = await User.create({
//       email: '16dpop@gmail.com',
//       password: 'IsbiBenob1880<<!',
//       role: 'administrator',
//       nume: 'Pop',
//       prenume: 'Denisa',
//       telefon: '0747553586',
    
//     });
    

//     // 2b. Un ADMIN (Agenție de Pază) necesar pentru a lega celelalte conturi
//     const adminAgentie = await User.create({
//       email: 'admin@agentie.com',
//       password: 'password123',
//       role: 'admin',
//       nume: 'Admin',
//       prenume: 'Agentie',
//       profile: { nume_firma: 'Security Agency SRL' },
//     });
    
//     // 2c. Utilizatorul tău BENEFICIAR, legat de Adminul creat mai sus
//     const beneficiarClient = await User.create({
//       email: 'denisaghiriti7@gmail.com',
//       password: 'IsBeneficiar123',
//       role: 'beneficiar',
//       nume: 'Ghiriti',
//       prenume: 'Denisa',
//       telefon: '0724034031',
//       creatDeAdminId: adminAgentie._id, // <-- Legătura logică
//       profile: { nume_companie: 'Client Test SRL' }
//     });
    
//     // 2d. Utilizatorul tău PAZNIC, legat de Adminul creat mai sus
//     const paznicAngajat = await User.create({
//       email: 'panicexemplu@gmail.com',
//       password: 'IsPaznic::1',
//       role: 'paznic',
//       nume: 'Pop',
//       prenume: 'Ioan',
//       telefon: '0744444444',
//       creatDeAdminId: adminAgentie._id, // <-- Legătura logică
//       profile: { nr_legitimatie: 'PZ-DP-001' }
//     });
    
//     console.log('✅ Toți utilizatorii au fost creați!');

//     // --- PASUL 3: Creăm restul datelor de test, legate de userii de mai sus ---
    
//     const postPrincipal = await Post.create({ nume_post: 'Punct de lucru principal - Client Test SRL', adresa_post: 'Str. Exemplului Nr. 123', qr_code_identifier: 'qr-client-test-principal-xyz', beneficiaryId: beneficiarClient._id, createdByAdminId: adminAgentie._id });
//     const sesizareInitiala = await Sesizare.create({ titlu: 'Verificare sistem de alarmă', descriere: 'Aș dori o verificare de rutină a sistemului de alarmă.', status: 'prelucrata', createdByBeneficiaryId: beneficiarClient._id, assignedAdminId: adminAgentie._id });
//     await Pontaj.create({ paznicId: paznicAngajat._id, postId: postPrincipal._id, ora_intrare: new Date(), ora_iesire: null });
//     const incidentInitial = await Incident.create({ titlu: 'Alarmă falsă de incendiu', descriere: 'Senzorul de fum a fost activat de abur.', paznicId: paznicAngajat._id, postId: postPrincipal._id });
//     await JurnalConectari.create({ userId: administrator._id, adresaIp: '127.0.0.1', agentUtilizator: 'SeederScript/1.0', status: 'succes' });
//     await JurnalStatusSesizari.create({ sesizareId: sesizareInitiala._id, statusVechi: 'prelucrata', statusNou: 'inCurs', modificatDe: adminAgentie._id });
//     await AtasamentIncident.create({ incidentId: incidentInitial._id, numeFisier: 'raport_senzor.pdf', caleStocare: '/uploads/raport_senzor_123.pdf', tipFisier: 'application/pdf', incarcatDe: paznicAngajat._id });
    
//     const dataExpirareRaport = new Date();
//     dataExpirareRaport.setMonth(dataExpirareRaport.getMonth() + 3);
//     await Raport.create({ tipRaport: 'pontaj', generatDe: adminAgentie._id, parametrii: { startDate: '2024-04-01', endDate: '2024-04-30' }, caleStocare: '/arhiva/raport_pontaj_aprilie.pdf', dataExpirare: dataExpirareRaport });

//     console.log('✅ Toate celelalte date de test au fost create și legate!');
//     console.log('\n--- BAZA DE DATE A FOST POPULATĂ CU SUCCES! ---');
    
//   } catch (error) {
//     console.error(`❌ Eroare la importul datelor: ${error.message}`);
//   }
// };

// // --- Logica de rulare ---
// const run = async () => {
//     dotenv.config({ path: path.resolve(__dirname, '../.env') });
//     await connectDB();
//     if (process.argv[2] === '--destroy') {
//         await destroyData();
//     } else {
//         await destroyData();
//         await importData();
//     }
//     await mongoose.connection.close();
//     process.exit();
// };

// run();