// src/app/api/admin/orders/route.ts
// Gestión de pedidos (solo admin)

import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { getOrders, saveOrders, getUsers, saveUsers, getProducts, saveProducts } from '@/lib/data';

// Obtiene todos los pedidos con la información de los usuarios asociada
export const GET = withAdmin(async () => {
  try {
    const [orders, users] = await Promise.all([getOrders(), getUsers()]);
    
    // Mapear usuarios por ID
    const userMap = new Map(users.map(u => [u._id, u]));
    
    const enrichedOrders = orders.map(order => {
      const user = userMap.get(order.userId);
      return {
        ...order,
        user: user ? { name: user.name, email: user.email } : { name: 'Usuario Eliminado', email: 'N/A' }
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ orders: enrichedOrders });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener pedidos.' }, { status: 500 });
  }
});

// Permite actualizar el estado de un pedido (por ejemplo, marcar como aprobado/pendiente/etc)
export const PUT = withAdmin(async (req: NextRequest) => {
  try {
    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 });
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'refunded'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 });
    }

    const orders = await getOrders();
    const orderIndex = orders.findIndex(o => o._id === orderId);

    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
    }

    const oldStatus = orders[orderIndex].status;
    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();

    await saveOrders(orders);

    // Si se pasa a aprobado manualmente, realizamos las mismas acciones que en el webhook
    if (status === 'approved' && oldStatus !== 'approved') {
      const order = orders[orderIndex];

      // 1. Activar acceso de pago al usuario
      try {
        const users = await getUsers();
        const userIndex = users.findIndex(u => u._id === order.userId);
        if (userIndex !== -1 && !users[userIndex].isPaid) {
          users[userIndex].isPaid = true;
          await saveUsers(users);
        }
      } catch (err) {
        console.error('[ADMIN ORDERS] Error al actualizar usuario:', err);
      }

      // 2. Descontar stock
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
        console.error('[ADMIN ORDERS] Error al descontar stock:', err);
      }
    }

    return NextResponse.json({ success: true, order: orders[orderIndex] });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar el pedido.' }, { status: 500 });
  }
});
