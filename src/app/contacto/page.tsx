// src/app/contacto/page.tsx
// Página de contacto — Formulario interactivo y datos de contacto minimalistas

'use client';

import { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Button from '@/components/ui/Button';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSent(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FAF8F4] pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-[#8B7355] text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">
              Hablemos
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#1A1A1A] mb-4">
              Contacto
            </h1>
            <p className="text-[#4A4A4A] text-base max-w-2xl mx-auto">
              ¿Tenés dudas sobre nuestros productos, envíos o cursos? Escribinos y te responderemos a la brevedad.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Columna Izquierda: Información de contacto */}
            <div className="lg:col-span-5 space-y-8 bg-white p-8 rounded-2xl border border-[#E8E2D9]/80">
              <h2 className="font-display text-2xl font-bold text-[#1A1A1A] mb-4">
                Información de contacto
              </h2>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FAF8F4] border border-[#E8E2D9] flex items-center justify-center text-[#8B7355] flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#7A6E60] uppercase tracking-wider mb-0.5">E-mail</h3>
                    <p className="text-[#1A1A1A] text-sm font-medium">hola@lamackenna.com</p>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FAF8F4] border border-[#E8E2D9] flex items-center justify-center text-[#8B7355] flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#7A6E60] uppercase tracking-wider mb-0.5">Teléfono / WhatsApp</h3>
                    <p className="text-[#1A1A1A] text-sm font-medium">+54 9 11 1234-5678</p>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FAF8F4] border border-[#E8E2D9] flex items-center justify-center text-[#8B7355] flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#7A6E60] uppercase tracking-wider mb-0.5">Ubicación del taller</h3>
                    <p className="text-[#1A1A1A] text-sm font-medium">Palermo, Ciudad de Buenos Aires, Argentina</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Formulario de contacto */}
            <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-[#E8E2D9]/80">
              {sent ? (
                <div className="text-center py-12 space-y-4">
                  <CheckCircle className="w-16 h-16 text-[#8B7355] mx-auto" />
                  <h2 className="font-display text-2xl font-bold text-[#1A1A1A]">¡Mensaje enviado con éxito!</h2>
                  <p className="text-[#4A4A4A] text-sm">
                    Muchas gracias por contactarte. Nos pondremos en contacto con vos a la brevedad.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-semibold text-[#7A6E60] uppercase tracking-wider">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej: Sofía Pérez"
                        className="w-full px-4 py-3 rounded-lg border border-[#E8E2D9] bg-white text-sm placeholder-[#7A6E60] focus:border-[#8B7355] focus:outline-none transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-semibold text-[#7A6E60] uppercase tracking-wider">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Ej: sofia@mail.com"
                        className="w-full px-4 py-3 rounded-lg border border-[#E8E2D9] bg-white text-sm placeholder-[#7A6E60] focus:border-[#8B7355] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Mensaje */}
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-xs font-semibold text-[#7A6E60] uppercase tracking-wider">
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Escribí tu consulta acá..."
                      className="w-full px-4 py-3 rounded-lg border border-[#E8E2D9] bg-white text-sm placeholder-[#7A6E60] focus:border-[#8B7355] focus:outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" variant="primary" className="w-full sm:w-auto">
                    Enviar mensaje
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
