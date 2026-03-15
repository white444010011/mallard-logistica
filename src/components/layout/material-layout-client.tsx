'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Package, LogOut, Menu, X, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function MaterialLayoutClient({ role }: { role: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['USER', 'CD', 'ADMIN', 'SUPER_ADMIN'] },
    ...(role === 'ADMIN' || role === 'SUPER_ADMIN' ? [
      { name: 'Usuários', href: '/admin/users', icon: Users, roles: ['ADMIN', 'SUPER_ADMIN'] },
      { name: 'Estoque', href: '/admin/products', icon: Package, roles: ['ADMIN', 'SUPER_ADMIN'] },
    ] : []),
    ...(role === 'CD' ? [
       { name: 'Entregas', href: '/cd/deliveries', icon: Truck, roles: ['CD'] }
    ] : [])
  ];

  return (
    <>
      {/* Top App Bar (Mobile & Desktop) */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 z-40 shadow-lg flex items-center justify-between px-4 md:pl-68 md:pr-8">
        <div className="flex items-center gap-3">
           <button 
             className="md:hidden p-2 -ml-2 hover:bg-white/10 dark:hover:bg-slate-900/10 rounded-full transition-colors"
             onClick={() => setIsMobileMenuOpen(true)}
           >
             <Menu className="w-6 h-6" />
           </button>
           <span className="font-serif italic font-bold text-xl tracking-tighter">M</span>
           <span className="font-medium text-[15px] opacity-90 tracking-wide">Mallard</span>
        </div>

        <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/10 text-white border-0 hidden sm:block">
              {role}
            </Badge>
           <button 
             onClick={handleLogout}
             className="p-2 hover:bg-white/10 dark:hover:bg-slate-900/10 rounded-full transition-colors"
             aria-label="Sair"
           >
              <LogOut className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Side Navigation Drawer (Desktop) & Full Screen Menu (Mobile overlay) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 shadow-2xl md:shadow-[4px_0_24px_rgb(0,0,0,0.04)] transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Drawer Header (Mobile Only) */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 md:hidden bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900">
           <div className="flex items-center gap-2">
              <span className="font-serif italic font-bold text-xl tracking-tighter">M</span>
           </div>
           <button 
             onClick={() => setIsMobileMenuOpen(false)}
             className="p-2 hover:bg-white/10 dark:hover:bg-slate-900/10 rounded-full transition-colors"
           >
             <X className="w-6 h-6" />
           </button>
        </div>

        {/* Desktop Drawer Header */}
        <div className="hidden md:flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800 mb-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900">
          <span className="font-serif italic font-bold text-2xl tracking-tighter pr-2">M</span>
          <span className="font-medium text-lg tracking-wide uppercase">Grupos</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
           {navItems.map((item) => {
             const Icon = item.icon;
             const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
             
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 onClick={() => setIsMobileMenuOpen(false)}
                 className={`
                   flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-[15px] font-medium
                   ${isActive 
                     ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md' 
                     : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}
                 `}
               >
                 <Icon className={`w-5 h-5 ${isActive ? 'text-white dark:text-slate-900' : 'opacity-70'}`} />
                 {item.name}
               </Link>
             );
           })}
        </nav>

        {/* Footer info in drawer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
           <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium text-center tracking-wider">
             josesantos.dev José Santos
           </div>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Bottom Navigation (Optional fallback, but side drawer works well on mobile as an overlay. Let's stick with Bottom Nav for super fast core actions) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 z-30 pb-safe">
        {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'}`}
              >
                <div className={`p-1 rounded-full ${isActive ? 'bg-slate-100 dark:bg-slate-800' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            )
        })}
      </div>
    </>
  );
}
