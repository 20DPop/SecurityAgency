// Cale: backend/src/services/email.service.js (Versiune Modificată)

const nodemailer = require('nodemailer');

// --- BLOC MODIFICAT ---
// În loc de `service: 'gmail'`, configurăm manual host-ul și portul
// pentru a avea mai mult control și a evita potențialele blocaje.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Serverul SMTP specific pentru Gmail
  port: 587,              // Portul standard pentru conexiuni securizate (STARTTLS)
  secure: false,          // Trebuie să fie `false` pentru portul 587
  requireTLS: true,       // Forțăm o conexiune criptată
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Aici trebuie să fie PAROLA PENTRU APLICAȚII de 16 caractere
  },
});
// --- SFÂRȘIT BLOC MODIFICAT ---

/**
 * Trimite un email.
 * (Restul funcției rămâne neschimbat)
 */
const sendEmail = async ({ to, subject, text, html, senderName }) => {
  try {
    const fromName = senderName ? `"${senderName}"` : '"Aplicație Suport Pază"';
    const fromEmail = `<${process.env.EMAIL_USER}>`;

    const mailOptions = {
      from: `${fromName} ${fromEmail}`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email trimis cu succes:', info.response);
    return info;
  } catch (error) {
    console.error('Eroare la trimiterea email-ului:', error);
    throw new Error('Eroare la trimiterea email-ului.');
  }
};

module.exports = { sendEmail };