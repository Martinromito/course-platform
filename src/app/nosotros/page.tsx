// src/app/nosotros/page.tsx
// Página Sobre Nosotros — Estilo minimalista y artesanal

'use client';

import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function AboutUsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FAF8F4] pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-[#8B7355] text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">
              Nuestra Historia
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#1A1A1A] mb-4">
              Sobre La Mackenna
            </h1>
            <div className="w-16 h-0.5 bg-[#8B7355] mx-auto mt-6" />
          </div>

          {/* Contenido Editorial */}
          <div className="prose prose-stone max-w-none text-[#4A4A4A] space-y-8 text-base sm:text-lg leading-relaxed">
            <p>
              Nacimos como un pequeño taller familiar motivado por la curiosidad de explorar materiales y el deseo de plasmar belleza en objetos cotidianos. Creemos firmemente que el proceso de creación manual tiene un valor incalculable: cada pieza lleva consigo tiempo, dedicación y una impronta única.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F5F0E8] border border-[#E8E2D9]">
                <img
                  src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=600"
                  alt="Taller de creación"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F5F0E8] border border-[#E8E2D9]">
                <img
                  src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600"
                  alt="Pinturas y detalles"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1A1A1A] pt-4">
              Nuestros Valores
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="bg-white p-6 rounded-xl border border-[#E8E2D9]/80">
                <h3 className="font-semibold text-lg text-[#1A1A1A] mb-2">Artesanal</h3>
                <p className="text-sm text-[#4A4A4A]">
                  Cada producto es elaborado o seleccionado minuciosamente garantizando altos estándares de calidad.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-[#E8E2D9]/80">
                <h3 className="font-semibold text-lg text-[#1A1A1A] mb-2">Comunidad</h3>
                <p className="text-sm text-[#4A4A4A]">
                  Fomentamos un espacio de intercambio y crecimiento para que nuestros alumnos compartan sus obras y progresos.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-[#E8E2D9]/80">
                <h3 className="font-semibold text-lg text-[#1A1A1A] mb-2">Diseño</h3>
                <p className="text-sm text-[#4A4A4A]">
                  Fusionamos técnicas tradicionales y rústicas con paletas modernas para que cada objeto combine con tu hogar.
                </p>
              </div>
            </div>

            <p className="pt-6">
              Hoy, La Mackenna es tanto una tienda online de productos artesanales e insumos seleccionados, como una academia de arte digital y presencial que busca inspirar a miles de personas a conectar con su propio lado creativo. ¡Gracias por formar parte de este viaje!
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
