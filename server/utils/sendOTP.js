import { Resend } from "resend";
import OTP from "../models/otp.model.js";

const resend = new Resend("re_ZWdiFg4X_ETJGqRKxJPukdHoH12aWbeij");

export async function sendOtp(email) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  await OTP.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true, new: true }
  );

  const html = `
    <div style="font-family:sans-serif;">
      <h2>Your OTP is: ${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    </div>
  `;

  await resend.emails.send({
    from: "Storage App <muhammadzohaibmalik10@gmail.com>",
    to: email,
    subject: "Storage App OTP",
    html,
  });

  return { success: true, message: "OTP sent successfully" };
}
