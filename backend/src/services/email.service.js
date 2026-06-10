// Cale: backend/src/services/email.service.js

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Trimite un email folosind Resend.
 */
const sendEmail = async ({ to, subject, html, senderName }) => {
  try {
    // Verificăm dacă variabilele esențiale sunt setate
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      console.error(
        'EROARE CRITICĂ: RESEND_API_KEY sau EMAIL_FROM nu sunt setate!'
      );
      return;
    }

    const { data, error } = await resend.emails.send({
      from: `${senderName || 'Aplicație Suport Pază'} <${process.env.EMAIL_FROM}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('Eroare Resend:', error);
      throw new Error(error.message);
    }

    console.log(`Email trimis cu succes prin Resend! ID: ${data?.id}`);
    return data;

  } catch (error) {
    console.error(
      'Eroare la trimiterea email-ului prin Resend:',
      error.message
    );

    throw new Error(
      `Eroare la trimiterea email-ului prin Resend: ${error.message}`
    );
  }
};

module.exports = { sendEmail };