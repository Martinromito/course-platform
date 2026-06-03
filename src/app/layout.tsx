// src/app/layout.tsx
// Layout raíz con providers globales — Rediseño ecommerce + cursos

import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'La Mackenna — Productos Artesanales y Cursos Creativos',
  description:
    'Descubrí productos artesanales, insumos exclusivos y capacitaciones para aprender nuevas técnicas. Pinturas fluidas, kits, herramientas y más.',
  keywords: 'productos artesanales, pinturas fluidas, cursos creativos, kits artesanales, herramientas, La Mackenna',
  openGraph: {
    title: 'La Mackenna — Productos Artesanales y Cursos Creativos',
    description: 'Tu tienda de productos artesanales y academia de técnicas creativas.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="bg-[#FAF8F4] text-[#1A1A1A] antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#FFFDF9',
                color: '#1A1A1A',
                border: '1px solid #E8E2D9',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
