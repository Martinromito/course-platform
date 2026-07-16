// src/components/landing/HeroSection.tsx
// Hero principal — Dual: productos + cursos, estilo artesanal minimalista

'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useState, useEffect } from 'react';

export default function HeroSection() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(console.error);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20 lg:pt-0">
      {/* Fondo sutil */}
      <div className="absolute inset-0 bg-[#FAF8F4]">
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-[#8B7355]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#C5A059]/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Columna izquierda — Texto */}
          <div className="flex-1 text-center lg:text-left max-w-xl lg:max-w-none">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#8B7355]/15 bg-[#8B7355]/[0.06] text-[#8B7355] text-xs font-medium mb-8 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B7355]" />
              Tienda artesanal &amp; academia creativa de {settings?.shopName || 'La Mackenna'}
            </div>

            {/* Título */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold text-[#1A1A1A] leading-[1.1] mb-6 animate-fade-in-up">
              {settings?.shopTitle || 'Creá piezas únicas para tu hogar y tus proyectos creativos'}
            </h1>

            {/* Subtítulo */}
            <p className="text-base sm:text-lg text-[#4A4A4A] max-w-lg lg:max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed animate-fade-in-up delay-100">
              {settings?.shopSubtitle || 'Descubrí productos artesanales, insumos exclusivos y capacitaciones para aprender nuevas técnicas.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3 animate-fade-in-up delay-200">
              <Link href="/productos" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Ver productos
                </Button>
              </Link>
              <Link href="/talleres" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explorar talleres
                </Button>
              </Link>
            </div>

            {/* Micro-stats */}
            <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 mt-10 animate-fade-in delay-300">
              <div className="text-center lg:text-left">
                <p className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">{settings?.statsProducts || '200+'}</p>
                <p className="text-xs text-[#7A6E60] font-medium">Productos</p>
              </div>
              <div className="w-px h-8 bg-[#E8E2D9]" />
              <div className="text-center lg:text-left">
                <p className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">{settings?.statsWorkshops || '10+'}</p>
                <p className="text-xs text-[#7A6E60] font-medium">Talleres</p>
              </div>
              <div className="w-px h-8 bg-[#E8E2D9]" />
              <div className="text-center lg:text-left">
                <p className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">{settings?.statsAlumnas || '1.500+'}</p>
                <p className="text-xs text-[#7A6E60] font-medium">Alumnas</p>
              </div>
            </div>
          </div>

          {/* Columna derecha — Imagen */}
          <div className="flex-1 relative animate-fade-in delay-200 w-full max-w-md lg:max-w-lg xl:max-w-xl">
            <div className="relative w-full aspect-[4/5] rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl shadow-[#8B7355]/10">
              <img
                src={settings?.shopImage || '/images/hero.png'}
                alt={`Productos artesanales ${settings?.shopName || 'La Mackenna'} — pinturas fluidas, kits y herramientas`}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay suave */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/10 via-transparent to-transparent" />
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-[#E8E2D9]/60 animate-fade-in-up delay-400">
              <p className="text-[#8B7355] font-semibold text-sm flex items-center gap-2">
                <span className="text-base">✨</span> 100% Hecho a mano
              </p>
            </div>

            {/* Decorative element */}
            <div className="hidden lg:block absolute -top-4 -right-4 w-24 h-24 border-2 border-[#8B7355]/10 rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
