// src/app/productos/page.tsx
// Página de listado de productos — Filtros y grilla elegante estilo ecommerce

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Button from '@/components/ui/Button';
import { SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
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

const categories = [
  { id: 'todos', name: 'Todos' },
  { id: 'pinturas-fluidas', name: 'Pinturas Fluidas' },
  { id: 'kits', name: 'Kits' },
  { id: 'herramientas', name: 'Herramientas' },
  { id: 'accesorios', name: 'Accesorios' },
  { id: 'stickers', name: 'Stickers' },
];

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-AR')}`;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem, openCart } = useCart();
  
  const [selectedCat, setSelectedCat] = useState('todos');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products) setProducts(data.products);
      })
      .catch(() => toast.error('Error al cargar productos'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat && categories.some(c => c.id === cat)) {
      setSelectedCat(cat);
    } else {
      setSelectedCat('todos');
    }
  }, [searchParams]);

  const filteredProducts = selectedCat === 'todos'
    ? products
    : products.filter(p => p.category === selectedCat);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    toast.success('Producto agregado al carrito');
    openCart();
  };

  const handleBuyNow = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
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
    <div className="min-h-screen bg-[#FAF8F4] pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Banner de cabecera */}
        <div className="text-center mb-12">
          <span className="text-[#8B7355] text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">
            Nuestra Tienda
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#1A1A1A] mb-4">
            Productos Artesanales
          </h1>
          <p className="text-[#4A4A4A] text-base max-w-2xl mx-auto">
            Explorá nuestra selección de insumos exclusivos, kits completos y piezas listas para decorar tus espacios.
          </p>
        </div>

        {/* Filtros horizontales */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-[#E8E2D9] pb-6">
          {/* Categorías */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCat === cat.id
                    ? 'bg-[#8B7355] text-white shadow-sm'
                    : 'bg-white border border-[#E8E2D9] text-[#4A4A4A] hover:border-[#8B7355] hover:text-[#8B7355]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Cantidad / Info */}
          <div className="flex items-center gap-2 text-xs text-[#7A6E60] font-medium self-end md:self-auto">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Mostrando {filteredProducts.length} productos</span>
          </div>
        </div>

        {/* Malla de Productos */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card group bg-white rounded-xl sm:rounded-2xl border border-[#E8E2D9]/80 overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                {/* Imagen */}
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
                  {/* Quick action on hover (solo desktop) */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 hidden lg:flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
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
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[#1A1A1A] font-medium text-sm sm:text-base mb-1.5 line-clamp-2 group-hover:text-[#8B7355] transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
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
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 px-0" onClick={(e) => handleAddToCart(product, e)}>
                      <ShoppingBag className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="flex-[3]" onClick={(e) => handleBuyNow(product, e)}>
                      Comprar ahora
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E8E2D9]/60">
            <p className="text-[#7A6E60] font-medium">No se encontraron productos en esta categoría.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
          <span className="text-[#8B7355] text-sm font-semibold tracking-wider animate-pulse">Cargando productos...</span>
        </div>
      }>
        <ProductsContent />
      </Suspense>
      <Footer />
    </>
  );
}
