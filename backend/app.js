// Cale: backend/app.js

const express = require('express');
const cors = require('cors');
const path = require('path');

// --- CONFIGURARE CORS ---
const allowedOrigins = [
  // Domeniul frontend-ului pe Railway
  'https://vigilent-security.up.railway.app',
  
  // Pentru testare locală
  'http://localhost:5173'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Permite cereri fără "origin" (Postman, aplicații mobile)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocat de politica CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // ✅ am adăugat OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // pentru browsere mai vechi
};

const app = express();

// Aplicați configurarea CORS pentru toate rutele
app.use(cors(corsOptions));

// ✅ Răspunde corect la cererile OPTIONS (preflight)
app.options('*', cors(corsOptions));
// --- SFÂRȘIT CONFIGURARE CORS ---

// Middleware pentru JSON
app.use(express.json());

// Servește fișierele statice din folderul 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importăm rutele principale ale API-ului
const apiRoutes = require('./src/api');

// Rută de test
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Salut! API-ul pentru aplicație funcționează și acceptă cereri.' 
  });
});

// Prefix pentru toate rutele API
app.use('/api', apiRoutes);

module.exports = app;
