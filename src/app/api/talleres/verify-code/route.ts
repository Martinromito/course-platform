// src/app/api/talleres/verify-code/route.ts
// POST — Verifica el código OTP y crea la cookie de sesión del estudiante

import { NextRequest, NextResponse } from 'next/server';
import { getLoginCodes, saveLoginCodes } from '@/lib/data';

const STUDENT_COOKIE_NAME = 'lamackenna_student';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Faltan datos requeridos.' }, { status: 400 });
    }

    const emailClean = email.trim().toLowerCase();
    const codeClean = code.trim();

    // 1. Cargar códigos de acceso
    const currentCodes = await getLoginCodes();
    const foundEntry = currentCodes.find(
      (c) => c.email.toLowerCase() === emailClean && c.code === codeClean
    );

    if (!foundEntry) {
      return NextResponse.json({ error: 'El código ingresado es incorrecto.' }, { status: 400 });
    }

    // 2. Verificar expiración
    const now = new Date();
    const expiresAt = new Date(foundEntry.expiresAt);
    if (now > expiresAt) {
      // Eliminar código expirado
      const filteredCodes = currentCodes.filter((c) => c.email.toLowerCase() !== emailClean);
      await saveLoginCodes(filteredCodes);
      return NextResponse.json({ error: 'El código de acceso ha expirado. Por favor, solicita uno nuevo.' }, { status: 400 });
    }

    // 3. Eliminar el código usado
    const filteredCodes = currentCodes.filter((c) => c.email.toLowerCase() !== emailClean);
    await saveLoginCodes(filteredCodes);

    // 4. Crear respuesta y establecer cookie httpOnly para el estudiante
    const response = NextResponse.json({ success: true, email: emailClean });
    
    response.cookies.set(STUDENT_COOKIE_NAME, emailClean, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[VERIFY ACCESS CODE ERROR]', error);
    return NextResponse.json({ error: 'Error al verificar el código de acceso.' }, { status: 500 });
  }
}
