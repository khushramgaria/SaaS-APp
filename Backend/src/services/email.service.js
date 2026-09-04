import nodemailer from "nodemailer";

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development fallback: automatic mock inbox
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("Nodemailer: Initialized Ethereal test mail account.");
  }

  return transporter;
};

export const sendInviteEmail = async ({
  toEmail,
  workspaceName,
  role,
  inviteUrl,
}) => {
  const mailer = await getTransporter();

  const info = await mailer.sendMail({
    from: process.env.EMAIL_FROM || '"TeamFlow App" <noreply@teamflow.local>',
    to: toEmail,
    subject: `You've been invited to join ${workspaceName} on TeamFlow`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #333;">Join ${workspaceName}</h2>
        <p style="color: #555; line-height: 1.5;">
          You have been invited to collaborate as a <strong>${role}</strong>.
        </p>
        <p style="margin: 30px 0;">
          <a href="${inviteUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Accept Invitation
          </a>
        </p>
        <p style="color: #888; font-size: 13px;">This invitation will expire in 48 hours.</p>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`\n📧 Preview Sent Email: ${previewUrl}\n`);
  }

  return info;
};
