// src/app/payment/failure/page.tsx
// Página de error/rechazo tras pago por Mercado Pago (público)

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Button from '@/components/ui/Button';
import { XCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

function FailurePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('external_reference') || 'N/D';

  return (
    <main className="max-w-2xl mx-auto px-5 py-12 text-center flex-1 flex flex-col items-center justify-center">
      {/* Icono de Error */}
      <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6 border border-red-200 shadow-sm animate-pulse">
        <XCircle className="w-8 h-8" />
      </div>

      {/* Título */}
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
        No pudimos procesar tu pago
      </h1>
      
      <p className="text-[#4A4A4A] text-base mb-8 max-w-md">
        Mercado Pago ha rechazado la transacción o se ha cancelado el proceso. Ningún cargo se ha realizado en tu tarjeta.
      </p>

      {/* Detalles del Pedido */}
      {orderId !== 'N/D' && (
        <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 text-left w-full max-w-md shadow-sm space-y-2.5 mb-8">
          <p className="text-sm text-[#4A4A4A] flex justify-between">
            <span className="font-semibold text-[#1A1A1A]">Pedido ID:</span> 
            <span className="font-mono font-bold text-[#8B7355]">#{orderId}</span>
          </p>
          <p className="text-sm text-[#4A4A4A] flex justify-between">
            <span className="font-semibold text-[#1A1A1A]">Estado del Pago:</span> 
            <span className="text-red-600 font-bold">Rechazado / Cancelado</span>
          </p>
        </div>
      )}

      {/* Advertencia/Consejos */}
      <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 text-left w-full max-w-md shadow-sm space-y-3 mb-10">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-800">¿Qué puedo hacer?</h4>
            <ul className="text-xs text-amber-700 mt-1 space-y-1 list-disc pl-4 leading-relaxed">
              <li>Verifica que los datos ingresados en Mercado Pago sean correctos.</li>
              <li>Prueba con otro método de pago en Mercado Pago (tarjeta de débito, efectivo o Mercado Crédito).</li>
              <li>O bien, selecciona **Transferencia Bancaria** al finalizar tu compra para pagar de forma directa.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center">
        <Button onClick={() => router.push('/checkout')} variant="primary" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver al checkout
        </Button>
        <Button onClick={() => router.push('/')} variant="outline">
          Ir a la página de inicio
        </Button>
      </div>
    </main>
  );
}

export default function PaymentFailurePage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FAF8F4] pt-28 pb-16 flex flex-col justify-between">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#8B7355]" />
          </div>
        }>
          <FailurePageContent />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
