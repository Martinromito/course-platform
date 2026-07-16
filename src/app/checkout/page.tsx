// src/app/checkout/page.tsx
// Página de checkout — Resumen de compra, datos de contacto/envío y selección de método de pago (MercadoPago o Transferencia)

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/landing/Navbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { CreditCard, Landmark, CheckCircle } from 'lucide-react';

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-AR')}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, shippingCost, total, coupon, totalItems, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'transfer'>('mercadopago');
  const [orderCompleted, setOrderCompleted] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  const [contactData, setContactData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
  });

  const [shippingData, setShippingData] = useState({
    address: '',
    city: '',
    province: '',
    zip: '',
  });

  // Verificar si hay productos físicos en el carrito
  const hasPhysicalProducts = items.some(item => item.product.itemType !== 'workshop');

  useEffect(() => {
    if (items.length === 0 && !orderCompleted) {
      router.push('/productos');
      toast.error('Tu carrito está vacío');
    }
  }, [items.length, router, orderCompleted]);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(console.error);
  }, []);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    setLoading(true);

    const payload = {
      items,
      couponCode: coupon?.code,
      buyerName: contactData.buyerName,
      buyerEmail: contactData.buyerEmail,
      buyerPhone: contactData.buyerPhone,
      shippingAddress: hasPhysicalProducts ? {
        name: contactData.buyerName,
        phone: contactData.buyerPhone,
        ...shippingData
      } : undefined,
    };

    try {
      if (paymentMethod === 'mercadopago') {
        const response = await fetch('/api/payments/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al procesar el pago');
        }

        if (data.initPoint) {
          clearCart();
          window.location.href = data.sandboxInitPoint || data.initPoint;
        }
      } else {
        // Transferencia bancaria
        const response = await fetch('/api/orders/create-transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al crear el pedido');
        }

        toast.success('¡Pedido registrado con éxito!');
        setOrderCompleted(data.orderId);
        clearCart();
      }
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-2xl mx-auto px-5 py-32 text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 border border-green-200">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[#1A1A1A] mb-4">
            ¡Gracias por tu compra!
          </h1>
          <p className="text-[#4A4A4A] text-base mb-2">
            Tu orden <span className="font-mono font-bold text-[#8B7355]">#{orderCompleted}</span> ha sido registrada.
          </p>
          <p className="text-[#7A6E60] text-sm mb-8 max-w-md">
            Para completar el pedido, por favor realiza la transferencia bancaria y envía el comprobante respondiendo al email de confirmación. Una vez verificado, liberaremos tu pedido/taller.
          </p>

          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 text-left w-full max-w-md shadow-sm space-y-4 mb-8">
            <h3 className="font-bold text-[#1A1A1A] border-b border-[#E8E2D9] pb-2 text-sm uppercase tracking-wider">
              Datos para la Transferencia
            </h3>
            <div className="text-sm space-y-2">
              <p className="text-[#4A4A4A]"><span className="font-semibold text-[#1A1A1A]">Banco:</span> {settings?.bankName || 'Galicia'}</p>
              <p className="text-[#4A4A4A]"><span className="font-semibold text-[#1A1A1A]">Titular:</span> {settings?.bankOwner || 'La Mackenna'}</p>
              <p className="text-[#4A4A4A]"><span className="font-semibold text-[#1A1A1A]">Alias:</span> {settings?.bankAlias || 'lamackenna.arte'}</p>
              <p className="text-[#4A4A4A]"><span className="font-semibold text-[#1A1A1A]">CBU:</span> {settings?.bankCbu || '0070000000000000000000'}</p>
              <div className="bg-[#FAF8F4] p-3 rounded-lg border border-[#E8E2D9]/80 text-center font-bold text-base text-[#8B7355] mt-3">
                Total a transferir: {formatPrice(total)}
              </div>
            </div>
          </div>

          <Button onClick={() => router.push('/')} variant="primary">
            Volver al inicio
          </Button>
        </div>
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Datos del Comprador (Izquierda) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Datos de Contacto */}
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#8B7355] text-white flex items-center justify-center text-sm">1</span>
                Datos de Contacto
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <Input
                    label="Nombre Completo"
                    name="buyerName"
                    value={contactData.buyerName}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <Input
                  label="Email de Notificación"
                  name="buyerEmail"
                  type="email"
                  value={contactData.buyerEmail}
                  onChange={handleContactChange}
                  required
                />
                <Input
                  label="Teléfono de Contacto"
                  name="buyerPhone"
                  type="tel"
                  value={contactData.buyerPhone}
                  onChange={handleContactChange}
                  required
                />
              </div>
            </div>

            {/* 2. Datos de Envío (solo si hay productos físicos) */}
            {hasPhysicalProducts && (
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#8B7355] text-white flex items-center justify-center text-sm">2</span>
                  Datos de Envío
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <Input
                      label="Dirección (Calle y Altura)"
                      name="address"
                      value={shippingData.address}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                  <Input
                    label="Ciudad"
                    name="city"
                    value={shippingData.city}
                    onChange={handleShippingChange}
                    required
                  />
                  <Input
                    label="Provincia"
                    name="province"
                    value={shippingData.province}
                    onChange={handleShippingChange}
                    required
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Código Postal"
                      name="zip"
                      value={shippingData.zip}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Método de Pago */}
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#8B7355] text-white flex items-center justify-center text-sm">
                  {hasPhysicalProducts ? '3' : '2'}
                </span>
                Método de Pago
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'mercadopago'
                    ? 'border-[#8B7355] bg-[#8B7355]/5'
                    : 'border-[#E8E2D9] hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'mercadopago'}
                    onChange={() => setPaymentMethod('mercadopago')}
                    className="mt-1 text-[#8B7355] focus:ring-[#8B7355]"
                  />
                  <div className="flex gap-2.5">
                    <CreditCard className="w-5 h-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">Mercado Pago</p>
                      <p className="text-xs text-[#7A6E60]">Tarjetas de débito/crédito, dinero en cuenta o Mercado Crédito.</p>
                    </div>
                  </div>
                </label>

                <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'transfer'
                    ? 'border-[#8B7355] bg-[#8B7355]/5'
                    : 'border-[#E8E2D9] hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'transfer'}
                    onChange={() => setPaymentMethod('transfer')}
                    className="mt-1 text-[#8B7355] focus:ring-[#8B7355]"
                  />
                  <div className="flex gap-2.5">
                    <Landmark className="w-5 h-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">Transferencia Bancaria</p>
                      <p className="text-xs text-[#7A6E60]">Paga directamente a nuestra cuenta bancaria. Despacho al verificar pago.</p>
                    </div>
                  </div>
                </label>
              </div>

              {paymentMethod === 'transfer' && (
                <div className="mt-6 bg-[#FAF8F4] border border-[#E8E2D9] rounded-xl p-5 text-sm space-y-2">
                  <p className="font-semibold text-[#1A1A1A] mb-1">Datos bancarios provisorios:</p>
                  <p className="text-[#4A4A4A]"><span className="font-semibold text-[#1A1A1A]">Banco:</span> {settings?.bankName || 'Galicia'}</p>
                  <p className="text-[#4A4A4A]"><span className="font-semibold text-[#1A1A1A]">Alias:</span> {settings?.bankAlias || 'lamackenna.arte'}</p>
                  <p className="text-[#4A4A4A]"><span className="font-semibold text-[#1A1A1A]">CBU:</span> {settings?.bankCbu || '0070000000000000000000'}</p>
                  <p className="text-xs text-[#7A6E60] italic mt-2">Los datos detallados también se te mostrarán al finalizar tu compra.</p>
                </div>
              )}
            </div>
          </div>

          {/* Resumen del Pedido (Derecha) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 sm:p-8 shadow-sm sticky top-32">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#8B7355] text-white flex items-center justify-center text-sm">
                  {hasPhysicalProducts ? '4' : '3'}
                </span>
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
                className="w-full mt-8 py-4 text-base"
                loading={loading}
              >
                {paymentMethod === 'mercadopago' ? 'Pagar con MercadoPago' : 'Completar por Transferencia'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
