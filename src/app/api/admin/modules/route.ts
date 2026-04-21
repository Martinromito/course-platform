// src/app/api/admin/modules/route.ts
// CRUD de módulos (solo admin)

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Module } from '@/lib/models/Course';
import { withAdmin } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';

// GET: Listar todos los módulos
export const GET = withAdmin(async () => {
  await connectDB();
  const modules = await Module.find().sort({ order: 1 });
  return NextResponse.json({ modules });
});

// POST: Crear nuevo módulo
export const POST = withAdmin(async (req: NextRequest, _user: JWTPayload) => {
  const { title, description, order } = await req.json();

  if (!title || order === undefined) {
    return NextResponse.json(
      { error: 'Título y orden son requeridos.' },
      { status: 400 }
    );
  }

  await connectDB();
  const module = await Module.create({ title, description: description ?? '', order, lessons: [] });
  return NextResponse.json({ module }, { status: 201 });
});
