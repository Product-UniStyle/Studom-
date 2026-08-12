import nodemailer from 'nodemailer';

function createTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function sendStaffCredentials({
  to,
  firstName,
  role,
  password,
}: {
  to: string;
  firstName?: string;
  role: 'admin' | 'editor';
  password: string;
}): Promise<void> {
  const transporter = createTransport();

  const roleLabel = role === 'admin' ? 'Admin' : 'Editor';
  const name = firstName || to;
  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/login`;

  await transporter.sendMail({
    from: `"Studom Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your Studom ${roleLabel} account is ready`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
        <h2 style="margin-bottom:4px">Welcome to Studom, ${name}!</h2>
        <p style="color:#666;margin-top:0">Your <strong>${roleLabel}</strong> account has been created.</p>

        <div style="background:#f5f5f5;border-radius:6px;padding:20px;margin:24px 0">
          <p style="margin:0 0 8px 0"><strong>Email:</strong> ${to}</p>
          <p style="margin:0"><strong>Password:</strong> ${password}</p>
        </div>

        <a href="${loginUrl}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:10px 24px;border-radius:4px;font-size:14px">
          Sign in to the panel
        </a>

        <p style="color:#999;font-size:12px;margin-top:24px">
          Please change your password after your first login.<br>
          If you did not expect this email, you can safely ignore it.
        </p>
      </div>
    `,
  });
}
