// src/app/api/auth/me/route.ts
// Obtiene la sesión actual del usuario usando el token JWT y la base JSON

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserById } from '@/lib/data';
import { MOCK_USERS } from '@/lib/constants/users';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Verificar y decodificar el token
    const payload = verifyToken(token);
    let userData = null;

    // Buscar el usuario en la "base de datos" (JSON)
    const user = await getUserById(payload.userId);
    if (user) {
      userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPaid: user.isPaid,
      };
    } else {
      // Si no existe, revisar mocks
      if (payload.email === MOCK_USERS.student.email) {
        userData = { ...MOCK_USERS.student, id: payload.userId };
      } else if (payload.email === MOCK_USERS.admin.email) {
        userData = { ...MOCK_USERS.admin, id: payload.userId };
      } else {
        // El usuario ya no existe o es un mock user viejo
        return NextResponse.json({ user: null }, { status: 200 });
      }
    }

    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    // Si el token expiró o es inválido, devolvemos user: null silenciosamente
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
