const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Personel360" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📨 E-posta gönderildi:", to);
  } catch (error) {
    console.error("❌ E-posta gönderme hatası:", error);
    throw error;
  }
};

module.exports = sendEmail;
