const nodemailer = require("nodemailer");

let transporter;

/**
 * Initialize email transporter
 */
const initTransporter = async () => {
  try {
    // Use Gmail/Custom SMTP if credentials exist
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.verify();

      console.log("✅ SMTP Server Connected Successfully");
      return;
    }

    // Fallback for development
    console.log("⚠ No SMTP credentials found.");
    console.log("⚠ Using Ethereal Test Email...");

    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log("✅ Ethereal Test Account Created");
    console.log(`Email : ${testAccount.user}`);
    console.log(`Pass  : ${testAccount.pass}`);
  } catch (error) {
    console.error("❌ Failed to initialize mail transporter");
    console.error(error);
    throw error;
  }
};

/**
 * Send Email
 */
const sendEmail = async ({
  to,
  subject,
  text = "",
  html = "",
}) => {
  try {
    if (!transporter) {
      await initTransporter();
    }

    const mailOptions = {
      from:
        process.env.FROM_EMAIL ||
        '"Cake E-Commerce" <noreply@cakeecommerce.com>',
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("\n========================================");
    console.log("📨 Email Sent Successfully");
    console.log("Message ID :", info.messageId);

    const preview = nodemailer.getTestMessageUrl(info);

    if (preview) {
      console.log("Preview URL :", preview);
    }

    console.log("========================================\n");

    return info;
  } catch (error) {
    console.error("\n========================================");
    console.error("❌ Email Sending Failed");
    console.error(error.message);
    console.error("========================================\n");

    throw new Error("Unable to send email.");
  }
};

module.exports = sendEmail;