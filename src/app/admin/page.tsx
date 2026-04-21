// src/app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  isPaid: boolean;
}

interface Module {
  _id: string;
  title: string;
  order: number;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form para nuevo módulo
  const [newModTitle, setNewModTitle] = useState('');
  const [newModOrder, setNewModOrder] = useState('0');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      }
    }

    const fetchData = async () => {
      try {
        const [usersRes, modsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/modules')
        ]);
        
        const usersData = await usersRes.json();
        const modsData = await modsRes.json();
        
        if (usersRes.ok) setUsers(usersData.users);
        if (modsRes.ok) setModules(modsData.modules);
      } catch (err) {
        toast.error('Error al cargar datos de admin');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') fetchData();
  }, [user, authLoading, router]);

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newModTitle, order: parseInt(newModOrder) }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Módulo creado');
        setModules([...modules, data.module].sort((a, b) => a.order - b.order));
        setNewModTitle('');
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Error al crear módulo');
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Cargando panel...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
            <p className="text-slate-400 mt-2">Gestiona usuarios y contenido del curso.</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>Volver al sitio</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gestión de Módulos */}
          <section className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Crear Nuevo Módulo</h2>
              <form onSubmit={handleCreateModule} className="space-y-4">
                <Input 
                  label="Título del Módulo" 
                  value={newModTitle} 
                  onChange={e => setNewModTitle(e.target.value)}
                  required
                />
                <Input 
                  label="Orden" 
                  type="number" 
                  value={newModOrder} 
                  onChange={e => setNewModOrder(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full">Crear Módulo</Button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Módulos Existentes</h2>
              <div className="space-y-3">
                {modules.map(mod => (
                  <div key={mod._id} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <span className="text-white font-medium">{mod.order}. {mod.title}</span>
                    <Button variant="ghost" size="sm">Editar</Button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Lista de Usuarios */}
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Usuarios Registrados ({users.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="pb-4 font-medium">Nombre</th>
                    <th className="pb-4 font-medium">Email</th>
                    <th className="pb-4 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map(u => (
                    <tr key={u._id} className="text-sm">
                      <td className="py-4 text-white font-medium">{u.name}</td>
                      <td className="py-4 text-slate-400">{u.email}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          u.isPaid ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-500'
                        }`}>
                          {u.isPaid ? 'PAGADO' : 'PENDIENTE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
