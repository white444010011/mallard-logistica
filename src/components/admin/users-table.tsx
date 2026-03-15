'use client';

import { useState } from 'react';
import { Plus, MoreVertical, Shield, User as UserIcon, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UsersTable({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Erro ao criar usuário');
      
      const { user } = await res.json();
      setUsers(prev => [user, ...prev]);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'USER' });
      router.refresh();
      
    } catch (error) {
       alert('Erro ao criar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
       case 'SUPER_ADMIN': return <Shield className="w-4 h-4 text-purple-600" />;
       case 'ADMIN': return <Shield className="w-4 h-4 text-emerald-600" />;
       case 'CD': return <Building2 className="w-4 h-4 text-blue-600" />;
       default: return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
         <button 
           onClick={() => setIsModalOpen(true)}
           className="inline-flex max-w-max items-center justify-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
         >
            <Plus className="-ml-1 w-4 h-4" /> Cadastrar Usuário
         </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
        <ul role="list" className="divide-y divide-gray-100">
           {users.map((user) => (
             <li key={user.id} className="flex items-center justify-between gap-x-6 p-5 hover:bg-gray-50 transition-colors">
                <div className="flex gap-x-4 items-center">
                   <div className="h-10 w-10 flex-none rounded-full bg-gray-100 flex items-center justify-center">
                     {getRoleIcon(user.role)}
                   </div>
                   <div className="min-w-0 flex-auto">
                     <p className="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-2">
                       {user.name}
                     </p>
                     <p className="mt-1 truncate text-xs leading-5 text-gray-400">{user.email}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className="hidden sm:inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                      {user.role}
                   </span>
                   <button className="text-gray-400 hover:text-black transition-colors p-1">
                      <MoreVertical className="w-5 h-5" />
                   </button>
                </div>
             </li>
           ))}
        </ul>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-6">Novo Cadastro</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input required type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha Provisória</label>
                  <input required minLength={6} type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Acesso (Papel)</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                     <option value="USER">Local (Usuário Comum)</option>
                     <option value="CD">CD (Centro de Distribuição)</option>
                     <option value="ADMIN">Administrador</option>
                     <option value="SUPER_ADMIN">Super Administrador</option>
                  </select>
               </div>
               <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2text-sm font-medium text-gray-600 hover:text-black">Cancelar</button>
                  <button type="submit" disabled={isLoading} className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-800 disabled:opacity-50">
                    {isLoading ? 'Salvando...' : 'Criar Acesso'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
