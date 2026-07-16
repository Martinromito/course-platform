// src/app/page.tsx
// Landing Page Principal — Rediseño ecommerce + talleres online

import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturedProducts from '@/components/landing/FeaturedProducts';
import Categories from '@/components/landing/Categories';
import FeaturedWorkshops from '@/components/landing/FeaturedWorkshops';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Categories */}
      <Categories />

      {/* Featured Workshops */}
      <FeaturedWorkshops />

      {/* Footer */}
      <Footer />
    </main>
  );
}
