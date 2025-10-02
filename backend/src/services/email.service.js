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
  }
};

module.exports = { sendEmail };