// src/app/api/admin/workshops/route.ts
// GET & POST — Gestión de talleres (solo admin)

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/admin-auth';
import { getWorkshops, saveWorkshops, generateId } from '@/lib/data';

// GET — Listar todos los talleres
export const GET = withAdminAuth(async () => {
  try {
    const workshops = await getWorkshops();
    return NextResponse.json({ workshops });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener talleres.' }, { status: 500 });
  }
});

// POST — Crear un nuevo taller
export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { title, description, price, originalPrice, image, youtubeId, badge, isActive } = body;

    if (!title || !youtubeId || price === undefined) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
    }

    const workshops = await getWorkshops();
    const newWorkshop = {
      id: generateId('ws'),
      title,
      description: description || '',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      image: image || '/images/default-workshop.png',
      youtubeId,
      badge: badge || null,
      isActive: isActive !== false,
      createdAt: new Date().toISOString(),
    };

    workshops.push(newWorkshop);
    await saveWorkshops(workshops);

    return NextResponse.json({ success: true, workshop: newWorkshop });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear el taller.' }, { status: 500 });
  }
});
