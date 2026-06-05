// src/app/api/admin/products/route.ts
// Admin CRUD de productos — lee/escribe al JSON local

import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { getProducts, saveProducts, type Product } from '@/lib/data';

// GET — Lista todos los productos (incluidos inactivos)
export const GET = withAdmin(async () => {
  try {
    const products = await getProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('[ADMIN GET PRODUCTS]', error);
    return NextResponse.json({ error: 'Error al obtener productos.' }, { status: 500 });
  }
});

// POST — Crear nuevo producto
export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { name, price, originalPrice, image, badge, category, stock } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Nombre, precio y categoría son obligatorios.' },
        { status: 400 }
      );
    }

    const products = await getProducts();

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      image: image || '/images/product-pieza.png',
      badge: badge || null,
      category,
      stock: stock ? Number(stock) : 999,
      isActive: true,
    };

    products.push(newProduct);
    await saveProducts(products);

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('[ADMIN CREATE PRODUCT]', error);
    return NextResponse.json({ error: 'Error al crear producto.' }, { status: 500 });
  }
});
