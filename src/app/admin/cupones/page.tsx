// src/app/admin/cupones/page.tsx
// ABM de Cupones (Admin)

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/landing/Navbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Trash2, Edit2, Plus, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
}

export default function AdminCuponesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Coupon>>({});

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
        toast.error('Acceso denegado');
        return;
      }
      fetchCoupons();
    }
  }, [user, authLoading, router]);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (res.ok) setCoupons(data.coupons);
    } catch {
      toast.error('Error al cargar cupones');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (coupon?: Coupon) => {
    if (coupon) {
      setFormData(coupon);
    } else {
      setFormData({
        code: '',
        type: 'percentage',
        value: 10,
        minPurchase: 0,
        maxUses: 999,
        isActive: true,
        expiresAt: null,
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
      const url = isNew ? '/api/admin/coupons' : `/api/admin/coupons/${formData.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error desconocido');

      toast.success(isNew ? 'Cupón creado' : 'Cupón actualizado');
      fetchCoupons();
      handleCloseForm();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar cupón');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cupón?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Cupón eliminado');
      fetchCoupons();
    } catch {
      toast.error('Error al eliminar');
      setLoading(false);
    }
  };

  if (authLoading || (loading && coupons.length === 0)) {
    return <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#8B7355]"></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] pt-28 pb-16">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#1A1A1A] flex items-center gap-3">
              <Tag className="w-8 h-8 text-[#8B7355]" />
              Cupones (Admin)
            </h1>
            <p className="text-[#7A6E60]">Gestión de cupones de descuento</p>
          </div>
          {!isEditing && (
            <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nuevo Cupón
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D9] shadow-sm animate-fade-in-up">
            <h2 className="text-xl font-bold mb-6">{formData.id ? 'Editar Cupón' : 'Crear Cupón'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Código (MAYÚSCULAS)" value={formData.code || ''} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
              
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1A1A1A]">Tipo de Descuento</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] transition-colors appearance-none"
                  value={formData.type || 'percentage'} 
                  onChange={(e) => setFormData({...formData, type: e.target.value as 'percentage'|'fixed'})}
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto Fijo ($)</option>
                </select>
              </div>

              <Input label={`Valor (${formData.type === 'percentage' ? '%' : '$'})`} type="number" value={formData.value || ''} onChange={(e) => setFormData({...formData, value: Number(e.target.value)})} required />
              <Input label="Compra mínima ($)" type="number" value={formData.minPurchase || ''} onChange={(e) => setFormData({...formData, minPurchase: Number(e.target.value)})} required />
              <Input label="Usos máximos permitidos" type="number" value={formData.maxUses || ''} onChange={(e) => setFormData({...formData, maxUses: Number(e.target.value)})} required />
              
              <div className="sm:col-span-2 flex items-center gap-3 mt-2">
                <input type="checkbox" id="isActive" checked={formData.isActive !== false} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 accent-[#8B7355]" />
                <label htmlFor="isActive" className="font-medium text-[#1A1A1A]">Cupón Activo</label>
              </div>

              <div className="sm:col-span-2 flex gap-3 mt-6">
                <Button type="submit" loading={loading}>Guardar Cupón</Button>
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
                    <th className="p-4 font-semibold">Código</th>
                    <th className="p-4 font-semibold">Descuento</th>
                    <th className="p-4 font-semibold">Compra Mín.</th>
                    <th className="p-4 font-semibold">Usos</th>
                    <th className="p-4 font-semibold">Estado</th>
                    <th className="p-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9]/60 text-sm">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                      <td className="p-4 font-bold text-[#8B7355]">{coupon.code}</td>
                      <td className="p-4 font-medium">{coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value.toLocaleString()}`}</td>
                      <td className="p-4">${coupon.minPurchase.toLocaleString()}</td>
                      <td className="p-4">{coupon.usedCount} / {coupon.maxUses}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {coupon.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleOpenForm(coupon)} className="p-1.5 text-[#7A6E60] hover:bg-[#F2F0ED] rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(coupon.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-[#7A6E60]">No hay cupones registrados.</td></tr>
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
