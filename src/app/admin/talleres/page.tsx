// src/app/admin/talleres/page.tsx
// ABM de Talleres Online (Admin) — CRUD de videoclases de YouTube

'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Trash2, Edit2, Plus, Play, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Workshop {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number | null;
  image: string;
  youtubeId: string;
  badge: string | null;
  isActive: boolean;
}

export default function AdminTalleresPage() {
  const router = useRouter();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Workshop>>({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const checkRes = await fetch('/api/admin/check');
        const checkData = await checkRes.json();

        if (!checkData.authenticated) {
          router.push('/admin/login');
          return;
        }
        await fetchWorkshops();
      } catch {
        toast.error('Error de autenticación');
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchWorkshops = async () => {
    try {
      const res = await fetch('/api/admin/workshops');
      const data = await res.json();
      if (res.ok) setWorkshops(data.workshops || []);
    } catch {
      toast.error('Error al cargar talleres');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (workshop?: Workshop) => {
    if (workshop) {
      setFormData(workshop);
    } else {
      setFormData({
        title: '',
        description: '',
        price: 0,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=600',
        youtubeId: '',
        badge: '',
        isActive: true,
      });
    }
    setIsEditing(true);
  };

  const handleCloseForm = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isNew = !formData.id;
      const url = isNew ? '/api/admin/workshops' : `/api/admin/workshops/${formData.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      toast.success(isNew ? 'Taller creado' : 'Taller actualizado');
      await fetchWorkshops();
      handleCloseForm();
    } catch {
      toast.error('Error al guardar taller');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este taller?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/workshops/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Taller eliminado');
      await fetchWorkshops();
    } catch {
      toast.error('Error al eliminar');
      setLoading(false);
    }
  };

  if (loading && workshops.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#8B7355]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] pt-28 pb-16">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => router.push('/admin')}
              className="group mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#8B7355] hover:text-[#705E45] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Volver al Panel
            </button>
            <h1 className="font-display text-3xl font-bold text-[#1A1A1A] flex items-center gap-3">
              <Play className="w-8 h-8 text-[#8B7355]" />
              Talleres Online
            </h1>
            <p className="text-[#7A6E60] text-sm">Gestión de cursos y talleres de un único video</p>
          </div>
          {!isEditing && (
            <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nuevo Taller
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D9] shadow-sm animate-fade-in-up">
            <h2 className="text-xl font-bold mb-6 text-slate-800">
              {formData.id ? 'Editar Taller' : 'Crear Taller'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <Input
                  label="Título del Taller"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="text-slate-800"
                />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Descripción del Contenido</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full rounded-xl border border-[#d7ccc8] bg-white px-4 py-3 text-slate-800 placeholder-[#8d6e63] focus:border-[#b04b2b] focus:outline-none focus:ring-2 focus:ring-[#b04b2b]/10 transition-all duration-200"
                  required
                />
              </div>
              <Input
                label="Precio (ARS)"
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                required
                className="text-slate-800"
              />
              <Input
                label="Precio Anterior (opcional)"
                type="number"
                value={formData.originalPrice || ''}
                onChange={(e) => setFormData({...formData, originalPrice: e.target.value ? Number(e.target.value) : null})}
                className="text-slate-800"
              />
              <div className="sm:col-span-2">
                <Input
                  label="ID del Video de YouTube (Ej: dQw4w9WgXcQ)"
                  value={formData.youtubeId || ''}
                  onChange={(e) => setFormData({...formData, youtubeId: e.target.value})}
                  required
                  className="text-slate-800"
                />
                {formData.youtubeId && (
                  <p className="text-[11px] text-[#7A6E60] mt-1.5 flex items-center gap-1.5">
                    <span>Video ID configurado:</span>
                    <a
                      href={`https://youtube.com/watch?v=${formData.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8B7355] flex items-center gap-0.5 hover:underline font-semibold"
                    >
                      Probar enlace externo <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="URL Imagen de Portada"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  required
                  className="text-slate-800"
                />
              </div>
              <Input
                label="Etiqueta (Ej: Nuevo, Recomendado)"
                value={formData.badge || ''}
                onChange={(e) => setFormData({...formData, badge: e.target.value})}
                className="text-slate-800"
              />
              
              <div className="sm:col-span-2 flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive !== false}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 accent-[#8B7355]"
                />
                <label htmlFor="isActive" className="font-medium text-[#1A1A1A]">
                  Taller Activo (visible en la academia pública)
                </label>
              </div>

              <div className="sm:col-span-2 flex gap-3 mt-6">
                <Button type="submit" loading={loading}>Guardar Taller</Button>
                <Button type="button" variant="outline" onClick={handleCloseForm} disabled={loading}>Cancelar</Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F4] border-b border-[#E8E2D9] text-xs uppercase tracking-wider text-[#7A6E60]">
                    <th className="p-4 font-semibold">Taller</th>
                    <th className="p-4 font-semibold">Precio</th>
                    <th className="p-4 font-semibold">YouTube ID</th>
                    <th className="p-4 font-semibold">Estado</th>
                    <th className="p-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9]/60 text-sm">
                  {workshops.map((workshop) => (
                    <tr key={workshop.id} className="hover:bg-[#FAF8F4]/50 transition-colors text-[#1A1A1A]">
                      <td className="p-4 flex items-center gap-3">
                        <img src={workshop.image} alt={workshop.title} className="w-12 h-8 rounded object-cover bg-[#F5F0E8]" />
                        <span className="font-medium">{workshop.title}</span>
                      </td>
                      <td className="p-4 font-medium">${workshop.price.toLocaleString('es-AR')}</td>
                      <td className="p-4 font-mono text-xs">{workshop.youtubeId}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${workshop.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {workshop.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2 text-[#7A6E60]">
                        <button onClick={() => handleOpenForm(workshop)} className="p-1.5 hover:bg-[#F2F0ED] rounded transition-colors cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(workshop.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {workshops.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#7A6E60]">
                        No hay talleres registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
