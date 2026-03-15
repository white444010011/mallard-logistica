'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Building2, User, Mail, Lock, ChevronLeft, ArrowLeft } from 'lucide-react';
import locationsData from '@/data/locations.json';
import { cn } from '@/lib/utils';

export default function AuthPage() {
  const [step, setStep] = useState(1);
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => {
    if (isLogin) setIsLogin(false);
    else setStep(s => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { 
          name: formData.name, 
          email: formData.email, 
          password: formData.password, 
          workLocation: formData.location 
        };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao processar');

      // Save user locally for mock redundancy if needed, but session is in cookie
      localStorage.setItem('mallard_user', JSON.stringify({
        name: formData.name || 'User',
        location: formData.location || 'Hub'
      }));

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white selection:bg-white selection:text-black flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        
        {/* Progress header or Back button */}
        {(step > 1 || isLogin) && (
          <button 
            onClick={handleBack}
            className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Voltar</span>
          </button>
        )}

        <header className="mb-12 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
          >
            <span className="text-4xl font-black text-black italic tracking-tighter">M</span>
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Mallard Logística</h1>
          <p className="text-zinc-500 text-sm tracking-wide">
            {isLogin ? "Acesse sua conta corporativa" : "Seu embarque na plataforma de luxo"}
          </p>
        </header>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-zinc-900 border border-red-900/50 text-red-500 text-xs font-bold rounded-xl"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {!isLogin && step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-600 ml-1">Seu Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="text"
                      required
                      placeholder="Identificação Mallard"
                      className="input-luxury pl-12"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-600 ml-1">Lotação de Trabalho</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <select 
                      required
                      className="input-luxury pl-12 appearance-none"
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

                <button 
                  type="button"
                  onClick={handleNext}
                  disabled={!formData.name || !formData.location}
                  className="btn-luxury w-full disabled:opacity-50"
                >
                  Continuar para Acesso
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <p className="text-center pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-white transition-colors"
                  >
                    Já possui conta? <span className="text-white">Entrar</span>
                  </button>
                </p>
              </motion.div>
            )}

            {(isLogin || step === 2) && (
              <motion.div 
                key="auth"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-600 ml-1">E-mail Institucional</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="email"
                      required
                      placeholder="email@mallard.com"
                      className="input-luxury pl-12"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-600 ml-1">Senha de Acesso</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      className="input-luxury pl-12"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="btn-luxury w-full group"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Entrar no Sistema" : "Finalizar Cadastro"}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {!isLogin && (
                   <div className="pt-2 text-[10px] text-zinc-600 text-center uppercase tracking-widest leading-relaxed">
                      Ao criar conta, você aceita os protocolos <br/> de segurança do Grupo Mallard.
                   </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <footer className="mt-20 text-center">
          <p className="text-zinc-700 text-[9px] uppercase tracking-[0.3em] font-black">
            Mallard Logística & Protocolos de Segurança
          </p>
        </footer>
      </div>
    </div>
  );
}

