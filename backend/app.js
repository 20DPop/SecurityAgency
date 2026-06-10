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
app.use(express.json());

// ==============================
// FISIERE STATICE
// ==============================

// Upload-uri existente
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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