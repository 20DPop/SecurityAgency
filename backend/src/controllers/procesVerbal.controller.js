// Cale: src/controllers/procesVerbal.controller.js (Versiune Corectată)

const ProcesVerbal = require('../models/procesVerbal.model');
const Pontaj = require('../models/pontaj.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const fs = require('fs'); // --- AICI ESTE CORECȚIA ---
const path = require('path');
const PDFDocument = require('pdfkit');

// @desc    Creare Proces Verbal și generare PDF
// @route   POST /api/proces-verbal/:pontajId
// @access  Private (Paznic)
const createProcesVerbal = async (req, res) => {
  try {
    // --- PASUL 1: Validarea datelor și preluarea informațiilor necesare ---
    const { pontajId } = req.params;
    const paznicLogat = req.user;

    // Preluăm pontajul și populăm datele despre post și paznic
    const pontaj = await Pontaj.findById(pontajId)
      .populate({
        path: 'postId',
        model: 'Post'
      })
      .populate({
        path: 'paznicId',
        model: 'User'
      });

    if (!pontaj) {
      return res.status(404).json({ message: 'Pontajul asociat nu a fost găsit.' });
    }
    if (pontaj.paznicId._id.toString() !== paznicLogat._id.toString()) {
      return res.status(403).json({ message: 'Nu sunteți autorizat pentru acest pontaj.' });
    }
    
    // Extragem datele din corpul cererii (trimise de formularul React)
    const {
      reprezentant_beneficiar,
      ora_declansare_alarma,
      ora_prezentare_echipaj,
      ora_incheiere_misiune,
      observatii_generale,
      evenimente // Acesta este array-ul cu rândurile tabelului
    } = req.body;

    // --- PASUL 2: Pregătirea pentru crearea fișierului PDF ---

    // Creăm un nume unic pentru fișier
    const fileName = `PV_${pontajId}_${Date.now()}.pdf`;
    // Definim calea unde vom salva fișierele
    const dirPath = path.join(__dirname, '..', '..', 'uploads', 'procese-verbale');
    const filePath = path.join(dirPath, fileName);
    
    // Ne asigurăm că folderul 'uploads/procese-verbale' există
    fs.mkdirSync(dirPath, { recursive: true });

    // --- PASUL 3: Generarea conținutului PDF folosind PDFKit ---

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    // Funcție ajutătoare pentru formatarea datei și orei
    const formatDateTime = (date) => new Date(date).toLocaleString('ro-RO');
    const formatDate = (date) => new Date(date).toLocaleDateString('ro-RO');
    const formatTime = (date) => new Date(date).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

    // --- PAGINA 1: Textul procesului verbal ---
    
    doc.font('Helvetica-Bold').fontSize(14).text('PROCES – VERBAL', { align: 'center' });
    doc.moveDown(2);

    doc.font('Helvetica').fontSize(12);
    doc.text(`Incheiat astazi ${formatDate(new Date())}`);
    doc.moveDown();

    doc.text('La obiectivul (denumirea si adresa) ', { continued: true });
    doc.font('Helvetica-Bold').text(`${pontaj.postId.nume_post}, ${pontaj.postId.adresa_post}`, { continued: true });
    doc.font('Helvetica').text(',');
    doc.moveDown();

    doc.text('de ', { continued: true });
    doc.font('Helvetica-Bold').text(`${pontaj.paznicId.nume} ${pontaj.paznicId.prenume}`, { continued: true });
    doc.font('Helvetica').text(', reprezentant al echipei de interventie, ca urmare a verificarii timpilor de interventie la obiectivele monitorizate.');
    doc.moveDown();

    doc.text('Alarma a fost declansata la ora ', { continued: true });
    doc.font('Helvetica-Bold').text(formatTime(ora_declansare_alarma));
    doc.moveDown();

    doc.text('Echipajul de interventie s-a prezentat la ora ', { continued: true });
    doc.font('Helvetica-Bold').text(formatTime(ora_prezentare_echipaj));
    doc.moveDown();

    doc.font('Helvetica').text(observatii_generale || "In timpul interventiei echipajul de interventie a actionat conform procedurilor in vigoare, neexistand observatii din partea beneficiarului privind calitatea prestatiei.");
    doc.moveDown();

    doc.text('Misiunea s-a incheiat la ora ', { continued: true });
    doc.font('Helvetica-Bold').text(formatTime(ora_incheiere_misiune));
    doc.moveDown();

    doc.font('Helvetica').text('Drept pentru care am incheiat prezentul proces-verbal in 2 (doua) exemplare.');
    doc.moveDown(5);

    // Secțiunea de semnături
    doc.text('ECHIPA DE INTERVENTIE', { continued: true });
    doc.text('BENEFICIAR', { align: 'right' });
    doc.text('____________________', { continued: true });
    doc.text('____________________', { align: 'right' });


    // --- PAGINA 2: Tabelul de evenimente ---

    doc.addPage();
    
    // Funcție pentru a desena tabelul
    function drawTable(doc, tableData) {
        let y = doc.y;
        const startX = doc.page.margins.left;
        const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const rowHeight = 40; // O înălțime mai generoasă pentru a permite textului să încapă

        const headers = ["Nr. crt.", "Data/Ora Rec.", "Tip Alarma", "Echipaj", "Ora Sosirii", "Cauze", "Solutionare", "Observatii"];
        const colWidths = [30, 80, 70, 60, 50, 70, 80, 80];

        // Desenăm antetul
        doc.font('Helvetica-Bold');
        let currentX = startX;
        headers.forEach((header, i) => {
            doc.text(header, currentX + 5, y + 5, { width: colWidths[i] - 10, align: 'center' });
            currentX += colWidths[i];
        });
        doc.rect(startX, y, tableWidth, rowHeight).stroke();
        
        y += rowHeight;
        
        // Desenăm rândurile de date
        doc.font('Helvetica');
        tableData.forEach((row, rowIndex) => {
            currentX = startX;
            const rowValues = [
                rowIndex + 1,
                formatDateTime(row.dataOraReceptionarii),
                row.tipulAlarmei,
                row.echipajAlarmat,
                formatTime(row.oraSosirii),
                row.cauzeleAlarmei,
                row.modulDeSolutionare,
                row.observatii || ''
            ];

            rowValues.forEach((cell, i) => {
                doc.text(cell.toString(), currentX + 5, y + 5, { width: colWidths[i] - 10, align: 'left' });
                currentX += colWidths[i];
            });
            doc.rect(startX, y, tableWidth, rowHeight).stroke();
            y += rowHeight;

            // Adăugăm o pagină nouă dacă tabelul ajunge la finalul paginii curente
            if (y > doc.page.height - doc.page.margins.bottom) {
                doc.addPage();
                y = doc.page.margins.top;
            }
        });
    }

    drawTable(doc, evenimente);

    // Finalizăm documentul PDF
    doc.end();


    // --- PASUL 4: Salvarea înregistrării în baza de date ---
    const caleStocareRelativa = `/uploads/procese-verbale/${fileName}`;

    const newProcesVerbal = await ProcesVerbal.create({
      pontajId,
      paznicId: paznicLogat._id,
      postId: pontaj.postId._id,
      reprezentant_beneficiar,
      ora_declansare_alarma,
      ora_prezentare_echipaj,
      ora_incheiere_misiune,
      observatii_generale,
      evenimente,
      caleStocarePDF: caleStocareRelativa
    });

    res.status(201).json({ message: 'Proces verbal creat și PDF generat cu succes!', data: newProcesVerbal });

  } catch (error) {
    console.error("Eroare la crearea procesului verbal:", error);
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

module.exports = {
  createProcesVerbal,
};