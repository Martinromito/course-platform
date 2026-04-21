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
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">¡Hola, {user?.name}! 👋</h1>
          <p className="text-slate-400 mt-2">Bienvenido a tu plataforma de aprendizaje.</p>
        </div>

        {!user?.isPaid ? (
          <div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 rounded-3xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Acceso Limitado</h2>
            <p className="text-slate-300 max-w-2xl mx-auto mb-8">
              Tu cuenta está activa, pero aún no tienes acceso completo al curso. 
              Completa tu pago para desbloquear todos los módulos y empezar a aprender.
            </p>
            <Button size="lg" onClick={() => router.push('/#precio')}>
              Desbloquear curso ahora
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Contenido del Curso</h2>
              {modules.map((mod, idx) => (
                <div key={mod._id} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
                    <h3 className="font-bold text-white">Módulo {idx + 1}: {mod.title}</h3>
                    <span className="text-xs text-slate-500">{mod.lessons.length} lecciones</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {mod.lessons.map((lesson) => (
                      <button
                        key={lesson._id}
                        onClick={() => router.push(`/dashboard/course/${mod._id}/${lesson._id}`)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-violet-600/20 group-hover:text-violet-400 transition-colors">
                            ▶
                          </div>
                          <div>
                            <span className="text-slate-200 font-medium">{lesson.title}</span>
                          </div>
                        </div>
                        {lesson.isPreview && !user?.isPaid && (
                          <span className="text-[10px] font-bold bg-green-500/10 text-green-400 px-2 py-1 rounded uppercase tracking-wider">
                            Vista previa
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Tu progreso</h2>
                <div className="w-full bg-slate-800 rounded-full h-2.5 mb-2">
                  <div className="bg-violet-600 h-2.5 rounded-full w-[10%]"></div>
                </div>
                <p className="text-sm text-slate-400">Has completado el 10% del curso</p>
                
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-slate-300 mb-4">Soporte</h3>
                  <p className="text-xs text-slate-500 mb-4">¿Tienes alguna duda o problema técnico?</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Contactar soporte
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
