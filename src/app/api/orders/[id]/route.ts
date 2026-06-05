// src/app/api/orders/[id]/route.ts
// GET — Retorna detalle de un pedido específico del usuario (JSON)

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getOrders } from '@/lib/data';

export const GET = withAuth(async (_req: NextRequest, user, context) => {
  try {
    const { id } = await context!.params;
    const orders = await getOrders();

    const order = orders.find((o) => o._id === id && o.userId === user.userId);

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('[GET ORDER DETAIL]', error);
    return NextResponse.json({ error: 'Error al obtener pedido.' }, { status: 500 });
  }
});
