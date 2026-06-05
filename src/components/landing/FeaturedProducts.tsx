// src/components/landing/FeaturedProducts.tsx
// Grilla de productos destacados — Estilo ecommerce moderno artesanal

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  badge: string | null;
  category: string;
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-AR')}`;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          // Mostrar solo los primeros 4 para destacados
          setProducts(data.products.slice(0, 4));
        }
      })
      .catch(console.error);
  }, []);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault(); // Por si el click se propaga
    addItem(product, 1);
    toast.success('Producto agregado al carrito');
    openCart();
  };

  return (
    <section id="productos" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <span className="text-[#8B7355] text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">
              Tienda
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
              Productos destacados
            </h2>
          </div>
          <Link
            href="/productos"
            className="text-[#8B7355] text-sm font-medium hover:underline underline-offset-4 transition-all flex items-center gap-1 group"
          >
            Ver todos
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <Link
              href={`/productos`} // En el futuro puede ir al detalle: `/productos/${product.id}`
              key={product.id}
              className="product-card group bg-white rounded-xl sm:rounded-2xl border border-[#E8E2D9]/80 overflow-hidden cursor-pointer block"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-[#F5F0E8]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image w-full h-full object-cover"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#8B7355] text-white text-[10px] sm:text-xs font-semibold rounded-md">
                    {product.badge}
                  </span>
                )}
                {/* Quick action on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                  <button 
                    onClick={(e) => handleAddToCart(product, e)}
                    className="bg-white/95 backdrop-blur-sm text-[#1A1A1A] px-4 py-2.5 rounded-lg text-xs font-semibold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 hover:bg-[#8B7355] hover:text-white"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Agregar al carrito
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 sm:p-4">
                <h3 className="text-[#1A1A1A] font-medium text-sm sm:text-base mb-1.5 line-clamp-2 group-hover:text-[#8B7355] transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  {product.originalPrice ? (
                    <>
                      <span className="text-[#8B7355] font-bold text-sm sm:text-base">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-[#7A6E60] line-through text-xs sm:text-sm">
                        {formatPrice(product.originalPrice)}
                      </span>
                    </>
                  ) : (
                    <span className="text-[#1A1A1A] font-bold text-sm sm:text-base">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10 sm:mt-12">
          <Link href="/productos">
            <Button variant="outline" size="lg">
              Ver todos los productos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
