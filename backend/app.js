// backend/app.js

const express = require('express');
const path = require('path');

const app = express();

// --- CORS global manual ---
const allowedOrigins = [
  'https://vigilent-security.up.railway.app',
  'http://localhost:5173'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // preflight răspuns instant
  }

  next();
});
// --- SFÂRȘIT CORS ---

// Middleware JSON
app.use(express.json());

// Servește fișiere statice
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importă rutele principale
const apiRoutes = require('./src/api');
app.use('/api', apiRoutes);

// Rută de test
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Salut! API-ul funcționează și acceptă cereri.' });
});

module.exports = app;