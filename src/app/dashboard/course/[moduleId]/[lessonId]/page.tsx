// src/app/dashboard/course/[moduleId]/[lessonId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/landing/Navbar';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface Lesson {
  _id: string;
  title: string;
  description: string;
  videoUrl: string | null;
  videoType: 'youtube' | 'vimeo' | 'direct';
  isPreview: boolean;
}

interface Module {
  _id: string;
  title: string;
  lessons: Lesson[];
}

export default function CoursePlayerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

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
          
          // Encontrar la lección actual
          for (const mod of data.modules) {
            const lesson = mod.lessons.find((l: Lesson) => l._id === params.lessonId);
            if (lesson) {
              setCurrentLesson(lesson);
              break;
            }
          }
        }
      } catch (err) {
        toast.error('Error al cargar la lección');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchContent();
  }, [user, authLoading, router, params.lessonId]);

  const toggleComplete = async () => {
    try {
      const res = await fetch('/api/course/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: params.lessonId }),
      });
      if (res.ok) {
        setCompleted(true);
        toast.success('¡Lección completada!');
      }
    } catch (err) {
      toast.error('Error al actualizar progreso');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Lección no encontrada</h1>
        <Button onClick={() => router.push('/dashboard')}>Volver al dashboard</Button>
      </div>
    );
  }

  const renderVideo = () => {
    if (!currentLesson.videoUrl) {
      return (
        <div className="aspect-video bg-slate-900 flex items-center justify-center flex-col p-8 text-center rounded-2xl border border-slate-800">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-500 text-2xl">🔒</div>
          <h3 className="text-white font-bold text-xl mb-2">Contenido bloqueado</h3>
          <p className="text-slate-400">Debes completar el pago para ver esta lección.</p>
          <Button className="mt-6" onClick={() => router.push('/#precio')}>Pagar ahora</Button>
        </div>
      );
    }

    // Si es YouTube
    if (currentLesson.videoType === 'youtube') {
      const videoId = currentLesson.videoUrl.split('v=')[1] || currentLesson.videoUrl.split('/').pop();
      return (
        <div className="aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-black">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={currentLesson.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    // HTML5 Video genérico
    return (
      <div className="aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-black">
        <video src={currentLesson.videoUrl} controls className="w-full h-full"></video>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <main className="max-w-[1600px] mx-auto px-4 pt-24 pb-12 flex flex-col lg:flex-row gap-8">
        {/* Lado izquierdo: Video y descripción */}
        <div className="flex-1 space-y-6">
          {renderVideo()}
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">{currentLesson.title}</h1>
                <p className="text-slate-400 mt-1">Lección #{currentLesson._id.slice(-4)}</p>
              </div>
              {user?.isPaid && (
                <Button 
                  variant={completed ? 'secondary' : 'primary'} 
                  onClick={toggleComplete}
                  disabled={completed}
                >
                  {completed ? '✓ Completada' : 'Marcar como completada'}
                </Button>
              )}
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 leading-relaxed">
                {currentLesson.description || 'No hay descripción disponible para esta lección.'}
              </p>
            </div>
          </div>
        </div>

        {/* Lado derecho: Lista de reproducción */}
        <div className="w-full lg:w-[400px] space-y-4">
          <h2 className="text-xl font-bold text-white px-2">Contenido del curso</h2>
          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
            {modules.map((mod, mIdx) => (
              <div key={mod._id} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 bg-slate-800/50 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-slate-200">Módulo {mIdx + 1}: {mod.title}</h3>
                </div>
                <div className="divide-y divide-slate-800">
                  {mod.lessons.map((lesson) => (
                    <button
                      key={lesson._id}
                      onClick={() => router.push(`/dashboard/course/${mod._id}/${lesson._id}`)}
                      className={`w-full flex items-center gap-3 p-4 hover:bg-slate-800/30 transition-colors text-left ${
                        params.lessonId === lesson._id ? 'bg-violet-600/10 border-l-4 border-violet-500' : ''
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                        params.lessonId === lesson._id ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-500'
                      }`}>
                        ▶
                      </div>
                      <span className={`text-sm font-medium ${
                        params.lessonId === lesson._id ? 'text-violet-400' : 'text-slate-400'
                      }`}>
                        {lesson.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
