// src/app/api/orders/create-transfer/route.ts
// POST — Crea una orden por Transferencia Bancaria (Checkout Público sin Auth)

import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getWorkshops, getOrders, saveOrders, validateCoupon, calculateShipping, type Order } from '@/lib/data';
import { sendOrderConfirmationEmail } from '@/lib/email/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, couponCode, shippingAddress, buyerName, buyerEmail, buyerPhone } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío.' }, { status: 400 });
    }

    if (!buyerName || !buyerEmail || !buyerPhone) {
      return NextResponse.json({ error: 'Faltan datos de contacto obligatorios.' }, { status: 400 });
    }

    // Validación estricta del formato de email (evita errores como gmail.con)
    const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!strictEmailRegex.test(buyerEmail)) {
      return NextResponse.json(
        { error: 'El formato del email no es válido. Verificá que el dominio sea correcto (ej: nombre@gmail.com).' },
        { status: 400 }
      );
    }

    // 1. Validar productos/talleres y precios
    const allProducts = await getProducts();
    const allWorkshops = await getWorkshops();
    let subtotal = 0;
    const orderItems = [];
    let hasPhysicalProducts = false;

    for (const item of items) {
      if (item.product.itemType === 'workshop') {
        const workshop = allWorkshops.find((w) => w.id === item.product.id);
        if (!workshop || !workshop.isActive) {
          return NextResponse.json(
            { error: `Taller no disponible: ${item.product.name}` },
            { status: 400 }
          );
        }
        const lineTotal = workshop.price * item.quantity;
        subtotal += lineTotal;

        orderItems.push({
          productId: workshop.id,
          name: workshop.title,
          quantity: item.quantity,
          unitPrice: workshop.price,
          image: workshop.image,
          itemType: 'workshop' as const,
        });
      } else {
        const product = allProducts.find((p) => p.id === item.product.id);
        if (!product || !product.isActive) {
          return NextResponse.json(
            { error: `Producto no disponible: ${item.product.name}` },
            { status: 400 }
          );
        }
        if (product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Stock insuficiente para: ${product.name}` },
            { status: 400 }
          );
        }
        hasPhysicalProducts = true;
        const lineTotal = product.price * item.quantity;
        subtotal += lineTotal;

        orderItems.push({
          productId: product.id,
          name: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
          image: product.image,
          itemType: 'product' as const,
        });
      }
    }

    // 2. Validar cupón
    let couponDiscount = 0;
    if (couponCode) {
      const validation = await validateCoupon(couponCode, subtotal);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      couponDiscount = validation.discount;
    }

    // 3. Calcular envío
    const afterDiscount = subtotal - couponDiscount;
    const shippingCost = calculateShipping(afterDiscount, hasPhysicalProducts);
    const total = afterDiscount + shippingCost;

    // 4. Crear la Orden en JSON
    const orders = await getOrders();
    const newOrderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newOrder: Order = {
      _id: newOrderId,
      buyerName,
      buyerEmail,
      buyerPhone,
      items: orderItems,
      subtotal,
      couponCode,
      couponDiscount,
      shippingCost,
      total,
      status: 'pending_transfer',
      paymentMethod: 'transfer',
      shippingAddress: hasPhysicalProducts ? shippingAddress : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    await saveOrders(orders);

    // Enviar email de confirmación (con datos de transferencia)
    try {
      await sendOrderConfirmationEmail(newOrder);
    } catch (err) {
      console.error('[CREATE TRANSFER] Error sending confirmation email:', err);
    }

    return NextResponse.json({
      success: true,
      orderId: newOrderId,
      total,
    });
  } catch (error) {
    console.error('[CREATE TRANSFER ORDER ERROR]', error);
    return NextResponse.json(
      { error: 'Error al registrar el pedido por transferencia.' },
      { status: 500 }
    );
  }
}
