// src/components/landing/FAQSection.tsx
// Preguntas frecuentes con acordeón

'use client';

import { useState } from 'react';

const faqs = [
  {
    q: '¿Necesito experiencia previa en programación?',
    a: 'No. El curso está diseñado para principiantes absolutos. Comenzamos desde los conceptos más básicos y avanzamos gradualmente hasta temas avanzados.',
  },
  {
    q: '¿Cuánto tiempo necesito por día?',
    a: 'Con 1-2 horas diarias es suficiente para completar el curso en 60 días. Todo el contenido es asincrónico, así que tú decides cuándo estudiar.',
  },
  {
    q: '¿Qué pasa si el curso no es para mí?',
    a: 'Ofrecemos garantía de devolución de 7 días sin preguntas. Si dentro de los primeros 7 días sientes que no es para ti, te devolvemos el dinero completo.',
  },
  {
    q: '¿Cómo funciona el acceso?',
    a: 'Una vez que completes el pago, recibirás un email con acceso inmediato. Ingresa con tu cuenta y tendrás acceso a todos los módulos de por vida.',
  },
  {
    q: '¿El certificado tiene validez oficial?',
    a: 'El certificado acredita la finalización del curso. Está orientado a fortalecer tu perfil en LinkedIn y portafolios. No es un título universitario.',
  },
  {
    q: '¿Puedo ver el curso en mi celular?',
    a: 'Sí. La plataforma es completamente responsive y funciona en cualquier dispositivo: PC, tablet y smartphone.',
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest">
            Preguntas frecuentes
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mt-3">
            ¿Tienes dudas?
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-800/30"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left gap-4"
              >
                <span className="text-white font-medium">{faq.q}</span>
                <span className={`text-violet-400 text-xl flex-shrink-0 transition-transform duration-300 ${openIdx === idx ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>

              {openIdx === idx && (
                <div className="border-t border-slate-700 px-5 pb-5 pt-4">
                  <p className="text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
