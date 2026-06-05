// src/app/api/orders/route.ts
// GET — Retorna los pedidos del usuario autenticado (JSON)

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getOrders } from '@/lib/data';

export const GET = withAuth(async (_req: NextRequest, user) => {
  try {
    const allOrders = await getOrders();
    const userOrders = allOrders
      .filter((o) => o.userId === user.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ orders: userOrders });
  } catch (error) {
    console.error('[GET ORDERS]', error);
    return NextResponse.json({ error: 'Error al obtener pedidos.' }, { status: 500 });
  }
});
