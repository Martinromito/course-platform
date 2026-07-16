// src/app/api/admin/check/route.ts
// GET — Verifica si la sesión de administrador está activa

import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const authenticated = await isAdminAuthenticated();
  return NextResponse.json({ authenticated });
}
