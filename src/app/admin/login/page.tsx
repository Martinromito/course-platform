// src/app/admin/login/page.tsx
// Login simple del Administrador — Requiere contraseña maestra

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('¡Sesión de administrador iniciada!');
        router.push('/admin');
        router.refresh();
      } else {
        toast.error(data.error || 'Contraseña incorrecta');
      }
    } catch {
      toast.error('Error de red al intentar iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center p-6">
      <div className="bg-white border border-[#E8E2D9] rounded-[32px] p-8 w-full max-w-md shadow-sm">
        {/* Logo/Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-[#8B7355]/10 text-[#8B7355] flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#1A1A1A]">
            La Mackenna Admin
          </h1>
          <p className="text-xs text-[#7A6E60] mt-1.5 font-medium">
            Ingresa la contraseña maestra para acceder al panel de control.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="text-slate-800"
          />

          <Button type="submit" className="w-full py-3.5" loading={loading}>
            Ingresar al Panel
          </Button>
        </form>
      </div>
    </div>
  );
}
