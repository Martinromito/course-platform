// src/components/landing/Navbar.tsx
// Navbar ecommerce con buscar, login y carrito — Estilo minimalista artesanal

'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Productos' },
  { href: '/cursos', label: 'Cursos' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass-nav shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="relative w-9 h-9 lg:w-10 lg:h-10">
                <img
                  src="/logo.png"
                  alt="La Mackenna"
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[#1A1A1A] font-semibold text-base lg:text-lg leading-none tracking-tight">
                  La Mackenna
                </span>
                <span className="text-[#8B7355] text-[9px] lg:text-[10px] font-medium tracking-[0.15em] uppercase mt-0.5">
                  Productos Artesanales
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3.5 py-2 text-[#4A4A4A] hover:text-[#8B7355] transition-colors text-[13px] font-medium rounded-lg hover:bg-[#8B7355]/5"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-lg text-[#4A4A4A] hover:text-[#8B7355] hover:bg-[#8B7355]/5 transition-all"
                aria-label="Buscar"
                id="btn-search"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              {/* Auth */}
              {user ? (
                <div className="flex items-center gap-1">
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="px-3 py-2 text-[13px] font-medium text-[#4A4A4A] hover:text-[#8B7355] hover:bg-[#8B7355]/5 rounded-lg transition-all"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="px-3 py-2 text-[13px] font-medium text-[#4A4A4A] hover:text-[#8B7355] hover:bg-[#8B7355]/5 rounded-lg transition-all"
                  >
                    Mi cuenta
                  </Link>
                  <button
                    onClick={logout}
                    className="px-3 py-2 text-[13px] font-medium text-[#7A6E60] hover:text-[#8B7355] hover:bg-[#8B7355]/5 rounded-lg transition-all"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-2.5 rounded-lg text-[#4A4A4A] hover:text-[#8B7355] hover:bg-[#8B7355]/5 transition-all"
                  aria-label="Iniciar sesión"
                  id="btn-login"
                >
                  <User className="w-[18px] h-[18px]" />
                </Link>
              )}

              {/* Cart */}
              <button
                className="p-2.5 rounded-lg text-[#4A4A4A] hover:text-[#8B7355] hover:bg-[#8B7355]/5 transition-all relative"
                aria-label="Carrito"
                id="btn-cart"
              >
                <ShoppingBag className="w-[18px] h-[18px]" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#8B7355] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  0
                </span>
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-1">
              <button
                className="p-2.5 rounded-lg text-[#4A4A4A] hover:text-[#8B7355] transition-all relative"
                aria-label="Carrito"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#8B7355] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  0
                </span>
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2.5 rounded-lg text-[#4A4A4A] hover:text-[#8B7355] transition-all"
                aria-label="Menú"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar (Desktop) */}
        <div
          className={`hidden lg:block overflow-hidden transition-all duration-300 ${
            searchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="max-w-2xl mx-auto px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6E60]" />
              <input
                type="text"
                placeholder="Buscar productos, cursos, herramientas..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#1A1A1A] placeholder-[#7A6E60] text-sm focus:border-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#8B7355]/10 transition-all"
                id="search-input"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          menuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMenuOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute top-0 right-0 w-full max-w-sm h-full bg-[#FFFDF9] shadow-2xl transition-transform duration-300 ease-out ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E8E2D9]">
              <span className="font-semibold text-[#1A1A1A]">Menú</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-[#F2F0ED] transition-colors"
              >
                <X className="w-5 h-5 text-[#4A4A4A]" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6E60]" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E8E2D9] bg-white text-sm placeholder-[#7A6E60] focus:border-[#8B7355] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center px-4 py-3.5 rounded-lg text-[#1A1A1A] hover:bg-[#F2F0ED] transition-colors font-medium text-[15px]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="border-t border-[#E8E2D9] p-4 space-y-2">
              {user ? (
                <>
                  <p className="text-xs text-[#7A6E60] font-medium px-2 mb-2">
                    Hola, {user.name}
                  </p>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-[#4A4A4A] hover:bg-[#F2F0ED] transition-colors font-medium text-sm"
                    >
                      Panel Admin
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-[#8B7355] text-white font-medium text-sm hover:bg-[#705E45] transition-colors"
                  >
                    Mi cuenta
                  </Link>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full px-4 py-3 rounded-lg text-[#7A6E60] hover:bg-[#F2F0ED] transition-colors font-medium text-sm text-center"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 px-4 py-3 rounded-lg border border-[#E8E2D9] text-[#4A4A4A] font-medium text-sm text-center hover:bg-[#F2F0ED] transition-colors"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 px-4 py-3 rounded-lg bg-[#8B7355] text-white font-medium text-sm text-center hover:bg-[#705E45] transition-colors"
                  >
                    Crear cuenta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
