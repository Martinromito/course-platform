// src/components/landing/Categories.tsx
// Tarjetas visuales de categorías principales

'use client';

import Link from 'next/link';

const categories = [
  {
    name: 'Pinturas Fluidas',
    image: '/images/cat-pinturas.png',
    href: '/productos?cat=pinturas-fluidas',
    count: '45 productos',
  },
  {
    name: 'Kits',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600',
    href: '/productos?cat=kits',
    count: '12 productos',
  },
  {
    name: 'Herramientas',
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=600',
    href: '/productos?cat=herramientas',
    count: '30 productos',
  },
  {
    name: 'Accesorios',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=600',
    href: '/productos?cat=accesorios',
    count: '25 productos',
  },
  {
    name: 'Stickers',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600',
    href: '/productos?cat=stickers',
    count: '18 productos',
  },
  {
    name: 'Cursos',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600',
    href: '/cursos',
    count: '15 cursos',
  },
];

export default function Categories() {
  return (
    <section className="section-padding bg-[#FAF8F4]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="text-[#8B7355] text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">
            Explorá
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
            Categorías principales
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
          {categories.map((cat, index) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="category-card group relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden"
            >
              {/* Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="category-overlay absolute inset-0 bg-[#1A1A1A]/35 group-hover:bg-[#1A1A1A]/50 transition-all duration-300" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <h3 className="font-display text-lg sm:text-xl lg:text-2xl font-bold text-center mb-1">
                  {cat.name}
                </h3>
                <span className="text-white/80 text-xs sm:text-sm font-medium">
                  {cat.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
