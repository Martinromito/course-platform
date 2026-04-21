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
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-[#b04b2b] text-sm font-bold uppercase tracking-widest">
            Preguntas frecuentes
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#3e2723] mt-3">
            ¿Tienes dudas?
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-[#d7ccc8] rounded-3xl overflow-hidden bg-[#fdfaf5]"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left gap-4"
              >
                <span className="text-[#3e2723] font-bold">{faq.q}</span>
                <span className={`text-[#b04b2b] text-2xl flex-shrink-0 transition-transform duration-300 ${openIdx === idx ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>

              {openIdx === idx && (
                <div className="border-t border-[#d7ccc8] px-6 pb-6 pt-5">
                  <p className="text-[#5d4037] leading-relaxed font-medium">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
