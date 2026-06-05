// src/app/api/auth/register/route.ts
// Endpoint de registro de usuarios — 100% JSON

import { NextRequest, NextResponse } from 'next/server';
import { getUsers, saveUsers, type User } from '@/lib/data';
import { signToken } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validaciones básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const users = await getUsers();

    // Verificar si el email ya existe
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con ese email.' },
        { status: 409 }
      );
    }

    // Verificar si es el primer admin
    const adminEmail = process.env.ADMIN_EMAIL;
    const role = email.toLowerCase() === adminEmail?.toLowerCase() ? 'admin' : 'student';

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const newUser: User = {
      _id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isPaid: false, // Por defecto, no pagó
      completedLessons: [],
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await saveUsers(users);

    // Generar token
    const token = signToken({
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role,
      isPaid: newUser.isPaid,
    });

    const response = NextResponse.json({
      message: 'Cuenta creada exitosamente.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isPaid: newUser.isPaid,
      },
    }, { status: 201 });

    // Guardar token en cookie httpOnly
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[REGISTER ERROR]', error);
    return NextResponse.json(
      { error: `Error interno: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}
