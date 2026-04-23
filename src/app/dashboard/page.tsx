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
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

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
        }
      } catch (err) {
        toast.error('Error al cargar el contenido');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchContent();
  }, [user, authLoading, router]);

  const [editingModule, setEditingModule] = useState<any>(null);

  const addModule = async () => {
    const title = prompt('Nombre del nuevo módulo:');
    if (!title) return;

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, order: modules.length + 1 }),
      });
      if (res.ok) {
        toast.success('Módulo creado con éxito');
        refreshData();
      }
    } catch (err) {
      toast.error('Error al crear módulo');
    }
  };

  const refreshData = async () => {
    const modRes = await fetch('/api/course/modules');
    const modData = await modRes.json();
    setModules(modData.modules);
  };

  const deleteModule = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este módulo?')) return;

    try {
      const res = await fetch(`/api/admin/content?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Módulo eliminado');
        setModules(modules.filter(m => m._id !== id));
      }
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const saveModuleChanges = async () => {
    if (!editingModule) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/content/${editingModule._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingModule),
      });
      
      if (res.ok) {
        toast.success('Módulo actualizado correctamente');
        setEditingModule(null);
        refreshData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Error al actualizar');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const addLesson = () => {
    if (!editingModule) return;
    const newLesson = {
      _id: `temp-${Date.now()}`,
      title: 'Nueva Lección',
      description: '',
      videoUrl: '',
      videoType: 'youtube',
      order: (editingModule.lessons?.length || 0) + 1,
      isPreview: false,
    };
    setEditingModule({
      ...editingModule,
      lessons: [...(editingModule.lessons || []), newLesson]
    });
  };

  const updateLesson = (index: number, field: string, value: any) => {
    if (!editingModule) return;
    const updatedLessons = [...editingModule.lessons];
    updatedLessons[index] = { ...updatedLessons[index], [field]: value };
    setEditingModule({ ...editingModule, lessons: updatedLessons });
  };

  const removeLesson = (index: number) => {
    if (!editingModule) return;
    const updatedLessons = editingModule.lessons.filter((_: any, i: number) => i !== index);
    setEditingModule({ ...editingModule, lessons: updatedLessons });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b04b2b]"></div>
      </div>
    );
  }

  // Si es admin, mostrar la vista de administrador
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16 sm:pb-20">
          
          {/* HEADER DASHBOARD / EDITOR */}
          <div className="mb-8 sm:mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#1A1A1A]">
                {editingModule ? 'Editando Módulo' : 'Panel de Control 🛠️'}
              </h1>
              <p className="text-[#705E45] mt-2 sm:mt-3 font-medium text-sm sm:text-lg">
                {editingModule ? `Ajustando los detalles de "${editingModule.title}"` : `Bienvenida, ${user?.name}. Aquí puedes gestionar tu academia.`}
              </p>
            </div>
            <div className="flex gap-4">
              {editingModule ? (
                <>
                  <Button variant="outline" onClick={() => setEditingModule(null)}>Cancelar</Button>
                  <Button onClick={saveModuleChanges}>Guardar Cambios</Button>
                </>
              ) : (
                <Button size="md" variant="outline" onClick={() => toast.success('Próximamente: Vista previa')}>Ver como alumno</Button>
              )}
            </div>
          </div>

          {editingModule ? (
            /* VISTA DEL EDITOR */
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Información General del Módulo */}
              <div className="bg-white border border-[#E5E0D8] rounded-[28px] sm:rounded-[40px] p-6 sm:p-10 shadow-sm">
                <h2 className="text-2xl font-black text-[#1A1A1A] mb-8 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#FAF9F6] flex items-center justify-center text-xl">📁</span>
                  Información General
                </h2>
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#8B7355]">Título del Módulo</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#FAF9F6] border border-[#E5E0D8] rounded-2xl px-6 py-4 text-[#1A1A1A] font-bold focus:outline-none focus:ring-2 focus:ring-[#b04b2b]/20"
                      value={editingModule.title}
                      onChange={(e) => setEditingModule({...editingModule, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#8B7355]">Descripción</label>
                    <textarea 
                      className="w-full bg-[#FAF9F6] border border-[#E5E0D8] rounded-2xl px-6 py-4 text-[#1A1A1A] font-medium min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#b04b2b]/20"
                      value={editingModule.description}
                      onChange={(e) => setEditingModule({...editingModule, description: e.target.value})}
                      placeholder="Describe de qué trata este módulo..."
                    />
                  </div>
                </div>
              </div>

              {/* Listado de Lecciones */}
              <div className="bg-white border border-[#E5E0D8] rounded-[28px] sm:rounded-[40px] p-6 sm:p-10 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black text-[#1A1A1A] flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#FAF9F6] flex items-center justify-center text-xl">🎬</span>
                    Lecciones del Módulo
                  </h2>
                  <Button variant="outline" size="sm" onClick={addLesson}>+ Añadir Lección</Button>
                </div>

                <div className="space-y-6">
                  {editingModule.lessons?.map((lesson: any, index: number) => (
                    <div key={lesson._id} className="p-5 sm:p-8 bg-[#FAF9F6] border border-[#E5E0D8] rounded-2xl sm:rounded-3xl relative group">
                      <div className="flex justify-between items-start mb-6">
                        <span className="bg-[#8B7355] text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <button 
                          onClick={() => removeLesson(index)}
                          className="text-red-400 hover:text-red-600 font-bold text-xs uppercase tracking-widest"
                        >
                          Eliminar Lección
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#705E45]">Título de la clase</label>
                          <input 
                            type="text" 
                            className="w-full bg-white border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#1A1A1A] font-bold text-sm focus:outline-none"
                            value={lesson.title}
                            onChange={(e) => updateLesson(index, 'title', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#705E45]">URL de Video (YouTube)</label>
                          <input 
                            type="text" 
                            className="w-full bg-white border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#1A1A1A] font-medium text-sm focus:outline-none"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={lesson.videoUrl}
                            onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#705E45]">Descripción corta</label>
                          <input 
                            type="text" 
                            className="w-full bg-white border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#1A1A1A] font-medium text-sm focus:outline-none"
                            value={lesson.description}
                            onChange={(e) => updateLesson(index, 'description', e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            id={`preview-${index}`}
                            checked={lesson.isPreview}
                            onChange={(e) => updateLesson(index, 'isPreview', e.target.checked)}
                            className="w-4 h-4 accent-[#b04b2b]"
                          />
                          <label htmlFor={`preview-${index}`} className="text-xs font-bold text-[#1A1A1A]">Clase abierta (gratis para todos)</label>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!editingModule.lessons || editingModule.lessons.length === 0) && (
                    <div className="py-12 text-center border-2 border-dashed border-[#E5E0D8] rounded-3xl">
                      <p className="text-[#705E45]">No hay lecciones en este módulo. Comienza añadiendo una.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* VISTA DEL LISTADO (Anterior) */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                <div className="bg-white border border-[#E5E0D8] p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm">
                  <span className="text-xs sm:text-sm font-bold text-[#8B7355] uppercase tracking-widest">Alumnos Totales</span>
                  <div className="text-3xl sm:text-4xl font-black text-[#1A1A1A] mt-2">1,248</div>
                </div>
                <div className="bg-white border border-[#E5E0D8] p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm">
                  <span className="text-xs sm:text-sm font-bold text-[#8B7355] uppercase tracking-widest">Módulos</span>
                  <div className="text-3xl sm:text-4xl font-black text-[#1A1A1A] mt-2">{modules.length}</div>
                </div>
                <div className="bg-white border border-[#E5E0D8] p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm">
                  <span className="text-xs sm:text-sm font-bold text-[#8B7355] uppercase tracking-widest">Ingresos Mes</span>
                  <div className="text-3xl sm:text-4xl font-black text-[#1A1A1A] mt-2">$45,200</div>
                </div>
              </div>

              <div className="bg-white border border-[#E5E0D8] rounded-[28px] sm:rounded-[40px] overflow-hidden shadow-xl shadow-[#b04b2b]/5">
                <div className="p-5 sm:p-8 border-b border-[#E5E0D8] flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-[#FAF9F6]">
                  <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">Gestión de Contenido</h2>
                  <Button size="sm" onClick={addModule}>+ Nuevo Módulo</Button>
                </div>
                
                <div className="divide-y divide-[#E5E0D8]">
                  {modules.length > 0 ? (
                    modules.map((mod, idx) => (
                      <div key={mod._id} className="p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 hover:bg-[#FAF9F6]/50 transition-colors">
                        <div className="flex gap-4 sm:gap-6 items-center">
                          <div className="w-11 h-11 sm:w-14 sm:h-14 bg-[#C5A059]/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-[#8B7355] font-black text-lg sm:text-xl flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-[#1A1A1A] text-base sm:text-xl">{mod.title}</h3>
                            <p className="text-[#705E45] text-sm mt-1">{mod.lessons?.length || 0} lecciones configuradas</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" size="sm" onClick={() => setEditingModule(mod)}>Editar</Button>
                          <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => deleteModule(mod._id)}>Eliminar</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 text-center text-[#705E45]">
                      No hay módulos creados. Haz clic en "+ Nuevo Módulo" para empezar.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  // Vista de Estudiante (Ya existente)
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16 sm:pb-20">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-black text-[#1A1A1A]">¡Hola de nuevo, {user?.name}! 👋</h1>
          <p className="text-[#705E45] mt-2 sm:mt-3 font-medium text-sm sm:text-lg">Es un gran día para seguir creando algo hermoso.</p>
        </div>

        {!user?.isPaid ? (
          <div className="bg-white border border-[#E5E0D8] rounded-[28px] sm:rounded-[40px] p-8 sm:p-12 text-center shadow-xl shadow-[#b04b2b]/5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#C5A059]/20 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6 text-2xl sm:text-3xl">🔒</div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] mb-3 sm:mb-4">Acceso Limitado</h2>
            <p className="text-[#4A4A4A] max-w-2xl mx-auto mb-8 sm:mb-10 text-base sm:text-lg leading-relaxed">
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
              <h2 className="text-2xl font-black text-[#1A1A1A]">Tu Contenido</h2>
              {modules.length > 0 ? (
                modules.map((mod, idx) => {
                  const isExpanded = expandedModules[mod._id];
                  return (
                    <div key={mod._id} className="bg-white border border-[#E5E0D8] rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <button 
                        onClick={() => toggleModule(mod._id)}
                        className="w-full p-6 sm:p-8 bg-[#FAF9F6] flex justify-between items-center text-left group"
                      >
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/20 flex items-center justify-center text-[#8B7355] font-black text-xl group-hover:scale-110 transition-transform">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-[#1A1A1A] text-lg sm:text-xl group-hover:text-[#8B7355] transition-colors">{mod.title}</h3>
                            <span className="text-xs font-bold text-[#8B7355] uppercase tracking-widest">{mod.lessons.length} lecciones</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="hidden sm:inline-block text-xs font-black text-[#705E45] uppercase tracking-widest">{isExpanded ? 'Ver menos' : 'Ver contenido'}</span>
                          <div className={`w-10 h-10 rounded-full bg-white border border-[#E5E0D8] flex items-center justify-center text-[#8B7355] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                      
                      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="divide-y divide-[#E5E0D8]/30 border-t border-[#E5E0D8]">
                          {mod.lessons.map((lesson) => (
                            <button
                              key={lesson._id}
                              onClick={() => router.push(`/dashboard/course/${mod._id}/${lesson._id}`)}
                              className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-[#FAF9F6] transition-colors text-left group/lesson"
                            >
                              <div className="flex items-center gap-5">
                                <div className="w-10 h-10 rounded-xl bg-[#d7ccc8]/20 flex items-center justify-center text-[#8B7355] group-hover/lesson:bg-[#8B7355] group-hover/lesson:text-white transition-all">
                                  <span className="text-xs">▶</span>
                                </div>
                                <div>
                                  <span className="text-[#1A1A1A] font-bold group-hover/lesson:text-[#8B7355] transition-colors">{lesson.title}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {lesson.isPreview && !user?.isPaid && (
                                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase tracking-wider border border-green-200">
                                    Clase abierta
                                  </span>
                                )}
                                <span className="text-[#8B7355] font-bold text-xs opacity-0 group-hover/lesson:opacity-100 transition-opacity">Comenzar →</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center">
                  <p className="text-[#705E45]">No hay contenido disponible todavía.</p>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="bg-white border border-[#E5E0D8] rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-black text-[#1A1A1A] mb-6">Tu progreso</h2>
                <div className="w-full bg-[#FAF9F6] rounded-full h-3 mb-3 border border-[#E5E0D8]/30">
                  <div className="bg-[#8B7355] h-full rounded-full w-[10%] shadow-lg shadow-[#b04b2b]/20"></div>
                </div>
                <p className="text-sm font-bold text-[#705E45]">10% completado</p>
                
                <div className="mt-8 pt-8 border-t border-[#E5E0D8]">
                  <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-widest mb-4">Ayuda Personalizada</h3>
                  <p className="text-sm text-[#4A4A4A] mb-6 leading-relaxed">¿Tienes dudas con algún proyecto? Estamos aquí para ayudarte.</p>
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
