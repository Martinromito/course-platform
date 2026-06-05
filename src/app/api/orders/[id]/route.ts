// src/app/api/orders/[id]/route.ts
// GET — Retorna detalle de un pedido específico del usuario

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { connectDB } from '@/lib/db/mongodb';
import Order from '@/lib/models/Order';

export const GET = withAuth(async (_req: NextRequest, user, context) => {
  try {
    const { id } = await context!.params;

    await connectDB();

    const order = await Order.findOne({
      _id: id,
      userId: user.userId,
    }).lean();

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('[GET ORDER DETAIL]', error);
    return NextResponse.json({ error: 'Error al obtener pedido.' }, { status: 500 });
  }
});
