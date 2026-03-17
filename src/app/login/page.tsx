'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Building2, User, Mail, Lock, LogIn, Sparkles, MapPin } from 'lucide-react';
import locationsData from '@/data/locations.json';
import { cn } from '@/lib/utils';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'onboarding'>('login');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // If already logged in, redirect
  useEffect(() => {
    const userData = localStorage.getItem('mallard_user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.name && user.location) {
        router.push('/dashboard');
      } else {
        setMode('onboarding');
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao entrar');

      // Save user locally
      localStorage.setItem('mallard_user', JSON.stringify(data.user));

      // Check if onboarding is needed
      if (!data.user.name || !data.user.location || data.user.name === 'Pendente') {
        setMode('onboarding');
        setFormData(prev => ({ ...prev, name: data.user.name === 'Pendente' ? '' : data.user.name }));
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // We need an endpoint to update profile
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, workLocation: formData.location })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar perfil');

      // Update local storage
      const existing = JSON.parse(localStorage.getItem('mallard_user') || '{}');
      localStorage.setItem('mallard_user', JSON.stringify({
        ...existing,
        name: formData.name,
        location: formData.location
      }));

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-black text-white selection:bg-white selection:text-black flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        
        <header className="mb-12 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-white/10 rotate-3"
          >
            <span className="text-4xl font-black text-black italic tracking-tighter">M</span>
          </motion.div>
          
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            {mode === 'login' ? "Mallard Logistics" : "Bem-vindo ao Grupo"}
          </h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-black">
            {mode === 'login' ? "Acesso Restrito Corporativo" : "Finalize sua Identificação"}
          </p>
        </header>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-zinc-900 border border-red-900/40 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl text-center"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.form 
              key="login-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleLogin} 
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-zinc-600 ml-1">E-mail Corporativo</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-white transition-colors" />
                    <input 
                      type="email"
                      required
                      placeholder="seu@mallard.com"
                      className="input-luxury pl-12 bg-zinc-950/50"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-zinc-600 ml-1">Senha Única</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-white transition-colors" />
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      className="input-luxury pl-12 bg-zinc-950/50"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="btn-luxury w-full group shadow-2xl shadow-white/5"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Entrar no Hub
                    <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center">
                 <p className="text-[9px] text-zinc-700 uppercase tracking-widest font-bold">
                   Apenas acessos autorizados pelo Admin
                 </p>
              </div>
            </motion.form>
          ) : (
            <motion.form 
              key="onboarding-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleOnboarding}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-zinc-600 ml-1">Para as listas, qual seu nome?</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-white transition-colors" />
                    <input 
                      type="text"
                      required
                      placeholder="Nome de Guerra"
                      className="input-luxury pl-12 bg-zinc-950/50"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-zinc-600 ml-1">Onde você está alocado?</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-white transition-colors" />
                    <select 
                      required
                      className="input-luxury pl-12 bg-zinc-950/50 appearance-none"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    >
                      <option value="" disabled>Selecione a Unidade</option>
                      {locationsData.locations.map(loc => (
                         <option key={loc.id} value={loc.name} className="bg-black">{loc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading || !formData.name || !formData.location}
                className="btn-luxury w-full group bg-white! text-black! shadow-2xl shadow-white/10"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Salvar e Começar
                    <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <footer className="mt-24 text-center">
          <p className="text-zinc-800 text-[8px] uppercase tracking-[0.4em] font-black">
            Mallard Group Logística — 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
