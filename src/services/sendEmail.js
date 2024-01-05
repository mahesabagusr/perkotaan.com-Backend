import nodemailer from 'nodemailer';
import crypto from 'crypto';

export const generateOtp = () => {
  const otp = crypto.randomInt(11111, 99999).toString();
  const expirationTime = Date.now() + 3600000;
  return { otp, expirationTime };
}

export const sendMail = async (email, otp, next) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_MAIL,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_MAIL,
      to: email,
      subject: 'Email OTP Verification',
      text: `Your OTP Verification: ${otp}`
    }

    const result = await transporter.sendMail(mailOptions)
    return result;

  } catch (err) {
    throw new Error(err.message)
  }
}

