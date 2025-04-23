import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>
): Promise<string> => {
  const tempaltePath = path.join(
    process.cwd(),
    "apps",
    "auth-service",
    "src",
    "utils",
    "email-templates",
    `${templateName}.ejs`
  );

  return ejs.renderFile(tempaltePath, data);
};

export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>
) => {
  try {
    const html = await renderEmailTemplate(templateName, data);
    const mailOptions = {
      from: `< ${process.env.SMTP_USER} >`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
