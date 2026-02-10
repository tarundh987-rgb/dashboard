import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "fddebb4a0d5814",
    pass: "344e2050bb529c",
  },
});

interface nodeMailer {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async ({ to, subject, text, html }: nodeMailer) => {
  try {
    const info = await transporter.sendMail({
      from: '"Your App" <no-reply@yourapp.com>',
      to,
      subject,
      text,
      html,
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
