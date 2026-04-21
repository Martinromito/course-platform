// src/components/landing/Navbar.tsx
// Barra de navegación con glassmorphism

'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-[#d7ccc8] shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <img 
                src="/logo.png" 
                alt="La Mackenna" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  (e.target as any).style.display = 'none';
                  (e.target as any).nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full rounded-full bg-[#b04b2b] items-center justify-center text-white font-bold text-lg">
                M
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[#3e2723] font-bold text-xl leading-none">La Mackenna</span>
              <span className="text-[#b04b2b] text-[10px] font-semibold tracking-widest uppercase">Productos Artesanales</span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#beneficios" className="text-[#5d4037] hover:text-[#b04b2b] transition-colors text-sm font-medium">Beneficios</a>
            <a href="#contenido" className="text-[#5d4037] hover:text-[#b04b2b] transition-colors text-sm font-medium">Temario</a>
            <a href="#precio" className="text-[#5d4037] hover:text-[#b04b2b] transition-colors text-sm font-medium">Inscripción</a>
            <a href="#faq" className="text-[#5d4037] hover:text-[#b04b2b] transition-colors text-sm font-medium">Preguntas</a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">Admin</Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button size="sm">Mi Academia</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>Salir</Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Ingresar</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Empezar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
