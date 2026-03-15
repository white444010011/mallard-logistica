'use client';

import { useState } from 'react';
import { Plus, Package, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ProductsTable({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', availableStock: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Erro ao cadastrar produto');
      
      const { product } = await res.json();
      setProducts(prev => [product, ...prev]);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', availableStock: 0 });
      router.refresh();
      
    } catch (error) {
       alert('Erro ao cadastrar produto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
         <button 
           onClick={() => setIsModalOpen(true)}
           className="inline-flex max-w-max items-center justify-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
         >
            <Plus className="-ml-1 w-4 h-4" /> Novo Item no Estoque
         </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
        <ul role="list" className="divide-y divide-gray-100">
           {products.length === 0 ? (
             <li className="p-6 text-center text-gray-500 text-sm">Nenhum produto cadastrado no momento.</li>
           ) : products.map((product) => (
             <li key={product.id} className="flex items-center justify-between gap-x-6 p-5 hover:bg-gray-50 transition-colors">
                <div className="flex gap-x-4 items-center">
                   <div className="h-10 w-10 flex-none rounded-xl bg-gray-100 flex items-center justify-center">
                     <Package className="w-5 h-5 text-gray-500" />
                   </div>
                   <div className="min-w-0 flex-auto">
                     <p className="text-sm font-semibold leading-6 text-gray-900">
                       {product.name}
                     </p>
                     <p className="mt-1 truncate text-xs leading-5 text-gray-400">{product.description || 'Sem descrição'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className="hidden sm:inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                      Estoque: {product.availableStock}
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
            <h2 className="text-xl font-bold mb-6">Novo Cadastro de Item</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                  <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Incial</label>
                  <input required min={0} type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black" value={formData.availableStock} onChange={e => setFormData({...formData, availableStock: parseInt(e.target.value)})} />
               </div>
               <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black">Cancelar</button>
                  <button type="submit" disabled={isLoading} className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-800 disabled:opacity-50">
                    {isLoading ? 'Salvando...' : 'Adicionar'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
