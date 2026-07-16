// src/app/talleres/ver/[token]/page.tsx
// Reproductor de video de Taller Online — Protegido y validado por token de orden

import { getOrders, getWorkshopById } from '@/lib/data';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { notFound } from 'next/navigation';
import { ShieldCheck, Video } from 'lucide-react';
import WorkshopPlayer from '@/components/workshop/WorkshopPlayer';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function WorkshopPlayerPage({ params }: PageProps) {
  const { token } = await params;

  // Buscar token en las órdenes aprobadas
  const orders = await getOrders();
  let foundWorkshopId: string | null = null;
  let buyerName = '';

  for (const order of orders) {
    if (order.status === 'approved' && order.accessTokens) {
      const match = order.accessTokens.find((t) => t.token === token);
      if (match) {
        foundWorkshopId = match.workshopId;
        buyerName = order.buyerName;
        break;
      }
    }
  }

  if (!foundWorkshopId) {
    return notFound();
  }

  const workshop = await getWorkshopById(foundWorkshopId);
  if (!workshop || !workshop.isActive) {
    return notFound();
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FAF8F4] pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-5">
          {/* Alerta de seguridad y bienvenida */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E8E2D9] rounded-2xl p-4 mb-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-700 flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">Acceso Verificado</p>
                <p className="text-xs text-[#7A6E60]">Hola {buyerName}, este taller está listo para ser reproducido.</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#8B7355] font-medium bg-[#8B7355]/5 px-3 py-1.5 rounded-lg border border-[#8B7355]/10">
              <Video className="w-3.5 h-3.5" />
              <span>Acceso de por vida</span>
            </div>
          </div>

          {/* Título y Descripción */}
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-3">
              {workshop.title}
            </h1>
            <p className="text-[#4A4A4A] text-sm sm:text-base leading-relaxed">
              {workshop.description}
            </p>
          </div>

          {/* Reproductor de Video Protegido sin redirecciones externas */}
          <WorkshopPlayer youtubeId={workshop.youtubeId} title={workshop.title} />

          {/* Recomendaciones */}
          <div className="mt-8 text-center text-xs text-[#7A6E60]">
            <p>Este video está embebido de forma privada y protegida. Por favor, no compartas tu enlace de acceso.</p>
            <p className="mt-1">Si tienes inconvenientes con la reproducción, recarga la página o ponte en contacto con nosotros.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
