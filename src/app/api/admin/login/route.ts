// src/app/api/admin/login/route.ts
// POST — Valida el password de administrador y guarda la cookie httpOnly

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword, createAdminLoginResponse } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'La contraseña es requerida.' }, { status: 400 });
    }

    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json({ error: 'Contraseña incorrecta.' }, { status: 401 });
    }

    return createAdminLoginResponse();
  } catch (error) {
    console.error('[ADMIN LOGIN API ERROR]', error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
