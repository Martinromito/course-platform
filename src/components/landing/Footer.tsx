// src/components/landing/Footer.tsx
// Footer completo y profesional estilo ecommerce minimalista artesanal

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(console.error);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#FAF8F4] border-t border-[#E8E2D9] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Columna 1: Info Marca */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8">
                <img
                  src={settings?.shopLogo || "/logo.png"}
                  alt={settings?.shopName || "La Mackenna"}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[#1A1A1A] font-semibold text-lg tracking-tight">
                {settings?.shopName || "La Mackenna"}
              </span>
            </Link>
            <p className="text-[#4A4A4A] text-sm leading-relaxed max-w-sm">
              Combinamos el arte de las técnicas tradicionales con el diseño moderno. Creá piezas únicas para tu hogar y tus proyectos creativos.
            </p>
            {/* Redes Sociales */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white border border-[#E8E2D9] flex items-center justify-center text-[#7A6E60] hover:text-[#8B7355] hover:border-[#8B7355] transition-all"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white border border-[#E8E2D9] flex items-center justify-center text-[#7A6E60] hover:text-[#8B7355] hover:border-[#8B7355] transition-all"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white border border-[#E8E2D9] flex items-center justify-center text-[#7A6E60] hover:text-[#8B7355] hover:border-[#8B7355] transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-[18px] h-[18px]" />
              </a>
            </div>
          </div>

          {/* Columna 2: Links Tienda */}
          <div>
            <h3 className="text-[#1A1A1A] font-semibold text-sm uppercase tracking-wider mb-4">
              Tienda
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/productos" className="text-[#4A4A4A] hover:text-[#8B7355] text-sm transition-colors">
                  Todos los productos
                </Link>
              </li>
              <li>
                <Link href="/productos?cat=pinturas-fluidas" className="text-[#4A4A4A] hover:text-[#8B7355] text-sm transition-colors">
                  Pinturas Fluidas
                </Link>
              </li>
              <li>
                <Link href="/productos?cat=kits" className="text-[#4A4A4A] hover:text-[#8B7355] text-sm transition-colors">
                  Kits Completos
                </Link>
              </li>
              <li>
                <Link href="/productos?cat=herramientas" className="text-[#4A4A4A] hover:text-[#8B7355] text-sm transition-colors">
                  Herramientas
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Links Academia */}
          <div>
            <h3 className="text-[#1A1A1A] font-semibold text-sm uppercase tracking-wider mb-4">
              Academia
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/cursos" className="text-[#4A4A4A] hover:text-[#8B7355] text-sm transition-colors">
                  Ver todos los cursos
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-[#4A4A4A] hover:text-[#8B7355] text-sm transition-colors">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-[#4A4A4A] hover:text-[#8B7355] text-sm transition-colors">
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Newsletter */}
          <div>
            <h3 className="text-[#1A1A1A] font-semibold text-sm uppercase tracking-wider mb-4">
              Newsletter
            </h3>
            <p className="text-[#4A4A4A] text-sm leading-relaxed mb-4">
              Suscribite para recibir novedades, promociones y tutoriales exclusivos en tu e-mail.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 rounded-lg border border-[#E8E2D9] bg-white text-sm placeholder-[#7A6E60] focus:border-[#8B7355] focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-[#8B7355] hover:text-[#705E45] transition-colors"
                  aria-label="Suscribirse"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {subscribed && (
                <p className="text-[#8B7355] text-xs font-medium animate-fade-in">
                  ¡Gracias por suscribirte a nuestro newsletter! ✨
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Separador y Footer Bottom */}
        <div className="border-t border-[#E8E2D9] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#7A6E60] text-xs text-center sm:text-left">
            © {new Date().getFullYear()} {settings?.shopName || 'La Mackenna'}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-xs text-[#7A6E60]">
            <Link href="/terminos" className="hover:text-[#8B7355] transition-colors">
              Términos de servicio
            </Link>
            <Link href="/privacidad" className="hover:text-[#8B7355] transition-colors">
              Política de privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
