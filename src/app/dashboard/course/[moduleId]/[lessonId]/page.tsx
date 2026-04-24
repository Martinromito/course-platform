// src/app/dashboard/course/[moduleId]/[lessonId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/landing/Navbar';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import Script from 'next/script';

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
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
            
            // Auto-expand current module and find current lesson
            let found = false;
            for (const mod of data.modules) {
              const lesson = mod.lessons.find((l: Lesson) => l._id === lessonId);
              if (lesson) {
                setCurrentLesson(lesson);
                setExpandedModules(prev => ({ ...prev, [mod._id]: true }));
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
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b04b2b]"></div>
      </div>
    );
  }

  const renderVideo = () => {
    if (!currentLesson?.videoUrl) {
      return (
        <div className="aspect-video bg-[#1A1A1A] flex items-center justify-center flex-col p-4 sm:p-8 text-center rounded-[24px] sm:rounded-[40px] border-4 sm:border-8 border-white shadow-2xl">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-white text-3xl sm:text-4xl">🔒</div>
          <h3 className="text-white font-black text-xl sm:text-2xl mb-3 sm:mb-4">Contenido bloqueado</h3>
          <p className="text-[#E5E0D8] max-w-sm text-sm sm:text-base">Debes inscribirte a la academia para acceder a este proyecto.</p>
          <Button className="mt-6 sm:mt-8 px-6 sm:px-10" onClick={() => router.push('/#precio')}>Inscribirme ahora</Button>
        </div>
      );
    }

    if (currentLesson.videoType === 'youtube') {
      const videoId = getYoutubeId(currentLesson.videoUrl);
      return (
        <div className="rounded-[24px] sm:rounded-[40px] overflow-hidden border-4 sm:border-8 border-white shadow-2xl bg-black">
          <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
          <div 
            className="plyr__video-embed" 
            id="player"
            style={{ 
              '--plyr-color-main': '#8B7355',
            } as React.CSSProperties}
          >
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?origin=${typeof window !== 'undefined' ? window.location.origin : ''}&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1`}
              allowFullScreen
              allow="autoplay"
            ></iframe>
          </div>
          <Script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js" strategy="afterInteractive" onLoad={() => {
            // @ts-ignore
            if (typeof Plyr !== 'undefined') {
              // @ts-ignore
              new Plyr('#player', {
                controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
                tooltips: { controls: true, seek: true },
              });
            }
          }} />
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
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col lg:h-screen">
      <Navbar />
      
      <div className="flex-1 pt-16 sm:pt-24 flex flex-col lg:flex-row lg:overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-96 bg-white lg:border-r border-t lg:border-t-0 border-[#E5E0D8] flex-shrink-0 flex flex-col lg:overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-[#E5E0D8] bg-[#FAF9F6] flex justify-between items-center lg:block cursor-pointer lg:cursor-default" onClick={() => setIsSyllabusOpen(!isSyllabusOpen)}>
            <div>
              <h2 className="text-[#1A1A1A] font-black text-lg sm:text-xl flex items-center gap-2">
                <span className="lg:hidden text-base">📖</span>
                Temario del curso
              </h2>
              <p className="text-[#8B7355] text-[10px] font-bold uppercase tracking-widest mt-1 sm:mt-2">
                <span className="lg:hidden">Toca para {isSyllabusOpen ? 'cerrar' : 'abrir'} contenido</span>
                <span className="hidden lg:inline">Progreso y lecciones</span>
              </p>
            </div>
            <button className="lg:hidden text-[#8B7355] flex items-center justify-center w-10 h-10 bg-[#8B7355]/10 rounded-full border border-[#b04b2b]/20 transition-colors active:bg-[#8B7355]/20">
              <svg className={`w-6 h-6 transition-transform duration-300 ${isSyllabusOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          <div className={`flex-1 lg:overflow-y-auto custom-scrollbar transition-all duration-300 ${isSyllabusOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'} overflow-hidden lg:overflow-y-auto`}>
            {modules.map((mod, mIdx) => {
              const isExpanded = expandedModules[mod._id];
              return (
                <div key={mod._id} className="border-b border-[#E5E0D8]/30">
                  <button 
                    onClick={() => toggleModule(mod._id)}
                    className="w-full px-5 sm:px-6 py-4 bg-[#FAF9F6] flex items-center justify-between hover:bg-[#f5eee6] transition-colors group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#8B7355] text-white flex items-center justify-center text-[10px] sm:text-[11px] font-bold flex-shrink-0 shadow-sm">
                        {mIdx + 1}
                      </span>
                      <span className="text-[#1A1A1A] font-black text-xs sm:text-sm uppercase tracking-tight group-hover:text-[#8B7355] transition-colors">{mod.title}</span>
                    </div>
                    <svg className={`w-4 h-4 text-[#705E45] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="divide-y divide-[#E5E0D8]/20 bg-white/50">
                      {mod.lessons.map((lesson) => (
                        <button
                          key={lesson._id}
                          disabled={!user?.isPaid && !lesson.isPreview}
                          onClick={() => router.push(`/dashboard/course/${mod._id}/${lesson._id}`)}
                          className={`w-full flex items-center gap-3 sm:gap-5 p-4 sm:p-5 text-left transition-all relative ${
                            lessonId === lesson._id
                              ? 'bg-[#8B7355] text-white'
                              : !user?.isPaid && !lesson.isPreview
                              ? 'opacity-40 grayscale cursor-not-allowed'
                              : 'hover:bg-[#FAF9F6] text-[#4A4A4A]'
                          }`}
                        >
                          {lessonId === lesson._id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/50" />
                          )}
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            lessonId === lesson._id ? 'bg-white/20' : 'bg-[#d7ccc8]/20'
                          }`}>
                            <span className="text-[10px] sm:text-xs">{lessonId === lesson._id ? '●' : '▶'}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs sm:text-sm font-bold leading-tight ${lessonId === lesson._id ? 'text-white' : 'text-[#1A1A1A]'}`}>
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
                </div>
              );
            })}
          </div>
        </aside>

        {/* Player */}
        <main className="flex-1 bg-[#FAF9F6] p-4 sm:p-6 lg:p-12 lg:overflow-y-auto">
          <div className="max-w-5xl mx-auto pb-10 sm:pb-20">
            {renderVideo()}

            {currentLesson && (
              <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-10">
                  <div>
                    <h1 className="text-3xl lg:text-5xl font-black text-[#1A1A1A] tracking-tight">{currentLesson.title}</h1>
                    <div className="flex items-center gap-3 mt-4">
                      <span className="bg-[#C5A059]/20 text-[#8B7355] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                        En curso
                      </span>
                      <span className="text-[#705E45] text-sm font-medium">
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
                
                <div className="bg-white border border-[#E5E0D8] rounded-[40px] p-10 lg:p-12 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#8B7355]" />
                  <h3 className="text-2xl font-black text-[#1A1A1A] mb-8 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#FAF9F6] flex items-center justify-center text-lg">📝</span>
                    Sobre este proyecto
                  </h3>
                  <div className="prose prose-stone max-w-none text-[#4A4A4A] text-lg leading-relaxed">
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
