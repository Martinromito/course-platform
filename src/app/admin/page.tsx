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
    <div className="min-h-screen bg-[#fdfaf5] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black text-[#3e2723]">Panel de Control</h1>
            <p className="text-[#8d6e63] mt-2 font-medium">Gestiona tu academia y tus alumnas.</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>Volver al sitio</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gestión de Módulos */}
          <section className="space-y-8">
            <div className="bg-white border border-[#d7ccc8] rounded-[40px] p-8 shadow-sm">
              <h2 className="text-xl font-black text-[#3e2723] mb-8">Crear Nuevo Módulo</h2>
              <form onSubmit={handleCreateModule} className="space-y-5">
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
                <Button type="submit" className="w-full py-4 text-lg">Crear Módulo</Button>
              </form>
            </div>

            <div className="bg-white border border-[#d7ccc8] rounded-[40px] p-8 shadow-sm">
              <h2 className="text-xl font-black text-[#3e2723] mb-8">Módulos Existentes</h2>
              <div className="space-y-4">
                {modules.map(mod => (
                  <div key={mod._id} className="flex justify-between items-center p-5 bg-[#fdfaf5] rounded-2xl border border-[#d7ccc8]">
                    <span className="text-[#3e2723] font-bold">{mod.order}. {mod.title}</span>
                    <Button variant="ghost" size="sm">Editar</Button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Lista de Usuarios */}
          <section className="bg-white border border-[#d7ccc8] rounded-[40px] p-8 shadow-sm">
            <h2 className="text-xl font-black text-[#3e2723] mb-8">Alumnas Registradas ({users.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[#8d6e63] border-b border-[#d7ccc8]">
                    <th className="pb-5 font-bold uppercase text-xs tracking-widest">Nombre</th>
                    <th className="pb-5 font-bold uppercase text-xs tracking-widest">Email</th>
                    <th className="pb-5 font-bold uppercase text-xs tracking-widest text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d7ccc8]">
                  {users.map(u => (
                    <tr key={u._id} className="text-sm">
                      <td className="py-5 text-[#3e2723] font-bold">{u.name}</td>
                      <td className="py-5 text-[#5d4037]">{u.email}</td>
                      <td className="py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          u.isPaid ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {u.isPaid ? 'ACTIVA' : 'PENDIENTE'}
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
