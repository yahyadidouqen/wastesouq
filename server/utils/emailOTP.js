const nodemailer = require("nodemailer");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(to, otp, name) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "localhost",
    port: parseInt(process.env.EMAIL_PORT) || 1025,
    ignoreTLS: true,
  });

  const mailOptions = {
    from: '"WasteSouq" <noreply@wastesouq.ma>',
    to,
    subject: "🔐 Votre code de vérification WasteSouq",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1B4332; font-size: 28px; margin: 0;">♻️ WasteSouq</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">La marketplace marocaine du recyclage</p>
        </div>
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Bonjour <strong>${name}</strong>,</p>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">Votre code de vérification est :</p>
          <div style="text-align: center; background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <span style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #1B4332;">${otp}</span>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            ⏱️ Ce code expire dans <strong>10 minutes</strong><br/>
            Ne partagez ce code avec personne.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email envoyé à ${to}`);
  } catch (err) {
    console.log("\n========================================");
    console.log(`📧 OTP pour ${to}`);
    console.log(`🔐 Code : ${otp}`);
    console.log("========================================\n");
  }
}

module.exports = { generateOTP, sendOTPEmail };