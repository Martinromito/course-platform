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
  const { moduleId, lessonId } = params;
  
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false); // New state for mobile syllabus

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
          let found = false;
          for (const mod of data.modules) {
            const lesson = mod.lessons.find((l: Lesson) => l._id === lessonId);
            if (lesson) {
              setCurrentLesson(lesson);
              found = true;
              break;
            }
          }
          if (!found) {
            toast.error('Lección no encontrada');
          }
        }
      } catch (err) {
        toast.error('Error al cargar el contenido');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchContent();
  }, [user, authLoading, router, lessonId]);

  const toggleComplete = async () => {
    try {
      const res = await fetch('/api/course/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      });
      if (res.ok) {
        setCompleted(true);
        toast.success('¡Lección completada!');
      }
    } catch (err) {
      toast.error('Error al actualizar progreso');
    }
  };

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fdfaf5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b04b2b]"></div>
      </div>
    );
  }

  const renderVideo = () => {
    if (!currentLesson?.videoUrl) {
      return (
        <div className="aspect-video bg-[#3e2723] flex items-center justify-center flex-col p-4 sm:p-8 text-center rounded-[24px] sm:rounded-[40px] border-4 sm:border-8 border-white shadow-2xl">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-white text-3xl sm:text-4xl">🔒</div>
          <h3 className="text-white font-black text-xl sm:text-2xl mb-3 sm:mb-4">Contenido bloqueado</h3>
          <p className="text-[#d7ccc8] max-w-sm text-sm sm:text-base">Debes inscribirte a la academia para acceder a este proyecto.</p>
          <Button className="mt-6 sm:mt-8 px-6 sm:px-10" onClick={() => router.push('/#precio')}>Inscribirme ahora</Button>
        </div>
      );
    }

    if (currentLesson.videoType === 'youtube') {
      const videoId = getYoutubeId(currentLesson.videoUrl);
      return (
        <div className="aspect-video rounded-[24px] sm:rounded-[40px] overflow-hidden border-4 sm:border-8 border-white shadow-2xl bg-black">
          {videoId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1`}
              title={currentLesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-full text-white">URL de video no válida</div>
          )}
        </div>
      );
    }

    return (
      <div className="aspect-video rounded-[24px] sm:rounded-[40px] overflow-hidden border-4 sm:border-8 border-white shadow-2xl bg-black">
        <video src={currentLesson.videoUrl} controls className="w-full h-full"></video>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fdfaf5] flex flex-col lg:h-screen">
      <Navbar />
      
      <div className="flex-1 pt-16 sm:pt-24 flex flex-col lg:flex-row lg:overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-96 bg-white lg:border-r border-t lg:border-t-0 border-[#d7ccc8] flex-shrink-0 flex flex-col lg:overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-[#d7ccc8] bg-[#fdfaf5] flex justify-between items-center lg:block cursor-pointer lg:cursor-default" onClick={() => setIsSyllabusOpen(!isSyllabusOpen)}>
            <div>
              <h2 className="text-[#3e2723] font-black text-lg sm:text-xl">Contenido</h2>
              <p className="text-[#b04b2b] text-[10px] font-bold uppercase tracking-widest mt-1 sm:mt-2">Tu camino de aprendizaje</p>
            </div>
            <button className="lg:hidden text-[#b04b2b] flex items-center justify-center w-10 h-10 bg-[#b04b2b]/10 rounded-full">
              <svg className={`w-6 h-6 transition-transform duration-300 ${isSyllabusOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          <div className={`flex-1 lg:overflow-y-auto custom-scrollbar transition-all duration-300 ${isSyllabusOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'} overflow-hidden lg:overflow-y-auto`}>
            {modules.map((mod, mIdx) => (
              <div key={mod._id}>
                <div className="px-5 sm:px-6 py-3 sm:py-4 bg-[#fdfaf5] border-b border-[#d7ccc8]/30 flex items-center gap-3 sm:gap-4">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#b04b2b] text-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold flex-shrink-0">
                    {mIdx + 1}
                  </span>
                  <span className="text-[#3e2723] font-black text-xs sm:text-sm uppercase tracking-tight">{mod.title}</span>
                </div>
                <div className="divide-y divide-[#d7ccc8]/30">
                  {mod.lessons.map((lesson) => (
                    <button
                      key={lesson._id}
                      disabled={!user?.isPaid && !lesson.isPreview}
                      onClick={() => router.push(`/dashboard/course/${mod._id}/${lesson._id}`)}
                      className={`w-full flex items-center gap-3 sm:gap-5 p-4 sm:p-6 text-left transition-all ${
                        lessonId === lesson._id
                          ? 'bg-[#b04b2b] text-white'
                          : !user?.isPaid && !lesson.isPreview
                          ? 'opacity-40 grayscale cursor-not-allowed'
                          : 'hover:bg-[#fdfaf5] text-[#5d4037]'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        lessonId === lesson._id ? 'bg-white/20' : 'bg-[#d7ccc8]/30'
                      }`}>
                        <span className="text-[10px] sm:text-xs">▶</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm font-bold leading-tight ${lessonId === lesson._id ? 'text-white' : 'text-[#3e2723]'}`}>
                          {lesson.title}
                        </p>
                      </div>
                      {lesson.isPreview && !user?.isPaid && (
                        <span className="text-[8px] sm:text-[9px] font-black bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full border border-green-200 uppercase tracking-tighter ml-2">Libre</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Player */}
        <main className="flex-1 bg-[#fdfaf5] p-4 sm:p-6 lg:p-12 lg:overflow-y-auto">
          <div className="max-w-5xl mx-auto pb-10 sm:pb-20">
            {renderVideo()}

            {currentLesson && (
              <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-10">
                  <div>
                    <h1 className="text-3xl lg:text-5xl font-black text-[#3e2723] tracking-tight">{currentLesson.title}</h1>
                    <div className="flex items-center gap-3 mt-4">
                      <span className="bg-[#e9a68a]/20 text-[#b04b2b] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                        En curso
                      </span>
                      <span className="text-[#8d6e63] text-sm font-medium">
                        Proyecto #{currentLesson._id.slice(-4)}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant={completed ? 'secondary' : 'primary'} 
                    onClick={toggleComplete}
                    disabled={completed}
                    className={`rounded-full px-10 py-5 text-lg ${completed ? 'opacity-70' : 'shadow-xl shadow-[#b04b2b]/20'}`}
                  >
                    {completed ? '✓ Proyecto finalizado' : 'Marcar como completado'}
                  </Button>
                </div>
                
                <div className="bg-white border border-[#d7ccc8] rounded-[40px] p-10 lg:p-12 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#b04b2b]" />
                  <h3 className="text-2xl font-black text-[#3e2723] mb-8 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#fdfaf5] flex items-center justify-center text-lg">📝</span>
                    Sobre este proyecto
                  </h3>
                  <div className="prose prose-stone max-w-none text-[#5d4037] text-lg leading-relaxed">
                    {currentLesson.description || 'No hay descripción disponible para esta lección.'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
