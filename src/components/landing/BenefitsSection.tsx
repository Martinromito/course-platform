// src/components/landing/BenefitsSection.tsx
// Sección de beneficios con iconos Lucide — Diseño compacto y limpio

import { Package, BookOpen, Users, MessageCircle } from 'lucide-react';

const benefits = [
  {
    icon: Package,
    title: 'Productos seleccionados',
    description: 'Materiales e insumos de primera calidad, testeados por nuestro equipo.',
  },
  {
    icon: BookOpen,
    title: 'Cursos paso a paso',
    description: 'Video-lecciones claras y detalladas, desde lo básico hasta lo avanzado.',
  },
  {
    icon: Users,
    title: 'Comunidad de alumnas',
    description: 'Grupo privado para compartir proyectos, dudas y experiencias.',
  },
  {
    icon: MessageCircle,
    title: 'Atención personalizada',
    description: 'Soporte directo para resolver tus consultas sobre productos y técnicas.',
  },
];

export default function BenefitsSection() {
  return (
    <section className="section-padding bg-[#FAF8F4]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="text-[#8B7355] text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">
            ¿Por qué elegirnos?
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
            La experiencia La Mackenna
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="group text-center lg:text-left p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E2D9]/60 hover:border-[#8B7355]/20 hover:shadow-lg hover:shadow-[#8B7355]/5 transition-all duration-300"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#8B7355]/[0.08] text-[#8B7355] mb-5 group-hover:bg-[#8B7355] group-hover:text-white transition-all duration-300">
                <b.icon className="w-5 h-5" strokeWidth={1.8} />
              </div>

              <h3 className="text-[#1A1A1A] font-semibold text-base sm:text-lg mb-2">
                {b.title}
              </h3>

              <p className="text-[#7A6E60] text-sm leading-relaxed">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
