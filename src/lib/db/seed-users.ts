// src/lib/db/seed-users.ts
import mongoose from 'mongoose';
import User from '../models/User';
import { MOCK_USERS } from '../constants/users';
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI no está definido en .env.local');
  process.exit(1);
}

async function seed() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Conexión exitosa.');

    // Limpiar usuarios de prueba previos (opcional)
    console.log('Limpiando usuarios de prueba anteriores...');
    await User.deleteMany({
      email: { $in: [MOCK_USERS.student.email, MOCK_USERS.admin.email] }
    });

    console.log('Creando usuario cliente (student)...');
    await User.create(MOCK_USERS.student);

    console.log('Creando usuario administrador (admin)...');
    await User.create(MOCK_USERS.admin);

    console.log('--- SEED COMPLETADO CON ÉXITO ---');
    console.log(`Cliente: ${MOCK_USERS.student.email} / ${MOCK_USERS.student.password}`);
    console.log(`Admin:   ${MOCK_USERS.admin.email} / ${MOCK_USERS.admin.password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error durante el seeding:', error);
    process.exit(1);
  }
}

seed();
