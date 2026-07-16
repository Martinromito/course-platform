// src/components/workshop/StudentLoginForm.tsx
// Formulario de inicio de sesión passwordless con OTP para estudiantes

'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Mail, KeyRound, Loader2, ArrowRight } from 'lucide-react';

export default function StudentLoginForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch('/api/talleres/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Código de acceso enviado a tu email');
        setStep('code');
      } else {
        toast.error(data.error || 'Error al solicitar el código');
      }
    } catch {
      toast.error('Error de red al solicitar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    try {
      const res = await fetch('/api/talleres/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('¡Ingreso exitoso!');
        // Recargar la página para que el servidor lea la nueva cookie
        window.location.reload();
      } else {
        toast.error(data.error || 'Código incorrecto');
      }
    } catch {
      toast.error('Error de red al verificar el código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-[#E8E2D9] rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl font-bold text-[#1A1A1A]">Ingreso para Alumnos</h2>
        <p className="text-sm text-[#7A6E60] mt-1.5">
          {step === 'email'
            ? 'Ingresá el correo que usaste al comprar para acceder a tus clases'
            : 'Ingresá el código de 6 dígitos que enviamos a tu casilla'}
        </p>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleRequestCode} className="space-y-4">
          <Input
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@gmail.com"
            required
            disabled={loading}
            className="text-slate-800"
          />
          <Button type="submit" loading={loading} className="w-full flex items-center justify-center gap-2">
            Recibir código por email
            <Mail className="w-4 h-4" />
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <Input
            label="Código de Acceso"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            maxLength={6}
            required
            disabled={loading}
            className="text-center text-lg font-mono tracking-widest text-slate-800"
          />
          <Button type="submit" loading={loading} className="w-full flex items-center justify-center gap-2">
            Ingresar a la Biblioteca
            <ArrowRight className="w-4 h-4" />
          </Button>
          <button
            type="button"
            onClick={() => setStep('email')}
            disabled={loading}
            className="w-full text-center text-xs text-[#8B7355] font-semibold uppercase tracking-wider mt-2 hover:underline disabled:opacity-50"
          >
            Volver a ingresar correo
          </button>
        </form>
      )}
    </div>
  );
}
