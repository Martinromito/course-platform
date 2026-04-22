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
      <div className="flex-1 pt-24 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar de navegación del curso */}
        <div className="w-full lg:w-80 bg-white border-r border-[#d7ccc8] flex-shrink-0 flex flex-col">
          <div className="p-6 border-b border-[#d7ccc8] bg-[#fdfaf5]">
            <h2 className="text-[#3e2723] font-black text-lg">Contenido</h2>
            <p className="text-[#8d6e63] text-xs font-bold uppercase tracking-widest mt-1">Tu proceso creativo</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#d7ccc8]">
            {modules.map((mod, mIdx) => (
              <div key={mod._id} className="bg-white">
                <div className="px-5 py-3 bg-[#fdfaf5]/50 flex items-center gap-3">
                  <span className="text-[#b04b2b] font-bold text-xs">{mIdx + 1}</span>
                  <span className="text-[#3e2723] font-bold text-xs uppercase tracking-tight">{mod.title}</span>
                </div>
                <div className="divide-y divide-[#d7ccc8]/50">
                  {mod.lessons.map((lesson) => (
                    <button
                      key={lesson._id}
                      disabled={!user?.isPaid && !lesson.isPreview}
                      onClick={() => router.push(`/dashboard/course/${mod._id}/${lesson._id}`)}
                      className={`w-full flex items-center gap-4 p-4 text-left transition-all ${
                        lessonId === lesson._id
                          ? 'bg-[#b04b2b] text-white shadow-inner'
                          : !user?.isPaid && !lesson.isPreview
                          ? 'opacity-40 grayscale cursor-not-allowed'
                          : 'hover:bg-[#fdfaf5] text-[#5d4037]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        lessonId === lesson._id ? 'bg-white/20' : 'bg-[#d7ccc8]/30'
                      }`}>
                        <span className="text-xs">▶</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${lessonId === lesson._id ? 'text-white' : 'text-[#3e2723]'}`}>
                          {lesson.title}
                        </p>
                      </div>
                      {lesson.isPreview && !user?.isPaid && (
                        <span className="text-[8px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 uppercase">Libre</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reproductor Principal */}
        <div className="flex-1 bg-[#fdfaf5] p-6 lg:p-12 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Video Placeholder / Container */}
            <div className="relative aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl mb-10 border-8 border-white">
              {currentLesson ? (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center p-8">
                    <p className="text-xl font-bold mb-4">Reproductor de Video</p>
                    <p className="text-slate-400 text-sm">{currentLesson.videoUrl}</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  Selecciona una lección
                </div>
              )}
            </div>

            {currentLesson && (
              <div className="animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-[#3e2723] mb-2">{currentLesson.title}</h1>
                    <p className="text-[#b04b2b] font-bold text-sm uppercase tracking-widest">Lección en curso</p>
                  </div>
                  <Button 
                    variant={completed ? 'secondary' : 'primary'} 
                    onClick={toggleComplete}
                    disabled={completed}
                    className="rounded-full px-8 border-[#d7ccc8] text-[#3e2723] hover:bg-white"
                  >
                    {completed ? '✓ Completada' : 'Marcar como completada'}
                  </Button>
                </div>
                
                <div className="bg-white border border-[#d7ccc8] rounded-[40px] p-8 lg:p-10 shadow-sm">
                  <h3 className="text-xl font-black text-[#3e2723] mb-6">Descripción del proyecto</h3>
                  <div className="prose prose-stone max-w-none text-[#5d4037] leading-relaxed">
                    {currentLesson.description || 'No hay descripción disponible para esta lección.'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
