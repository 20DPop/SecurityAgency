const nodemailer = require('nodemailer');
const dns = require('dns');

// FORȚĂM REZOLVAREA DNS PRIN IPv4
// Aceasta este o măsură de siguranță pentru a evita probleme de rețea cu IPv6.
dns.setDefaultResultOrder('ipv4first');

// --- BLOC MODIFICAT PENTRU DEBUGGING AVANSAT ---
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS se folosește după ce se stabilește conexiunea (STARTTLS)
  
  // MĂRIM TIMEOUT-URILE PENTRU A FI SIGURI CĂ NU E O PROBLEMĂ DE REȚEA LENTĂ
  connectionTimeout: 20000, // 20 de secunde (implicit e 2 min, dar e bine să fim expliciți)
  greetingTimeout: 20000,   // Timp de așteptare pentru "salutul" de la server
  socketTimeout: 20000,     // Timp de așteptare pentru inactivitate pe socket

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Asigură-te că aceasta este PAROLA PENTRU APLICAȚII, fără spații
  },

  // ACTIVĂM LOGGING-UL DETALIAT
  // Acesta este cel mai important pas pentru debugging!
  debug: true, // Afișează în consolă comunicarea dintre Nodemailer și server
  logger: true // Afișează log-urile în consolă
});
// --- SFÂRȘIT BLOC MODIFICAT ---


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
    
    console.log("--- Începe trimiterea email-ului cu configurația de debug ---");
    const info = await transporter.sendMail(mailOptions);
    console.log('Email trimis cu succes:', info.response);
    return info;

  } catch (error) {
    // Aici log-ul este deja foarte detaliat datorită opțiunii 'debug: true'
    console.error('Eroare la trimiterea email-ului (vezi log-urile de debug de mai sus):', error);
    throw new Error('Eroare la trimiterea email-ului.');
  }
};

module.exports = { sendEmail };
