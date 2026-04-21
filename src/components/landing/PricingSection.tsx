// src/components/landing/PricingSection.tsx
// Sección de precio con botón de pago vía Mercado Pago

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
    <section id="precio" className="py-24 bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest">
            Inversión
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mt-3">
            Un precio, acceso para siempre
          </h2>
        </div>

        {/* Tarjeta de precio */}
        <div className="relative rounded-3xl border border-violet-500/30 bg-slate-900 p-8 sm:p-10 overflow-hidden">
          {/* Badge popular */}
          <div className="absolute top-6 right-6">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-600 text-white">
              MÁS POPULAR
            </span>
          </div>

          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" />

          {/* Precio */}
          <div className="mb-8">
            <div className="flex items-end gap-2 mb-2">
              <span className="text-slate-500 line-through text-2xl">$24,900</span>
              <span className="text-sm text-[#b04b2b] font-semibold">PRECIO LANZAMIENTO</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-400 text-2xl">ARS</span>
              <span className="text-6xl font-extrabold text-[#3e2723]">$14,500</span>
            </div>
            <p className="text-slate-500 text-sm mt-1">Pago único · Acceso ilimitado</p>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {[
              '✅ 5 Módulos de aprendizaje intensivo',
              '✅ Video-lecciones en alta definición',
              '✅ Listado de proveedores de confianza',
              '✅ Moldes y patrones descargables',
              '✅ Certificado de finalización',
              '✅ Acceso al grupo privado de alumnas',
              '✅ Garantía de satisfacción de 7 días',
            ].map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-[#5d4037] text-sm">
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button
            size="xl"
            className="w-full"
            onClick={handleBuy}
            loading={loading}
            id="btn-comprar-curso"
          >
            {user?.isPaid ? '✅ Ya eres alumna — Ir al curso' : '🧶 Inscribirme ahora'}
          </Button>

          <p className="text-center text-slate-500 text-xs mt-4">
            🔒 Pago seguro con SSL · Mercado Pago · Tarjetas y efectivo
          </p>
        </div>
      </div>
    </section>
  );
}
