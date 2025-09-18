const nodemailer = require('nodemailer');

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
 * @param {string} options.text - Conținutul text al email-ului (pentru clienți fără HTML).
 * @param {string} options.html - Conținutul HTML al email-ului.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: `"Numele Agentiei Tale" <${process.env.EMAIL_USER}>`, // Numele expeditorului
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email trimis cu succes:', info.response);
  } catch (error) {
    console.error('Eroare la trimiterea email-ului:', error);
   
  }
};

module.exports = { sendEmail };