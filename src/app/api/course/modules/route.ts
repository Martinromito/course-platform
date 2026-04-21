// src/app/api/course/modules/route.ts
// Obtiene todos los módulos con sus lecciones (requiere pago para ver contenido completo)

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Module } from '@/lib/models/Course';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Verificar si el usuario está autenticado y pagó
    let isPaid = false;
    try {
      const token = req.cookies.get('auth_token')?.value;
      if (token) {
        const payload = verifyToken(token);
        isPaid = payload.isPaid;
      }
    } catch {
      // No autenticado, solo mostrar previews
    }

    const modules = await Module.find().sort({ order: 1 }).lean();

    // Si no pagó, ocultar la URL de videos que no son preview
    const sanitizedModules = modules.map((mod) => ({
      ...mod,
      lessons: mod.lessons
        .sort((a, b) => a.order - b.order)
        .map((lesson) => ({
          ...lesson,
          videoUrl: isPaid || lesson.isPreview ? lesson.videoUrl : null,
        })),
    }));

    return NextResponse.json({ modules: sanitizedModules });
  } catch (error) {
    console.error('[GET MODULES ERROR]', error);
    return NextResponse.json(
      { error: 'Error al obtener los módulos.' },
      { status: 500 }
    );
  }
}
