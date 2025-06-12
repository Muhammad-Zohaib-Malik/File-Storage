import nodemailer from "nodemailer";
import Otp from "../models/otp.model.js";

// 🔐 Utility to generate a 4-digit OTP
function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function sendOtp(email) {
  const otp = generateOtp();

  // Save or update OTP in DB
  await Otp.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true, new: true },
  );

  // Beautiful HTML Email content
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f7fc; padding: 20px; border-radius: 8px; width: 100%; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333; font-size: 24px; text-align: center;">Your OTP Code</h2>
        <p style="font-size: 16px; color: #555; text-align: center; margin-bottom: 20px;">Thank you for using Storage App. Please use the OTP below to verify your account:</p>
        <div style="background-color: #4CAF50; color: white; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 5px; margin-bottom: 20px;">
          ${otp}
        </div>
        <p style="font-size: 16px; color: #555; text-align: center;">This OTP is valid for the next 10 minutes. If you didn't request this, please ignore this email.</p>
        <div style="margin-top: 30px; text-align: center;">
          <p style="font-size: 14px; color: #aaa;">Best regards,</p>
          <p style="font-size: 14px; color: #aaa;">The Storage App Team</p>
        </div>
      </div>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Send the email
  const info = await transporter.sendMail({
    from: `"Storage App" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your OTP for Storage App",
    html,
  });

  return {
    success: true,
    message: "OTP sent successfully",
    messageId: info.messageId,
  };
}
