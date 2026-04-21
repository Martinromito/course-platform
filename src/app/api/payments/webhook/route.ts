// src/app/api/payments/webhook/route.ts
// Webhook de Mercado Pago: valida y procesa notificaciones de pago
// IMPORTANTE: La validación ocurre aquí en el backend, no en el frontend

import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { sendWelcomeEmail } from '@/lib/email/mailer';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    // Mercado Pago envía el tipo de notificación en query params
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || url.searchParams.get('topic');
    const dataId = url.searchParams.get('data.id') || url.searchParams.get('id');

    // Solo procesamos notificaciones de pago
    if (type !== 'payment' || !dataId) {
      return NextResponse.json({ message: 'Notificación recibida.' }, { status: 200 });
    }

    // Consultar el pago directamente en la API de MP (NO confiar en el body del webhook)
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: dataId });

    if (!payment || !payment.external_reference) {
      return NextResponse.json({ error: 'Pago no encontrado.' }, { status: 404 });
    }

    // external_reference = userId que seteamos al crear la preferencia
    const userId = payment.external_reference;
    const status = payment.status;

    await connectDB();
    const user = await User.findById(userId);

    if (!user) {
      console.error('[WEBHOOK] Usuario no encontrado:', userId);
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    if (status === 'approved' && !user.isPaid) {
      // Marcar como pagado
      user.isPaid = true;
      user.paymentId = String(payment.id);
      user.paymentDate = new Date();
      user.paymentStatus = 'approved';
      await user.save();

      // Enviar email de bienvenida
      try {
        await sendWelcomeEmail(user.name, user.email);
      } catch (emailError) {
        // No fallar si el email falla
        console.error('[WEBHOOK] Error enviando email:', emailError);
      }

      console.log(`[WEBHOOK] Pago aprobado para usuario ${user.email}`);
    } else if (status === 'rejected' || status === 'refunded') {
      user.isPaid = false;
      user.paymentStatus = status;
      await user.save();
    }

    return NextResponse.json({ message: 'Webhook procesado.' }, { status: 200 });
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error);
    // Retornar 200 para que MP no reintente (ya logueamos el error)
    return NextResponse.json({ error: 'Error procesando webhook.' }, { status: 200 });
  }
}
