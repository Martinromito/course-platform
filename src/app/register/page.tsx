// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

import { Suspense } from 'react';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(name, email, password);
      toast.success('¡Cuenta creada con éxito!');
      
      if (redirect === 'checkout') {
        // Si venía del botón de compra, intentar iniciar pago
        const res = await fetch('/api/payments/create-preference', { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
          window.location.href = process.env.NODE_ENV === 'production' ? data.initPoint : data.sandboxInitPoint;
          return;
        }
      }
      
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfaf5] px-5 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#e9a68a]/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[#b04b2b]/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 sm:gap-3 mb-5 sm:mb-6">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
            <div className="flex flex-col text-left">
              <span className="text-[#3e2723] font-bold text-lg sm:text-xl leading-none">La Mackenna</span>
              <span className="text-[#b04b2b] text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">Academia</span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3e2723]">Crea tu cuenta</h1>
          <p className="text-[#8d6e63] mt-2 sm:mt-3 font-medium text-sm sm:text-base">Únete a nuestra comunidad de artesanas.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[#d7ccc8] p-6 sm:p-10 rounded-[28px] sm:rounded-[40px] shadow-2xl shadow-[#b04b2b]/5 space-y-5 sm:space-y-6">
          <Input
            label="Nombre completo"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="hola@tuemail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button type="submit" className="w-full py-3.5 sm:py-4 text-base sm:text-lg" loading={loading}>
            Registrarme ahora
          </Button>

          <p className="text-center text-sm text-[#8d6e63] font-medium">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-[#b04b2b] hover:underline font-bold">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fdfaf5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b04b2b]"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
