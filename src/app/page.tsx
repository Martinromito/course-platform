// src/app/page.tsx
// Landing Page Principal — Rediseño ecommerce + cursos

import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturedProducts from '@/components/landing/FeaturedProducts';
import Categories from '@/components/landing/Categories';
import FeaturedCourses from '@/components/landing/FeaturedCourses';
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

      {/* Featured Courses */}
      <FeaturedCourses />

      {/* Footer */}
      <Footer />
    </main>
  );
}

