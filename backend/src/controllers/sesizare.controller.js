// Cale: backend/src/controllers/sesizare.controller.js
const Sesizare = require('../models/sesizare.model');
const User = require('../models/user.model'); // Asigură-te că User model este importat
const { sendEmail } = require('../services/email.service'); // Importăm serviciul de email

// --- Funcția de creare sesizare (rămâne neschimbată) ---
exports.createSesizare = async (req, res) => {
  try {
    const { titlu, descriere } = req.body;
    if (!titlu || !descriere) {
      return res.status(400).json({ message: "Titlu și descriere sunt obligatorii." });
    }

    const beneficiaryId = req.user?._id || req.body.createdByBeneficiaryId;

    const admin = await User.findOne({ role: { $in: ["admin", "administrator"] } });
    if (!admin) {
      return res.status(500).json({ message: "Nu există niciun admin în sistem." });
    }

    const newSesizare = await Sesizare.create({
      titlu,
      descriere,
      createdByBeneficiaryId: beneficiaryId,
      assignedAdminId: admin._id,
    });

    res.status(201).json({ message: "Sesizare înregistrată cu succes!", data: newSesizare });
  } catch (error) {
    res.status(500).json({ message: "Eroare server la crearea sesizării." });
  }
};

// --- Listare sesizări pentru un beneficiar (rămâne neschimbată) ---
exports.getSesizariByBeneficiar = async (req, res) => {
  try {
    const beneficiaryId = req.user?._id || req.params.beneficiaryId;
    const sesizari = await Sesizare.find({ createdByBeneficiaryId: beneficiaryId })
      .populate('assignedAdminId', 'email nume prenume');
    res.json(sesizari);
  } catch (error) {
    res.status(500).json({ message: "Eroare la obținerea sesizărilor." });
  }
};

// --- Listare toate sesizările (rămâne neschimbată) ---
exports.getAllSesizari = async (req, res) => {
  try {
    const sesizari = await Sesizare.find()
      .populate({
        path: 'createdByBeneficiaryId',
        select: 'profile email nume'
      })
      .populate('assignedAdminId', 'email nume prenume')
      .lean();
    res.json(sesizari);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la obținerea tuturor sesizărilor." });
  }
};

exports.deleteSesizare = async (req, res) => {
  try {
    const { id } = req.params;
    const sesizare = await Sesizare.findByIdAndDelete(id);
    if (!sesizare) return res.status(404).json({ message: "Sesizare negăsită." });
    res.json({ message: "Sesizare ștearsă cu succes!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la ștergerea sesizării." });
  }
};

// --- Funcția de actualizare status (MODIFICATĂ PENTRU NOTIFICĂRI ȘI DATA FINALIZARE) ---
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Dacă status devine 'rezolvata', setăm dataFinalizare și expireAt
    const update = { status };
    if (status === 'rezolvata') {
      const now = new Date();
      update.dataFinalizare = now;
      update.expireAt = new Date(now.getTime() + 24*60*60*1000); // 24h mai târziu
    }

    const sesizare = await Sesizare.findByIdAndUpdate(
      id,
      update,
      { new: true }
    ).populate('createdByBeneficiaryId', 'email nume');

    if (!sesizare) {
      return res.status(404).json({ message: "Sesizarea nu a fost găsită." });
    }

    // --- START LOGICĂ NOTIFICARE EMAIL ---
    if (sesizare.createdByBeneficiaryId && sesizare.createdByBeneficiaryId.email) {
      const beneficiar = sesizare.createdByBeneficiaryId;
      const emailContent = getEmailTemplateForStatusChange(sesizare.titlu, status);

      if (emailContent) {
        sendEmail({
          to: beneficiar.email,
          subject: emailContent.subject,
          html: emailContent.html(beneficiar.nume),
        }).catch(err => {
          console.error(`EROARE NOTIFICARE: Nu s-a putut trimite email-ul pentru sesizarea ${sesizare._id}:`, err);
        });
      }
    }
    // --- FINAL LOGICĂ NOTIFICARE EMAIL ---

    res.json({ message: "Status actualizat cu succes!", data: sesizare });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la actualizarea statusului." });
  }
};

// --- Funcția de actualizare pași (rămâne neschimbată) ---
exports.updatePasi = async (req, res) => {
  try {
    const { id } = req.params;
    const { pasiRezolvare } = req.body;
    const sesizare = await Sesizare.findByIdAndUpdate(
      id,
      { pasiRezolvare },
      { new: true }
    );
    if (!sesizare) return res.status(404).json({ message: "Sesizare negăsită." });
    res.json({ message: "Pași de rezolvare actualizați!", data: sesizare });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la actualizarea pașilor." });
  }
};

// --- FUNCȚIE AJUTĂTOARE PENTRU A GENERA ȘABLOANELE DE EMAIL ---
const getEmailTemplateForStatusChange = (titluSesizare, newStatus) => {
  let subject = '';
  let bodyText = '';

  switch(newStatus) {
    case 'preluată':
      subject = `Am înregistrat sesizarea "${titluSesizare}"`;
      bodyText = `Vă confirmăm că am primit și înregistrat solicitarea dumneavoastră. Un operator o va analiza în cel mai scurt timp.`;
      break;
    case 'inCurs':
      subject = `Sesizarea "${titluSesizare}" a fost preluată`;
      bodyText = `Unul dintre operatorii noștri a preluat solicitarea și lucrează la rezolvarea ei. Veți fi notificat din nou când statusul se va schimba.`;
      break;
    case 'rezolvata':
      subject = `Sesizarea "${titluSesizare}" a fost rezolvată`;
      bodyText = `Problema pe care ați raportat-o a fost soluționată cu succes. Vă mulțumim pentru sesizare!`;
      break;
    default:
      return null; 
  }

  return {
    subject: `[Notificare Aplicație Pază] ${subject}`,
    html: (numeBeneficiar) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
        <h2 style="color: #333;">Actualizare Status Sesizare</h2>
        <p>Salut, <strong>${numeBeneficiar || 'client'}</strong>,</p>
        <p>Dorim să vă informăm că statusul sesizării dumneavoastră, "<strong>${titluSesizare}</strong>", a fost actualizat.</p>
        <p style="background-color: #f2f2f2; padding: 15px; border-radius: 5px;">
          <strong>Noul Status:</strong> <span style="font-weight: bold; color: #007bff;">${newStatus.replace(/^\w/, c => c.toUpperCase())}</span>
          <br><br>
          <strong>Detalii:</strong> ${bodyText}
        </p>
        <p>Vă mulțumim,</p>
        <p><em>Echipa de Suport</em></p>
      </div>
    `
  };
};
