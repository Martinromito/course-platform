// src/components/landing/PricingSection.tsx
// Sección de precio con botón de pago vía Mercado Pago - Optimizada para mobile

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function PricingSection() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (!user) {
      router.push('/register?redirect=checkout');
      return;
    }

    if (user.isPaid) {
      router.push('/dashboard');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments/create-preference', {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Redirigir al checkout de Mercado Pago
      // En producción usar initPoint; en desarrollo usar sandboxInitPoint
      const url =
        process.env.NODE_ENV === 'production'
          ? data.initPoint
          : data.sandboxInitPoint;

      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert('Error al iniciar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="precio" className="py-16 sm:py-24 bg-[#fdfaf5]">
      <div className="max-w-2xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-[#b04b2b] text-xs sm:text-sm font-bold uppercase tracking-widest">
            Inversión
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#3e2723] mt-3">
            Iníciate hoy mismo
          </h2>
        </div>

        {/* Tarjeta de precio */}
        <div className="relative rounded-[28px] sm:rounded-[40px] border border-[#d7ccc8] bg-white p-6 sm:p-10 md:p-14 overflow-hidden shadow-2xl shadow-[#b04b2b]/5">
          {/* Badge popular */}
          <div className="flex justify-center sm:justify-end sm:absolute sm:top-8 sm:right-8 mb-4 sm:mb-0">
            <span className="px-4 py-1.5 rounded-full text-[10px] font-bold bg-[#b04b2b] text-white tracking-widest uppercase">
              RECOMENDADO
            </span>
          </div>

          {/* Glow decorativo superior */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 sm:w-40 h-1.5 bg-[#b04b2b] rounded-full" />

          {/* Precio */}
          <div className="mb-8 sm:mb-10 text-center">
            <div className="flex items-end justify-center gap-2 sm:gap-3 mb-3">
              <span className="text-[#a1887f] line-through text-xl sm:text-2xl font-medium">$24,900</span>
              <span className="text-[10px] sm:text-xs text-[#b04b2b] font-bold border border-[#b04b2b]/20 px-2 py-1 rounded-lg">LANZAMIENTO</span>
            </div>
            <div className="flex items-baseline justify-center gap-1.5 sm:gap-2">
              <span className="text-[#8d6e63] text-lg sm:text-2xl font-bold">ARS</span>
              <span className="text-5xl sm:text-6xl md:text-7xl font-black text-[#3e2723] tracking-tight">$14,500</span>
            </div>
            <p className="text-[#8d6e63] text-xs sm:text-sm mt-3 font-medium">Pago único · Acceso para siempre</p>
          </div>

          {/* Features */}
          <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
            {[
              '✅ 5 Módulos de aprendizaje intensivo',
              '✅ Video-lecciones en alta definición',
              '✅ Listado de proveedores de confianza',
              '✅ Moldes y patrones descargables',
              '✅ Certificado de finalización',
              '✅ Acceso al grupo privado de alumnas',
              '✅ Garantía de satisfacción de 7 días',
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 sm:gap-3 text-[#5d4037] font-medium text-sm sm:text-base">
                <span className="text-[#b04b2b] flex-shrink-0">{f.split(' ')[0]}</span>
                <span>{f.split(' ').slice(1).join(' ')}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button
            size="xl"
            className="w-full py-5 sm:py-6 text-base sm:text-lg"
            onClick={handleBuy}
            loading={loading}
            id="btn-comprar-curso"
          >
            {user?.isPaid ? '✅ Ya eres alumna — Ir al curso' : '🧶 Inscribirme ahora'}
          </Button>

          <p className="text-center text-[#a1887f] text-[10px] sm:text-xs mt-5 sm:mt-6 flex items-center justify-center gap-2">
            <span>🔒</span> Pago seguro procesado por Mercado Pago
          </p>
        </div>
      </div>
    </section>
  );
}
