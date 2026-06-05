// src/app/payment/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Button from '@/components/ui/Button';
import Navbar from '@/components/landing/Navbar';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { clearCart } = useCart();

  useEffect(() => {
    // Refrescar el estado del usuario para asegurar que isPaid sea true
    refreshUser();
    // Vaciar el carrito después de una compra exitosa
    clearCart();
  }, [refreshUser, clearCart]);

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 pt-40 pb-20 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-sm">
          <span className="text-5xl">🎉</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-[#1A1A1A] mb-6">
          ¡Pago aprobado con éxito!
        </h1>
        
        <p className="text-xl text-[#7A6E60] max-w-2xl mx-auto mb-12">
          ¡Felicidades! Tu compra se ha procesado correctamente.
          Te hemos enviado un email con los detalles.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="xl" onClick={() => router.push('/mis-pedidos')}>
            Ver mis pedidos →
          </Button>
          <Button variant="outline" size="xl" onClick={() => router.push('/productos')}>
            Seguir comprando
          </Button>
        </div>

        <p className="mt-12 text-[#7A6E60] text-sm font-medium">
          Si el acceso no se refleja inmediatamente, espera unos segundos y refresca la página.
        </p>
      </main>
    </div>
  );
}
