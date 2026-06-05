// src/app/api/products/route.ts
// GET — Retorna productos activos para la tienda pública

import { NextResponse } from 'next/server';
import { getActiveProducts } from '@/lib/data';

export async function GET() {
  try {
    const products = await getActiveProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('[GET PRODUCTS]', error);
    return NextResponse.json({ error: 'Error al obtener productos.' }, { status: 500 });
  }
}
