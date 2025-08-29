const mongoose = require('mongoose');

// Această sub-schemă definește structura unui singur rând din tabelul de evenimente
const evenimentSchema = new mongoose.Schema({
  dataOraReceptionarii: { type: Date, required: true },
  tipulAlarmei: { type: String, required: true },
  echipajAlarmat: { type: String, required: true },
  oraSosirii: { type: Date, required: true },
  cauzeleAlarmei: { type: String, required: true },
  modulDeSolutionare: { type: String, required: true },
  observatii: { type: String },
}, { _id: false }); // _id: false înseamnă că rândurile din tabel nu vor avea propriul lor ID unic

// Aceasta este schema principală pentru documentul "Proces Verbal"
const procesVerbalSchema = new mongoose.Schema({
  // Legături către alte entități pentru context
  pontajId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pontaj', 
  },
  paznicId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  postId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true 
  },
  
  // Câmpurile care corespund datelor de pe prima pagină a PDF-ului
  reprezentant_beneficiar: { type: String },
  ora_declansare_alarma: { type: Date, required: true },
  ora_prezentare_echipaj: { type: Date, required: true },
  ora_incheiere_misiune: { type: Date, required: true },
  observatii_generale: { type: String },

  // Câmpul care stochează toate rândurile din tabelul de evenimente
  evenimente: [evenimentSchema],
  
  // Câmpul care stochează calea către fișierul PDF generat
  caleStocarePDF: { type: String, required: true },
  
}, { 
  timestamps: true // Adaugă automat createdAt și updatedAt
});

const ProcesVerbal = mongoose.model('ProcesVerbal', procesVerbalSchema);

module.exports = ProcesVerbal;