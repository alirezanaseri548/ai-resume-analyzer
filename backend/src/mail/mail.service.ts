import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      this.logger.warn("SMTP config missing. Email sending skipped.");
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    });
  }

  async sendVerificationEmail(email: string, fullName: string | null, token: string) {
    const transporter = this.getTransporter();
    const appUrl = process.env.APP_URL || "http://localhost:5173";
    const verifyLink = `${appUrl}/verify-email?token=${token}`;

    if (!transporter) {
      this.logger.log(`Verification link for ${email}: ${verifyLink}`);
      return { sent: false, verifyLink };
    }

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Hello ${fullName || "User"}</h2>
        <p>Please verify your email by clicking the link below:</p>
        <p><a href="${verifyLink}">${verifyLink}</a></p>
        <p>This link will expire soon.</p>
      `,
    });

    return { sent: true };
  }
}
