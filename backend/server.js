require('dotenv').config(); 
const app = require('./app');
const config = require('./src/config');
const connectDB = require('./src/config/database');

// Adaugă cron aici
const cron = require('node-cron');
const ProcesVerbal = require('./src/models/procesVerbal.model');
const ProcesVerbalPredarePrimire = require('./src/models/procesVerbalPredarePrimire.model');
const RaportEveniment = require('./src/models/raportEveniment.model');

cron.schedule('0 0 * * *', async () => {
  const now = new Date();
  await ProcesVerbal.deleteMany({ expirationDate: { $lt: now } });
  await ProcesVerbalPredarePrimire.deleteMany({ expirationDate: { $lt: now } });
  await RaportEveniment.deleteMany({ expirationDate: { $lt: now } });
  console.log('Documente expirate șterse automat.');
});

const startServer = () => {
  app.listen(config.port, () => {
    console.log(`Serverul a pornit și ascultă pe portul ${config.port}`);
  });
};

connectDB().then(() => {
  startServer();
});