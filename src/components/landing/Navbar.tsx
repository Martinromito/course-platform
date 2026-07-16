// src/components/landing/Navbar.tsx
// Navbar ecommerce con login admin simple y carrito — Estilo minimalista artesanal

'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import { Search, ShoppingBag, Menu, X, Settings } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Productos' },
  { href: '/talleres', label: 'Talleres Online' },
  { href: '/talleres/mis-talleres', label: 'Mis Talleres' },
];

export default function Navbar() {
  const { totalItems, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(console.error);
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
                <div className="w-full h-full rounded-full bg-[#8B7355] flex items-center justify-center text-white font-serif font-bold text-lg">
                  {settings?.shopName ? settings.shopName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'LM'}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[#1A1A1A] font-semibold text-base lg:text-lg leading-none tracking-tight">
                  {settings?.shopName || 'La Mackenna'}
                </span>
                <span className="text-[#8B7355] text-[9px] lg:text-[10px] font-medium tracking-[0.15em] uppercase mt-0.5">
                  Productos & Talleres
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

              {/* Admin Panel Link */}
              <Link
                href="/admin"
                className="p-2.5 rounded-lg text-[#4A4A4A] hover:text-[#8B7355] hover:bg-[#8B7355]/5 transition-all"
                aria-label="Administración"
                id="btn-admin"
              >
                <Settings className="w-[18px] h-[18px]" />
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="p-2.5 rounded-lg text-[#4A4A4A] hover:text-[#8B7355] hover:bg-[#8B7355]/5 transition-all relative"
                aria-label="Carrito"
                id="btn-cart"
              >
                <ShoppingBag className="w-[18px] h-[18px]" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#8B7355] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-1">
              <button
                onClick={openCart}
                className="p-2.5 rounded-lg text-[#4A4A4A] hover:text-[#8B7355] transition-all relative"
                aria-label="Carrito"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#8B7355] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
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
                placeholder="Buscar productos, talleres, herramientas..."
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

            {/* Actions Section */}
            <div className="border-t border-[#E8E2D9] p-4 space-y-2">
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-[#E8E2D9] text-[#4A4A4A] font-medium text-sm hover:bg-[#F2F0ED] transition-colors"
              >
                Panel Administrador
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
