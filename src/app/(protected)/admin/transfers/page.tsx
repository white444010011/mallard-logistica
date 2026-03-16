import { db } from '@/db';
import { transfers, users } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { Clock, MapPin, Camera, User } from 'lucide-react';

export default async function AdminTransfersPage() {
  const allTransfers = await db.select({
    id: transfers.id,
    origin: transfers.origin,
    destination: transfers.destination,
    status: transfers.status,
    photoUrl: transfers.photoUrl,
    deliveryPhotoUrl: transfers.deliveryPhotoUrl,
    createdAt: transfers.createdAt,
    deliveredAt: transfers.deliveredAt,
    userName: users.name,
  })
  .from(transfers)
  .leftJoin(users, eq(transfers.userId, users.id))
  .orderBy(desc(transfers.createdAt));

  return (
    <div className="space-y-8 p-6">
      <div className="pb-4 border-b border-zinc-800">
         <h1 className="text-2xl font-bold tracking-tight text-white">Log de Entregas e Transportes</h1>
         <p className="text-sm text-zinc-500 mt-1">Histórico completo de toda a operação logística.</p>
      </div>

      <div className="grid gap-6">
        {allTransfers.map((item) => (
          <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col md:flex-row gap-6">
            {/* Photos */}
            <div className="flex gap-4">
               <div className="space-y-2">
                 <p className="text-[10px] uppercase tracking-widest font-black text-zinc-600">Registro</p>
                 <div className="w-24 h-24 rounded-2xl overflow-hidden border border-zinc-800">
                    <img src={item.photoUrl} className="w-full h-full object-cover grayscale" alt="Registro" />
                 </div>
               </div>
               {item.deliveryPhotoUrl && (
                 <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest font-black text-emerald-600">Comprovante</p>
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-emerald-900/50">
                       <img src={item.deliveryPhotoUrl} className="w-full h-full object-cover" alt="Entrega" />
                    </div>
                 </div>
               )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span>{item.origin}</span>
                    <ArrowRight className="w-4 h-4 text-zinc-700" />
                    <span>{item.destination}</span>
                  </div>
                  <div className={`text-[10px] px-3 py-1 rounded-full font-black uppercase border ${
                    item.status === 'Entregue' ? 'border-emerald-900 text-emerald-500 bg-emerald-950/20' : 'border-zinc-800 text-zinc-500'
                  }`}>
                    {item.status}
                  </div>
               </div>

               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-zinc-500">
                     <User className="w-3.5 h-3.5" />
                     <span className="text-xs">{item.userName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                     <Clock className="w-3.5 h-3.5" />
                     <span className="text-xs">Criado: {item.createdAt.toLocaleTimeString()}</span>
                  </div>
                  {item.deliveredAt && (
                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                       <Clock className="w-3.5 h-3.5" />
                       <span className="text-xs">Entregue: {item.deliveredAt.toLocaleTimeString()}</span>
                    </div>
                  )}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
