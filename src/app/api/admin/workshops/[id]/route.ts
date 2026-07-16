// src/app/api/admin/workshops/[id]/route.ts
// PUT & DELETE — Modificar y eliminar taller individual (solo admin)

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/admin-auth';
import { getWorkshops, saveWorkshops } from '@/lib/data';

interface Context {
  params: Promise<{ id: string }>;
}

export const PUT = withAdminAuth(async (req: NextRequest, context?: any) => {
  try {
    const { id } = await (context as Context).params;
    const body = await req.json();
    const { title, description, price, originalPrice, image, youtubeId, badge, isActive } = body;

    const workshops = await getWorkshops();
    const index = workshops.findIndex(w => w.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Taller no encontrado.' }, { status: 404 });
    }

    workshops[index] = {
      ...workshops[index],
      title: title ?? workshops[index].title,
      description: description ?? workshops[index].description,
      price: price !== undefined ? Number(price) : workshops[index].price,
      originalPrice: originalPrice !== undefined ? (originalPrice ? Number(originalPrice) : null) : workshops[index].originalPrice,
      image: image ?? workshops[index].image,
      youtubeId: youtubeId ?? workshops[index].youtubeId,
      badge: badge !== undefined ? badge : workshops[index].badge,
      isActive: isActive !== undefined ? isActive : workshops[index].isActive,
    };

    await saveWorkshops(workshops);

    return NextResponse.json({ success: true, workshop: workshops[index] });
  } catch (error) {
    console.error('[PUT WORKSHOP ERROR]', error);
    return NextResponse.json({ error: 'Error al modificar taller.' }, { status: 500 });
  }
});

export const DELETE = withAdminAuth(async (req: NextRequest, context?: any) => {
  try {
    const { id } = await (context as Context).params;

    const workshops = await getWorkshops();
    const filtered = workshops.filter(w => w.id !== id);

    if (workshops.length === filtered.length) {
      return NextResponse.json({ error: 'Taller no encontrado.' }, { status: 404 });
    }

    await saveWorkshops(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar taller.' }, { status: 500 });
  }
});
