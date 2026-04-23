// src/app/page.tsx
// Landing Page Principal

import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import CurriculumSection from '@/components/landing/CurriculumSection';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <BenefitsSection />
      <CurriculumSection />
      <PricingSection />
      <FAQSection />
      
      {/* Footer Simple */}
      <footer className="py-10 sm:py-16 bg-[#fdfaf5] border-t border-[#d7ccc8]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <span className="text-[#3e2723] font-bold text-base sm:text-lg">La Mackenna</span>
          </div>
          <p className="text-[#8d6e63] text-xs sm:text-sm max-w-md mx-auto mb-6 sm:mb-8 leading-relaxed">
            Enseñando el valor de lo hecho a mano desde 1999. Únete a nuestra comunidad de artesanas.
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-6 text-xs text-[#b04b2b] font-semibold">
            <a href="#" className="hover:underline py-2">Términos</a>
            <a href="#" className="hover:underline py-2">Privacidad</a>
            <a href="#" className="hover:underline py-2">Instagram</a>
          </div>
          <p className="text-[#a1887f] text-xs mt-6 sm:mt-10">
            © {new Date().getFullYear()} La Mackenna. Hecho con amor.
          </p>
        </div>
      </footer>
    </main>
  );
}
