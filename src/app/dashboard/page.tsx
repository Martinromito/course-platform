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
      <div className="min-h-screen bg-[#fdfaf5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b04b2b]"></div>
      </div>
    );
  }

  // Si es admin, mostrar la vista de administrador
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-[#fdfaf5]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          
          {/* HEADER DASHBOARD / EDITOR */}
          <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-black text-[#3e2723]">
                {editingModule ? 'Editando Módulo' : 'Panel de Control 🛠️'}
              </h1>
              <p className="text-[#8d6e63] mt-3 font-medium text-lg">
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
              <div className="bg-white border border-[#d7ccc8] rounded-[40px] p-10 shadow-sm">
                <h2 className="text-2xl font-black text-[#3e2723] mb-8 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#fdfaf5] flex items-center justify-center text-xl">📁</span>
                  Información General
                </h2>
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#b04b2b]">Título del Módulo</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#fdfaf5] border border-[#d7ccc8] rounded-2xl px-6 py-4 text-[#3e2723] font-bold focus:outline-none focus:ring-2 focus:ring-[#b04b2b]/20"
                      value={editingModule.title}
                      onChange={(e) => setEditingModule({...editingModule, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#b04b2b]">Descripción</label>
                    <textarea 
                      className="w-full bg-[#fdfaf5] border border-[#d7ccc8] rounded-2xl px-6 py-4 text-[#3e2723] font-medium min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#b04b2b]/20"
                      value={editingModule.description}
                      onChange={(e) => setEditingModule({...editingModule, description: e.target.value})}
                      placeholder="Describe de qué trata este módulo..."
                    />
                  </div>
                </div>
              </div>

              {/* Listado de Lecciones */}
              <div className="bg-white border border-[#d7ccc8] rounded-[40px] p-10 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black text-[#3e2723] flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#fdfaf5] flex items-center justify-center text-xl">🎬</span>
                    Lecciones del Módulo
                  </h2>
                  <Button variant="outline" size="sm" onClick={addLesson}>+ Añadir Lección</Button>
                </div>

                <div className="space-y-6">
                  {editingModule.lessons?.map((lesson: any, index: number) => (
                    <div key={lesson._id} className="p-8 bg-[#fdfaf5] border border-[#d7ccc8] rounded-3xl relative group">
                      <div className="flex justify-between items-start mb-6">
                        <span className="bg-[#b04b2b] text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
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
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#8d6e63]">Título de la clase</label>
                          <input 
                            type="text" 
                            className="w-full bg-white border border-[#d7ccc8] rounded-xl px-4 py-3 text-[#3e2723] font-bold text-sm focus:outline-none"
                            value={lesson.title}
                            onChange={(e) => updateLesson(index, 'title', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#8d6e63]">URL de Video (YouTube)</label>
                          <input 
                            type="text" 
                            className="w-full bg-white border border-[#d7ccc8] rounded-xl px-4 py-3 text-[#3e2723] font-medium text-sm focus:outline-none"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={lesson.videoUrl}
                            onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#8d6e63]">Descripción corta</label>
                          <input 
                            type="text" 
                            className="w-full bg-white border border-[#d7ccc8] rounded-xl px-4 py-3 text-[#3e2723] font-medium text-sm focus:outline-none"
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
                          <label htmlFor={`preview-${index}`} className="text-xs font-bold text-[#3e2723]">Clase abierta (gratis para todos)</label>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!editingModule.lessons || editingModule.lessons.length === 0) && (
                    <div className="py-12 text-center border-2 border-dashed border-[#d7ccc8] rounded-3xl">
                      <p className="text-[#8d6e63]">No hay lecciones en este módulo. Comienza añadiendo una.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* VISTA DEL LISTADO (Anterior) */
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white border border-[#d7ccc8] p-8 rounded-3xl shadow-sm">
                  <span className="text-sm font-bold text-[#b04b2b] uppercase tracking-widest">Alumnos Totales</span>
                  <div className="text-4xl font-black text-[#3e2723] mt-2">1,248</div>
                </div>
                <div className="bg-white border border-[#d7ccc8] p-8 rounded-3xl shadow-sm">
                  <span className="text-sm font-bold text-[#b04b2b] uppercase tracking-widest">Módulos</span>
                  <div className="text-4xl font-black text-[#3e2723] mt-2">{modules.length}</div>
                </div>
                <div className="bg-white border border-[#d7ccc8] p-8 rounded-3xl shadow-sm">
                  <span className="text-sm font-bold text-[#b04b2b] uppercase tracking-widest">Ingresos Mes</span>
                  <div className="text-4xl font-black text-[#3e2723] mt-2">$45,200</div>
                </div>
              </div>

              <div className="bg-white border border-[#d7ccc8] rounded-[40px] overflow-hidden shadow-xl shadow-[#b04b2b]/5">
                <div className="p-8 border-b border-[#d7ccc8] flex justify-between items-center bg-[#fdfaf5]">
                  <h2 className="text-2xl font-black text-[#3e2723]">Gestión de Contenido</h2>
                  <Button size="sm" onClick={addModule}>+ Nuevo Módulo</Button>
                </div>
                
                <div className="divide-y divide-[#d7ccc8]">
                  {modules.length > 0 ? (
                    modules.map((mod, idx) => (
                      <div key={mod._id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#fdfaf5]/50 transition-colors">
                        <div className="flex gap-6 items-center">
                          <div className="w-14 h-14 bg-[#e9a68a]/20 rounded-2xl flex items-center justify-center text-[#b04b2b] font-black text-xl">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-[#3e2723] text-xl">{mod.title}</h3>
                            <p className="text-[#8d6e63] text-sm mt-1">{mod.lessons?.length || 0} lecciones configuradas</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" size="sm" onClick={() => setEditingModule(mod)}>Editar</Button>
                          <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => deleteModule(mod._id)}>Eliminar</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 text-center text-[#8d6e63]">
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
              {modules.length > 0 ? (
                modules.map((mod, idx) => (
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
                ))
              ) : (
                <div className="bg-white border border-[#d7ccc8] rounded-3xl p-12 text-center">
                  <p className="text-[#8d6e63]">No hay contenido disponible todavía.</p>
                </div>
              )}
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
