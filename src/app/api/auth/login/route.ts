// src/app/api/auth/login/route.ts
// Endpoint de inicio de sesión

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth/jwt';
import { MOCK_USERS } from '@/lib/constants/users';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos.' },
        { status: 400 }
      );
    }

    // --- MOCK USERS CHECK (Fallback para desarrollo) ---
    const isMockStudent = email === MOCK_USERS.student.email && password === MOCK_USERS.student.password;
    const isMockAdmin = email === MOCK_USERS.admin.email && password === MOCK_USERS.admin.password;

    if (isMockStudent || isMockAdmin) {
      const mockUser = isMockStudent ? MOCK_USERS.student : MOCK_USERS.admin;
      const token = signToken({
        userId: isMockStudent ? 'mock-student-id' : 'mock-admin-id',
        email: mockUser.email,
        role: mockUser.role as 'student' | 'admin',
        isPaid: mockUser.isPaid,
      });

      const response = NextResponse.json({
        message: 'Sesión iniciada (MOCK MODE).',
        user: {
          id: isMockStudent ? 'mock-student-id' : 'mock-admin-id',
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          isPaid: mockUser.isPaid,
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
    }
    // --- END MOCK USERS CHECK ---

    await connectDB();
    // Buscar usuario e incluir el campo password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas.' },
        { status: 401 }
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas.' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      isPaid: user.isPaid,
    });

    const response = NextResponse.json({
      message: 'Sesión iniciada correctamente.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPaid: user.isPaid,
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
