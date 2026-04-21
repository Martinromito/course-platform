// src/app/layout.tsx
// Layout raíz con providers globales

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'La Mackenna — Curso de Objetos Artesanales',
  description:
    'Aprende a crear cestos, textiles y objetos únicos para el hogar. Transforma tu pasión en un emprendimiento con nuestro curso completo.',
  keywords: 'cestería, objetos artesanales, curso costura, servilleteros cocidos, emprendimiento artesanal',
  openGraph: {
    title: 'La Mackenna — Academia de Artesanías',
    description: 'Aprende el arte de crear con tus manos con La Mackenna.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-slate-950 text-white antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
