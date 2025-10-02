<<<<<<< HEAD
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
   
=======
// Cale: backend/src/services/email.service.js (VERSIUNE FINALĂ CU SENDGRID)

const sgMail = require('@sendgrid/mail');

// Setează cheia API din variabilele de mediu
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Trimite un email folosind API-ul SendGrid.
 */
const sendEmail = async ({ to, subject, html, senderName }) => {
  try {
    // Verificăm dacă variabilele esențiale sunt setate
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_VERIFIED_SENDER) {
      console.error('EROARE CRITICĂ: Cheia API SendGrid sau expeditorul verificat nu sunt setate!');
      return;
    }

    const msg = {
      to: to,
      from: {
        email: process.env.SENDGRID_VERIFIED_SENDER, // FOLOSEȘTE EMAIL-UL VERIFICAT!
        name: senderName || 'Aplicație Suport Pază'
      },
      subject: subject,
      html: html,
    };

    // Trimite email-ul
    await sgMail.send(msg);
    console.log('Email trimis cu succes prin SendGrid!');
    
  } catch (error) {
    // SendGrid oferă erori foarte detaliate
    console.error('Eroare la trimiterea email-ului prin SendGrid:', error.response ? error.response.body : error.message);
    throw new Error('Eroare la trimiterea email-ului prin SendGrid.');
>>>>>>> 6959aa57107531329a0a0fa7e287a11b524f89d5
  }
};

module.exports = { sendEmail };