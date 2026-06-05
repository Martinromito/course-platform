// src/app/api/admin/coupons/[id]/route.ts
// Admin — Editar y eliminar cupón individual

import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { getCoupons, saveCoupons } from '@/lib/data';

// PUT — Editar cupón
export const PUT = withAdmin(async (req: NextRequest, _user, context) => {
  try {
    const { id } = await context!.params;
    const body = await req.json();
    const coupons = await getCoupons();
    const index = coupons.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Cupón no encontrado.' }, { status: 404 });
    }

    coupons[index] = {
      ...coupons[index],
      ...body,
      id, // No permitir cambiar el ID
      code: body.code ? body.code.toUpperCase() : coupons[index].code,
      value: body.value !== undefined ? Number(body.value) : coupons[index].value,
      minPurchase: body.minPurchase !== undefined ? Number(body.minPurchase) : coupons[index].minPurchase,
      maxUses: body.maxUses !== undefined ? Number(body.maxUses) : coupons[index].maxUses,
    };

    await saveCoupons(coupons);
    return NextResponse.json({ coupon: coupons[index] });
  } catch (error) {
    console.error('[ADMIN UPDATE COUPON]', error);
    return NextResponse.json({ error: 'Error al actualizar cupón.' }, { status: 500 });
  }
});

// DELETE — Eliminar cupón
export const DELETE = withAdmin(async (_req: NextRequest, _user, context) => {
  try {
    const { id } = await context!.params;
    const coupons = await getCoupons();
    const filtered = coupons.filter((c) => c.id !== id);

    if (filtered.length === coupons.length) {
      return NextResponse.json({ error: 'Cupón no encontrado.' }, { status: 404 });
    }

    await saveCoupons(filtered);
    return NextResponse.json({ message: 'Cupón eliminado.' });
  } catch (error) {
    console.error('[ADMIN DELETE COUPON]', error);
    return NextResponse.json({ error: 'Error al eliminar cupón.' }, { status: 500 });
  }
});
