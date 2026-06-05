// src/components/cart/CartDrawer.tsx
// Panel lateral del carrito — slide-in desde la derecha

'use client';

import { useState } from 'react';
import { useCart, CartItem } from '@/contexts/CartContext';
import { X, Minus, Plus, Trash2, ShoppingBag, Tag, Truck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-AR')}`;
}

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-3 sm:gap-4 py-4 border-b border-[#E8E2D9]/60 last:border-0">
      {/* Image */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F5F0E8] flex-shrink-0">
        <img
          src={item.product.image}
          alt={item.product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-[#1A1A1A] font-medium text-sm leading-tight line-clamp-2 mb-1">
          {item.product.name}
        </h4>
        <p className="text-[#8B7355] font-bold text-sm">
          {formatPrice(item.product.price)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center border border-[#E8E2D9] rounded-lg overflow-hidden">
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
              className="p-1.5 hover:bg-[#F2F0ED] transition-colors text-[#4A4A4A]"
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-3 text-xs font-bold text-[#1A1A1A] min-w-[28px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              className="p-1.5 hover:bg-[#F2F0ED] transition-colors text-[#4A4A4A]"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => removeItem(item.product.id)}
            className="p-1.5 text-[#7A6E60] hover:text-red-500 transition-colors ml-auto"
            aria-label="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Line Total */}
      <div className="text-right flex-shrink-0">
        <span className="text-[#1A1A1A] font-bold text-sm">
          {formatPrice(item.product.price * item.quantity)}
        </span>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    coupon,
    applyCoupon,
    removeCoupon,
    totalItems,
    subtotal,
    discount,
    shippingCost,
    total,
    clearCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();

      if (data.valid) {
        applyCoupon({
          code: data.coupon.code,
          type: data.coupon.type,
          value: data.coupon.value,
          discount: data.discount,
        });
        toast.success(`¡Cupón "${data.coupon.code}" aplicado!`);
        setCouponCode('');
      } else {
        toast.error(data.error || 'Cupón inválido');
      }
    } catch {
      toast.error('Error al validar el cupón');
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isCartOpen ? 'visible' : 'invisible pointer-events-none'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
            isCartOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeCart}
        />

        {/* Panel */}
        <div
          className={`absolute top-0 right-0 w-full max-w-md h-full bg-[#FFFDF9] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
            isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E8E2D9]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#8B7355]" />
              <h2 className="font-bold text-[#1A1A1A] text-lg">
                Tu carrito
                {totalItems > 0 && (
                  <span className="text-[#7A6E60] font-medium text-sm ml-2">
                    ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </span>
                )}
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-lg hover:bg-[#F2F0ED] transition-colors"
            >
              <X className="w-5 h-5 text-[#4A4A4A]" />
            </button>
          </div>

          {/* Content */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="w-20 h-20 bg-[#F5F0E8] rounded-full flex items-center justify-center mb-5">
                <ShoppingBag className="w-8 h-8 text-[#8B7355]/50" />
              </div>
              <h3 className="text-[#1A1A1A] font-bold text-lg mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-[#7A6E60] text-sm mb-6">
                Explorá nuestra tienda y encontrá productos increíbles.
              </p>
              <Link
                href="/productos"
                onClick={closeCart}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B7355] text-white rounded-lg font-medium text-sm hover:bg-[#705E45] transition-colors"
              >
                Ver productos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-5">
                {items.map((item) => (
                  <CartItemRow key={item.product.id} item={item} />
                ))}
              </div>

              {/* Coupon */}
              <div className="px-4 sm:px-5 py-3 border-t border-[#E8E2D9]/60">
                {coupon ? (
                  <div className="flex items-center justify-between bg-[#8B7355]/5 border border-[#8B7355]/20 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#8B7355]" />
                      <span className="text-xs font-bold text-[#8B7355] uppercase">
                        {coupon.code}
                      </span>
                      <span className="text-xs text-[#4A4A4A]">
                        (-{formatPrice(discount)})
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[#7A6E60] hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Código de cupón"
                      className="flex-1 px-3 py-2 border border-[#E8E2D9] rounded-lg text-xs font-medium text-[#1A1A1A] placeholder-[#7A6E60] focus:border-[#8B7355] focus:outline-none transition-colors"
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-3 py-2 bg-[#8B7355] text-white rounded-lg text-xs font-semibold hover:bg-[#705E45] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {couponLoading ? '...' : 'Aplicar'}
                    </button>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="px-4 sm:px-5 py-4 border-t border-[#E8E2D9] bg-[#FAF8F4]/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7A6E60]">Subtotal</span>
                  <span className="text-[#1A1A1A] font-medium">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Descuento</span>
                    <span className="text-green-600 font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-[#7A6E60] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    Envío
                  </span>
                  <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : 'text-[#1A1A1A]'}`}>
                    {shippingCost === 0 ? '¡Gratis!' : formatPrice(shippingCost)}
                  </span>
                </div>

                {shippingCost > 0 && (
                  <p className="text-[10px] text-[#7A6E60]">
                    Envío gratis en compras mayores a $50.000
                  </p>
                )}

                <div className="flex justify-between pt-2 border-t border-[#E8E2D9]/60">
                  <span className="text-[#1A1A1A] font-bold">Total</span>
                  <span className="text-[#1A1A1A] font-black text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 sm:px-5 py-4 border-t border-[#E8E2D9] space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#8B7355] text-white rounded-xl font-semibold text-sm hover:bg-[#705E45] transition-colors shadow-sm"
                >
                  Ir al checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={closeCart}
                    className="flex-1 px-4 py-2.5 border border-[#E8E2D9] text-[#4A4A4A] rounded-xl font-medium text-sm hover:bg-[#F2F0ED] transition-colors"
                  >
                    Seguir comprando
                  </button>
                  <button
                    onClick={() => {
                      clearCart();
                      toast.success('Carrito vaciado');
                    }}
                    className="px-4 py-2.5 border border-red-200 text-red-500 rounded-xl font-medium text-sm hover:bg-red-50 transition-colors"
                  >
                    Vaciar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
