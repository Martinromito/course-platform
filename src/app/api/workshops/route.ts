// src/app/api/workshops/route.ts
// GET — Retorna talleres activos para la academia pública

import { NextResponse } from 'next/server';
import { getActiveWorkshops } from '@/lib/data';

export async function GET() {
  try {
    const workshops = await getActiveWorkshops();
    return NextResponse.json({ workshops });
  } catch (error) {
    console.error('[GET WORKSHOPS]', error);
    return NextResponse.json({ error: 'Error al obtener los talleres.' }, { status: 500 });
  }
}
