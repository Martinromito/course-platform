// src/lib/constants/users.ts

export const MOCK_USERS = {
  student: {
    name: 'Estudiante',
    email: 'estudiante@estudiante.com',
    password: '12345678',
    role: 'student',
    isPaid: true,
  },
  admin: {
    name: 'Administrador',
    email: 'admin@admin.com',
    password: '12345678',
    role: 'admin',
    isPaid: true,
  }
};

export type MockUserType = typeof MOCK_USERS;
