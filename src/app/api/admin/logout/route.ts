// src/app/api/admin/logout/route.ts
// POST — Elimina la cookie httpOnly de administrador

import { NextRequest } from 'next/server';
import { createAdminLogoutResponse } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  return createAdminLogoutResponse();
}
