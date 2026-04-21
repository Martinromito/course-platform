// src/lib/email/mailer.ts
// Servicio de envío de emails con Nodemailer

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envía un email genérico
 */
export async function sendEmail({ to, subject, html }: EmailOptions) {
  await transporter.sendMail({
    from: `"Curso Online" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
}

/**
 * Email de bienvenida post-compra
 */
export async function sendWelcomeEmail(name: string, email: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #0f0f0f; color: #fff; margin: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .body { padding: 32px; }
        .body p { color: #cbd5e1; line-height: 1.7; font-size: 16px; }
        .cta { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; 
               padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .footer { padding: 24px 32px; border-top: 1px solid #2d2d3a; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Bienvenido al curso!</h1>
        </div>
        <div class="body">
          <p>Hola <strong>${name}</strong>,</p>
          <p>Tu pago fue aprobado exitosamente. Ya tienes acceso completo a todos los módulos del curso.</p>
          <p>¡Empieza a aprender ahora mismo!</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="cta">Acceder al curso →</a>
          <p>Si tienes alguna pregunta, responde este email y te ayudamos.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Curso Online. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: '🎉 ¡Tu acceso al curso está listo!',
    html,
  });
}
