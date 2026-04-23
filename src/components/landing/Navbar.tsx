// src/components/landing/Navbar.tsx
// Barra de navegación con glassmorphism y menú hamburguesa mobile

'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { href: '#beneficios', label: 'Beneficios' },
    { href: '#contenido', label: 'Temario' },
    { href: '#precio', label: 'Inscripción' },
    { href: '#faq', label: 'Preguntas' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-white/95 backdrop-blur-xl border-b border-[#d7ccc8] shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="relative w-9 h-9 sm:w-12 sm:h-12">
              <img 
                src="/logo.png" 
                alt="La Mackenna" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as any).style.display = 'none';
                  (e.target as any).nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full rounded-full bg-[#b04b2b] items-center justify-center text-white font-bold text-lg">
                M
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[#3e2723] font-bold text-base sm:text-xl leading-none">La Mackenna</span>
              <span className="text-[#b04b2b] text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase">Productos Artesanales</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#5d4037] hover:text-[#b04b2b] transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
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

          {/* Mobile: CTA compacto + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {user ? (
              <Link href="/dashboard">
                <Button size="sm" className="!px-3 !py-1.5 !text-xs">Mi Academia</Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="sm" className="!px-3 !py-1.5 !text-xs">Empezar</Button>
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#efebe9] transition-colors"
              aria-label="Menú"
            >
              <div className="w-5 h-5 relative flex flex-col justify-center items-center">
                <span
                  className={`block w-5 h-0.5 bg-[#3e2723] rounded-full transition-all duration-300 absolute ${
                    menuOpen ? 'rotate-45' : '-translate-y-1.5'
                  }`}
                />
                <span
                  className={`block w-5 h-0.5 bg-[#3e2723] rounded-full transition-all duration-300 ${
                    menuOpen ? 'opacity-0 scale-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`block w-5 h-0.5 bg-[#3e2723] rounded-full transition-all duration-300 absolute ${
                    menuOpen ? '-rotate-45' : 'translate-y-1.5'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          menuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-[#d7ccc8] px-4 pb-6 pt-4">
          {/* Nav links */}
          <div className="space-y-1 mb-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-2xl text-[#5d4037] hover:bg-[#efebe9] hover:text-[#b04b2b] transition-colors font-semibold text-base"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth section */}
          <div className="border-t border-[#d7ccc8] pt-4 space-y-3">
            {user ? (
              <>
                <p className="text-xs text-[#8d6e63] font-medium px-4 mb-2">Sesión de {user.name}</p>
                {user.role === 'admin' && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full" size="md">Panel Admin</Button>
                  </Link>
                )}
                <Button variant="ghost" className="w-full" size="md" onClick={() => { logout(); setMenuOpen(false); }}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link href="/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" className="w-full" size="md">Ingresar</Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full" size="md">Empezar</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
