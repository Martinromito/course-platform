// src/app/api/auth/me/route.ts
// Retorna el usuario autenticado actual

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const payload = verifyToken(token);
    
    // --- MOCK USERS CHECK ---
    const { MOCK_USERS } = require('@/lib/constants/users');
    if (payload.userId === 'mock-student-id' || payload.userId === 'mock-admin-id') {
      const isStudent = payload.userId === 'mock-student-id';
      const mockUser = isStudent ? MOCK_USERS.student : MOCK_USERS.admin;
      return NextResponse.json({ 
        user: {
          id: payload.userId,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          isPaid: mockUser.isPaid
        } 
      });
    }
    // --- END MOCK USERS CHECK ---

    try {
      await connectDB();
      const user = await User.findById(payload.userId).select('-password');
      if (!user) {
        return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
      }
      return NextResponse.json({ user });
    } catch (dbError) {
      // Si la DB falla pero el token es de un usuario real, no podemos recuperarlo,
      // pero si es mock ya lo manejamos arriba.
      return NextResponse.json({ error: 'Error de conexión a la base de datos.' }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
  }
}
