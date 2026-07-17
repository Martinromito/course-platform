// src/app/api/payments/create-preference/route.ts
// Crea preferencia de pago en Mercado Pago y genera Order en JSON (Checkout Público sin Auth)

import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getProducts, getWorkshops, getOrders, saveOrders, saveProducts, validateCoupon, calculateShipping, generateAccessToken, type Order } from '@/lib/data';
import { sendOrderConfirmationEmail, sendWorkshopAccessEmail } from '@/lib/email/mailer';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

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

    // 1. Validar productos/talleres y precios contra JSON
    const allProducts = await getProducts();
    const allWorkshops = await getWorkshops();
    let subtotal = 0;
    const orderItems = [];
    const preferenceItems = [];
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

        preferenceItems.push({
          id: workshop.id,
          title: workshop.title,
          quantity: item.quantity,
          unit_price: workshop.price,
          currency_id: 'ARS',
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

        preferenceItems.push({
          id: product.id,
          title: product.name,
          quantity: item.quantity,
          unit_price: product.price,
          currency_id: 'ARS',
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
    const shippingCost = calculateShipping(afterDiscount, hasPhysicalProducts);
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

    // 4. Crear Orden en JSON con estado pendiente
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
      status: 'pending',
      paymentMethod: 'mercadopago',
      shippingAddress: hasPhysicalProducts ? shippingAddress : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    await saveOrders(orders);

    // 5. Crear Preferencia de Mercado Pago
    const isMockMP = !process.env.MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN.includes('TU_ACCESS_TOKEN');
    let initPoint = '';
    let sandboxInitPoint = '';
    let preferenceId = 'mock-pref-' + Date.now();

    if (isMockMP) {
      console.log('\n==================================================');
      console.log('[MERCADO PAGO MOCK MODE] Credenciales no configuradas.');
      console.log(`Preferencia mock creada para la orden: ${newOrderId}`);
      console.log('==================================================\n');
      
      initPoint = `/payment/success?external_reference=${newOrderId}&status=approved&preference_id=${preferenceId}`;
      sandboxInitPoint = initPoint;
      
      // Auto-aprobar orden
      newOrder.status = 'approved';
      newOrder.mpPaymentId = 'mock-pay-' + Date.now();
      newOrder.mpPreferenceId = preferenceId;
      
      // Generar tokens para talleres
      const accessTokens: { workshopId: string; token: string }[] = [];
      for (const item of newOrder.items) {
        if (item.itemType === 'workshop') {
          accessTokens.push({
            workshopId: item.productId,
            token: generateAccessToken(),
          });
        }
      }
      if (accessTokens.length > 0) {
        newOrder.accessTokens = accessTokens;
      }
      
      // Descontar stock
      try {
        const products = await getProducts();
        let changed = false;
        for (const item of newOrder.items) {
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
        console.error('[MOCK MP] Error descontando stock:', err);
      }

      // Enviar e-mails de simulación (con accesos en consola)
      try {
        await sendOrderConfirmationEmail(newOrder);
        if (accessTokens.length > 0) {
          await sendWorkshopAccessEmail(newOrder);
        }
      } catch (err) {
        console.error('[MOCK MP] Error enviando emails:', err);
      }

      // Guardar de nuevo la orden aprobada
      const ordersWithApproval = await getOrders();
      const idx = ordersWithApproval.findIndex(o => o._id === newOrderId);
      if (idx !== -1) {
        ordersWithApproval[idx] = newOrder;
        await saveOrders(ordersWithApproval);
      }
    } else {
      const preference = new Preference(client);
      const mpBody = {
        items: preferenceItems,
        payer: { email: buyerEmail, name: buyerName, phone: { number: buyerPhone } },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`,
        },
        auto_return: 'approved' as const,
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
        external_reference: newOrder._id,
        statement_descriptor: 'LA MACKENNA',
        expires: false,
      };

      const result = await preference.create({ body: mpBody });
      preferenceId = result.id!;
      initPoint = result.init_point!;
      sandboxInitPoint = result.sandbox_init_point!;

      // Actualizar con ID de preferencia
      const updatedOrders = await getOrders();
      const index = updatedOrders.findIndex(o => o._id === newOrderId);
      if (index !== -1) {
        updatedOrders[index].mpPreferenceId = result.id;
        await saveOrders(updatedOrders);
      }
    }

    return NextResponse.json({
      preferenceId,
      initPoint,
      sandboxInitPoint,
      orderId: newOrderId,
    });
  } catch (error: any) {
    console.error('[CREATE PREFERENCE ERROR]', error);
    return NextResponse.json(
      { error: error?.message || 'Error al crear la preferencia de pago.' },
      { status: 500 }
    );
  }
}
