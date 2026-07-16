// src/app/payment/success/page.tsx
// Página de éxito tras pago por Mercado Pago (público)

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Button from '@/components/ui/Button';
import { CheckCircle, Mail, ArrowRight, Loader2 } from 'lucide-react';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get('external_reference') || searchParams.get('merchant_order_id') || 'N/D';
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id') || 'N/D';
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(console.error);
  }, []);

  return (
    <main className="max-w-2xl mx-auto px-5 py-12 text-center flex-1 flex flex-col items-center justify-center">
      {/* Icono de Éxito */}
      <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 border border-green-200 shadow-sm animate-bounce">
        <CheckCircle className="w-8 h-8" />
      </div>

      {/* Título */}
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
        ¡Pago Aprobado con Éxito!
      </h1>
      
      <p className="text-[#4A4A4A] text-base mb-8 max-w-md">
        Tu pago ha sido procesado de manera correcta. A continuación se detallan los datos de tu transacción.
      </p>

      {/* Detalles del Pedido */}
      <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 text-left w-full max-w-md shadow-sm space-y-4 mb-8">
        <h3 className="font-bold text-[#1A1A1A] border-b border-[#E8E2D9] pb-2 text-sm uppercase tracking-wider">
          Detalles del Pago
        </h3>
        <div className="text-sm space-y-2.5">
          <p className="text-[#4A4A4A] flex justify-between">
            <span className="font-semibold text-[#1A1A1A]">Pedido ID:</span> 
            <span className="font-mono font-bold text-[#8B7355]">#{orderId}</span>
          </p>
          <p className="text-[#4A4A4A] flex justify-between">
            <span className="font-semibold text-[#1A1A1A]">Transacción ID (MP):</span> 
            <span className="font-mono text-[#7A6E60]">{paymentId}</span>
          </p>
          <p className="text-[#4A4A4A] flex justify-between">
            <span className="font-semibold text-[#1A1A1A]">Estado del Pago:</span> 
            <span className="text-green-600 font-bold">Aprobado (Mercado Pago)</span>
          </p>
        </div>
      </div>

      {/* Instrucciones de Acceso a Talleres */}
      <div className="bg-green-50/50 border border-green-200/80 rounded-2xl p-5 text-left w-full max-w-md shadow-sm space-y-3 mb-10">
        <div className="flex gap-3">
          <Mail className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-green-800">¿Cómo accedo a mis compras?</h4>
            <p className="text-xs text-green-700 mt-1 leading-relaxed">
              Hemos enviado los datos de facturación e instrucciones de acceso al correo electrónico que ingresaste durante el checkout.
            </p>
            <p className="text-[11px] text-green-600 font-medium mt-1 leading-relaxed">
              * Si compraste un Taller Online, revisá tu correo: contiene un enlace único para reproducir el video protegido directamente en la plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center">
        <Button onClick={() => router.push('/')} variant="primary" className="flex items-center gap-2">
          Volver a la portada
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button onClick={() => router.push('/productos')} variant="outline">
          Seguir explorando
        </Button>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FAF8F4] pt-28 pb-16 flex flex-col justify-between">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#8B7355]" />
          </div>
        }>
          <SuccessPageContent />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
