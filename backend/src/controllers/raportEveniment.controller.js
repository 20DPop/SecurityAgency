// backend/src/controllers/raportEveniment.controller.js

const RaportEveniment = require('../models/raportEveniment.model');
const User = require('../models/user.model');
const Pontaj = require('../models/pontaj.model');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

exports.createRaportEveniment = async (req, res) => {
  try {
    const paznicLogat = req.user;
    
    const {
      beneficiaryId,
      punctDeLucru, // Primit pentru validare, dar nu e folosit în PDF
      numarPost,     // Primit din câmpul text și folosit în PDF
      numarRaport, 
      dataRaport, 
      functiePaznic,
      dataConstatare, 
      oraConstatare, 
      numeFaptuitor,
      descriereFapta, 
      cazSesizatLa,
      signatureDataURL
    } = req.body;

    if (!beneficiaryId || !punctDeLucru) {
        return res.status(400).json({ message: 'Selectarea beneficiarului și a punctului de lucru este obligatorie.' });
    }
    if (!numarPost) {
        return res.status(400).json({ message: 'Câmpul "La postul Nr." este obligatoriu.' });
    }

    const turaActiva = await Pontaj.findOne({ paznicId: paznicLogat._id, ora_iesire: null });
    if (!turaActiva) {
      return res.status(400).json({ message: 'Nu aveți o tură activă pentru a genera documente.' });
    }

    const beneficiar = await User.findById(beneficiaryId);
    if (!beneficiar) {
        return res.status(404).json({ message: 'Beneficiarul selectat nu a fost găsit.' });
    }
    
    const templatePath = path.join(__dirname, '..', 'templates', 'raport_eveniment_template.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ro-RO');

    // Popularea PDF-ului
    page.drawText(numarRaport || '', { x: 285, y: height - 102, font, size: 11 });
    page.drawText(formatDate(dataRaport), { x: 335, y: height - 102, font, size: 11 });
    page.drawText(`${paznicLogat.nume} ${paznicLogat.prenume}`, { x: 260, y: height - 120, font, size: 11 });
    page.drawText(functiePaznic, { x: 150, y: height - 153, font, size: 11 });
    page.drawText(beneficiar.profile.nume_companie, { x: 80, y: height - 170, font, size: 11 });
    page.drawText(numarPost, { x: 485, y: height - 170, font, size: 11 }); // Aici folosim numarPost
    page.drawText(formatDate(dataConstatare), { x: 120 , y: height - 203, font, size: 11 });
    page.drawText(oraConstatare, { x: 265, y: height - 203, font, size: 11 });
    page.drawText(numeFaptuitor, { x: 418, y: height - 203, font, size: 11 });
    page.drawText(descriereFapta, { x: 220, y: height - 253, font, size: 11, lineHeight: 15, maxWidth: 450 });
    page.drawText(cazSesizatLa, { x: 190, y: height - 540, font, size: 11 });
    
    if (signatureDataURL) {
      const signatureImageBytes = Buffer.from(signatureDataURL.split(',')[1], 'base64');
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
      const sigDims = signatureImage.scale(0.3);
      page.drawImage(signatureImage, { x: 75, y: 160, width: sigDims.width, height: sigDims.height });
    }

    // Salvarea fișierului PDF
    const pdfBytes = await pdfDoc.save();
    const fileName = `RaportEveniment_${paznicLogat.nume.replace(/\s/g, '_')}_${Date.now()}.pdf`;
    const dirPath = path.join(__dirname, '..', '..', 'uploads', 'rapoarte-eveniment');
    await fs.mkdir(dirPath, { recursive: true });
    const filePath = path.join(dirPath, fileName);
    await fs.writeFile(filePath, pdfBytes);

    const caleStocareRelativa = `/uploads/rapoarte-eveniment/${fileName}`;
    
    // Crearea documentului în baza de date
    await RaportEveniment.create({
      paznicId: paznicLogat._id,
      beneficiaryId: beneficiar._id,
      numarRaport,
      dataRaport,
      numePaznic: `${paznicLogat.nume} ${paznicLogat.prenume}`,
      functiePaznic,
      societate: beneficiar.profile.nume_companie,
      punctDeLucru: numarPost, // Salvăm în DB postul introdus manual
      dataConstatare,
      oraConstatare,
      numeFaptuitor,
      descriereFapta,
      cazSesizatLa,
      caleStocarePDF: caleStocareRelativa,
    });

    res.status(201).json({ message: 'Raport de eveniment creat cu succes!' });
  } catch (error) {
    console.error("Eroare la crearea raportului de eveniment:", error);
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};