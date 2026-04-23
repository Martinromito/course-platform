// src/components/landing/FAQSection.tsx
// Preguntas frecuentes con acordeón - Optimizada para mobile

'use client';

import { useState } from 'react';

const faqs = [
  {
    q: '¿Necesito experiencia previa en artesanías?',
    a: 'No. El curso está diseñado para principiantes absolutos. Comenzamos desde los conceptos más básicos y avanzamos gradualmente hasta técnicas avanzadas de cestería y textiles.',
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
    a: 'El certificado acredita la finalización del curso y tus conocimientos en artesanías. Está orientado a fortalecer tu perfil profesional y tu marca personal como artesana.',
  },
  {
    q: '¿Puedo ver el curso en mi celular?',
    a: 'Sí. La plataforma es completamente responsive y funciona en cualquier dispositivo: PC, tablet y smartphone.',
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <span className="text-[#b04b2b] text-xs sm:text-sm font-bold uppercase tracking-widest">
            Preguntas frecuentes
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#3e2723] mt-3">
            ¿Tienes dudas?
          </h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-[#d7ccc8] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#fdfaf5]"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-6 text-left gap-3 sm:gap-4"
              >
                <span className="text-[#3e2723] font-bold text-sm sm:text-base">{faq.q}</span>
                <span className={`text-[#b04b2b] text-xl sm:text-2xl flex-shrink-0 transition-transform duration-300 ${openIdx === idx ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>

              {openIdx === idx && (
                <div className="border-t border-[#d7ccc8] px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-5">
                  <p className="text-[#5d4037] leading-relaxed font-medium text-sm sm:text-base">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
