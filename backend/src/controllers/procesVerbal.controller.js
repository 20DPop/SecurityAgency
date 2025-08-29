// Cale: backend/src/controllers/procesVerbal.controller.js (Versiune de test, decuplată de pontaj)

const ProcesVerbal = require('../models/procesVerbal.model');
// Încă avem nevoie de modele pentru a prelua date de test
const Post = require('../models/post.model'); 
const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// @desc    Creare Proces Verbal (fără a necesita un pontajId)
// @route   POST /api/proces-verbal/create
// @access  Private (Paznic)
const createProcesVerbal = async (req, res) => {
  try {
    // --- PASUL 1: Preluarea datelor ---
    const paznicLogat = req.user;

    // Extragem datele din corpul cererii
    const {
      postId, // Acum trebuie să trimitem ID-ul postului în body
      reprezentant_beneficiar,
      ora_declansare_alarma,
      ora_prezentare_echipaj,
      ora_incheiere_misiune,
      observatii_generale,
      evenimente
    } = req.body;

    // --- Preluăm datele necesare pentru PDF (post și paznic) ---
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Postul specificat nu a fost găsit.' });
    }
    // Nu mai avem nevoie să căutăm pontajul

    // --- PASUL 2: Generarea PDF (codul rămâne identic) ---
    const fileName = `PV_TEST_${Date.now()}.pdf`;
    const dirPath = path.join(__dirname, '..', '..', 'uploads', 'procese-verbale');
    const filePath = path.join(dirPath, fileName);
    fs.mkdirSync(dirPath, { recursive: true });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));
    
    // ... AICI VINE TOT CODUL TĂU DE GENERARE PDF (cu doc.text, doc.addPage, etc.) ...
    // ... L-am scurtat pentru claritate, dar el trebuie să fie aici ...
    doc.fontSize(14).text('PROCES – VERBAL (MOD TEST)', { align: 'center' });
    doc.moveDown();
    doc.text(`La obiectivul: ${post.nume_post}`);
    doc.text(`De: ${paznicLogat.nume} ${paznicLogat.prenume}`);
    doc.end();


    // --- PASUL 3: Salvarea înregistrării în baza de date ---
    const caleStocareRelativa = `/uploads/procese-verbale/${fileName}`;

    const newProcesVerbal = await ProcesVerbal.create({
      // NU mai avem pontajId
      paznicId: paznicLogat._id,
      postId: post._id,
      reprezentant_beneficiar,
      ora_declansare_alarma,
      ora_prezentare_echipaj,
      ora_incheiere_misiune,
      observatii_generale,
      evenimente,
      caleStocarePDF: caleStocareRelativa
    });

    res.status(201).json({ message: 'Proces verbal de test creat cu succes!', data: newProcesVerbal });

  } catch (error) {
    console.error("Eroare la crearea procesului verbal:", error);
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

module.exports = {
  createProcesVerbal,
};