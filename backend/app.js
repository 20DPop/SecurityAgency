// Cale: backend/app.js

const express = require('express');
const cors = require('cors');
const path = require('path');

// --- ÎNCEPUT CONFIGURARE CORS ---

// Lista de domenii care au voie să facă cereri la acest API.
const allowedOrigins = [
  // URL-ul EXACT al frontend-ului de pe Railway
  'https://vigilent-security.up.railway.app', 
  
  // Adresa locală pentru testare
  'http://localhost:5173' 
];

const corsOptions = {
  origin: (origin, callback) => {
    // Verificăm dacă originea cererii (ex: https://vigilent-security.up.railway.app)
    // se află în lista noastră de site-uri permise.
    // `!origin` permite cereri de la unelte ca Postman sau aplicații mobile care nu au o origine.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Permite cererea
    } else {
      // Dacă nu se află în listă, blocăm cererea
      callback(new Error('Blocat de politica CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Ce tipuri de cereri sunt permise
  allowedHeaders: ['Content-Type', 'Authorization'], // Ce headere sunt permise
  optionsSuccessStatus: 200 // ADAUGAT: Asigură compatibilitate maximă pentru cererile preflight (OPTIONS)
};

const app = express();

// APLICĂM CONFIGURAREA CORS PENTRU TOATE RUTELE
// Aceasta trebuie să fie una dintre primele middleware-uri aplicate.
app.use(cors(corsOptions));

// --- SFÂRȘIT CONFIGURARE CORS ---

// Middleware pentru a parsa body-ul cererilor JSON
app.use(express.json());

// Servește fișierele statice din folderul 'uploads'
// Orice cerere la /uploads/nume-fisier.pdf va servi fișierul din folderul backend/uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importăm rutele principale ale API-ului
const apiRoutes = require('./src/api');

// O rută de test pentru a verifica dacă API-ul funcționează
app.get('/', (req, res) => {
    res.status(200).json({ message: `Salut! API-ul pentru aplicație funcționează și acceptă cereri.` });
});

// Toate rutele API vor fi prefixate cu /api
app.use('/api', apiRoutes);

module.exports = app;