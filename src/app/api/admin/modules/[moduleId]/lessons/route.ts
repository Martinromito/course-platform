// src/app/api/admin/modules/[moduleId]/lessons/route.ts
// Gestión de lecciones dentro de un módulo (solo admin)

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Module } from '@/lib/models/Course';
import { withAdmin } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import mongoose from 'mongoose';

type Context = { params: { moduleId: string } };

// POST: Agregar lección a un módulo
export const POST = withAdmin(async (req: NextRequest, _user: JWTPayload, context?: { params: Record<string, string> }) => {
  const moduleId = context?.params?.moduleId;

  if (!moduleId) {
    return NextResponse.json({ error: 'moduleId requerido.' }, { status: 400 });
  }

  const { title, description, videoUrl, videoType, duration, order, isPreview } = await req.json();

  if (!title || !videoUrl || order === undefined) {
    return NextResponse.json(
      { error: 'Título, URL de video y orden son requeridos.' },
      { status: 400 }
    );
  }

  await connectDB();

  const lesson = {
    _id: new mongoose.Types.ObjectId(),
    title,
    description: description ?? '',
    videoUrl,
    videoType: videoType ?? 'youtube',
    duration: duration ?? 0,
    order,
    isPreview: isPreview ?? false,
    moduleId: new mongoose.Types.ObjectId(moduleId),
  };

  const module = await Module.findByIdAndUpdate(
    moduleId,
    { $push: { lessons: lesson } },
    { new: true }
  );

  if (!module) {
    return NextResponse.json({ error: 'Módulo no encontrado.' }, { status: 404 });
  }

  return NextResponse.json({ lesson }, { status: 201 });
});
