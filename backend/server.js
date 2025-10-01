// Încarcă variabilele de mediu din fișierul .env DOAR în mediul de dezvoltare.
// În producție (pe Railway), variabilele vor fi injectate direct de platformă.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = require('./app');
const config = require('./src/config');
const connectDB = require('./src/config/database');

// Importăm modelele necesare pentru cron job
const cron = require('node-cron');
const ProcesVerbal = require('./src/models/procesVerbal.model');
const ProcesVerbalPredarePrimire = require('./src/models/procesVerbalPredarePrimire.model');
const RaportEveniment = require('./src/models/raportEveniment.model');

// Configurăm cron job-ul pentru a rula în fiecare zi la miezul nopții
// și a șterge documentele mai vechi de 60 de zile.
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    console.log(`[${now.toISOString()}] Rulează cron job-ul pentru ștergerea documentelor expirate...`);
    
    const pvResult = await ProcesVerbal.deleteMany({ expirationDate: { $lt: now } });
    const pvpResult = await ProcesVerbalPredarePrimire.deleteMany({ expirationDate: { $lt: now } });
    const reResult = await RaportEveniment.deleteMany({ expirationDate: { $lt: now } });

    const totalDeleted = pvResult.deletedCount + pvpResult.deletedCount + reResult.deletedCount;
    
    if (totalDeleted > 0) {
      console.log(`Cron job finalizat. Au fost șterse ${totalDeleted} documente expirate.`);
    } else {
      console.log('Cron job finalizat. Nu au fost găsite documente expirate pentru ștergere.');
    }
  } catch (error) {
    console.error('Eroare în timpul executării cron job-ului:', error);
  }
});

const startServer = () => {
  // Pentru mediile de producție (cum este Railway), este o bună practică
  // să specificăm '0.0.0.0' ca host pentru a asigura că serverul este accesibil
  // din exteriorul containerului. Altfel, ar putea asculta doar pe localhost.
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  
  app.listen(config.port, host, () => {
    console.log(`🚀 Serverul a pornit și ascultă pe http://${host}:${config.port}`);
  });
};

// Ne conectăm la baza de date și, dacă reușim, pornim serverul.
connectDB()
  .then(() => {
    startServer();
  })
  .catch(error => {
    console.error(' Eroare critică: Nu s-a putut porni serverul.', error);
    process.exit(1); // Oprim procesul dacă nu ne putem conecta la DB
  });