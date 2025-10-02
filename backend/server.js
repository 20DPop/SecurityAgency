// backend/server.js

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = require('./app');
const config = require('./src/config');
const connectDB = require('./src/config/database');
const cron = require('node-cron');
const ProcesVerbal = require('./src/models/procesVerbal.model');
const ProcesVerbalPredarePrimire = require('./src/models/procesVerbalPredarePrimire.model');
const RaportEveniment = require('./src/models/raportEveniment.model');

// Cron job zilnic pentru ștergerea documentelor expirate
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    console.log(`[${now.toISOString()}] Rulează cron job-ul pentru ștergerea documentelor expirate...`);

    const pvResult = await ProcesVerbal.deleteMany({ expirationDate: { $lt: now } });
    const pvpResult = await ProcesVerbalPredarePrimire.deleteMany({ expirationDate: { $lt: now } });
    const reResult = await RaportEveniment.deleteMany({ expirationDate: { $lt: now } });

    const totalDeleted = pvResult.deletedCount + pvpResult.deletedCount + reResult.deletedCount;
    console.log(`Cron job finalizat. Au fost șterse ${totalDeleted} documente expirate.`);
  } catch (error) {
    console.error('Eroare în timpul executării cron job-ului:', error);
  }
});

const startServer = () => {
  const PORT = process.env.PORT || config.port || 3000;
  const HOST = '0.0.0.0'; // obligatoriu pe Railway

  app.listen(PORT, HOST, () => {
    console.log(`🚀 Serverul a pornit și ascultă pe http://${HOST}:${PORT}`);
  });
};

connectDB()
  .then(() => startServer())
  .catch(error => {
    console.error('Eroare critică: Nu s-a putut porni serverul.', error);
    process.exit(1);
  });
