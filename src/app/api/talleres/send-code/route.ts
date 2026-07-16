// src/app/api/talleres/send-code/route.ts
// POST — Envía un código OTP de 6 dígitos al correo del estudiante para acceder a sus talleres comprados

import { NextRequest, NextResponse } from 'next/server';
import { getOrders, getLoginCodes, saveLoginCodes } from '@/lib/data';
import { sendEmail } from '@/lib/email/mailer';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ingresa un correo electrónico válido.' }, { status: 400 });
    }

    const emailClean = email.trim().toLowerCase();

    // 1. Verificar si el email tiene alguna orden aprobada con talleres online
    const orders = await getOrders();
    const hasWorkshops = orders.some(
      (order) =>
        order.status === 'approved' &&
        order.buyerEmail.trim().toLowerCase() === emailClean &&
        order.items.some((item) => item.itemType === 'workshop')
    );

    if (!hasWorkshops) {
      return NextResponse.json(
        { error: 'No encontramos compras de talleres aprobadas para este correo electrónico. Por favor, verifica el email o realiza el pago.' },
        { status: 404 }
      );
    }

    // 2. Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutos de validez

    // 3. Guardar el código en la base de datos temporal
    const currentCodes = await getLoginCodes();
    // Limpiar códigos anteriores del mismo email
    const filteredCodes = currentCodes.filter((c) => c.email.toLowerCase() !== emailClean);
    filteredCodes.push({
      email: emailClean,
      code,
      expiresAt,
    });
    await saveLoginCodes(filteredCodes);

    // 4. Imprimir código en consola para desarrollo/depuración local
    console.log('\n==================================================');
    console.log(`🔑 CÓDIGO DE ACCESO GENERADO`);
    console.log(`Destinatario: ${emailClean}`);
    console.log(`👉 CÓDIGO (OTP): ${code}`);
    console.log('==================================================\n');

    // 5. Enviar email con el código
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', sans-serif; background-color: #FAF8F4; color: #1A1A1A; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 20px auto; background-color: #ffffff; border: 1px solid #E8E2D9; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(139, 115, 85, 0.05); }
          .header { background-color: #8B7355; color: white; padding: 25px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 700; font-family: Georgia, serif; }
          .body { padding: 30px; text-align: center; }
          .body p { line-height: 1.6; font-size: 14px; color: #4A4A4A; }
          .code-box { background-color: #FAF8F4; border: 1px solid #E8E2D9; border-radius: 12px; padding: 15px; margin: 20px auto; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #8B7355; width: fit-content; }
          .footer { padding: 15px; background-color: #FAF8F4; border-top: 1px solid #E8E2D9; text-align: center; color: #7A6E60; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Código de Acceso a Talleres</h1>
          </div>
          <div class="body">
            <p>Hola,</p>
            <p>Usá el siguiente código de un solo uso para ingresar a tu biblioteca de talleres online:</p>
            <div class="code-box">${code}</div>
            <p style="font-size: 12px; color: #7A6E60;">Este código expira en 15 minutos. Si no solicitaste este ingreso, puedes ignorar este mensaje.</p>
          </div>
          <div class="footer">
            <p>© La Mackenna. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: emailClean,
      subject: 'Tu código de acceso a talleres - La Mackenna',
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SEND ACCESS CODE ERROR]', error);
    return NextResponse.json({ error: 'Error al enviar el código de acceso.' }, { status: 500 });
  }
}
