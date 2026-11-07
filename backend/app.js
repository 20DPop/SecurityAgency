// backend/app.js

const express = require('express');
const path = require('path');

const app = express();

// --- CORS global manual ---
const allowedOrigins = [
  'https://vigilent-security.up.railway.app',
  'http://localhost:5173',
  'https://vigilent-security-app.up.railway.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Middleware JSON
// Semnăturile (base64) pot depăși limita implicită de 100kb
app.use(express.json({ limit: '5mb' }));

// ==============================
// FISIERE STATICE
// ==============================

// PDF-urile din /uploads NU mai sunt publice: se deschid cu linkuri temporare, prin /api/files (vezi files.routes.js).
// Pe durata trecerii (până când frontend-ul nou e publicat) poți reactiva vechiul comportament cu UPLOADS_PUBLIC=true.
if (process.env.UPLOADS_PUBLIC === 'true') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// APK Android
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// ==============================
// API
// ==============================

const apiRoutes = require('./src/api');
app.use('/api', apiRoutes);

// ==============================
// TEST
// ==============================

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Salut! API-ul funcționează și acceptă cereri.'
  });
});

module.exports = app;