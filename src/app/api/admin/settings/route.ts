// src/app/api/admin/settings/route.ts
// API administrativa para gestionar la configuración de la tienda (solo admin)

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/admin-auth';
import { getSettings, saveSettings } from '@/lib/data';

// GET — Obtener configuraciones de admin
export const GET = withAdminAuth(async () => {
  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener configuraciones.' }, { status: 500 });
  }
});

// PUT — Modificar configuraciones
export const PUT = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const currentSettings = await getSettings();

    const newSettings = {
      ...currentSettings,
      ...body,
    };

    await saveSettings(newSettings);
    return NextResponse.json({ success: true, settings: newSettings });
  } catch (error) {
    console.error('[PUT SETTINGS ERROR]', error);
    return NextResponse.json({ error: 'Error al guardar configuraciones.' }, { status: 500 });
  }
});
