// src/components/landing/CurriculumSection.tsx
// Sección de contenido del curso con acordeón

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
    <section id="contenido" className="py-24 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest">
            Qué vas a aprender
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mt-3 mb-4">
            Contenido del curso
          </h2>
          <div className="flex items-center justify-center gap-6 mt-4 text-slate-400 text-sm">
            <span>📚 {modules.length} módulos</span>
            <span>🎥 40+ horas de video</span>
            <span>📁 Archivos descargables</span>
          </div>
        </div>

        <div className="space-y-3">
          {modules.map((mod, idx) => (
            <div
              key={idx}
              className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-800/50 hover:border-slate-600 transition-colors"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-600/30 flex items-center justify-center text-violet-400 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{mod.title}</h3>
                    <span className="text-slate-500 text-xs">{mod.duration} · {mod.lessons.length} lecciones</span>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openIdx === idx ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openIdx === idx && (
                <div className="border-t border-slate-700 px-5 pb-5">
                  <ul className="space-y-2 mt-4">
                    {mod.lessons.map((lesson, li) => (
                      <li key={li} className="flex items-center gap-3 text-slate-400 text-sm">
                        <span className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-xs text-slate-500">
                          {li + 1}
                        </span>
                        {lesson}
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
