// backend/src/controllers/procesVerbal.controller.js

const ProcesVerbal = require('../models/procesVerbal.model');
const User = require('../models/user.model');
const Pontaj = require('../models/pontaj.model');
const fs = require('fs').promises;
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const createProcesVerbal = async (req, res) => {
  try {
    const paznicLogat = req.user;
    
    const {
      beneficiaryId,
      punctDeLucru,
      reprezentant_beneficiar,
      ora_declansare_alarma,
      ora_prezentare_echipaj,
      ora_incheiere_misiune,
      evenimente,
      agentSignatureDataURL,
      beneficiarySignatureDataURL
    } = req.body;

    if (!beneficiaryId || !punctDeLucru) {
        return res.status(400).json({ message: 'Beneficiarul și punctul de lucru sunt obligatorii.' });
    }

    const turaActiva = await Pontaj.findOne({ paznicId: paznicLogat._id, ora_iesire: null });
    if (!turaActiva) {
      return res.status(400).json({ message: 'Nu aveți o tură activă pentru a genera documente.' });
    }

    const beneficiar = await User.findById(beneficiaryId);
    if (!beneficiar) {
        return res.status(404).json({ message: 'Beneficiarul selectat nu a fost găsit.' });
    }
    
    const templatePath = path.join(__dirname, '..', 'templates', 'PV_interventie_template.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    const page1 = pdfDoc.getPages()[0];
    const page2 = pdfDoc.getPages()[1];
    const { width, height } = page1.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

    page1.drawText(new Date().toLocaleDateString('ro-RO'), { x: 300, y: height - 107, font, size: 11 });
    page1.drawText(punctDeLucru, { x: 247, y: height - 196, font, size: 11 });
    page1.drawText(reprezentant_beneficiar || 'Nespecificat', { x: 95, y: height - 215, font, size: 11 });
    page1.drawText(beneficiar.profile.nume_companie, { x: 90, y: height - 229, font, size: 11 });
    page1.drawText(formatTime(ora_declansare_alarma), { x: 263, y: height - 267, font, size: 11 });
    page1.drawText(formatTime(ora_prezentare_echipaj), { x: 323, y: height - 290, font, size: 11 });
    page1.drawText(formatTime(ora_incheiere_misiune), { x: 230, y: height - 349, font, size: 11 });
    
    // --- MODIFICARE APLICATĂ AICI: Am adăugat înapoi logica pentru tabel ---
    if (evenimente && evenimente.length > 0) {
      let currentY = height - 125; // Poziția Y de start pentru primul rând
      const rowHeight = 65; // Înălțimea fixă a unui rând, ajustează dacă e nevoie

      evenimente.forEach((event, index) => {
        // Asigură-te că nu scrii sub pagină
        if (currentY < 50) return;

        page2.drawText(`${index + 1}.`, { x: 78, y: currentY, font, size: 9 });
        page2.drawText(new Date(event.dataOraReceptionarii).toLocaleString('ro-RO'), { x: 110, y: currentY, font, size: 9, maxWidth: 80 });
        page2.drawText(event.tipulAlarmei, { x: 195, y: currentY, font, size: 9, maxWidth: 70 });
        page2.drawText(event.echipajAlarmat, { x: 275, y: currentY, font, size: 9, maxWidth: 70 });
        page2.drawText(formatTime(event.oraSosirii), { x: 347, y: currentY, font, size: 9 });
        page2.drawText(event.cauzeleAlarmei, { x: 390, y: currentY, font, size: 9, maxWidth: 80 });
        page2.drawText(event.modulDeSolutionare, { x: 445, y: currentY, font, size: 9, maxWidth: 80 });
        page2.drawText(event.observatii || '', { x: 500, y: currentY, font, size: 9, maxWidth: 80 });
        
        currentY -= rowHeight; // Treci la rândul următor
      });
    }
    // --- SFÂRȘIT MODIFICARE ---

    if (agentSignatureDataURL) {
      const signatureImageBytes = Buffer.from(agentSignatureDataURL.split(',')[1], 'base64');
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
      const sigDims = signatureImage.scale(0.3);
      page1.drawImage(signatureImage, { x: 100, y: 220, width: sigDims.width, height: sigDims.height });
    }

    if (beneficiarySignatureDataURL) {
        const signatureImageBytes = Buffer.from(beneficiarySignatureDataURL.split(',')[1], 'base64');
        const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
        const sigDims = signatureImage.scale(0.3);
        page1.drawImage(signatureImage, { x: 375, y: 220, width: sigDims.width, height: sigDims.height });
    }

    const pdfBytes = await pdfDoc.save();
    const fileName = `PV_Interventie_${beneficiar.profile.nume_companie.replace(/\s/g, '_')}_${Date.now()}.pdf`;
    const dirPath = path.join(__dirname, '..', '..', 'uploads', 'procese-verbale-interventie');
    await fs.mkdir(dirPath, { recursive: true });
    const filePath = path.join(dirPath, fileName);
    await fs.writeFile(filePath, pdfBytes);

    const caleStocareRelativa = `/uploads/procese-verbale-interventie/${fileName}`;
    await ProcesVerbal.create({
      paznicId: paznicLogat._id,
      pontajId: turaActiva._id,
      beneficiaryId: beneficiar._id,
      punctDeLucru: punctDeLucru,
      reprezentant_beneficiar,
      ora_declansare_alarma,
      ora_prezentare_echipaj,
      ora_incheiere_misiune,
      evenimente,
      caleStocarePDF: caleStocareRelativa
    });

    res.status(201).json({ message: 'Proces verbal creat cu succes!' });
  } catch (error) {
    console.error("Eroare la crearea procesului verbal:", error);
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

module.exports = { createProcesVerbal };