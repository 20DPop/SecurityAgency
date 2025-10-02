// Cale: backend/app.js (VERSIUNE FINALĂ ȘI COMPLETĂ)

const express = require('express');
const cors = require('cors');
const path = require('path');

// --- ÎNCEPUT CONFIGURARE CORS ---

// Lista de domenii care au voie să facă cereri la acest API.
const allowedOrigins = [
  // EXTREM DE IMPORTANT: Pune aici URL-ul EXACT al frontend-ului tău!
  'https://vigilent-security.up.railway.app', 
  
  // Adăugăm și adresa locală pentru a putea testa și de pe calculator
  'http://localhost:5173' 
];

const corsOptions = {
  origin: (origin, callback) => {
    // Verificăm dacă originea cererii (ex: https://vigilent-security.up.railway.app)
    // se află în lista noastră de site-uri permise.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Permite cererea
    } else {
      // Dacă nu se află în listă, blocăm cererea
      callback(new Error('Blocat de politica CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Ce tipuri de cereri sunt permise
  allowedHeaders: ['Content-Type', 'Authorization'], // Ce headere sunt permise
};

const app = express();

// APLICĂM CONFIGURAREA CORS PENTRU TOATE RUTELE
app.use(cors(corsOptions));

// --- SFÂRȘIT CONFIGURARE CORS ---

app.use(express.json());

// Servește fișierele statice din folderul 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const apiRoutes = require('./src/api');

// O rută de test pentru a verifica dacă API-ul funcționează
app.get('/', (req, res) => {
    res.status(200).json({ message: `Salut! API-ul pentru aplicație funcționează și acceptă cereri.` });
});

// Toate rutele API vor fi prefixate cu /api
app.use('/api', apiRoutes);

module.exports = app;