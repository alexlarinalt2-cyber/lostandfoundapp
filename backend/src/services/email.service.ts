import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail(
    to,
    'Reset your password',
    `<p>Click the link below to reset your password. It expires in 1 hour.</p>
     <p><a href="${resetUrl}">${resetUrl}</a></p>`,
  );
}

export async function sendClaimNotificationEmail(to: string, itemTitle: string, claimantName: string) {
  await sendEmail(
    to,
    `New claim on your item: ${itemTitle}`,
    `<p><strong>${claimantName}</strong> has submitted a claim on your item <strong>${itemTitle}</strong>.</p>
     <p>Log in to review and respond to the claim.</p>`,
  );
}
