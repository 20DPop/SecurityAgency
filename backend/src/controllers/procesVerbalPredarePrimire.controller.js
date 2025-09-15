const ProcesVerbalPredarePrimire = require('../models/procesVerbalPredarePrimire.model');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

exports.createProcesVerbalPredarePrimire = async (req, res) => {
  try {
    const { pontajId, data_incheierii, nume_sef_formatie, nume_reprezentant_primire, obiecte_predate } = req.body;
    const paznicLogat = req.user;

    const existingPV = await ProcesVerbalPredarePrimire.findOne({ pontajId });
    if (existingPV) {
      return res.status(400).json({ message: 'Procesul verbal pentru această tură a fost deja creat.' });
    }

    // PASUL 1: Încarcă șablonul din `src/templates`
    const templatePath = path.join(__dirname, '..', 'templates', 'PV_predare_primire_template.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ro-RO');

    // --- SECȚIUNEA DE CALIBRARE (Ajustează valorile X și Y pentru aliniere perfectă) ---
    page.drawText(formatDate(data_incheierii), { x: 200, y: height - 256, font, size: 13 });
    page.drawText(nume_sef_formatie, { x: 150, y: height - 270, font, size: 11 });
    page.drawText(nume_reprezentant_primire, { x: 380, y: height - 273, font, size: 13 });
    page.drawText(obiecte_predate, { x: 90, y: height - 334, font, size: 13, lineHeight: 14, maxWidth: 450 });
    page.drawText(nume_sef_formatie, { x: 130, y: 165, font, size: 11 });
    page.drawText(nume_reprezentant_primire, { x: 270, y: 215, font, size: 13 });
    // --- SFÂRȘIT SECȚIUNE CALIBRARE ---

    const pdfBytes = await pdfDoc.save();
    const fileName = `PV_Predare_${paznicLogat.nume.replace(/\s/g, '_')}_${Date.now()}.pdf`;
    
    // PASUL 2: Salvează fișierul final în `uploads/procese-predare-primire`
    const dirPath = path.join(__dirname, '..', '..', 'uploads', 'procese-predare-primire');
    await fs.mkdir(dirPath, { recursive: true });
    const filePath = path.join(dirPath, fileName);
    await fs.writeFile(filePath, pdfBytes);

    const caleStocareRelativa = `/uploads/procese-predare-primire/${fileName}`;
    await ProcesVerbalPredarePrimire.create({
      pontajId,
      paznicPredareId: paznicLogat._id,
      data_incheierii,
      nume_sef_formatie,
      nume_reprezentant_primire,
      obiecte_predate,
      caleStocarePDF: caleStocareRelativa,
    });

    res.status(201).json({ message: 'Proces verbal creat cu succes!' });

  } catch (error) {
    console.error("Eroare la crearea PV de predare-primire:", error);
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};