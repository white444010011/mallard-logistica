'use client';

import { useState } from 'react';
import { Package, MapPin, Clock, ArrowRight, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CdDashboard({ activeOrders }: { activeOrders: any[] }) {
  const router = useRouter();

  // For real implementation, CD user clicks a link in WhatsApp and 
  // hits an /assume/[id] page, but they can also assume from here.

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
         <h1 className="text-2xl font-bold tracking-tight text-gray-900">Painel do Centro de Distribuição</h1>
         <p className="text-sm text-gray-500 mt-1">Gerencie e assuma os pedidos pendentes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeOrders.length === 0 ? (
           <div className="col-span-full py-12 text-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">
             <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
             <p className="font-medium">Nenhum pedido aguardando ação no momento.</p>
           </div>
        ) : (
          activeOrders.map((order) => (
             <div key={order.id} className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.06)] border border-gray-50 flex flex-col justify-between">
                <div>
                   <div className="flex justify-between items-start mb-3">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                     }`}>
                       {order.status === 'pending' ? 'Pendente' : 'Em Preparação'}
                     </span>
                     <span className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 6)}</span>
                   </div>
                   
                   <h3 className="font-bold text-gray-900">Destino: {order.user?.name}</h3>
                   
                   <div className="mt-4 flex items-center text-sm text-gray-500 gap-2">
                     <Clock className="w-4 h-4 opacity-70" />
                     {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} 
                     {' - '}
                     {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                   </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => router.push(`/cd/order/${order.id}`)}
                    className="w-full flex justify-between items-center bg-black text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    Abrir Detalhes do Pedido
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
             </div>
          ))
        )}
      </div>
    </div>
  );
}
