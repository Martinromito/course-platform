// src/components/workshop/StudentLogoutButton.tsx
// Botón de cierre de sesión para alumnos (Client Component)

'use client';

import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentLogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/talleres/logout', {
        method: 'POST',
      });
      if (res.ok) {
        toast.success('Sesión de alumno cerrada');
        window.location.reload();
      } else {
        toast.error('Error al cerrar sesión');
      }
    } catch {
      toast.error('Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs text-[#8B7355] font-semibold uppercase tracking-wider hover:underline disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <>
          <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
        </>
      )}
    </button>
  );
}
