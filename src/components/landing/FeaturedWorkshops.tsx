// src/components/landing/FeaturedWorkshops.tsx
// Talleres destacados en la página principal — Dinámicos desde workshops.json /api/workshops

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';
import { Play } from 'lucide-react';

interface Workshop {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number | null;
  image: string;
  isActive: boolean;
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-AR')}`;
}

export default function FeaturedWorkshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    fetch('/api/workshops')
      .then((res) => res.json())
      .then((data) => {
        if (data.workshops) {
          // Mostrar solo los primeros 3 para destacados
          setWorkshops(data.workshops.slice(0, 3));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (workshop: Workshop, e: React.MouseEvent) => {
    e.preventDefault();
    // Convert workshop format to cart product format
    const cartProduct = {
      id: workshop.id,
      name: workshop.title,
      price: workshop.price,
      originalPrice: workshop.originalPrice,
      image: workshop.image,
    };
    addItem(cartProduct, 1);
    toast.success('Taller agregado al carrito');
    openCart();
  };

  if (loading) return null;
  if (workshops.length === 0) return null;

  return (
    <section id="talleres" className="section-padding bg-[#F5F0E8]/40">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="text-[#8B7355] text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">
            Academia Online
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
            Nuestros Talleres Online
          </h2>
          <p className="text-[#4A4A4A] text-base sm:text-lg max-w-2xl mx-auto">
            Aprende a tu propio ritmo con videoclases exclusivas. Compra una vez, accede para siempre desde cualquier dispositivo.
          </p>
        </div>

        {/* Workshops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {workshops.map((workshop) => (
            <div
              key={workshop.id}
              className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-[#E8E2D9]/60 hover:border-[#8B7355]/30 hover:shadow-xl hover:shadow-[#8B7355]/5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#FAF8F4]">
                <img
                  src={workshop.image}
                  alt={workshop.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-[#8B7355] shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-5 h-5 fill-current ml-1" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-[#1A1A1A] font-semibold text-lg mb-2 group-hover:text-[#8B7355] transition-colors line-clamp-2">
                    {workshop.title}
                  </h3>
                  <p className="text-[#4A4A4A] text-sm leading-relaxed mb-5 line-clamp-2">
                    {workshop.description}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between border-t border-[#E8E2D9]/60 pt-4 mt-2">
                    <div className="flex flex-col">
                      {workshop.originalPrice && (
                        <span className="text-xs text-[#7A6E60] line-through">
                          {formatPrice(workshop.originalPrice)}
                        </span>
                      )}
                      <span className="text-[#1A1A1A] font-bold text-lg leading-tight">
                        {formatPrice(workshop.price)}
                      </span>
                    </div>
                    <Button variant="primary" size="sm" onClick={(e) => handleAddToCart(workshop, e)}>
                      Comprar Taller
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10 sm:mt-12">
          <Link href="/talleres">
            <Button variant="outline" size="lg">
              Ver todos los talleres →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
