// src/app/api/admin/users/route.ts
// Lista todos los usuarios (solo admin)

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { withAdmin } from '@/lib/auth/middleware';

export const GET = withAdmin(async () => {
  await connectDB();
  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 });

  return NextResponse.json({ users });
});
