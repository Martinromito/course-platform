// src/app/api/admin/coupons/route.ts
// Admin CRUD de cupones — lee/escribe al JSON local

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/admin-auth';
import { getCoupons, saveCoupons, type Coupon } from '@/lib/data';

// GET — Lista todos los cupones
export const GET = withAdminAuth(async () => {
  try {
    const coupons = await getCoupons();
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('[ADMIN GET COUPONS]', error);
    return NextResponse.json({ error: 'Error al obtener cupones.' }, { status: 500 });
  }
});

// POST — Crear nuevo cupón
export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { code, type, value, minPurchase, maxUses, expiresAt } = body;

    if (!code || !type || !value) {
      return NextResponse.json(
        { error: 'Código, tipo y valor son obligatorios.' },
        { status: 400 }
      );
    }

    const coupons = await getCoupons();

    // Verificar que el código no exista
    if (coupons.some((c) => c.code.toUpperCase() === code.toUpperCase())) {
      return NextResponse.json(
        { error: 'Ya existe un cupón con ese código.' },
        { status: 400 }
      );
    }

    const newCoupon: Coupon = {
      id: `cup-${Date.now()}`,
      code: code.toUpperCase(),
      type,
      value: Number(value),
      minPurchase: minPurchase ? Number(minPurchase) : 0,
      maxUses: maxUses ? Number(maxUses) : 999,
      usedCount: 0,
      isActive: true,
      expiresAt: expiresAt || null,
    };

    coupons.push(newCoupon);
    await saveCoupons(coupons);

    return NextResponse.json({ coupon: newCoupon }, { status: 201 });
  } catch (error) {
    console.error('[ADMIN CREATE COUPON]', error);
    return NextResponse.json({ error: 'Error al crear cupón.' }, { status: 500 });
  }
});
