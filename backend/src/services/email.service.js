import nodemailer from 'nodemailer';

// Crează transporter folosind SendGrid SMTP (foarte stabil)
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey', // asta trebuie să fie literal 'apikey'
    pass: process.env.SENDGRID_API_KEY
  }
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: 'noreply@mg.your-sendgrid-domain.com', // adresa implicită SendGrid
      to,
      subject,
      text,
      html
    });
    console.log('Email trimis cu succes!');
  } catch (err) {
    console.error('Eroare la trimiterea email-ului:', err);
  }
};
