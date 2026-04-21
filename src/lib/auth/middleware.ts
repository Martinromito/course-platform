// src/lib/auth/middleware.ts
// Middleware helper para proteger rutas de API

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

export type AuthenticatedHandler = (
  req: NextRequest,
  user: JWTPayload,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>;

/**
 * Envuelve un handler de API con verificación de autenticación
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (
    req: NextRequest,
    context?: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    try {
      const cookieToken = req.cookies.get('auth_token')?.value;
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : cookieToken;

      if (!token) {
        return NextResponse.json(
          { error: 'No autorizado. Por favor inicia sesión.' },
          { status: 401 }
        );
      }

      const user = verifyToken(token);
      return handler(req, user, context);
    } catch {
      return NextResponse.json(
        { error: 'Token inválido o expirado.' },
        { status: 401 }
      );
    }
  };
}

/**
 * Envuelve un handler con verificación de pago
 */
export function withPaidAccess(handler: AuthenticatedHandler) {
  return withAuth(async (req, user, context) => {
    if (!user.isPaid) {
      return NextResponse.json(
        { error: 'Acceso denegado. Debes completar el pago primero.' },
        { status: 403 }
      );
    }
    return handler(req, user, context);
  });
}

/**
 * Envuelve un handler con verificación de rol admin
 */
export function withAdmin(handler: AuthenticatedHandler) {
  return withAuth(async (req, user, context) => {
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador.' },
        { status: 403 }
      );
    }
    return handler(req, user, context);
  });
}
