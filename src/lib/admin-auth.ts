// src/lib/admin-auth.ts
// Autenticación simple para admin — usa una contraseña de variable de entorno
// No hay usuarios, solo una contraseña maestra para el panel admin

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'lamackenna_admin';
const ADMIN_COOKIE_VALUE = 'authenticated';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

/** Verifica si la contraseña del admin es correcta */
export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('[ADMIN AUTH] ADMIN_PASSWORD no está configurada en .env');
    return false;
  }
  return password === adminPassword;
}

/** Verifica si la request tiene la cookie de admin */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME);
    return adminCookie?.value === ADMIN_COOKIE_VALUE;
  } catch {
    return false;
  }
}

/** Crea una respuesta con la cookie de admin (login) */
export function createAdminLoginResponse(): NextResponse {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  return response;
}

/** Crea una respuesta que elimina la cookie de admin (logout) */
export function createAdminLogoutResponse(): NextResponse {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}

/** Middleware para proteger rutas API de admin */
export function withAdminAuth(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'No autorizado. Iniciá sesión como administrador.' },
        { status: 401 }
      );
    }
    return handler(req);
  };
}
