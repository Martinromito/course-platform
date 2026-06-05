// src/app/api/auth/login/route.ts
// Endpoint de inicio de sesión — 100% JSON

import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/data';
import { signToken } from '@/lib/auth/jwt';
import { MOCK_USERS } from '@/lib/constants/users';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos.' },
        { status: 400 }
      );
    }

    // Buscar el usuario en nuestro JSON
    const user = await getUserByEmail(email);
    let isMatch = false;

    // Si no está en el JSON, verificamos si es uno de los MOCK_USERS (para legacy/pruebas)
    const isMockStudent = email === MOCK_USERS.student.email && password === MOCK_USERS.student.password;
    const isMockAdmin = email === MOCK_USERS.admin.email && password === MOCK_USERS.admin.password;

    let finalUser: any = null;

    if (user && user.password) {
      // Comparar contraseña real
      isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) finalUser = user;
    } else if (isMockStudent || isMockAdmin) {
      // Usar mock
      isMatch = true;
      const mockUser = isMockStudent ? MOCK_USERS.student : MOCK_USERS.admin;
      finalUser = {
        _id: isMockStudent ? 'mock-student-id' : 'mock-admin-id',
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        isPaid: mockUser.isPaid,
      };
    }

    if (!isMatch || !finalUser) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas.' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: finalUser._id,
      email: finalUser.email,
      role: finalUser.role,
      isPaid: finalUser.isPaid,
    });

    const response = NextResponse.json({
      message: 'Sesión iniciada correctamente.',
      user: {
        id: finalUser._id,
        name: finalUser.name,
        email: finalUser.email,
        role: finalUser.role,
        isPaid: finalUser.isPaid,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
