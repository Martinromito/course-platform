// src/app/admin/page.tsx
// Panel de Control Principal — Resumen general y accesos rápidos de administrador

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Box, Play, Landmark, Tag, LogOut, Loader2, Settings } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: 0,
    workshops: 0,
    orders: 0,
    earnings: 0,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const checkRes = await fetch('/api/admin/check');
        const checkData = await checkRes.json();

        if (!checkData.authenticated) {
          router.push('/admin/login');
          return;
        }

        // Cargar estadísticas resumidas
        const [prodRes, wsRes, ordRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/workshops'),
          fetch('/api/admin/orders'),
        ]);

        const products = await prodRes.json();
        const workshops = await wsRes.json();
        const orders = await ordRes.json();

        const approvedOrders = (orders.orders || []).filter((o: any) => o.status === 'approved');
        const earnings = approvedOrders.reduce((sum: number, o: any) => sum + o.total, 0);

        setStats({
          products: (products.products || []).length,
          workshops: (workshops.workshops || []).length,
          orders: (orders.orders || []).length,
          earnings,
        });
      } catch {
        toast.error('Error al cargar datos del panel');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      toast.success('Sesión cerrada');
      router.push('/admin/login');
      router.refresh();
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  if (loading) {
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
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
              Panel de Control
            </h1>
            <p className="text-[#7A6E60] mt-1 font-medium">
              Administración de la tienda y la academia.
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 shadow-sm">
            <p className="text-[#7A6E60] text-xs font-bold uppercase tracking-wider">Recaudación</p>
            <h3 className="text-2xl font-black text-green-700 mt-1">
              ${stats.earnings.toLocaleString('es-AR')}
            </h3>
          </div>
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 shadow-sm">
            <p className="text-[#7A6E60] text-xs font-bold uppercase tracking-wider">Total Pedidos</p>
            <h3 className="text-2xl font-black text-[#1A1A1A] mt-1">{stats.orders}</h3>
          </div>
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 shadow-sm">
            <p className="text-[#7A6E60] text-xs font-bold uppercase tracking-wider">Productos Físicos</p>
            <h3 className="text-2xl font-black text-[#1A1A1A] mt-1">{stats.products}</h3>
          </div>
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 shadow-sm">
            <p className="text-[#7A6E60] text-xs font-bold uppercase tracking-wider">Talleres Online</p>
            <h3 className="text-2xl font-black text-[#1A1A1A] mt-1">{stats.workshops}</h3>
          </div>
        </div>

        {/* Secciones de Administración */}
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Administrar Módulos</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Productos */}
          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#8B7355]/10 text-[#8B7355] flex items-center justify-center mb-4">
                <Box className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-[#1A1A1A] mb-1">Productos Físicos</h3>
              <p className="text-sm text-[#7A6E60] mb-6">
                Crea, edita stock y desactiva productos físicos del catálogo.
              </p>
            </div>
            <Button onClick={() => router.push('/admin/productos')} variant="primary" className="w-full">
              Gestionar Productos
            </Button>
          </div>

          {/* Talleres */}
          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#8B7355]/10 text-[#8B7355] flex items-center justify-center mb-4">
                <Play className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-[#1A1A1A] mb-1">Talleres Online</h3>
              <p className="text-sm text-[#7A6E60] mb-6">
                Sube nuevos videos de YouTube y configura sus accesos.
              </p>
            </div>
            <Button onClick={() => router.push('/admin/talleres')} variant="primary" className="w-full">
              Gestionar Talleres
            </Button>
          </div>

          {/* Pedidos */}
          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#8B7355]/10 text-[#8B7355] flex items-center justify-center mb-4">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-[#1A1A1A] mb-1">Pedidos & Transferencias</h3>
              <p className="text-sm text-[#7A6E60] mb-6">
                Aprobación manual de transferencias y control de despachos.
              </p>
            </div>
            <Button onClick={() => router.push('/admin/pedidos')} variant="primary" className="w-full">
              Ver Pedidos
            </Button>
          </div>

          {/* Cupones */}
          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#8B7355]/10 text-[#8B7355] flex items-center justify-center mb-4">
                <Tag className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-[#1A1A1A] mb-1">Cupones de Descuento</h3>
              <p className="text-sm text-[#7A6E60] mb-6">
                Crea códigos promocionales fijos o porcentuales.
              </p>
            </div>
            <Button onClick={() => router.push('/admin/cupones')} variant="primary" className="w-full">
              Gestionar Cupones
            </Button>
          </div>

          {/* Configuración */}
          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#8B7355]/10 text-[#8B7355] flex items-center justify-center mb-4">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-[#1A1A1A] mb-1">Configuración General</h3>
              <p className="text-sm text-[#7A6E60] mb-6">
                Edita textos de la portada, fotos de la tienda, estadísticas y datos bancarios.
              </p>
            </div>
            <Button onClick={() => router.push('/admin/configuracion')} variant="primary" className="w-full">
              Editar Configuración
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
