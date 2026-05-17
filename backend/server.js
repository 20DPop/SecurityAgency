// Cale: backend/server.js

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const config = require('./src/config');
const connectDB = require('./src/config/database');
const cron = require('node-cron');
const ProcesVerbal = require('./src/models/procesVerbal.model');
const ProcesVerbalPredarePrimire = require('./src/models/procesVerbalPredarePrimire.model');
const RaportEveniment = require('./src/models/raportEveniment.model');
const Pontaj = require('./src/models/pontaj.model');

// ✅ Cream serverul HTTP și atașăm Socket.io
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ✅ Facem io accesibil în toți controllerii prin req.app.get('io')
app.set('io', io);

// ✅ Gestionăm conexiunile Socket.io
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client conectat: ${socket.id}`);

  // Beneficiarul se alătură propriului room
  // Frontend-ul va emite: socket.emit('join_room', beneficiarId)
  socket.on('join_room', (beneficiarId) => {
    socket.join(`beneficiar_${beneficiarId}`);
    console.log(`[Socket.io] Beneficiar ${beneficiarId} a intrat în room-ul său`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client deconectat: ${socket.id}`);
  });
});

// Cron job zilnic la miezul nopții pentru ștergerea documentelor expirate
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    console.log(`[${now.toISOString()}] Rulează cron job-ul pentru curățare...`);

    // Documentele existente
    const pvResult = await ProcesVerbal.deleteMany({ expirationDate: { $lt: now } });
    const pvpResult = await ProcesVerbalPredarePrimire.deleteMany({ expirationDate: { $lt: now } });
    const reResult = await RaportEveniment.deleteMany({ expirationDate: { $lt: now } });

    // ✅ Pontajele (cu GPS cu tot) mai vechi de 60 zile
    const acum60zile = new Date();
    acum60zile.setDate(now.getDate() - 60);

    const deletedPontaje = await Pontaj.deleteMany({
      ora_intrare: { $lt: acum60zile },
      ora_iesire: { $ne: null } // doar turele închise, nu cele active!
    });

    const totalDeleted =
      pvResult.deletedCount +
      pvpResult.deletedCount +
      reResult.deletedCount +
      deletedPontaje.deletedCount;

    console.log(`Cron job finalizat. Șterse ${totalDeleted} înregistrări.`);
    console.log(`  - PV Intervenție: ${pvResult.deletedCount}`);
    console.log(`  - PV Predare-Primire: ${pvpResult.deletedCount}`);
    console.log(`  - Rapoarte Eveniment: ${reResult.deletedCount}`);
    console.log(`  - Pontaje (cu GPS): ${deletedPontaje.deletedCount}`);

  } catch (error) {
    console.error('Eroare în timpul executării cron job-ului:', error);
  }
});

const startServer = () => {
  const PORT = process.env.PORT || config.port || 3000;
  const HOST = '0.0.0.0'; // obligatoriu pe Railway

  // ✅ Pornim httpServer în loc de app.listen
  httpServer.listen(PORT, HOST, () => {
    console.log(`🚀 Serverul a pornit și ascultă pe http://${HOST}:${PORT}`);
    console.log(`🔌 Socket.io activ`);
  });
};

connectDB()
  .then(() => startServer())
  .catch(error => {
    console.error('Eroare critică: Nu s-a putut porni serverul.', error);
    process.exit(1);
  });