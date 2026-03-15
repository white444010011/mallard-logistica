'use client';

import { useState } from 'react';
import { Package, MapPin, Truck, Check, Clock, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function OrderDetailsClient({ order, items, assignedUser, currentUserId }: any) {
  const [status, setStatus] = useState(order.status);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isAssignedToMe = order.assignedCdId === currentUserId;
  const isAssigned = !!order.assignedCdId;

  const handleAssume = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/assume`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      
      setStatus('assumed');
      router.refresh();
    } catch (e) {
      alert('Erro ao assumir pedido. Ele pode já ter sido assumido.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed');
      
      setStatus(newStatus);
      router.refresh();
    } catch (e) {
       alert('Erro ao atualizar status.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Status Bar */}
       <div className={`p-6 text-white ${status === 'pending' ? 'bg-amber-500' : status === 'delivered' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
         <div className="flex justify-between items-start">
            <div>
              <span className="uppercase text-xs font-bold tracking-wider opacity-90">Status Atual</span>
              <h2 className="text-2xl font-bold mt-1">
                {status === 'pending' ? 'Aguardando CD' : 
                 status === 'assumed' ? 'Em Preparação' : 
                 status === 'in_transit' ? 'Em Trânsito' : 
                 status === 'delivered' ? 'Entregue' : 'Cancelado'}
              </h2>
            </div>
            <span className="font-mono text-sm opacity-80">#{order.id.slice(0, 8)}</span>
         </div>
       </div>

       {/* Order Body */}
       <div className="p-6 space-y-8">
          {/* User Requesting */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Solicitante</h3>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                  <MapPin className="w-5 h-5" />
               </div>
               <div>
                  <p className="font-semibold text-gray-900">{order.user?.name}</p>
                  <p className="text-sm text-gray-500">{order.user?.email}</p>
               </div>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Itens ({(items || []).length})</h3>
            <ul className="divide-y divide-gray-100 bg-gray-50 rounded-xl px-4">
              {items.map((itemRow: any, idx: number) => (
                 <li key={idx} className="py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <Package className="w-4 h-4 text-gray-400" />
                       <span className="font-medium text-gray-800">{itemRow.product?.name || 'Produto Não Encontrado'}</span>
                    </div>
                    <span className="bg-white border border-gray-200 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                      x{itemRow.quantity}
                    </span>
                 </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-gray-100">
             {!isAssigned ? (
               <button
                 onClick={handleAssume}
                 disabled={isLoading}
                 className="w-full bg-black text-white py-4 rounded-xl font-medium tracking-wide shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-50"
               >
                 <UserIcon className="w-5 h-5" />
                 {isLoading ? 'Assumindo...' : 'Assumir e Preparar Pedido'}
               </button>
             ) : (
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <Check className="w-5 h-5 text-emerald-500" />
                     Assumido por <span className="font-semibold capitalize">{assignedUser?.name || 'Você'}</span>
                   </div>

                   {/* Status Transitions only if user owns the order */}
                   {isAssignedToMe && status !== 'delivered' && (
                     <div className="grid grid-cols-2 gap-3 mt-4">
                       {status === 'assumed' && (
                         <button onClick={() => handleStatusChange('in_transit')} className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex justify-center items-center gap-2 transition-colors">
                            <Truck className="w-4 h-4" /> Despachar (Em Trânsito)
                         </button>
                       )}
                       {status === 'in_transit' && (
                         <button onClick={() => handleStatusChange('delivered')} className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium flex justify-center items-center gap-2 transition-colors">
                            <Check className="w-4 h-4" /> Marcar como Entregue
                         </button>
                       )}
                     </div>
                   )}
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
