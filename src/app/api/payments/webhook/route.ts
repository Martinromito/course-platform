// src/app/api/payments/webhook/route.ts
// Webhook de Mercado Pago: valida y procesa notificaciones de pago

import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { connectDB } from '@/lib/db/mongodb';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import { getProducts, saveProducts, getCoupons, saveCoupons } from '@/lib/data';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || url.searchParams.get('topic');
    const dataId = url.searchParams.get('data.id') || url.searchParams.get('id');

    if (type !== 'payment' || !dataId) {
      return NextResponse.json({ message: 'Notificación recibida.' }, { status: 200 });
    }

    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: dataId });

    if (!payment || !payment.external_reference) {
      return NextResponse.json({ error: 'Pago no encontrado o sin referencia.' }, { status: 404 });
    }

    const orderId = payment.external_reference;
    const status = payment.status;

    await connectDB();
    const order = await Order.findById(orderId);

    if (!order) {
      console.error('[WEBHOOK] Pedido no encontrado:', orderId);
      return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
    }

    // Evitar procesar dos veces el mismo pago si ya está aprobado
    if (order.status === 'approved' && status === 'approved') {
        return NextResponse.json({ message: 'Pedido ya estaba aprobado.' }, { status: 200 });
    }

    order.mpPaymentId = String(payment.id);

    if (status === 'approved') {
      order.status = 'approved';
      await order.save();

      // 1. Actualizar isPaid del User (si corresponde dar acceso a cursos)
      // Como ahora vendemos productos físicos también, podríamos dar acceso a cursos 
      // si compraron uno, pero para no complicar, asumimos que todos los clientes de MP pagan la membresía/curso
      // o ajustamos la lógica. Por ahora mantenemos la actualización del user:
      const user = await User.findById(order.userId);
      if (user && !user.isPaid) {
          user.isPaid = true;
          user.paymentDate = new Date();
          user.paymentStatus = 'approved';
          await user.save();
      }

      // 2. Descontar stock de productos (JSON)
      try {
        const products = await getProducts();
        let changed = false;
        
        for (const item of order.items) {
          const prodIndex = products.findIndex(p => p.id === item.productId);
          if (prodIndex !== -1) {
            products[prodIndex].stock = Math.max(0, products[prodIndex].stock - item.quantity);
            changed = true;
          }
        }
        
        if (changed) {
          await saveProducts(products);
        }
      } catch (err) {
        console.error('[WEBHOOK] Error descontando stock:', err);
      }

      // 3. Incrementar uso del cupón si usó uno
      if (order.couponCode) {
        try {
          const coupons = await getCoupons();
          const cupIndex = coupons.findIndex(c => c.code === order.couponCode);
          if (cupIndex !== -1) {
            coupons[cupIndex].usedCount += 1;
            await saveCoupons(coupons);
          }
        } catch (err) {
            console.error('[WEBHOOK] Error actualizando cupón:', err);
        }
      }

      console.log(`[WEBHOOK] Pedido ${orderId} aprobado`);
    } else if (status === 'rejected' || status === 'refunded') {
      order.status = status as 'rejected' | 'refunded';
      await order.save();
    }

    return NextResponse.json({ message: 'Webhook procesado.' }, { status: 200 });
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error);
    return NextResponse.json({ error: 'Error procesando webhook.' }, { status: 200 });
  }
}
