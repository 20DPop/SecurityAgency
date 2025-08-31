// Cale: backend/src/controllers/procesVerbal.controller.js

const ProcesVerbal = require('../models/procesVerbal.model');
const Post = require('../models/post.model'); 
const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit-table'); // Folosim extensia pentru tabele

// @desc    Creare Proces Verbal
// @route   POST /api/proces-verbal/create
// @access  Private (Paznic)
const createProcesVerbal = async (req, res) => {
  try {
    // --- PASUL 1: Preluarea datelor și identificarea postului ---
    const paznicLogat = req.user;
    const beneficiar = await User.findOne({ 'profile.assignedPazniciIds': paznicLogat._id });
    if (!beneficiar) {
      return res.status(404).json({ message: 'Nu sunteți alocat la niciun beneficiar.' });
    }
    const post = await Post.findOne({ beneficiaryId: beneficiar._id });
    if (!post) {
      return res.status(404).json({ message: 'Beneficiarul nu are niciun post configurat.' });
    }
    
    const {
      reprezentant_beneficiar,
      ora_declansare_alarma,
      ora_prezentare_echipaj,
      ora_incheiere_misiune,
      observatii_generale,
      evenimente
    } = req.body;

    // --- PASUL 2: Generarea PDF detaliată ---
    const fileName = `PV_${beneficiar.profile.nume_companie.replace(/\s/g, '_')}_${Date.now()}.pdf`;
    const dirPath = path.join(__dirname, '..', '..', 'uploads', 'procese-verbale');
    const filePath = path.join(dirPath, fileName);
    fs.mkdirSync(dirPath, { recursive: true });
    
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));
    
    // Înregistrăm fonturile standard pentru a le putea schimba ușor
    const fontNormal = 'Helvetica';
    const fontBold = 'Helvetica-Bold';

    // Funcții ajutătoare pentru formatare
    const formatDate = (dateString) => {
        if (!dateString) return '__________';
        const date = new Date(dateString);
        return date.toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const formatTime = (dateString) => {
        if (!dateString) return '____:____';
        const date = new Date(dateString);
        return date.toLocaleString('ro-RO', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    // --- START PAGINA 1 ---
    doc.font(fontBold).fontSize(16).text('PROCES – VERBAL', { align: 'center' });
    doc.moveDown(2);

    doc.font(fontNormal).fontSize(12).text('Încheiat astăzi ', { continued: true, align: 'center' });
    doc.font(fontBold).text(new Date().toLocaleDateString('ro-RO'), { align: 'center' });
    doc.moveDown(3);

    const initialX = doc.x; // Salvăm poziția X de start a marginilor
    
    doc.font(fontNormal).text('La obiectivul (denumirea și adresa) ', { continued: true });
    doc.font(fontBold).text(`${post.nume_post}, ${post.adresa_post}`);

    if (reprezentant_beneficiar) {
      doc.font(fontNormal).text('de ', { continued: true });
      doc.font(fontBold).text(reprezentant_beneficiar, { continued: true });
      doc.font(fontNormal).text(', reprezentant al ', { continued: true });
      doc.font(fontBold).text(beneficiar.profile.nume_companie);
    } else {
        doc.moveDown(0.5); // Adaugă spațiu dacă nu există reprezentant
    }

    doc.font(fontNormal).text('ca urmare a verificării timpilor de intervenție la obiectivele monitorizate.');
    doc.moveDown(2);
    
    doc.text('Alarma a fost declanșată la ora ', { continued: true });
    doc.font(fontBold).text(formatTime(ora_declansare_alarma));
    doc.moveDown(1);
    
    doc.text('Echipajul de intervenție s-a prezentat la ora ', { continued: true });
    doc.font(fontBold).text(formatTime(ora_prezentare_echipaj));
    doc.moveDown(2);

    const observatii = observatii_generale || "În timpul intervenției echipajul de intervenție a acționat conform procedurilor în vigoare, neexistând observații din partea beneficiarului privind calitatea prestației.";
    doc.font(fontNormal).text(observatii, { align: 'justify' });
    doc.moveDown(2);

    doc.text('Misiunea s-a încheiat la ora ', { continued: true });
    doc.font(fontBold).text(formatTime(ora_incheiere_misiune));
    doc.moveDown(2);

    doc.font(fontNormal).text('Drept pentru care am încheiat prezentul proces-verbal în 2 (două) exemplare.');
    doc.moveDown(5);

    // Secțiunea de semnături
    const signatureY = doc.y;
    doc.font(fontBold).text('ECHIPA DE INTERVENȚIE', initialX, signatureY);
    doc.text('BENEFICIAR', doc.page.width - initialX - 150, signatureY, { width: 150, align: 'right' });
    doc.moveDown(0.5);
    doc.font(fontNormal).text('_________________________', initialX, doc.y);
    doc.text('_________________________', doc.page.width - initialX - 150, doc.y, { width: 150, align: 'right' });
    
    // --- END PAGINA 1 ---


    // --- START PAGINA 2: TABELUL ---
    doc.addPage();

    const table = {
        headers: [
            { label: "Nr. crt.", property: 'nr', width: 40, align: 'center', renderer: (value, i) => i !== undefined ? `${i + 1}.` : ''},
            { label: "Data și ora recepționării", property: 'dataOraReceptionarii', width: 90, renderer: (value) => value ? new Date(value).toLocaleString('ro-RO') : '' },
            { label: "Tipul alarmei", property: 'tipulAlarmei', width: 80 },
            { label: "Echipaj alarmat", property: 'echipajAlarmat', width: 80 },
            { label: "Ora sosirii la obiectiv", property: 'oraSosirii', width: 70, renderer: (value) => formatTime(value) },
            { label: "Cauzele alarmei", property: 'cauzeleAlarmei', width: 80 },
            { label: "Modul de soluționare", property: 'modulDeSolutionare', width: 80 },
            { label: "Observații", property: 'observatii' }, // Lasă lățimea automată
        ],
        datas: evenimente.length > 0 ? evenimente : [{}], // Asigură-te că există cel puțin un rând gol pentru a desena structura
        options: {
            padding: 5,
            headerStyle: {
                fillColor: '#E0E0E0',
                font: fontBold,
                fontSize: 10,
            },
            style: {
                font: fontNormal,
                fontSize: 9,
            },
        }
    };

    await doc.table(table);

    // Adaugă rânduri goale pentru a umple pagina, dacă este necesar
    const rowsOnPage = evenimente.length > 0 ? evenimente.length : 1;
    const remainingRows = 10 - rowsOnPage; // Ajustează '10' la numărul total de rânduri dorit
    if (remainingRows > 0) {
        const emptyRow = { nr: '', dataOraReceptionarii: '', tipulAlarmei: '', echipajAlarmat: '', oraSosirii: '', cauzeleAlarmei: '', modulDeSolutionare: '', observatii: '' };
        for (let i = 0; i < remainingRows; i++) {
            await doc.table({ headers: table.headers, datas: [emptyRow], options: { ...table.options, hideHeader: true } });
        }
    }
    // --- END PAGINA 2 ---

    doc.end();

    // --- PASUL 3: Salvarea înregistrării în baza de date ---
    const caleStocareRelativa = `/uploads/procese-verbale/${fileName}`;
    const newProcesVerbal = await ProcesVerbal.create({
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

    res.status(201).json({ message: 'Proces verbal creat cu succes!', data: newProcesVerbal });

  } catch (error) {
    console.error("Eroare la crearea procesului verbal:", error);
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

module.exports = { createProcesVerbal };