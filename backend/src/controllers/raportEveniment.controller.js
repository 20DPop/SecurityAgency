const RaportEveniment = require('../models/raportEveniment.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

exports.createRaportEveniment = async (req, res) => {
  try {
    const paznicLogat = req.user;
    const {
      numarRaport, dataRaport, functiePaznic, numarPost,
      dataConstatare, oraConstatare, numeFaptuitor,
      descriereFapta, cazSesizatLa
    } = req.body;

    const beneficiar = await User.findOne({ 'profile.assignedPazniciIds': paznicLogat._id });
    if (!beneficiar) return res.status(404).json({ message: 'Nu sunteți alocat la niciun beneficiar.' });
    
    const post = await Post.findOne({ beneficiaryId: beneficiar._id });
    if (!post) return res.status(404).json({ message: 'Beneficiarul nu are niciun post configurat.' });
    
    // Încarcă șablonul PDF
    const templatePath = path.join(__dirname, '..', 'templates', 'raport_eveniment_template.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ro-RO');

    // --- SECȚIUNEA DE CALIBRARE (Ajustează aceste valori) ---
    page.drawText(numarRaport || '', { x: 130, y: height - 110, font, size: 11 });
    page.drawText(formatDate(dataRaport), { x: 200, y: height - 110, font, size: 11 });
    page.drawText(`${paznicLogat.nume} ${paznicLogat.prenume}`, { x: 260, y: height - 157, font, size: 11 });
    page.drawText(functiePaznic, { x: 150, y: height - 188, font, size: 11 });
    page.drawText(beneficiar.profile.nume_companie, { x: 320, y: height - 219, font, size: 11 });
    page.drawText(numarPost, { x: 490, y: height - 219, font, size: 11 });
    page.drawText(formatDate(dataConstatare), { x: 115, y: height - 250, font, size: 11 });
    page.drawText(oraConstatare, { x: 245, y: height - 250, font, size: 11 });
    page.drawText(numeFaptuitor, { x: 410, y: height - 250, font, size: 11 });
    page.drawText(descriereFapta, { x: 80, y: height - 305, font, size: 11, lineHeight: 15, maxWidth: 450 });
    page.drawText(cazSesizatLa, { x: 215, y: height - 618, font, size: 11 });
    page.drawText(`${paznicLogat.nume} ${paznicLogat.prenume}`, { x: 140, y: height - 685, font, size: 11 });
    // --- SFÂRȘIT SECȚIUNE CALIBRARE ---

    const pdfBytes = await pdfDoc.save();
    const fileName = `RaportEveniment_${paznicLogat.nume.replace(/\s/g, '_')}_${Date.now()}.pdf`;
    const dirPath = path.join(__dirname, '..', '..', 'uploads', 'rapoarte-eveniment');
    await fs.mkdir(dirPath, { recursive: true });
    const filePath = path.join(dirPath, fileName);
    await fs.writeFile(filePath, pdfBytes);

    const caleStocareRelativa = `/uploads/rapoarte-eveniment/${fileName}`;
    await RaportEveniment.create({
      paznicId: paznicLogat._id,
      postId: post._id,
      numarRaport, dataRaport,
      numePaznic: `${paznicLogat.nume} ${paznicLogat.prenume}`,
      functiePaznic,
      societate: beneficiar.profile.nume_companie,
      numarPost, dataConstatare, oraConstatare,
      numeFaptuitor: numeFaptuitor, // Corectat numele câmpului
      descriereFapta, cazSesizatLa,
      caleStocarePDF: caleStocareRelativa,
    });

    res.status(201).json({ message: 'Raport de eveniment creat cu succes!' });
  } catch (error) {
    console.error("Eroare la crearea raportului de eveniment:", error);
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};