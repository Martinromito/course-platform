// src/app/api/orders/route.ts
// GET — Retorna los pedidos del usuario autenticado

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { connectDB } from '@/lib/db/mongodb';
import Order from '@/lib/models/Order';

export const GET = withAuth(async (_req: NextRequest, user) => {
  try {
    await connectDB();

    const orders = await Order.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('[GET ORDERS]', error);
    return NextResponse.json({ error: 'Error al obtener pedidos.' }, { status: 500 });
  }
});
