// src/components/landing/HeroSection.tsx
// Sección hero con animaciones y CTA

'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Fondo con tonos cálidos y texturas orgánicas */}
      <div className="absolute inset-0 bg-[#fdfaf5]">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#e9a68a]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#b04b2b]/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* Papel texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")`,
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
        <div className="flex-1">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#b04b2b]/20 bg-[#b04b2b]/5 text-[#b04b2b] text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#b04b2b] animate-pulse" />
            🧶 Aprende el arte de las manos
          </div>

          {/* Título */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#3e2723] leading-[1.1] mb-6 animate-fade-in-up">
            Crea piezas únicas con{' '}
            <span className="text-[#b04b2b] italic">
              tus propias manos
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl sm:text-2xl text-[#5d4037] max-w-2xl lg:mx-0 mx-auto mb-10 leading-relaxed animate-fade-in-up delay-100">
            Curso completo de cestería, textiles y objetos artesanales. Desde servilleteros cocidos hasta cestos de diseño. Transforma tu pasión en un emprendimiento.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4 animate-fade-in-up delay-200">
            {user?.isPaid ? (
              <Link href="/dashboard">
                <Button size="xl">Continuar creando →</Button>
              </Link>
            ) : (
              <>
                <a href="#precio">
                  <Button size="xl">
                    🧵 Inscribirme al curso
                  </Button>
                </a>
                <a href="#contenido">
                  <Button variant="outline" size="xl">
                    Ver proyectos
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Imagen representativa */}
        <div className="flex-1 relative animate-fade-in delay-300">
          <div className="relative w-full aspect-square max-w-[500px] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
            <img 
              src="https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=1000" 
              alt="Artesanías La Mackenna" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3e2723]/40 to-transparent" />
          </div>
          {/* Elementos decorativos floating */}
          <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-[#d7ccc8] animate-bounce delay-700">
            <p className="text-[#b04b2b] font-bold text-sm">✨ 100% Hecho a mano</p>
          </div>
        </div>
      </div>
    </section>
  );
}
