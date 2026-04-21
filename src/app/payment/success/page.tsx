// src/app/payment/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Navbar from '@/components/landing/Navbar';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    // Refrescar el estado del usuario para asegurar que isPaid sea true
    refreshUser();
  }, [refreshUser]);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 pt-40 pb-20 text-center">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-5xl">🎉</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
          ¡Pago aprobado con éxito!
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
          ¡Felicidades! Ya tienes acceso completo al curso. 
          Te hemos enviado un email con los detalles de tu compra.
          ¡Estamos emocionados de que empieces a aprender!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="xl" onClick={() => router.push('/dashboard')}>
            Ir al Dashboard y empezar →
          </Button>
          <Button variant="outline" size="xl" onClick={() => router.push('/')}>
            Volver al inicio
          </Button>
        </div>

        <p className="mt-12 text-slate-500 text-sm">
          Si el acceso no se refleja inmediatamente, espera unos segundos y refresca la página.
        </p>
      </main>
    </div>
  );
}
