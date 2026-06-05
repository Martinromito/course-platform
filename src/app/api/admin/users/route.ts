import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { getUsers } from '@/lib/data';

export const GET = withAdmin(async () => {
  const users = await getUsers();
  // Eliminar contraseñas por seguridad
  const safeUsers = users.map(({ password, ...u }) => u);
  
  return NextResponse.json({ users: safeUsers });
});

