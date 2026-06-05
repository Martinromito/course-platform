// src/app/api/coupons/validate/route.ts
// Valida un código de cupón contra el subtotal — público

import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/data';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || subtotal === undefined) {
      return NextResponse.json(
        { valid: false, error: 'Código y subtotal son requeridos.' },
        { status: 400 }
      );
    }

    const result = await validateCoupon(code, Number(subtotal));
    return NextResponse.json(result);
  } catch (error) {
    console.error('[VALIDATE COUPON]', error);
    return NextResponse.json(
      { valid: false, error: 'Error al validar cupón.' },
      { status: 500 }
    );
  }
}
