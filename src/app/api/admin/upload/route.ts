// src/app/api/admin/upload/route.ts
// API de subida de archivos para administradores — guarda imágenes localmente en public/uploads/

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/admin-auth';
import { promises as fs } from 'fs';
import path from 'path';

// Desactivamos bodyParser por defecto de Next.js si fuera necesario, pero en App Router no hace falta.
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

    // 3. Convertir el archivo a un Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Asegurar el directorio de subidas public/uploads/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // 5. Generar nombre de archivo único
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedOriginalName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Reemplaza caracteres especiales
      .substring(0, 30); // Limita el largo
    const filename = `${uniqueSuffix}-${sanitizedOriginalName}`;
    const filePath = path.join(uploadDir, filename);

    // 6. Escribir archivo al disco
    await fs.writeFile(filePath, buffer);

    // 7. Retornar la URL pública accesible
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error('[ADMIN UPLOAD ERROR]', error);
    return NextResponse.json({ error: 'Error interno al subir el archivo.' }, { status: 500 });
  }
});
