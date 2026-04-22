// src/lib/auth/jwt.ts
// Utilidades para generación y verificación de JWT

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_only_for_build';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'admin';
  isPaid: boolean;
}

/**
 * Genera un token JWT para el usuario
 */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Verifica y decodifica un JWT
 */
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

/**
 * Extrae el token del header Authorization o cookie
 */
export function extractToken(authHeader?: string | null, cookieToken?: string): string | null {
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return cookieToken ?? null;
}
