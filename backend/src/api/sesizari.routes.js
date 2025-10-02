const Sesizare = require('../models/sesizare.model');
const User = require('../models/user.model'); 
const { sendEmail } = require('../services/email.service');

/**
 * ===================================================================================
 * FUNCȚIE AJUTĂTOARE PENTRU A GENERA ȘABLOANELE DE EMAIL
 * Această funcție centralizează conținutul tuturor email-urilor de notificare.
 * ===================================================================================
 */
const getEmailTemplateForStatusChange = (titluSesizare, newStatus) => {
  let subject = '';
  let bodyText = '';

  switch(newStatus) {
    case 'preluată':
      subject = `Am înregistrat solicitarea dvs.: "${titluSesizare}"`;
      bodyText = `Vă confirmăm că am primit și înregistrat solicitarea dumneavoastră. Un operator o va analiza în cel mai scurt timp.`;
      break;
    case 'inCurs':
      subject = `Solicitarea "${titluSesizare}" a fost preluată de un operator`;
      bodyText = `Unul dintre operatorii noștri a preluat solicitarea și lucrează la rezolvarea ei. Veți fi notificat din nou când statusul se va schimba.`;
      break;
    case 'rezolvata':
      subject = `Solicitarea "${titluSesizare}" a fost rezolvată`;
      bodyText = `Problema pe care ați raportat-o a fost soluționată cu succes. Vă mulțumim pentru sesizare!`;
      break;
    default:
      return null; 
  }

  return {
    subject: `[Notificare Aplicație Pază] ${subject}`,
    // Template-ul acceptă acum și numele agenției pentru personalizare
    html: (numeBeneficiar, numeAgentie) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
        <h2 style="color: #333;">Actualizare Status Solicitare</h2>
        <p>Salut, <strong>${numeBeneficiar || 'client'}</strong>,</p>
        <p>Dorim să vă informăm că statusul solicitării dumneavoastră, "<strong>${titluSesizare}</strong>", a fost actualizat.</p>
        <p style="background-color: #f2f2f2; padding: 15px; border-radius: 5px;">
          <strong>Noul Status:</strong> <span style="font-weight: bold; color: #007bff;">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</span>
          <br><br>
          <strong>Detalii:</strong> ${bodyText}
        </p>
        <p>Vă mulțumim,</p>
        <p><em>Echipa ${numeAgentie || 'de Suport'}</em></p>
      </div>
    `
  };
};

/**
 * ===================================================================================
 * 1. CREARE SESIZARE (CU NOTIFICARE PERSONALIZATĂ)
 * ===================================================================================
 */
exports.createSesizare = async (req, res) => {
  try {
    const { titlu, descriere } = req.body;
    if (!titlu || !descriere) {
      return res.status(400).json({ message: "Titlu și descriere sunt obligatorii." });
    }

    const beneficiaryId = req.user._id;

    // Găsim un admin sau administrator pentru a-i asocia sesizarea
    const admin = await User.findOne({ role: { $in: ["admin", "administrator"] } });
    if (!admin) {
      return res.status(500).json({ message: "Nu există niciun admin în sistem pentru a prelua sesizarea." });
    }

    const newSesizare = await Sesizare.create({
      titlu,
      descriere,
      createdByBeneficiaryId: beneficiaryId,
      assignedAdminId: admin._id,
    });

    // --- LOGICĂ NOTIFICARE PERSONALIZATĂ ---
    const beneficiar = await User.findById(beneficiaryId);
    
    if (beneficiar && beneficiar.email) {
      const emailContent = getEmailTemplateForStatusChange(newSesizare.titlu, 'preluată');
      
      // Extragem numele agenției din profilul adminului găsit
      const numeAgentie = admin.profile?.nume_firma || "Agenția de Securitate";

      if (emailContent) {
        // Trimitem emailul în fundal pentru a nu întârzia răspunsul
        sendEmail({
          to: beneficiar.email,
          subject: emailContent.subject,
          html: emailContent.html(beneficiar.nume, numeAgentie), // Adăugăm numele agenției în corpul email-ului
          senderName: numeAgentie, // Trimitem numele agenției ca expeditor
        }).catch(err => {
          console.error(`EROARE NOTIFICARE CREARE: Nu s-a putut trimite email-ul pentru sesizarea ${newSesizare._id}:`, err);
        });
      }
    }
    // --- FINAL LOGICĂ NOTIFICARE ---

    res.status(201).json({ message: "Sesizare înregistrată cu succes!", data: newSesizare });
  } catch (error) {
    console.error("Eroare la crearea sesizării:", error);
    res.status(500).json({ message: "Eroare server la crearea sesizării." });
  }
};

/**
 * ===================================================================================
 * 2. ACTUALIZARE STATUS (CU NOTIFICARE PERSONALIZATĂ)
 * ===================================================================================
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const update = { status };
    if (status === 'rezolvata') {
      const now = new Date();
      update.dataFinalizare = now;
      // Setează expirarea la 24 de ore de la rezolvare
      update.expireAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); 
    } else {
      // Dacă statusul este schimbat din 'rezolvata' înapoi, anulăm expirarea
      update.expireAt = null;
    }

    const sesizare = await Sesizare.findByIdAndUpdate(id, update, { new: true })
      .populate('createdByBeneficiaryId', 'email nume')
      .populate('assignedAdminId', 'profile'); // Adăugăm populate pentru profilul adminului

    if (!sesizare) {
      return res.status(404).json({ message: "Sesizarea nu a fost găsită." });
    }

    // --- LOGICĂ NOTIFICARE PERSONALIZATĂ ---
    if (sesizare.createdByBeneficiaryId && sesizare.createdByBeneficiaryId.email) {
      const beneficiar = sesizare.createdByBeneficiaryId;
      const admin = sesizare.assignedAdminId;
      const emailContent = getEmailTemplateForStatusChange(sesizare.titlu, status);

      // Extragem numele agenției din profilul adminului
      const numeAgentie = admin?.profile?.nume_firma || "Agenția de Securitate";

      if (emailContent) {
        sendEmail({
          to: beneficiar.email,
          subject: emailContent.subject,
          html: emailContent.html(beneficiar.nume, numeAgentie),
          senderName: numeAgentie,
        }).catch(err => {
          console.error(`EROARE NOTIFICARE UPDATE: Nu s-a putut trimite email-ul pentru sesizarea ${sesizare._id}:`, err);
        });
      }
    }
    // --- FINAL LOGICĂ NOTIFICARE ---

    res.json({ message: "Status actualizat cu succes!", data: sesizare });
  } catch (error) {
    console.error("Eroare la actualizarea statusului:", error);
    res.status(500).json({ message: "Eroare la actualizarea statusului." });
  }
};

/**
 * ===================================================================================
 * RESTUL FUNCȚIILOR (NU NECESITĂ MODIFICĂRI)
 * ===================================================================================
 */

// Listare sesizări pentru un beneficiar
exports.getSesizariByBeneficiar = async (req, res) => {
  try {
    const beneficiaryId = req.user._id;
    const sesizari = await Sesizare.find({ createdByBeneficiaryId: beneficiaryId })
      .populate('assignedAdminId', 'email nume prenume');
    res.json(sesizari);
  } catch (error) {
    res.status(500).json({ message: "Eroare la obținerea sesizărilor." });
  }
};

// Listare toate sesizările pentru admin
exports.getAllSesizari = async (req, res) => {
  try {
    const sesizari = await Sesizare.find()
      .populate({
        path: 'createdByBeneficiaryId',
        select: 'profile email nume'
      })
      .populate('assignedAdminId', 'email nume prenume')
      .sort({ createdAt: -1 })
      .lean();
    res.json(sesizari);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la obținerea tuturor sesizărilor." });
  }
};

// Ștergere sesizare
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

// Actualizare pași de rezolvare
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
  } catch (error)
    {
    console.error(error);
    res.status(500).json({ message: "Eroare la actualizarea pașilor." });
  }
};