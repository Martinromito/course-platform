// src/app/api/talleres/logout/route.ts
// POST — Cierra la sesión del estudiante eliminando la cookie de acceso

import { NextResponse } from 'next/server';

const STUDENT_COOKIE_NAME = 'lamackenna_student';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(STUDENT_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
