const ProcesVerbal = require('../models/procesVerbal.model');
const Post = require('../models/post.model'); 
const User = require('../models/user.model');
const fs = require('fs').promises;
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// @desc    Creare Proces Verbal de Intervenție (cu noul șablon curat)
// @route   POST /api/proces-verbal/create
// @access  Private (Paznic)
const createProcesVerbal = async (req, res) => {
  try {
    // --- PASUL 1: Preluarea datelor (rămâne la fel) ---
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
      evenimente
    } = req.body;

    // --- PASUL 2: Generarea PDF folosind Noul Șablon ---
    const templatePath = path.join(__dirname, '..', 'templates', 'PV_interventie_template.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    const page1 = pdfDoc.getPages()[0];
    const page2 = pdfDoc.getPages()[1];
    const { width, height } = page1.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

    //------------------------------------------------------------------//
    // --- CALIBRARE PAGINA 1 (Ajustează aceste valori) --- //
    // Y=0 este în JOSUL paginii. O valoare Y mai mare înseamnă mai SUS.
    //------------------------------------------------------------------//
    page1.drawText(new Date().toLocaleDateString('ro-RO'), { x: 300, y: height - 107, font, size: 11 });
    page1.drawText(`${post.nume_post}, ${post.adresa_post}`, { x: 276, y: height - 196, font, size: 11 });
    page1.drawText(reprezentant_beneficiar || 'Nespecificat', { x: 95, y: height - 215, font, size: 11 });
    page1.drawText(beneficiar.profile.nume_companie, { x: 440, y: height - 216, font, size: 11 });
    page1.drawText(formatTime(ora_declansare_alarma), { x: 263, y: height - 267, font, size: 11 });
    page1.drawText(formatTime(ora_prezentare_echipaj), { x: 323, y: height - 290, font, size: 11 });
    page1.drawText(formatTime(ora_incheiere_misiune), { x: 230, y: height - 349, font, size: 11 });
    // Semnăturile nu necesită text dinamic, sunt deja pe șablon.

    //------------------------------------------------------------------//
    // --- CALIBRARE PAGINA 2 (Tabelul) (Ajustează aceste valori) --- //
    //------------------------------------------------------------------//
    let startY = height - 125; // Poziția Y de start pentru primul rând al tabelului
    const rowHeight = 65; // Înălțimea unui rând (distanța verticală)
    const columnX = { // Pozițiile X pentru fiecare coloană
      nrCrt: 78,
      dataOra: 110,
      tipAlarma: 195,
      echipaj: 275,
      oraSosirii: 347,
      cauze: 390,
      solutionare: 445,
      observatii: 500
    };
    
    if (evenimente && evenimente.length > 0) {
      evenimente.forEach((event, index) => {
        const currentY = startY - (index * rowHeight);
        
        page2.drawText(`${index + 1}.`, { x: columnX.nrCrt, y: currentY, font, size: 9 });
        page2.drawText(new Date(event.dataOraReceptionarii).toLocaleString('ro-RO'), { x: columnX.dataOra, y: currentY, font, size: 9, maxWidth: 80 });
        page2.drawText(event.tipulAlarmei, { x: columnX.tipAlarma, y: currentY, font, size: 9, maxWidth: 70 });
        page2.drawText(event.echipajAlarmat, { x: columnX.echipaj, y: currentY, font, size: 9, maxWidth: 70 });
        page2.drawText(formatTime(event.oraSosirii), { x: columnX.oraSosirii, y: currentY, font, size: 9, maxWidth: 70 });
        page2.drawText(event.cauzeleAlarmei, { x: columnX.cauze, y: currentY, font, size: 9, maxWidth: 80 });
        page2.drawText(event.modulDeSolutionare, { x: columnX.solutionare, y: currentY, font, size: 9, maxWidth: 80 });
        page2.drawText(event.observatii || '', { x: columnX.observatii, y: currentY, font, size: 9, maxWidth: 80 });
      });
    }

    // --- Salvarea fișierului ---
    const pdfBytes = await pdfDoc.save();
    const fileName = `PV_Interventie_${beneficiar.profile.nume_companie.replace(/\s/g, '_')}_${Date.now()}.pdf`;
    const dirPath = path.join(__dirname, '..', '..', 'uploads', 'procese-verbale-interventie');
    await fs.mkdir(dirPath, { recursive: true });
    const filePath = path.join(dirPath, fileName);
    await fs.writeFile(filePath, pdfBytes);

    // --- Salvarea înregistrării în baza de date ---
    const caleStocareRelativa = `/uploads/procese-verbale-interventie/${fileName}`;
    await ProcesVerbal.create({
      paznicId: paznicLogat._id,
      postId: post._id,
      reprezentant_beneficiar,
      ora_declansare_alarma,
      ora_prezentare_echipaj,
      ora_incheiere_misiune,
      evenimente, // Observațiile generale nu mai sunt în acest șablon
      caleStocarePDF: caleStocareRelativa
    });

    res.status(201).json({ message: 'Proces verbal de intervenție creat cu succes!' });

  } catch (error) {
    console.error("Eroare la crearea procesului verbal de intervenție:", error);
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

module.exports = { createProcesVerbal };