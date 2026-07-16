// src/app/api/settings/route.ts
// API pública para obtener la configuración general de la tienda

import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/data';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('[GET SETTINGS ERROR]', error);
    return NextResponse.json({ error: 'Error al obtener configuraciones.' }, { status: 500 });
  }
}
