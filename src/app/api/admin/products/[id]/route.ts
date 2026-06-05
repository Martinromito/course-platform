// src/app/api/admin/products/[id]/route.ts
// Admin — Editar y eliminar un producto individual

import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { getProducts, saveProducts } from '@/lib/data';

// PUT — Editar producto
export const PUT = withAdmin(async (req: NextRequest, _user, context) => {
  try {
    const { id } = await context!.params;
    const body = await req.json();
    const products = await getProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
    }

    products[index] = {
      ...products[index],
      ...body,
      id, // No permitir cambiar el ID
      price: body.price ? Number(body.price) : products[index].price,
      originalPrice: body.originalPrice !== undefined
        ? (body.originalPrice ? Number(body.originalPrice) : null)
        : products[index].originalPrice,
      stock: body.stock !== undefined ? Number(body.stock) : products[index].stock,
    };

    await saveProducts(products);
    return NextResponse.json({ product: products[index] });
  } catch (error) {
    console.error('[ADMIN UPDATE PRODUCT]', error);
    return NextResponse.json({ error: 'Error al actualizar producto.' }, { status: 500 });
  }
});

// DELETE — Eliminar producto
export const DELETE = withAdmin(async (_req: NextRequest, _user, context) => {
  try {
    const { id } = await context!.params;
    const products = await getProducts();
    const filtered = products.filter((p) => p.id !== id);

    if (filtered.length === products.length) {
      return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
    }

    await saveProducts(filtered);
    return NextResponse.json({ message: 'Producto eliminado.' });
  } catch (error) {
    console.error('[ADMIN DELETE PRODUCT]', error);
    return NextResponse.json({ error: 'Error al eliminar producto.' }, { status: 500 });
  }
});
