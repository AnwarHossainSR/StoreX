import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";

const transporter = nodemailer.createTransport({
  host: `email-smtp.${process.env.AWS_REGION}.amazonaws.com`,
  port: 587,
  secure: false,
  auth: {
    user: process.env.AWS_SES_SMTP_USER || "",
    pass: process.env.AWS_SES_SMTP_PASS || "",
  },
  logger: false,
  debug: false,
});

const renderOrderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    "apps",
    "order-service",
    "src",
    "utils",
    "email-templates",
    `${templateName}.ejs`
  );
  return ejs.renderFile(templatePath, data);
};

export const sendOrderEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>
) => {
  // Validate environment variables
  if (
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY ||
    !process.env.AWS_REGION ||
    !process.env.SES_FROM_EMAIL
  ) {
    console.error("Missing required environment variables:", {
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
        ? "****"
        : undefined,
      AWS_REGION: process.env.AWS_REGION,
      SES_FROM_EMAIL: process.env.SES_FROM_EMAIL,
    });
    return false;
  }

  try {
    const html = await renderOrderEmailTemplate(templateName, data);
    const mailOptions = {
      from: `StoreX <${process.env.SES_FROM_EMAIL}>`, // Must be a verified email
      to, // Must be a verified email in sandbox mode
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Order email sent successfully to ${to}`);
    return true;
  } catch (error: any) {
    console.error("Error sending order email:", {
      message: error.message,
      code: error.code,
      response: error.response,
      command: error.command,
      stack: error.stack,
    });
    return false;
  }
};

// // using gmail
// import ejs from "ejs";
// import nodemailer from "nodemailer";
// import path from "path";

// const transporter = nodemailer.createTransport({
//   service: process.env.SMTP_SERVICE,
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT) || 587,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASSWORD,
//   },
// });

// const renderOrderEmailTemplate = async (
//   templateName: string,
//   data: Record<string, any>
// ): Promise<string> => {
//   const templatePath = path.join(
//     process.cwd(),
//     "apps",
//     "order-service",
//     "src",
//     "utils",
//     "email-templates",
//     `${templateName}.ejs`
//   );
//   return ejs.renderFile(templatePath, data);
// };

// export const sendOrderEmail = async (
//   to: string,
//   subject: string,
//   templateName: string,
//   data: Record<string, any>
// ) => {
//   try {
//     const html = await renderOrderEmailTemplate(templateName, data);
//     const mailOptions = {
//       from: `StoreX <${process.env.SMTP_USER}>`,
//       to,
//       subject,
//       html,
//     };
//     await transporter.sendMail(mailOptions);
//     console.log(`Order email sent successfully to ${to}`);
//     return true;
//   } catch (error) {
//     console.error("Error sending order email:", error);
//     return false;
//   }
// };
