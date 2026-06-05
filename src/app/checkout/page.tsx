// src/app/checkout/page.tsx
// Página de checkout — Resumen de compra, formulario de envío y pago con MercadoPago

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/landing/Navbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-AR')}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, discount, shippingCost, total, coupon, totalItems } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    zip: '',
  });

  // Redirigir si no está logueado o carrito vacío
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/checkout');
        toast.error('Inicia sesión para continuar con la compra');
      } else if (items.length === 0) {
        router.push('/productos');
        toast.error('Tu carrito está vacío');
      } else if (user && !formData.name) {
        // Pre-llenar nombre si está vacío
        setFormData(prev => ({ ...prev, name: user.name }));
      }
    }
  }, [user, authLoading, items.length, router, formData.name]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
          })),
          couponCode: coupon?.code,
          shippingAddress: formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      if (data.initPoint) {
        // Redirigir a MercadoPago
        window.location.href = data.sandboxInitPoint || data.initPoint;
      }
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión');
      setLoading(false);
    }
  };

  if (authLoading || !user || items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B7355]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] pt-28 pb-16">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
            Finalizar Compra
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Formulario de Envío (Izquierda) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#E8E2D9] shadow-sm">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#8B7355] text-white flex items-center justify-center text-sm">1</span>
                Datos de Envío
              </h2>

              <form id="checkout-form" onSubmit={handlePayment} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <Input
                    label="Nombre Completo"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Dirección (Calle y Altura)"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Input
                  label="Ciudad"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Provincia"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Código Postal"
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Teléfono"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  type="tel"
                  required
                />
              </form>
            </div>
          </div>

          {/* Resumen del Pedido (Derecha) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#E8E2D9] shadow-sm sticky top-32">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#8B7355] text-white flex items-center justify-center text-sm">2</span>
                Resumen del Pedido
              </h2>

              {/* Items */}
              <div className="max-h-60 overflow-y-auto pr-2 mb-6 space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#F5F0E8] flex-shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-[#1A1A1A] line-clamp-2 leading-tight">
                        {item.product.name}
                      </h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-[#7A6E60]">Cant: {item.quantity}</span>
                        <span className="text-sm font-bold text-[#8B7355]">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="border-t border-[#E8E2D9] pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7A6E60]">Subtotal ({totalItems} items)</span>
                  <span className="text-[#1A1A1A] font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Descuento ({coupon?.code})</span>
                    <span className="text-green-600 font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-[#7A6E60]">Envío</span>
                  <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : 'text-[#1A1A1A]'}`}>
                    {shippingCost === 0 ? '¡Gratis!' : formatPrice(shippingCost)}
                  </span>
                </div>

                <div className="flex justify-between pt-4 border-t border-[#E8E2D9] mt-4">
                  <span className="text-[#1A1A1A] font-bold text-lg">Total a pagar</span>
                  <span className="text-[#1A1A1A] font-black text-2xl">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                className="w-full mt-8 py-4 text-base"
                loading={loading}
              >
                Pagar con MercadoPago
              </Button>
              <p className="text-center text-xs text-[#7A6E60] mt-3">
                Serás redirigido a MercadoPago para completar el pago de forma segura.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
