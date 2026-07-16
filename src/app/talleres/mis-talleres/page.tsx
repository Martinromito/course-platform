// src/app/talleres/mis-talleres/page.tsx
// Biblioteca personal del estudiante — Muestra los talleres comprados por el alumno

import { cookies } from 'next/headers';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import StudentLoginForm from '@/components/workshop/StudentLoginForm';
import StudentLogoutButton from '@/components/workshop/StudentLogoutButton';
import Button from '@/components/ui/Button';
import { getOrders, getWorkshops, formatPrice } from '@/lib/data';
import Link from 'next/link';
import { BookOpen, Video, ArrowRight, Sparkles } from 'lucide-react';

export default async function StudentLibraryPage() {
  const cookieStore = await cookies();
  const studentEmail = cookieStore.get('lamackenna_student')?.value;

  let purchasedWorkshops: any[] = [];

  if (studentEmail) {
    const emailClean = studentEmail.trim().toLowerCase();
    const orders = await getOrders();
    const workshops = await getWorkshops();

    // 1. Obtener todas las órdenes aprobadas asociadas al correo del estudiante
    const approvedOrders = orders.filter(
      (order) => order.status === 'approved' && order.buyerEmail.trim().toLowerCase() === emailClean
    );

    // 2. Mapear los access tokens a los talleres de la orden
    const tokenMap = new Map<string, string>(); // workshopId -> token
    approvedOrders.forEach((order) => {
      if (order.accessTokens) {
        order.accessTokens.forEach((t) => {
          tokenMap.set(t.workshopId, t.token);
        });
      }
    });

    // 3. Cruzar los ids con el catálogo de talleres disponibles y activos
    purchasedWorkshops = workshops
      .filter((w) => tokenMap.has(w.id))
      .map((w) => ({
        ...w,
        accessToken: tokenMap.get(w.id),
      }));
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FAF8F4] pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          
          {/* Caso 1: Estudiante no autenticado */}
          {!studentEmail ? (
            <div className="flex flex-col items-center justify-center py-12">
              <StudentLoginForm />
            </div>
          ) : (
            /* Caso 2: Estudiante autenticado */
            <div className="space-y-8">
              {/* Encabezado del portal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-6">
                <div>
                  <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A1A] flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-[#8B7355]" />
                    Mi Biblioteca
                  </h1>
                  <p className="text-sm text-[#7A6E60] mt-1.5">
                    Sesión iniciada como: <span className="font-semibold text-[#1A1A1A]">{studentEmail}</span>
                  </p>
                </div>
                <div>
                  <StudentLogoutButton />
                </div>
              </div>

              {/* Listado de cursos */}
              {purchasedWorkshops.length === 0 ? (
                <div className="bg-white border border-[#E8E2D9] rounded-3xl p-8 text-center max-w-xl mx-auto shadow-sm space-y-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#1A1A1A] text-lg">No encontramos talleres en tu biblioteca</h3>
                  <p className="text-[#4A4A4A] text-sm leading-relaxed">
                    Si acabas de realizar una compra mediante **Transferencia Bancaria**, ten en cuenta que tu acceso se activará en cuanto el administrador apruebe tu pago (recibirás una notificación por correo electrónico).
                  </p>
                  <p className="text-xs text-[#7A6E60]">
                    Si crees que esto es un error, por favor ponte en contacto con nosotros indicando tu número de orden.
                  </p>
                  <Link href="/talleres" className="inline-block mt-4">
                    <Button variant="primary">Explorar talleres disponibles</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {purchasedWorkshops.map((workshop) => (
                    <div
                      key={workshop.id}
                      className="bg-white border border-[#E8E2D9] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        {/* Portada */}
                        <div className="relative aspect-video w-full overflow-hidden bg-black/5">
                          <img
                            src={workshop.image}
                            alt={workshop.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Datos del Taller */}
                        <div className="p-6">
                          <h3 className="font-display font-bold text-xl text-[#1A1A1A] line-clamp-2">
                            {workshop.title}
                          </h3>
                          <p className="text-[#4A4A4A] text-sm mt-2 line-clamp-3 leading-relaxed">
                            {workshop.description}
                          </p>
                        </div>
                      </div>
                      {/* Enlace de ingreso */}
                      <div className="p-6 pt-0">
                        <Link href={`/talleres/ver/${workshop.accessToken}`}>
                          <button className="w-full flex items-center justify-center gap-2 bg-[#8B7355] hover:bg-[#705c43] text-white py-3 px-4 rounded-xl font-semibold text-sm transition-colors cursor-pointer">
                            <Video className="w-4 h-4" />
                            Ingresar a la Clase
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}
