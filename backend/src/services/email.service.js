const nodemailer = require('nodemailer');

// Configurarea transporter-ului folosind variabilele de mediu
const transporter = nodemailer.createTransport({
  service: 'gmail', // sau alt serviciu, ex: 'sendgrid'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Trimite un email.
 * @param {object} options - Opțiunile pentru email.
 * @param {string} options.to - Adresa destinatarului.
 * @param {string} options.subject - Subiectul email-ului.
 * @param {string} [options.text] - Conținutul text al email-ului (opțional, pentru clienți fără HTML).
 * @param {string} options.html - Conținutul HTML al email-ului.
 * @param {string} [options.senderName] - Numele personalizat al expeditorului (ex: numele agenției).
 */
const sendEmail = async ({ to, subject, text, html, senderName }) => {
  try {
    // Construim dinamic câmpul "from".
    // Dacă senderName este furnizat, îl folosim. Altfel, folosim un nume generic.
    const fromName = senderName ? `"${senderName}"` : '"Aplicație Suport Pază"';
    const fromEmail = `<${process.env.EMAIL_USER}>`;

    const mailOptions = {
      from: `${fromName} ${fromEmail}`,
      to,
      subject,
      text, // opțional
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email trimis cu succes:', info.response);
    return info; // Returnăm info pentru a putea verifica dacă a funcționat
  } catch (error) {
    console.error('Eroare la trimiterea email-ului:', error);
    // Aruncăm eroarea mai departe pentru a putea fi prinsă în controller-ul care a apelat funcția
    throw new Error('Eroare la trimiterea email-ului.');
  }
};

module.exports = { sendEmail };