'use client';

import { FileText, Package, Users, Truck } from 'lucide-react';
import Link from 'next/link';

export function AdminDashboard({ recentOrders }: { recentOrders: any[] }) {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
         <h1 className="text-2xl font-bold tracking-tight text-gray-900">Visão Geral - Administração</h1>
         <p className="text-sm text-gray-500 mt-1">Bem-vindo ao painel de controle principal.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Link href="/admin/users" className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center gap-3 group border border-gray-100/50">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <span className="font-semibold text-gray-800">Usuários</span>
         </Link>
         
         <Link href="/admin/products" className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center gap-3 group border border-gray-100/50">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Package className="w-6 h-6" />
            </div>
            <span className="font-semibold text-gray-800">Estoque</span>
         </Link>

         <div className="bg-white p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center gap-3 border border-gray-100/50 opacity-70">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span className="font-semibold text-gray-800">Relatórios</span>
         </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 mt-8 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-gray-400" /> 
            Últimos Pedidos Movimentados
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {recentOrders.length === 0 ? (
            <p className="p-6 text-center text-gray-500 font-medium">Nenhum pedido recente.</p>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="p-4 sm:px-6 hover:bg-gray-50 flex items-center justify-between transition-colors">
                 <div>
                   <p className="text-sm font-semibold text-gray-900">Pedido #{order.id.slice(0, 8)}</p>
                   <p className="text-xs text-gray-500 mt-1">Solicitado por: {order.user?.name}</p>
                 </div>
                 <div className="text-right">
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-800`}>
                      {order.status}
                   </span>
                   <p className="text-[11px] text-gray-400 mt-1">
                     {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                   </p>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
