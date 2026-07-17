// src/app/api/admin/upload/route.ts
// API de subida de archivos para administradores — guarda imágenes en Vercel Blob (prod) o localmente (dev)

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/admin-auth';
import { promises as fs } from 'fs';
import path from 'path';
import { put } from '@vercel/blob';

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se subió ningún archivo.' }, { status: 400 });
    }

    // 1. Validar el tamaño del archivo (Max 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: 'El archivo excede el tamaño máximo permitido (5MB).' },
        { status: 400 }
      );
    }

    // 2. Validar que sea una imagen (Mime-type y Extensión)
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];
    const ext = path.extname(file.name).toLowerCase();
    const allowedExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];

    if (!allowedMimeTypes.includes(file.type) || !allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se aceptan imágenes (PNG, JPG, WEBP, GIF, SVG).' },
        { status: 400 }
      );
    }

    // 3. Generar nombre de archivo único
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedOriginalName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Reemplaza caracteres especiales
      .substring(0, 30); // Limita el largo
    const filename = `${uniqueSuffix}-${sanitizedOriginalName}`;

    // 4. Subida híbrida: Vercel Blob (si está configurado) vs Local fs (desarrollo)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(filename, file, {
          access: 'public',
        });
        return NextResponse.json({ url: blob.url }, { status: 201 });
      } catch (blobError) {
        console.error('[ADMIN VERCEL BLOB UPLOAD ERROR]', blobError);
        return NextResponse.json(
          { error: 'Error al subir a Vercel Blob. Verifica tus credenciales de Storage.' },
          { status: 500 }
        );
      }
    }

    // Si estamos en producción en Vercel pero falta el token del Storage
    if (process.env.VERCEL === '1') {
      return NextResponse.json(
        {
          error:
            'No se puede guardar archivos localmente en Vercel. Por favor, conecta una base de datos de Storage (Vercel Blob) desde tu consola de Vercel.',
        },
        { status: 400 }
      );
    }

    // Fallback: Guardar localmente (entorno de desarrollo)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error('[ADMIN UPLOAD ERROR]', error);
    return NextResponse.json({ error: 'Error interno al subir el archivo.' }, { status: 500 });
  }
});
