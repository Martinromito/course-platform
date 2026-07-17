// src/app/talleres/page.tsx
// Página de academia / talleres — Listado elegante de talleres creativos dinámicos

'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Button from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';
import { Play, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, openCart } = useCart();
  const router = useRouter();


  useEffect(() => {
    fetch('/api/workshops')
      .then((res) => res.json())
      .then((data) => {
        if (data.workshops) setWorkshops(data.workshops);
      })
      .catch(() => toast.error('Error al cargar los talleres'))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (workshop: Workshop, e: React.MouseEvent) => {
    e.stopPropagation();
    const cartProduct = {
      id: workshop.id,
      name: workshop.title,
      price: workshop.price,
      originalPrice: workshop.originalPrice,
      image: workshop.image,
      itemType: 'workshop' as const,
    };
    addItem(cartProduct, 1);
    toast.success('Taller agregado al carrito');
    openCart();
  };

  const handleBuyNow = (workshop: Workshop, e: React.MouseEvent) => {
    e.stopPropagation();
    const cartProduct = {
      id: workshop.id,
      name: workshop.title,
      price: workshop.price,
      originalPrice: workshop.originalPrice,
      image: workshop.image,
      itemType: 'workshop' as const,
    };
    addItem(cartProduct, 1);
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center pt-28">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B7355]"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FAF8F4] pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-[#8B7355] text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">
              Talleres Creativos
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#1A1A1A] mb-4">
              Aprende Online
            </h1>
            <p className="text-[#4A4A4A] text-base max-w-2xl mx-auto">
              Talleres online con clases de un único video. Compra y accede de por vida sin necesidad de registrarte ni crear cuentas complicadas. Recibirás tu acceso directamente en tu email.
            </p>
          </div>

          {/* Grilla de Talleres */}
          {workshops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {workshops.map((workshop) => (
                <div
                  key={workshop.id}
                  className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-[#E8E2D9]/80 hover:border-[#8B7355]/30 hover:shadow-xl hover:shadow-[#8B7355]/5 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Imagen */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#F5F0E8]">
                    <img
                      src={workshop.image}
                      alt={workshop.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-[#8B7355] shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-5 h-5 fill-current ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-[#1A1A1A] font-semibold text-lg sm:text-xl mb-2 group-hover:text-[#8B7355] transition-colors line-clamp-2">
                        {workshop.title}
                      </h3>
                      <p className="text-[#4A4A4A] text-sm leading-relaxed mb-4 line-clamp-3">
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
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={(e) => handleAddToCart(workshop, e)}>
                            <ShoppingBag className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={(e) => handleBuyNow(workshop, e)}>
                            Comprar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-[#E8E2D9]/60">
              <p className="text-[#7A6E60] font-medium">Próximamente subiremos nuevos talleres online. ¡Estate atenta!</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
