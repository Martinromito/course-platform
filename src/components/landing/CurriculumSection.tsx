// src/components/landing/CurriculumSection.tsx
// Sección de contenido del curso con acordeón - Optimizada para mobile

'use client';

import { useState } from 'react';

const modules = [
  {
    title: 'Módulo 1: Introducción y Materiales',
    duration: '2h 30min',
    lessons: [
      'Tipos de fibras naturales y sintéticas',
      'Herramientas esenciales para el taller',
      'Preparación de las telas y materiales',
      'Técnicas de teñido artesanal',
    ],
  },
  {
    title: 'Módulo 2: Servilleteros Cocidos',
    duration: '4h 15min',
    lessons: [
      'Diseño y moldería de servilleteros',
      'Corte de precisión en textiles',
      'Costura a mano vs. Máquina decorativa',
      'Terminaciones y detalles de marca',
    ],
  },
  {
    title: 'Módulo 3: Cestería de Diseño',
    duration: '5h 45min',
    lessons: [
      'Estructuras básicas de cestos',
      'Tejido con sogas y cintas',
      'Cestos con base rígida vs. Flexible',
      'Manijas y agarres artesanales',
    ],
  },
  {
    title: 'Módulo 4: Individuales y Textiles',
    duration: '4h 20min',
    lessons: [
      'Creación de individuales reversibles',
      'Bordado decorativo simple',
      'Técnica de patchwork para objetos',
      'Impermeabilización de piezas',
    ],
  },
  {
    title: 'Módulo 5: Packaging y Venta',
    duration: '3h 00min',
    lessons: [
      'Cómo presentar tus productos',
      'Costos y fijación de precios',
      'Fotografía de producto con celular',
      'Primeros pasos en redes sociales',
    ],
  },
];

export default function CurriculumSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="contenido" className="py-16 sm:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <span className="text-[#8B7355] text-xs sm:text-sm font-bold uppercase tracking-widest">
            Qué vas a aprender
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1A1A1A] mt-3 mb-4">
            Proyectos del curso
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-4 text-[#705E45] text-xs sm:text-sm">
            <span>🧵 {modules.length} módulos</span>
            <span>🎥 Videos paso a paso</span>
            <span>📥 Moldes incluidos</span>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {modules.map((mod, idx) => (
            <div
              key={idx}
              className="border border-[#E5E0D8] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FAF9F6] hover:border-[#b04b2b]/30 transition-colors shadow-sm"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-6 text-left"
              >
                <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#8B7355]/10 border border-[#b04b2b]/20 flex items-center justify-center text-[#8B7355] font-bold text-base sm:text-lg flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[#1A1A1A] font-bold text-sm sm:text-lg leading-snug truncate">{mod.title}</h3>
                    <span className="text-[#705E45] text-[10px] sm:text-xs uppercase tracking-wider font-semibold">{mod.duration}</span>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 sm:w-6 sm:h-6 text-[#bcaaa4] transition-transform duration-300 flex-shrink-0 ml-2 ${openIdx === idx ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openIdx === idx && (
                <div className="border-t border-[#E5E0D8] px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
                  <ul className="space-y-2.5 sm:space-y-3 mt-3 sm:mt-4">
                    {mod.lessons.map((lesson, li) => (
                      <li key={li} className="flex items-start gap-3 sm:gap-4 text-[#4A4A4A] text-sm">
                        <div className="w-2 h-2 rounded-full bg-[#C5A059] mt-1.5 flex-shrink-0" />
                        <span>{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
