// src/components/landing/BenefitsSection.tsx
// Sección de beneficios del curso

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
    <section id="beneficios" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest">
            ¿Por qué elegirnos?
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mt-3 mb-4">
            Todo lo que necesitas para{' '}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              triunfar
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Un curso diseñado para llevarte de cero a empleado (o freelancer) en el menor tiempo posible.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="group relative p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-violet-500/50 hover:bg-slate-900 transition-all duration-300"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="text-4xl mb-4">{b.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{b.title}</h3>
                <p className="text-slate-400 leading-relaxed">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
