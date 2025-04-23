import { ValidationError } from "@packages/error-handler";
import redis from "@packages/libs/redis";
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

export const verifyOtpHelper = async (email: string, otp: string) => {
  const otpFromRedis = await redis.get(`otp:${email}`);

  if (!otpFromRedis) {
    throw new ValidationError("Invalid OTP, please try again");
  }

  const failedAttemptsKey = `otp_attempts:${email}`; // Key to track failed attempts
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

  // Ensure both OTPs are strings and trimmed of any whitespace
  if (otpFromRedis?.toString().trim() !== otp.toString().trim()) {
    if (failedAttempts >= 3) {
      await redis.set(`otp_lock:${email}`, "true", "EX", 1800); // 30 minutes lock
      await redis.del(`otp:${email}`, failedAttemptsKey);
      throw new ValidationError(
        "Account locked due to multiple failed attempts, please try again after 30 minutes"
      );
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300); // 5 minutes lock
    throw new ValidationError(
      `Incorrect OTP, you have ${3 - failedAttempts} attempts left`
    );
  }

  // OTP is correct, so delete the OTP and failed attempts from Redis
  await redis.del(`otp:${email}`, failedAttemptsKey);
};
