const ProcesVerbal = require('../models/procesVerbal.model');
const Post = require('../models/post.model'); 
const User = require('../models/user.model');
const fs = require('fs').promises;
const path = require('path');
// MODIFICARE 1: S-ar putea să ai deja `PDFDocument`, `rgb`, `StandardFonts`. Le păstrăm.
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// @desc    Creare Proces Verbal de Intervenție (cu semnătură)
// @route   POST /api/proces-verbal/create
// @access  Private (Paznic)
const createProcesVerbal = async (req, res) => {
  try {
    // --- PASUL 1: Preluarea datelor (rămâne aproape la fel) ---
    const paznicLogat = req.user;
    const beneficiar = await User.findOne({ 'profile.assignedPazniciIds': paznicLogat._id });
    if (!beneficiar) return res.status(404).json({ message: 'Nu sunteți alocat la niciun beneficiar.' });
    
    const post = await Post.findOne({ beneficiaryId: beneficiar._id });
    if (!post) return res.status(404).json({ message: 'Beneficiarul nu are niciun post configurat.' });
    
    const {
      reprezentant_beneficiar,
      ora_declansare_alarma,
      ora_prezentare_echipaj,
      ora_incheiere_misiune,
      evenimente,
      // MODIFICARE 2: Preluăm imaginea semnăturii din corpul cererii
      signatureDataURL 
    } = req.body;

    // --- PASUL 2: Generarea PDF folosind Șablonul ---
    const templatePath = path.join(__dirname, '..', 'templates', 'PV_interventie_template.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    const page1 = pdfDoc.getPages()[0];
    const page2 = pdfDoc.getPages()[1];
    const { width, height } = page1.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

    // --- Completarea textului pe PDF (rămâne la fel) ---
    page1.drawText(new Date().toLocaleDateString('ro-RO'), { x: 300, y: height - 107, font, size: 11 });
    page1.drawText(`${post.nume_post}, ${post.adresa_post}`, { x: 247, y: height - 196, font, size: 11 });
    page1.drawText(reprezentant_beneficiar || 'Nespecificat', { x: 95, y: height - 215, font, size: 11 });
    page1.drawText(beneficiar.profile.nume_companie, { x: 90, y: height - 229, font, size: 11 });
    page1.drawText(formatTime(ora_declansare_alarma), { x: 263, y: height - 267, font, size: 11 });
    page1.drawText(formatTime(ora_prezentare_echipaj), { x: 323, y: height - 290, font, size: 11 });
    page1.drawText(formatTime(ora_incheiere_misiune), { x: 230, y: height - 349, font, size: 11 });
    
    // --- Completarea tabelului (rămâne la fel) ---
    let startY = height - 125;
    const rowHeight = 65;
    const columnX = { nrCrt: 78, dataOra: 110, tipAlarma: 195, echipaj: 275, oraSosirii: 347, cauze: 390, solutionare: 445, observatii: 500 };
    
    if (evenimente && evenimente.length > 0) {
      let currentY = startY;
      evenimente.forEach((event, index) => {
        // ... (logica de calculare a înălțimii rândului și desenarea textului în tabel rămâne neschimbată)
        page2.drawText(`${index + 1}.`, { x: columnX.nrCrt, y: currentY, font, size: 9 });
        // ... etc.
      });
    }

    // MODIFICARE 3: Adăugăm logica pentru a încorpora imaginea semnăturii
    if (signatureDataURL) {
      // Data URL are formatul "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
      // Trebuie să extragem doar partea de după virgulă.
      const signatureImageBytes = Buffer.from(signatureDataURL.split(',')[1], 'base64');
      
      // Încorporăm imaginea PNG în documentul PDF
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
      
      // Scalăm imaginea pentru a nu fi prea mare. Ajustează valoarea (ex: 0.3 = 30% din dimensiunea originală)
      const sigDims = signatureImage.scale(0.3); 
      
      // Desenăm imaginea pe prima pagină.
      // !!! IMPORTANT: Va trebui să ajustezi valorile X și Y pentru a potrivi semnătura în locul corect pe șablonul tău!
      page1.drawImage(signatureImage, {
        x: 130, // Poziția de la marginea stângă a paginii
        y: 130, // Poziția de la marginea de jos a paginii (Y=0 este jos)
        width: sigDims.width,
        height: sigDims.height,
      });
    }

    // --- Salvarea fișierului (rămâne la fel) ---
    const pdfBytes = await pdfDoc.save();
    const fileName = `PV_Interventie_${beneficiar.profile.nume_companie.replace(/\s/g, '_')}_${Date.now()}.pdf`;
    const dirPath = path.join(__dirname, '..', '..', 'uploads', 'procese-verbale-interventie');
    await fs.mkdir(dirPath, { recursive: true });
    const filePath = path.join(dirPath, fileName);
    await fs.writeFile(filePath, pdfBytes);

    // --- Salvarea înregistrării în baza de date (rămâne la fel) ---
    const caleStocareRelativa = `/uploads/procese-verbale-interventie/${fileName}`;
    await ProcesVerbal.create({
      paznicId: paznicLogat._id,
      postId: post._id,
      reprezentant_beneficiar,
      ora_declansare_alarma,
      ora_prezentare_echipaj,
      ora_incheiere_misiune,
      evenimente,
      caleStocarePDF: caleStocareRelativa
    });

    res.status(201).json({ message: 'Proces verbal de intervenție creat cu succes!' });

  } catch (error) {
    console.error("Eroare la crearea procesului verbal de intervenție:", error);
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

module.exports = { createProcesVerbal };