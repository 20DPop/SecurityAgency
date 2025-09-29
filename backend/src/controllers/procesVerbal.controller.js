const ProcesVerbal = require('../models/procesVerbal.model');
const Post = require('../models/post.model'); 
const User = require('../models/user.model');
const fs = require('fs').promises;
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// @desc    Creare Proces Verbal de Intervenție (cu semnătura agentului și a beneficiarului)
// @route   POST /api/proces-verbal/create
// @access  Private (Paznic)
const createProcesVerbal = async (req, res) => {
  try {
    // --- PASUL 1: Preluarea datelor ---
    const paznicLogat = req.user;
    const beneficiar = await User.findOne({ 'profile.assignedPazniciIds': paznicLogat._id });
    if (!beneficiar) return res.status(404).json({ message: 'Nu sunteți alocat la niciun beneficiar.' });
    
    const post = await Post.findOne({ beneficiaryId: beneficiar._id });
    if (!post) return res.status(404).json({ message: 'Beneficiarul nu are niciun post configurat.' });
    
    // MODIFICARE 1: Preluăm ambele semnături din corpul cererii
    const {
      reprezentant_beneficiar,
      ora_declansare_alarma,
      ora_prezentare_echipaj,
      ora_incheiere_misiune,
      evenimente,
      agentSignatureDataURL,
      beneficiarySignatureDataURL
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
    // (Codul pentru popularea tabelului pe pagina 2 rămâne neschimbat)
    if (evenimente && evenimente.length > 0) {
      //... logica existentă pentru tabel ...
    }

    // MODIFICARE 2: Adăugăm ambele semnături în document

    // --- ADAUGĂM SEMNĂTURA AGENTULUI ---
    if (agentSignatureDataURL) {
      const signatureImageBytes = Buffer.from(agentSignatureDataURL.split(',')[1], 'base64');
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
      const sigDims = signatureImage.scale(0.3); // Ajustează factorul de scalare dacă e necesar
      
      // Calibrează poziția pentru "ECHIPA DE INTERVENTIE" (stânga jos)
      page1.drawImage(signatureImage, {
        x: 130, // Poziția de la marginea stângă a paginii
        y: 130, // Poziția de la marginea de jos a paginii
        width: sigDims.width,
        height: sigDims.height,
      });
    }

    // --- ADAUGĂM SEMNĂTURA BENEFICIARULUI ---
    if (beneficiarySignatureDataURL) {
        const signatureImageBytes = Buffer.from(beneficiarySignatureDataURL.split(',')[1], 'base64');
        const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
        const sigDims = signatureImage.scale(0.3); // Ajustează factorul de scalare dacă e necesar

        // Calibrează poziția pentru "BENEFICIAR" (dreapta jos)
        // !!! AJUSTEAZĂ ACESTE COORDONATE !!!
        page1.drawImage(signatureImage, {
            x: 400, // Mai la dreapta față de semnătura agentului
            y: 130, // La aceeași înălțime pe verticală
            width: sigDims.width,
            height: sigDims.height,
        });
    }

    // --- PASUL 3: Salvarea fișierului și a înregistrării în DB (rămâne la fel) ---
    const pdfBytes = await pdfDoc.save();
    const fileName = `PV_Interventie_${beneficiar.profile.nume_companie.replace(/\s/g, '_')}_${Date.now()}.pdf`;
    const dirPath = path.join(__dirname, '..', '..', 'uploads', 'procese-verbale-interventie');
    await fs.mkdir(dirPath, { recursive: true });
    const filePath = path.join(dirPath, fileName);
    await fs.writeFile(filePath, pdfBytes);

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