import nodemailer from 'nodemailer';

export const sendEmail = async (to, title, template) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Tinder4Devs" <${process.env.APP_EMAIL}>`,
    to: to,
    subject: title,
    html: template,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Email failed:', error);
  }
};
