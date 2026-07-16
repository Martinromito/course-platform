// src/app/admin/productos/page.tsx
// ABM de Productos (Admin) — CRUD simple interactuando con las APIs de /api/admin/products

'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Trash2, Edit2, Plus, Box, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  image: string;
  badge: string | null;
  category: string;
  stock: number;
  isActive: boolean;
}

export default function AdminProductosPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const checkRes = await fetch('/api/admin/check');
        const checkData = await checkRes.json();

        if (!checkData.authenticated) {
          router.push('/admin/login');
          return;
        }
        await fetchProducts();
      } catch {
        toast.error('Error de autenticación');
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (res.ok) setProducts(data.products || []);
    } catch {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        originalPrice: null,
        image: '/images/product-pieza.png',
        badge: '',
        category: 'kits',
        stock: 999,
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
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${formData.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      toast.success(isNew ? 'Producto creado' : 'Producto actualizado');
      await fetchProducts();
      handleCloseForm();
    } catch {
      toast.error('Error al guardar producto');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Producto eliminado');
      await fetchProducts();
    } catch {
      toast.error('Error al eliminar');
      setLoading(false);
    }
  };

  if (loading && products.length === 0) {
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
              className="flex items-center gap-1.5 text-xs text-[#8B7355] font-semibold uppercase tracking-wider mb-2 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel
            </button>
            <h1 className="font-display text-3xl font-bold text-[#1A1A1A] flex items-center gap-3">
              <Box className="w-8 h-8 text-[#8B7355]" />
              Productos
            </h1>
            <p className="text-[#7A6E60] text-sm">Gestión de catálogo de productos físicos</p>
          </div>
          {!isEditing && (
            <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nuevo Producto
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D9] shadow-sm animate-fade-in-up">
            <h2 className="text-xl font-bold mb-6 text-slate-800">
              {formData.id ? 'Editar Producto' : 'Crear Producto'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <Input
                  label="Nombre del Producto"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="text-slate-800 animate-none"
                />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Descripción</label>
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
                  label="URL Imagen"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  required
                  className="text-slate-800"
                />
              </div>
              <Input
                label="Categoría"
                value={formData.category || ''}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
                className="text-slate-800"
              />
              <Input
                label="Etiqueta (Ej: Nuevo, Más vendido)"
                value={formData.badge || ''}
                onChange={(e) => setFormData({...formData, badge: e.target.value})}
                className="text-slate-800"
              />
              <Input
                label="Stock"
                type="number"
                value={formData.stock || ''}
                onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                required
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
                  Producto Activo (visible en la tienda)
                </label>
              </div>

              <div className="sm:col-span-2 flex gap-3 mt-6">
                <Button type="submit" loading={loading}>Guardar Producto</Button>
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
                    <th className="p-4 font-semibold">Producto</th>
                    <th className="p-4 font-semibold">Precio</th>
                    <th className="p-4 font-semibold">Stock</th>
                    <th className="p-4 font-semibold">Categoría</th>
                    <th className="p-4 font-semibold">Estado</th>
                    <th className="p-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9]/60 text-sm">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover bg-[#F5F0E8]" />
                        <span className="font-medium text-[#1A1A1A]">{product.name}</span>
                      </td>
                      <td className="p-4 font-medium">${product.price.toLocaleString('es-AR')}</td>
                      <td className="p-4">{product.stock}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-[#F5F0E8] text-[#7A6E60] rounded-md text-xs">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleOpenForm(product)} className="p-1.5 text-[#7A6E60] hover:bg-[#F2F0ED] rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#7A6E60]">
                        No hay productos registrados.
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
