// src/contexts/CartContext.tsx
// Contexto global del carrito — persistencia en localStorage, sin necesidad de login

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  itemType?: 'product' | 'workshop';
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

export interface AppliedCoupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  discount: number;
}

interface CartContextType {
  items: CartItem[];
  coupon: AppliedCoupon | null;
  isCartOpen: boolean;
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const FREE_SHIPPING_THRESHOLD = 50000;
const SHIPPING_FLAT_RATE = 5000;
const CART_STORAGE_KEY = 'lamackenna_cart';
const COUPON_STORAGE_KEY = 'lamackenna_coupon';

// ─── Context ─────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Cargar desde localStorage al montar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) {
        setCoupon(JSON.parse(savedCoupon));
      }
    } catch {
      // localStorage no disponible
    }
    setHydrated(true);
  }, []);

  // Persistir en localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      if (coupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // localStorage no disponible
    }
  }, [items, coupon, hydrated]);

  // Bloquear scroll cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen]);

  const addItem = useCallback((product: CartProduct, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const applyCoupon = useCallback((c: AppliedCoupon) => setCoupon(c), []);
  const removeCoupon = useCallback(() => setCoupon(null), []);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0), [items]);

  const discount = useMemo(() => {
    if (!coupon) return 0;
    // Recalcular descuento con subtotal actual
    if (coupon.type === 'percentage') {
      return Math.round(subtotal * (coupon.value / 100));
    }
    return Math.min(coupon.value, subtotal);
  }, [coupon, subtotal]);

  const shippingCost = useMemo(() => {
    if (items.length === 0) return 0;
    const hasPhysicalProducts = items.some(item => item.product.itemType !== 'workshop');
    if (!hasPhysicalProducts) return 0;
    const afterDiscount = subtotal - discount;
    return afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  }, [subtotal, discount, items]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount + shippingCost);
  }, [subtotal, discount, shippingCost]);

  return (
    <CartContext.Provider
      value={{
        items,
        coupon,
        isCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        applyCoupon,
        removeCoupon,
        totalItems,
        subtotal,
        discount,
        shippingCost,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
