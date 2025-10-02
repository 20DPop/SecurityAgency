const express = require('express');
const cors = require('cors');
const path = require('path');

// --- ÎNCEPUT MODIFICARE CORS ---
// Lista de domenii care au voie să facă cereri la API-ul tău
const allowedOrigins = [
  'https://vigilent-security.up.railway.app', // URL-ul tău de producție pentru frontend
  'http://localhost:5173' // URL-ul pentru dezvoltare locală (dacă folosești portul default Vite)
];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitem cererile dacă vin de la unul din domeniile din listă sau dacă nu au o origine (ex: Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocat de politica CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();

// Folosim opțiunile CORS configurate
app.use(cors(corsOptions));

// --- SFÂRȘIT MODIFICARE CORS ---

app.use(express.json());

// Servește fișierele statice din folderul 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const apiRoutes = require('./src/api');

app.get('/', (req, res) => {
    res.status(200).json({ message: `Salut! API-ul pentru aplicație funcționează` });
});

app.use('/api', apiRoutes);

module.exports = app;