import nodemailer from "nodemailer";

export const sendEmail = async (
  email: string,
  subject: string,
  message: string
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail email address
      pass: process.env.GMAIL_PASS, // Your Gmail app password (use an app-specific password if using 2FA)
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};
