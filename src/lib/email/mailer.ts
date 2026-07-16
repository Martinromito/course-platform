// src/lib/email/mailer.ts
// Servicio de envío de emails con Nodemailer para La Mackenna

import nodemailer from 'nodemailer';
import { type Order, getSettings } from '@/lib/data';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const settings = await getSettings();
  console.log('\n==================================================');
  console.log(`[SIMULACIÓN EMAIL]`);
  console.log(`Destinatario: ${to}`);
  console.log(`Asunto: ${subject}`);
  
  // Extraer el enlace de acceso protegido si existe en el html
  const accessLinkMatch = html.match(/href="([^"]+\/talleres\/ver\/[^"]+)"/);
  if (accessLinkMatch) {
    console.log(`👉 ENLACE DE ACCESO AL TALLER: ${accessLinkMatch[1]}`);
  }
  console.log('==================================================\n');

  try {
    if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('tu_email')) {
      console.log('[SMTP] Nodemailer no configurado o tiene valores por defecto. Correo simulado.');
      return;
    }
    
    await transporter.sendMail({
      from: `"${settings.shopName}" <${process.env.EMAIL_FROM || 'no-reply@lamackenna.com'}>`,
      to,
      subject,
      html,
    });
    console.log('[SMTP] Correo electrónico real enviado.');
  } catch (error) {
    console.error('[SMTP EMAIL ERROR] No se pudo enviar el correo real:', error);
  }
}

/** Email de confirmación de pedido físico y/o transferencia */
export async function sendOrderConfirmationEmail(order: Order) {
  const settings = await getSettings();
  const isTransfer = order.paymentMethod === 'transfer';
  const hasPhysical = order.items.some(item => item.itemType === 'product');

  const itemsHtml = order.items
    .map(
      (item) => `
    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E8E2D9; padding: 10px 0;">
      <div>
        <p style="margin: 0; font-weight: bold; color: #1A1A1A;">${item.name}</p>
        <p style="margin: 0; font-size: 12px; color: #7A6E60;">Cant: ${item.quantity} x $${item.unitPrice.toLocaleString('es-AR')}</p>
      </div>
      <span style="font-weight: bold; color: #8B7355;">$${(item.quantity * item.unitPrice).toLocaleString('es-AR')}</span>
    </div>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', sans-serif; background-color: #FAF8F4; color: #1A1A1A; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #E8E2D9; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(139, 115, 85, 0.05); }
        .header { background-color: #8B7355; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; font-family: Georgia, serif; }
        .body { padding: 30px; }
        .body p { line-height: 1.6; font-size: 14px; color: #4A4A4A; }
        .divider { border-top: 1px solid #E8E2D9; margin: 20px 0; }
        .footer { padding: 20px; background-color: #FAF8F4; border-top: 1px solid #E8E2D9; text-align: center; color: #7A6E60; font-size: 11px; }
        .bank-box { background-color: #FAF8F4; border: 1px solid #E8E2D9; border-radius: 12px; padding: 20px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${settings.shopName}</h1>
        </div>
        <div class="body">
          <p>Hola <strong>${order.buyerName}</strong>,</p>
          
          ${
            isTransfer && order.status === 'pending_transfer'
              ? `<p>Hemos recibido tu pedido por <strong>Transferencia Bancaria</strong>. Para confirmarlo, realiza el pago y responde a este correo con el comprobante.</p>
                 <div class="bank-box">
                   <p style="margin: 0 0 10px 0; font-weight: bold; color: #8B7355;">Datos para transferir:</p>
                   <p style="margin: 4px 0;"><strong>Banco:</strong> ${settings.bankName}</p>
                   <p style="margin: 4px 0;"><strong>Titular:</strong> ${settings.bankOwner}</p>
                   <p style="margin: 4px 0;"><strong>Alias:</strong> ${settings.bankAlias}</p>
                   <p style="margin: 4px 0;"><strong>CBU:</strong> ${settings.bankCbu}</p>
                   <p style="margin: 10px 0 0 0; font-size: 16px; font-weight: bold; text-align: center; color: #1A1A1A;">Total a transferir: $${order.total.toLocaleString('es-AR')}</p>
                 </div>`
              : `<p>Tu pago ha sido procesado con éxito. A continuación, verás el detalle de tu compra.</p>`
          }

          <div class="divider"></div>
          <h3 style="color: #1A1A1A; font-family: Georgia, serif;">Resumen del Pedido #${order._id.substring(0, 8)}</h3>
          ${itemsHtml}

          <div style="margin-top: 20px; text-align: right; font-size: 14px;">
            <p style="margin: 4px 0;">Subtotal: $${order.subtotal.toLocaleString('es-AR')}</p>
            ${order.couponDiscount > 0 ? `<p style="margin: 4px 0; color: green;">Descuento: -$${order.couponDiscount.toLocaleString('es-AR')}</p>` : ''}
            ${hasPhysical ? `<p style="margin: 4px 0;">Envío: $${order.shippingCost.toLocaleString('es-AR')}</p>` : ''}
            <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold; color: #8B7355;">Total: $${order.total.toLocaleString('es-AR')}</p>
          </div>

          ${
            hasPhysical && order.shippingAddress
              ? `<div class="divider"></div>
                 <h4 style="margin: 0 0 8px 0; color: #1A1A1A;">Dirección de Envío:</h4>
                 <p style="margin: 2px 0; font-size: 13px;">${order.shippingAddress.address}</p>
                 <p style="margin: 2px 0; font-size: 13px;">${order.shippingAddress.city}, ${order.shippingAddress.province} (${order.shippingAddress.zip})</p>`
              : ''
          }
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${settings.shopName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: order.buyerEmail,
    subject: `${settings.shopName} — Detalle del Pedido #${order._id.substring(0, 8)}`,
    html,
  });
}

/** Email para enviar accesos únicos a los talleres comprados */
export async function sendWorkshopAccessEmail(order: Order) {
  if (!order.accessTokens || order.accessTokens.length === 0) return;

  const settings = await getSettings();

  const linksHtml = order.accessTokens
    .map((tokenObj) => {
      const item = order.items.find((i) => i.productId === tokenObj.workshopId);
      const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/talleres/ver/${tokenObj.token}`;
      return `
      <div style="background-color: #FAF8F4; border: 1px solid #E8E2D9; border-radius: 12px; padding: 20px; margin-bottom: 15px; text-align: center;">
        <h4 style="margin: 0 0 10px 0; color: #1A1A1A; font-family: Georgia, serif;">${item?.name || 'Taller Online'}</h4>
        <p style="margin: 0 0 15px 0; font-size: 13px; color: #7A6E60;">Haz clic en el siguiente enlace para ver la videoclase de forma segura.</p>
        <a href="${url}" style="display: inline-block; background-color: #8B7355; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Acceder al Taller</a>
      </div>
    `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', sans-serif; background-color: #FAF8F4; color: #1A1A1A; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #E8E2D9; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(139, 115, 85, 0.05); }
        .header { background-color: #8B7355; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; font-family: Georgia, serif; }
        .body { padding: 30px; }
        .body p { line-height: 1.6; font-size: 14px; color: #4A4A4A; }
        .divider { border-top: 1px solid #E8E2D9; margin: 20px 0; }
        .footer { padding: 20px; background-color: #FAF8F4; border-top: 1px solid #E8E2D9; text-align: center; color: #7A6E60; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Tus Talleres ya están listos!</h1>
        </div>
        <div class="body">
          <p>Hola <strong>${order.buyerName}</strong>,</p>
          <p>Tu pago ha sido verificado con éxito y ya tienes disponibles tus accesos a los talleres online comprados.</p>
          <p>Puedes ingresar directamente haciendo clic en los botones de abajo:</p>
          
          <div style="margin: 25px 0;">
            ${linksHtml}
          </div>

          <p style="font-size: 12px; color: #7A6E60; margin-top: 20px; font-style: italic;">
            * Nota: Por favor, guarda este correo para poder volver a acceder a los videos en el futuro. No compartas tus enlaces de acceso únicos.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${settings.shopName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: order.buyerEmail,
    subject: `${settings.shopName} — ¡Accesos a tus Talleres Online!`,
    html,
  });
}
