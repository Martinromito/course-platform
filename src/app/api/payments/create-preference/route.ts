// src/app/api/payments/create-preference/route.ts
// Crea una preferencia de pago en Mercado Pago y retorna el init_point

import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export const POST = withAuth(async (req: NextRequest, user: JWTPayload) => {
  try {
    const preference = new Preference(client);

    const body = {
      items: [
        {
          id: 'curso-online-001',
          title: 'Acceso Completo al Curso Online',
          description: 'Acceso de por vida a todos los módulos y actualizaciones',
          quantity: 1,
          unit_price: 9900, // Precio en pesos ARS (ajustar según moneda)
          currency_id: 'ARS',
        },
      ],
      payer: {
        email: user.email,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`,
      },
      auto_return: 'approved' as const,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      external_reference: user.userId, // Usamos el userId para identificar al comprador en el webhook
      statement_descriptor: 'CURSO ONLINE',
      expires: false,
    };

    const result = await preference.create({ body });

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: result.init_point,         // URL de producción
      sandboxInitPoint: result.sandbox_init_point, // URL de pruebas
    });
  } catch (error) {
    console.error('[CREATE PREFERENCE ERROR]', error);
    return NextResponse.json(
      { error: 'Error al crear la preferencia de pago.' },
      { status: 500 }
    );
  }
});
