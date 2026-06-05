// src/app/api/payments/create-preference/route.ts
// Crea preferencia de pago en Mercado Pago y genera Order en MongoDB

import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { getProducts, validateCoupon, calculateShipping, getOrders, saveOrders, type Order } from '@/lib/data';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export const POST = withAuth(async (req: NextRequest, user: JWTPayload) => {
  try {
    const body = await req.json();
    const { items, couponCode, shippingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío.' }, { status: 400 });
    }

    // 1. Validar productos y precios contra nuestra "base de datos" (JSON)
    const allProducts = await getProducts();
    let subtotal = 0;
    const orderItems = [];
    const preferenceItems = [];

    for (const item of items) {
      const product = allProducts.find((p) => p.id === item.productId);
      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Producto no disponible: ${item.name}` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para: ${product.name}` },
          { status: 400 }
        );
      }

      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        image: product.image,
      });

      preferenceItems.push({
        id: product.id,
        title: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        currency_id: 'ARS',
      });
    }

    // 2. Validar cupón si existe
    let couponDiscount = 0;
    if (couponCode) {
      const validation = await validateCoupon(couponCode, subtotal);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      couponDiscount = validation.discount;
      
      // MP no soporta descuentos a nivel de total fácilmente, agregamos un item negativo
      preferenceItems.push({
        id: 'DESC-CUPON',
        title: `Descuento cupón (${couponCode})`,
        quantity: 1,
        unit_price: -couponDiscount,
        currency_id: 'ARS',
      });
    }

    // 3. Calcular envío
    const afterDiscount = subtotal - couponDiscount;
    const shippingCost = calculateShipping(afterDiscount);
    const total = afterDiscount + shippingCost;

    if (shippingCost > 0) {
      preferenceItems.push({
        id: 'ENVIO',
        title: 'Costo de envío',
        quantity: 1,
        unit_price: shippingCost,
        currency_id: 'ARS',
      });
    }

    // 4. Crear Order en JSON
    const orders = await getOrders();
    const newOrderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newOrder: Order = {
      _id: newOrderId,
      userId: user.userId,
      items: orderItems,
      subtotal,
      couponCode,
      couponDiscount,
      shippingCost,
      total,
      status: 'pending',
      shippingAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    // Lo guardamos provisoriamente, luego lo actualizamos con la preferencia
    await saveOrders(orders);

    // 5. Crear Preferencia en Mercado Pago
    const preference = new Preference(client);
    const mpBody = {
      items: preferenceItems,
      payer: { email: user.email },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`,
      },
      auto_return: 'approved' as const,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      external_reference: newOrder._id, // Crucial: vincula MP con nuestra Order
      statement_descriptor: 'LA MACKENNA',
      expires: false,
    };

    const result = await preference.create({ body: mpBody });

    // Actualizar Order con preference ID en el JSON
    const updatedOrders = await getOrders(); // volvemos a leer por seguridad
    const index = updatedOrders.findIndex(o => o._id === newOrderId);
    if (index !== -1) {
      updatedOrders[index].mpPreferenceId = result.id;
      await saveOrders(updatedOrders);
    }

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
      orderId: newOrderId,
    });
  } catch (error) {
    console.error('[CREATE PREFERENCE ERROR]', error);
    return NextResponse.json(
      { error: 'Error al crear la preferencia de pago.' },
      { status: 500 }
    );
  }
});
