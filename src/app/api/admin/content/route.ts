// src/app/api/admin/content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Module } from '@/lib/models/Course';
import { verifyToken } from '@/lib/auth/jwt';

// Helper para verificar si es admin
async function checkAdmin(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return false;
  try {
    const payload = verifyToken(token);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const data = await req.json();

  try {
    await connectDB();
    
    // Crear un nuevo módulo
    const newModule = await Module.create({
      title: data.title || 'Nuevo Módulo',
      description: data.description || '',
      order: data.order || 0,
      lessons: data.lessons || []
    });

    return NextResponse.json({ message: 'Módulo creado', module: newModule });
  } catch (error: any) {
    console.error('[POST MODULE ERROR]', error);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('topology')) {
      console.warn('[MOCK MODE] Simulando éxito en creación (DB desconectada)');
      return NextResponse.json({ 
        message: 'Módulo creado (Modo Simulación)', 
        module: { ...data, _id: `mock-${Date.now()}` } 
      });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!await checkAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    await connectDB();
    await Module.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Módulo eliminado' });
  } catch (error: any) {
    console.error('[DELETE MODULE ERROR]', error);

    if (error.message.includes('ECONNREFUSED') || error.message.includes('topology')) {
      console.warn('[MOCK MODE] Simulando éxito en eliminación (DB desconectada)');
      return NextResponse.json({ message: 'Módulo eliminado (Modo Simulación)' });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
