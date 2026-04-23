// src/components/landing/BenefitsSection.tsx
// Sección de beneficios del curso - Optimizada para mobile

export default function BenefitsSection() {
  const benefits = [
    {
      icon: '🧶',
      title: 'Técnicas ancestrales',
      description: 'Aprende métodos de tejido y costura que han pasado de generación en generación.',
    },
    {
      icon: '🏠',
      title: 'Desde tu hogar',
      description: 'Crea tu propio taller en casa con herramientas simples y de bajo costo.',
    },
    {
      icon: '💼',
      title: 'Salida laboral',
      description: 'Te enseñamos cómo convertir tus creaciones en un negocio rentable y profesional.',
    },
    {
      icon: '📦',
      title: 'Kit de inicio',
      description: 'Guía completa de proveedores para conseguir los mejores materiales al mejor precio.',
    },
    {
      icon: '✨',
      title: 'Diseño exclusivo',
      description: 'No solo copias modelos, aprendes a diseñar tus propias piezas únicas.',
    },
    {
      icon: '🎓',
      title: 'Certificado de Artesano',
      description: 'Al finalizar, recibirás un certificado que avala tus conocimientos técnicos.',
    },
  ];

  return (
    <section id="beneficios" className="py-16 sm:py-24 bg-[#fdfaf5]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <span className="text-[#b04b2b] text-xs sm:text-sm font-bold uppercase tracking-widest">
            ¿Por qué elegirnos?
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#3e2723] mt-3 mb-4">
            Todo lo que necesitas para{' '}
            <span className="text-[#b04b2b]">
              crear y emprender
            </span>
          </h2>
          <p className="text-[#5d4037] text-base sm:text-lg max-w-2xl mx-auto">
            Un espacio pensado para que desarrolles tu creatividad y aprendas técnicas profesionales desde cero.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#d7ccc8] bg-white hover:border-[#b04b2b]/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative flex sm:block items-start gap-4">
                <div className="text-4xl sm:text-5xl sm:mb-6 flex-shrink-0">{b.icon}</div>
                <div>
                  <h3 className="text-[#3e2723] font-bold text-lg sm:text-xl mb-2 sm:mb-3">{b.title}</h3>
                  <p className="text-[#8d6e63] leading-relaxed text-sm sm:text-base">{b.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
