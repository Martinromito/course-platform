// src/app/api/course/progress/route.ts
// Gestiona el progreso del usuario: marcar lecciones como completadas

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { withPaidAccess } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import mongoose from 'mongoose';

// GET: Obtener progreso del usuario
export const GET = withPaidAccess(async (_req: NextRequest, user: JWTPayload) => {
  await connectDB();
  const dbUser = await User.findById(user.userId).select('completedLessons');
  return NextResponse.json({ completedLessons: dbUser?.completedLessons ?? [] });
});

// POST: Marcar lección como completada
export const POST = withPaidAccess(async (req: NextRequest, user: JWTPayload) => {
  const { lessonId } = await req.json();

  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId es requerido.' }, { status: 400 });
  }

  await connectDB();
  const lessonObjectId = new mongoose.Types.ObjectId(lessonId);

  await User.findByIdAndUpdate(user.userId, {
    $addToSet: { completedLessons: lessonObjectId },
  });

  return NextResponse.json({ message: 'Lección marcada como completada.' });
});

// DELETE: Desmarcar lección
export const DELETE = withPaidAccess(async (req: NextRequest, user: JWTPayload) => {
  const { lessonId } = await req.json();

  await connectDB();
  const lessonObjectId = new mongoose.Types.ObjectId(lessonId);

  await User.findByIdAndUpdate(user.userId, {
    $pull: { completedLessons: lessonObjectId },
  });

  return NextResponse.json({ message: 'Progreso actualizado.' });
});
