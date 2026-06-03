// src/app/cursos/page.tsx
// Página de academia / cursos — Listado elegante de capacitaciones creativas

'use client';

import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const courses = [
  {
    id: 1,
    title: 'Pintura Fluida: De cero a experto',
    description: 'Dominá las técnicas de fluid art, acrílico pouring y efectos marmolados para crear piezas únicas.',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=600',
    duration: '12 módulos',
    students: '450+ alumnas',
    price: '$24.000',
    badge: 'Popular',
  },
  {
    id: 2,
    title: 'Cestería y Textiles Artesanales',
    description: 'Aprendé a crear cestos, servilleteros y objetos textiles con técnicas ancestrales y modernas.',
    image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=600',
    duration: '5 módulos',
    students: '300+ alumnas',
    price: '$18.000',
  },
  {
    id: 3,
    title: 'Emprendimiento Creativo',
    description: 'Transformá tu pasión en un negocio: packaging, fotografía, pricing y venta en redes sociales.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=600',
    duration: '8 módulos',
    students: '200+ alumnas',
    price: '$19.500',
    badge: 'Recomendado',
  },
];

export default function CoursesPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FAF8F4] pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-[#8B7355] text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">
              Academia Creativa
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#1A1A1A] mb-4">
              Nuestros Cursos Online
            </h1>
            <p className="text-[#4A4A4A] text-base max-w-2xl mx-auto">
              Aprendé paso a paso con clases grabadas en alta definición y soporte personalizado. Llevá tus habilidades artísticas al siguiente nivel.
            </p>
          </div>

          {/* Grilla de Cursos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-[#E8E2D9]/80 hover:border-[#8B7355]/30 hover:shadow-xl hover:shadow-[#8B7355]/5 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Imagen */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#F5F0E8]">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {course.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#8B7355] text-white text-[10px] sm:text-xs font-semibold rounded-md">
                      {course.badge}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>

                {/* Contenido */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Metadata */}
                    <div className="flex items-center gap-3 mb-3 text-xs text-[#7A6E60] font-medium">
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

                    <h3 className="text-[#1A1A1A] font-semibold text-lg sm:text-xl mb-2 group-hover:text-[#8B7355] transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-[#4A4A4A] text-sm leading-relaxed mb-4 line-clamp-3">
                      {course.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between border-t border-[#E8E2D9]/60 pt-4 mt-2">
                      <span className="text-[#1A1A1A] font-bold text-lg">
                        {course.price}
                      </span>
                      <Link href={`/login`}>
                        <Button variant="primary" size="sm">
                          Inscribirme
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
