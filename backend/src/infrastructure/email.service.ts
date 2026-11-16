
import nodemailer from "nodemailer";
import { env } from "../config/env";

interface MainAdminInvitationEmail {
    email: string;
    fullName: string;
    schoolName: string;
    invitationUrl: string;
    expiresAt: Date;
}

const escapeHtml = (value: string): string =>
    value.replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };

        return entities[character];
    });

const createTransporter = () => {
    if (!env.SMTP_HOST || !env.EMAIL_FROM) {
        throw new Error(
            "Email is not configured. Set SMTP_HOST and EMAIL_FROM in .env."
        );
    }

    if (Boolean(env.SMTP_USER) !== Boolean(env.SMTP_PASSWORD)) {
        throw new Error(
            "SMTP_USER and SMTP_PASSWORD must both be configured."
        );
    }

    return nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        ...(env.SMTP_USER && env.SMTP_PASSWORD
            ? {
                  auth: {
                      user: env.SMTP_USER,
                      pass: env.SMTP_PASSWORD,
                  },
              }
            : {}),
    });
};

export const sendMainAdminInvitationEmail = async (
    invitation: MainAdminInvitationEmail
): Promise<void> => {
    const transporter = createTransporter();

    const fullName = escapeHtml(invitation.fullName);
    const schoolName = escapeHtml(invitation.schoolName);
    const safeUrl = escapeHtml(invitation.invitationUrl);

    const expiryText = invitation.expiresAt.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
    });

    await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: invitation.email,
        subject: `Invitation to manage ${invitation.schoolName}`,
        text: [
            `Hello ${invitation.fullName},`,
            "",
            `You have been invited to become the School Main Admin of ${invitation.schoolName}.`,
            "",
            `Accept your invitation and create your password using this link:`,
            invitation.invitationUrl,
            "",
            `This invitation expires on ${expiryText} (IST).`,
            "",
            "If you were not expecting this invitation, you can ignore this email.",
        ].join("\n"),
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #222;">
                <h2>School Main Admin Invitation</h2>
                <p>Hello ${fullName},</p>
                <p>
                    You have been invited to become the School Main Admin
                    of <strong>${schoolName}</strong>.
                </p>
                <p>Please accept the invitation and create your password:</p>
                <p style="margin: 28px 0;">
                    <a href="${safeUrl}"
                       style="background: #111; color: #fff; padding: 13px 22px; text-decoration: none; border-radius: 6px;">
                        Accept Invitation
                    </a>
                </p>
                <p>This invitation expires on <strong>${escapeHtml(expiryText)} (IST)</strong>.</p>
                <p>If you were not expecting this invitation, you can ignore this email.</p>
            </div>
        `,
    });
};
