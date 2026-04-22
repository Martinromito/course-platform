// src/app/api/auth/register/route.ts
// Endpoint de registro de usuarios

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
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

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con ese email.' },
        { status: 409 }
      );
    }

    // Verificar si es el primer admin
    const adminEmail = process.env.ADMIN_EMAIL;
    const role = email === adminEmail ? 'admin' : 'student';

    // Crear usuario
    const user = await User.create({ name, email, password, role });

    // Generar token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      isPaid: user.isPaid,
    });

    const response = NextResponse.json({
      message: 'Cuenta creada exitosamente.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPaid: user.isPaid,
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
    
    // Si es un error de MongoDB (por ejemplo, conexión rechazada)
    if (error.name === 'MongooseServerSelectionError') {
      return NextResponse.json(
        { error: 'No se pudo conectar a la base de datos. Por favor verifica que MongoDB esté corriendo.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: `Error interno: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}
