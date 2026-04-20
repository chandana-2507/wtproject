const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html, text }) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.warn('[email] SMTP not configured; skipping send to', to);
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text: text || undefined,
    html: html || undefined,
  });

  return { sent: true };
}

module.exports = sendEmail;
