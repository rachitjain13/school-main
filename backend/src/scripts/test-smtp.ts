
import nodemailer from "nodemailer";
import { env } from "../config/env";

const testSMTP = async () => {
  try {
    console.log("Checking Gmail SMTP configuration...");

    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD || !env.EMAIL_FROM) {
      throw new Error("SMTP configuration is incomplete. Check your .env file.");
    }

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });

    await transporter.verify();
    console.log("SMTP connection verified successfully!");

    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: "jainrachit558@gmail.com",
      subject: "School Portal - SMTP Test",
      text: "Congratulations! Your School Portal Gmail SMTP integration is working successfully.",
      html: `
        <h2>School Portal SMTP Test</h2>
        <p>Congratulations!</p>
        <p>Your Gmail SMTP integration is working successfully.</p>
        <p>You can now proceed with Main Admin invitation email testing.</p>
      `,
    });

    console.log("Test email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Accepted recipients:", info.accepted);
  } catch (error) {
    console.error(
      "SMTP test failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    process.exitCode = 1;
  }
};

void testSMTP();
