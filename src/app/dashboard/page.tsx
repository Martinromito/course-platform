// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Navbar from '@/components/landing/Navbar';
import toast from 'react-hot-toast';

interface Lesson {
  _id: string;
  title: string;
  isPreview: boolean;
  videoUrl: string | null;
  order: number;
}

interface Module {
  _id: string;
  title: string;
  lessons: Lesson[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchContent = async () => {
      try {
        const res = await fetch('/api/course/modules');
        const data = await res.json();
        if (res.ok) {
          setModules(data.modules);
        }
      } catch (err) {
        toast.error('Error al cargar el contenido');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchContent();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf5]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-[#3e2723]">¡Hola de nuevo, {user?.name}! 👋</h1>
          <p className="text-[#8d6e63] mt-3 font-medium text-lg">Es un gran día para seguir creando algo hermoso.</p>
        </div>

        {!user?.isPaid ? (
          <div className="bg-white border border-[#d7ccc8] rounded-[40px] p-12 text-center shadow-xl shadow-[#b04b2b]/5">
            <div className="w-20 h-20 bg-[#e9a68a]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🔒</div>
            <h2 className="text-3xl font-black text-[#3e2723] mb-4">Acceso Limitado</h2>
            <p className="text-[#5d4037] max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
              Tu cuenta está activa, pero aún no tienes acceso completo a la academia. 
              Inscríbete hoy para desbloquear todos los proyectos y empezar a aprender con nosotros.
            </p>
            <Button size="xl" onClick={() => router.push('/#precio')}>
              Desbloquear Academia ahora
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <h2 className="text-2xl font-black text-[#3e2723]">Tu Contenido</h2>
              {modules.map((mod, idx) => (
                <div key={mod._id} className="bg-white border border-[#d7ccc8] rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-[#d7ccc8] bg-[#fdfaf5] flex justify-between items-center">
                    <h3 className="font-bold text-[#3e2723] text-lg">Módulo {idx + 1}: {mod.title}</h3>
                    <span className="text-xs font-bold text-[#b04b2b] uppercase tracking-widest">{mod.lessons.length} lecciones</span>
                  </div>
                  <div className="divide-y divide-[#d7ccc8]">
                    {mod.lessons.map((lesson) => (
                      <button
                        key={lesson._id}
                        onClick={() => router.push(`/dashboard/course/${mod._id}/${lesson._id}`)}
                        className="w-full flex items-center justify-between p-5 hover:bg-[#fdfaf5] transition-colors text-left group"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-xl bg-[#d7ccc8]/30 flex items-center justify-center text-[#b04b2b] group-hover:bg-[#b04b2b] group-hover:text-white transition-all">
                            ▶
                          </div>
                          <div>
                            <span className="text-[#3e2723] font-bold group-hover:text-[#b04b2b] transition-colors">{lesson.title}</span>
                          </div>
                        </div>
                        {lesson.isPreview && !user?.isPaid && (
                          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase tracking-wider">
                            Clase abierta
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              <div className="bg-white border border-[#d7ccc8] rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-black text-[#3e2723] mb-6">Tu progreso</h2>
                <div className="w-full bg-[#fdfaf5] rounded-full h-3 mb-3 border border-[#d7ccc8]/30">
                  <div className="bg-[#b04b2b] h-full rounded-full w-[10%] shadow-lg shadow-[#b04b2b]/20"></div>
                </div>
                <p className="text-sm font-bold text-[#8d6e63]">10% completado</p>
                
                <div className="mt-8 pt-8 border-t border-[#d7ccc8]">
                  <h3 className="text-sm font-black text-[#3e2723] uppercase tracking-widest mb-4">Ayuda Personalizada</h3>
                  <p className="text-sm text-[#5d4037] mb-6 leading-relaxed">¿Tienes dudas con algún proyecto? Estamos aquí para ayudarte.</p>
                  <Button variant="outline" size="md" className="w-full">
                    Enviar mensaje
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
