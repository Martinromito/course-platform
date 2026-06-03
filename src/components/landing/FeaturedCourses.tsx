// src/components/landing/FeaturedCourses.tsx
// Cursos destacados — Secundario al ecommerce, pero prominente

'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';

const courses = [
  {
    id: 1,
    title: 'Pintura Fluida: De cero a experto',
    description: 'Dominá las técnicas de fluid art, acrílico pouring y efectos marmolados para crear piezas únicas.',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=600',
    duration: '12 módulos',
    students: '450+ alumnas',
  },
  {
    id: 2,
    title: 'Cestería y Textiles Artesanales',
    description: 'Aprendé a crear cestos, servilleteros y objetos textiles con técnicas ancestrales y modernas.',
    image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=600',
    duration: '5 módulos',
    students: '300+ alumnas',
  },
  {
    id: 3,
    title: 'Emprendimiento Creativo',
    description: 'Transformá tu pasión en un negocio: packaging, fotografía, pricing y venta en redes sociales.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=600',
    duration: '8 módulos',
    students: '200+ alumnas',
  },
];

export default function FeaturedCourses() {
  return (
    <section id="cursos" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="text-[#8B7355] text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">
            Academia
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
            Aprendé con La Mackenna
          </h2>
          <p className="text-[#4A4A4A] text-base sm:text-lg max-w-2xl mx-auto">
            Cursos online paso a paso para dominar nuevas técnicas y llevar tus proyectos al siguiente nivel.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group bg-[#FAF8F4] rounded-xl sm:rounded-2xl overflow-hidden border border-[#E8E2D9]/60 hover:border-[#8B7355]/30 hover:shadow-xl hover:shadow-[#8B7355]/5 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-3 text-[11px] sm:text-xs text-[#7A6E60] font-medium">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {course.students}
                  </span>
                </div>

                <h3 className="text-[#1A1A1A] font-semibold text-base sm:text-lg mb-2 group-hover:text-[#8B7355] transition-colors line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-[#4A4A4A] text-sm leading-relaxed mb-5 line-clamp-2">
                  {course.description}
                </p>

                <Link href={`/cursos/${course.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver curso
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10 sm:mt-12">
          <Link href="/cursos">
            <Button variant="ghost" size="lg" className="text-[#8B7355]">
              Ver todos los cursos →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
