// src/app/api/admin/orders/route.ts
// Gestión de pedidos (solo admin)

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/admin-auth';
import { getOrders, saveOrders, getProducts, saveProducts, generateAccessToken } from '@/lib/data';
import { sendOrderConfirmationEmail, sendWorkshopAccessEmail } from '@/lib/email/mailer';

// GET — Obtiene todos los pedidos
export const GET = withAdminAuth(async () => {
  try {
    const orders = await getOrders();
    const sorted = orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json({ orders: sorted });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener pedidos.' }, { status: 500 });
  }
});

// PUT — Permite actualizar el estado de un pedido (por ejemplo, marcar como aprobado/pendiente/etc)
export const PUT = withAdminAuth(async (req: NextRequest) => {
  try {
    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 });
    }

    const validStatuses = ['pending', 'pending_transfer', 'approved', 'rejected', 'refunded'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 });
    }

    const orders = await getOrders();
    const orderIndex = orders.findIndex(o => o._id === orderId);

    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
    }

    const order = orders[orderIndex];
    const oldStatus = order.status;

    order.status = status;
    order.updatedAt = new Date().toISOString();

    // Si se pasa a aprobado manualmente, realizamos las acciones
    if (status === 'approved' && oldStatus !== 'approved') {
      // 1. Si incluye talleres online, generar tokens de acceso único
      const accessTokens: { workshopId: string; token: string }[] = [];
      for (const item of order.items) {
        if (item.itemType === 'workshop') {
          accessTokens.push({
            workshopId: item.productId,
            token: generateAccessToken(),
          });
        }
      }

      if (accessTokens.length > 0) {
        order.accessTokens = accessTokens;
      }

      // 2. Guardar orden para tener los tokens registrados antes de enviar el correo
      await saveOrders(orders);

      // 3. Enviar notificaciones de acceso por email
      try {
        // Enviar email de confirmación general
        await sendOrderConfirmationEmail(order);

        // Si compró talleres, enviar email con los botones de acceso protegido
        if (accessTokens.length > 0) {
          await sendWorkshopAccessEmail(order);
        }
      } catch (err) {
        console.error('[ADMIN ORDERS API] Error al enviar correos:', err);
      }

      // 4. Descontar stock de productos físicos
      try {
        const products = await getProducts();
        let changed = false;
        for (const item of order.items) {
          if (item.itemType === 'product') {
            const prodIndex = products.findIndex(p => p.id === item.productId);
            if (prodIndex !== -1) {
              products[prodIndex].stock = Math.max(0, products[prodIndex].stock - item.quantity);
              changed = true;
            }
          }
        }
        if (changed) {
          await saveProducts(products);
        }
      } catch (err) {
        console.error('[ADMIN ORDERS API] Error al descontar stock:', err);
      }
    } else {
      // En otros casos de actualización de estado
      await saveOrders(orders);
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('[PUT ORDER STATUS ERROR]', error);
    return NextResponse.json({ error: 'Error al actualizar el pedido.' }, { status: 500 });
  }
});
