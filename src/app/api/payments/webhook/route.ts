// src/app/api/payments/webhook/route.ts
// Webhook de Mercado Pago: valida y procesa notificaciones de pago

import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getProducts, saveProducts, getCoupons, saveCoupons, getOrders, saveOrders, getUsers, saveUsers } from '@/lib/data';

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

    const orders = await getOrders();
    const orderIndex = orders.findIndex(o => o._id === orderId);

    if (orderIndex === -1) {
      console.error('[WEBHOOK] Pedido no encontrado:', orderId);
      return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
    }

    const order = orders[orderIndex];

    // Evitar procesar dos veces el mismo pago si ya está aprobado
    if (order.status === 'approved' && status === 'approved') {
        return NextResponse.json({ message: 'Pedido ya estaba aprobado.' }, { status: 200 });
    }

    order.mpPaymentId = String(payment.id);
    order.updatedAt = new Date().toISOString();

    if (status === 'approved') {
      order.status = 'approved';

      // 1. Actualizar isPaid del User en JSON
      try {
        const users = await getUsers();
        const userIndex = users.findIndex(u => u._id === order.userId);
        if (userIndex !== -1 && !users[userIndex].isPaid) {
          users[userIndex].isPaid = true;
          await saveUsers(users);
        }
      } catch (err) {
        console.error('[WEBHOOK] Error actualizando usuario:', err);
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
    }

    // Guardar los cambios en el pedido
    await saveOrders(orders);

    return NextResponse.json({ message: 'Webhook procesado.' }, { status: 200 });
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error);
    return NextResponse.json({ error: 'Error procesando webhook.' }, { status: 200 });
  }
}
