// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('¡Bienvenido de nuevo!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-5">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-[#C5A059]/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-[#8B7355]/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 sm:gap-3 mb-5 sm:mb-6">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
            <div className="flex flex-col text-left">
              <span className="text-[#1A1A1A] font-bold text-lg sm:text-xl leading-none">La Mackenna</span>
              <span className="text-[#8B7355] text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">Academia</span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">Bienvenida</h1>
          <p className="text-[#8d6e63] mt-2 sm:mt-3 font-medium text-sm sm:text-base">Ingresa para acceder a tus cursos.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[#E5E0D8] p-6 sm:p-10 rounded-[28px] sm:rounded-[40px] shadow-2xl shadow-[#b04b2b]/5 space-y-5 sm:space-y-6">
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
            Ingresar
          </Button>

          <p className="text-center text-sm text-[#8d6e63] font-medium">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-[#8B7355] hover:underline font-bold">
              Regístrate gratis
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
