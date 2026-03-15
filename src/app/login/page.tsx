'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Credenciais inválidas');
      }

      // Redirect based on role
      if (data.role === 'ADMIN' || data.role === 'SUPER_ADMIN') {
        router.push('/admin');
      } else {
         router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      {/* Container - Material Card Surface */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 mt-12 mb-auto transition-shadow duration-300">
        
        {/* Mallard M Logo Marker */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold font-serif italic tracking-tighter pr-1">M</span>
          </div>
        </div>

        <h1 className="text-2xl font-medium text-center text-gray-900 mb-8 tracking-tight">
          Acesso Mallard
        </h1>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-medium border border-red-100 flex items-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 pt-6 pb-2 text-gray-900 bg-transparent border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors"
              placeholder=" "
              required
            />
            <label
              htmlFor="email"
              className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
            >
              Email institucional
            </label>
          </div>

          <div className="relative group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 pt-6 pb-2 text-gray-900 bg-transparent border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors"
              placeholder=" "
              required
            />
            <label
              htmlFor="password"
              className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
            >
              Senha
            </label>
          </div>

          {/* Material Elevated Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative overflow-hidden group bg-black text-white font-medium h-12 rounded-full shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </span>
            ) : (
                <span className="flex items-center justify-center gap-2 text-[15px] tracking-wide">
                    Acessar <LogIn className="w-4 h-4 ml-1" />
                </span>
            )}
           
            {/* Ripple effect trick (simplified CSS) */}
            <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white/20 rounded-full group-hover:w-full group-hover:h-32 opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></span>
          </button>
        </form>
      </div>

      <footer className="mt-8 mb-6 text-center text-xs text-gray-400 font-medium tracking-wide">
        Developed by josesantos.dev José Santos
      </footer>
    </div>
  );
}
