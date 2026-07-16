// src/app/admin/configuracion/page.tsx
// ABM de Configuración General (Admin) — Edición de datos generales de la app

'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { ArrowLeft, Settings, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SettingsData {
  shopName: string;
  shopTitle: string;
  shopSubtitle: string;
  shopImage: string;
  shopLogo: string;
  statsProducts: string;
  statsWorkshops: string;
  statsAlumnas: string;
  bankAlias: string;
  bankCbu: string;
  bankName: string;
  bankOwner: string;
}

export default function AdminConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SettingsData>({
    shopName: '',
    shopTitle: '',
    shopSubtitle: '',
    shopImage: '',
    shopLogo: '',
    statsProducts: '',
    statsWorkshops: '',
    statsAlumnas: '',
    bankAlias: '',
    bankCbu: '',
    bankName: '',
    bankOwner: '',
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
        await fetchSettings();
      } catch {
        toast.error('Error de autenticación');
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok && data.settings) {
        setFormData(data.settings);
      } else {
        toast.error('Error al cargar configuraciones');
      }
    } catch {
      toast.error('Error de red al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Configuración actualizada con éxito');
      } else {
        toast.error(data.error || 'Error al guardar configuración');
      }
    } catch {
      toast.error('Error de red al guardar configuración');
    } finally {
      setSaving(false);
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
      
      <main className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1.5 text-xs text-[#8B7355] font-semibold uppercase tracking-wider mb-2 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel
          </button>
          <h1 className="font-display text-3xl font-bold text-[#1A1A1A] flex items-center gap-3">
            <Settings className="w-8 h-8 text-[#8B7355]" />
            Configuración General
          </h1>
          <p className="text-[#7A6E60] text-sm">Gestiona la información de la portada, estadísticas y datos de pago</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sección 1: Información de Tienda */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D9] shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-[#1A1A1A] border-b border-[#E8E2D9] pb-2">
              Información de la Tienda
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Nombre de la Tienda"
                name="shopName"
                value={formData.shopName}
                onChange={handleInputChange}
                required
                className="text-slate-800"
              />
              <Input
                label="URL del Logo de la Tienda"
                name="shopLogo"
                value={formData.shopLogo}
                onChange={handleInputChange}
                required
                className="text-slate-800"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Título Principal (Hero)"
                  name="shopTitle"
                  value={formData.shopTitle}
                  onChange={handleInputChange}
                  required
                  className="text-slate-800"
                />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Subtítulo Principal (Hero)</label>
                <textarea
                  name="shopSubtitle"
                  value={formData.shopSubtitle}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-xl border border-[#d7ccc8] bg-white px-4 py-3 text-slate-800 placeholder-[#8d6e63] focus:border-[#b04b2b] focus:outline-none focus:ring-2 focus:ring-[#b04b2b]/10 transition-all duration-200"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="URL de la Foto Principal (Hero/Tienda)"
                  name="shopImage"
                  value={formData.shopImage}
                  onChange={handleInputChange}
                  required
                  className="text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Estadísticas */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D9] shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-[#1A1A1A] border-b border-[#E8E2D9] pb-2">
              Estadísticas Destacadas (Hero)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Input
                label="Total Productos (Ej: 200+)"
                name="statsProducts"
                value={formData.statsProducts}
                onChange={handleInputChange}
                required
                className="text-slate-800"
              />
              <Input
                label="Total Talleres (Ej: 10+)"
                name="statsWorkshops"
                value={formData.statsWorkshops}
                onChange={handleInputChange}
                required
                className="text-slate-800"
              />
              <Input
                label="Total Alumnas (Ej: 1.500+)"
                name="statsAlumnas"
                value={formData.statsAlumnas}
                onChange={handleInputChange}
                required
                className="text-slate-800"
              />
            </div>
          </div>

          {/* Sección 3: Datos de Transferencia Bancaria */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D9] shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-[#1A1A1A] border-b border-[#E8E2D9] pb-2">
              Datos para Pago por Transferencia Bancaria
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Banco"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                required
                className="text-slate-800"
              />
              <Input
                label="Titular de la Cuenta"
                name="bankOwner"
                value={formData.bankOwner}
                onChange={handleInputChange}
                required
                className="text-slate-800"
              />
              <Input
                label="Alias"
                name="bankAlias"
                value={formData.bankAlias}
                onChange={handleInputChange}
                required
                className="text-slate-800"
              />
              <Input
                label="CBU"
                name="bankCbu"
                value={formData.bankCbu}
                onChange={handleInputChange}
                required
                className="text-slate-800"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-4">
            <Button type="submit" loading={saving} className="flex items-center gap-2">
              <Save className="w-4 h-4" /> Guardar Cambios
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/admin')} disabled={saving}>
              Cancelar
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
