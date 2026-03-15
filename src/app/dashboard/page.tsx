'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Plus, 
  MapPin, 
  ArrowRight, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck,
  LogOut,
  ChevronRight,
  X,
  Trash2,
  Send,
  Mic,
  ShieldAlert
} from 'lucide-react';
import locationsData from '@/data/locations.json';
import { cn } from '@/lib/utils';

// Types
type Status = 'Pendente' | 'Em Trânsito' | 'Entregue' | 'Em Separação' | 'Concluído';

interface TransportItem {
  id: string;
  type: 'transport';
  photoUrl: string;
  origin: string;
  destination: string;
  status: string;
  createdAt: string;
}

interface OrderItem {
  id: string;
  type: 'order';
  status: string;
  createdAt: string;
  items?: { productName: string; quantity: string }[];
}

type FeedItem = TransportItem | OrderItem;

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [destination, setDestination] = useState('');
  
  // Order Basket State
  const [orderBasket, setOrderBasket] = useState<{ name: string; quantity: string }[]>([]);
  const [currentProduct, setCurrentProduct] = useState('');
  const [currentQty, setCurrentQty] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      // In a real app we'd check server session, but for now let's use the local mock 
      // AND also fetch real data from API if it exists
      const userData = localStorage.getItem('mallard_user');
      if (!userData) {
        router.push('/login');
        return;
      }
      setUser(JSON.parse(userData));
      
      try {
        const [transRes, orderRes] = await Promise.all([
          fetch('/api/transfers'),
          fetch('/api/orders')
        ]);
        
        const transfers = await transRes.json();
        const orders = await orderRes.json();
        
        // Merge and sort
        const combined: FeedItem[] = [
          ...transfers.map((t: any) => ({ ...t, type: 'transport' })),
          ...orders.map((o: any) => ({ ...o, type: 'order' }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setItems(combined);
      } catch (err) {
        console.error("Fetch error", err);
      }
    };

    fetchSession();
  }, [router]);

  const startCamera = async () => {
    setShowCamera(true);
    setCapturedPhoto(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCapturedPhoto(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  const createTransport = async () => {
    if (!capturedPhoto || !destination) return;
    setIsSubmitting(true);

    try {
      await fetch('/api/transfers', {
        method: 'POST',
        body: JSON.stringify({
          photoUrl: capturedPhoto,
          origin: user.location,
          destination
        })
      });
      
      // Refresh
      window.location.reload();
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const addToBasket = () => {
    if (!currentProduct || !currentQty) return;
    setOrderBasket([...orderBasket, { name: currentProduct, quantity: currentQty }]);
    setCurrentProduct('');
    setCurrentQty('');
  };

  const removeFromBasket = (index: number) => {
    setOrderBasket(orderBasket.filter((_, i) => i !== index));
  };

  const submitOrder = async () => {
    if (orderBasket.length === 0) return;
    setIsSubmitting(true);

    try {
      await fetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ items: orderBasket })
      });
      
      window.location.reload();
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mallard_user');
    router.push('/login');
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isCD = user?.role === 'CD';
  const canUpdate = isAdmin || isCD;

  const handleAIUpdate = async (id: string, text: string) => {
    if (!text.trim()) return;
    setIsSubmitting(true);
    try {
      // 1. Process with AI
      const aiRes = await fetch('/api/ai/process-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const { status } = await aiRes.json();
      
      if (!status) throw new Error("IA não identificou status");

      // 2. Update DB
      await fetch(`/api/transfers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      window.location.reload();
    } catch (err) {
      alert("Falha ao processar atualização: " + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-black text-white pb-32">
      <div className="lux-container space-y-8 animate-in fade-in duration-700">
        
        {/* Header Branding */}
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center rotate-3">
              <span className="text-black font-black text-lg italic tracking-tighter">M</span>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Mallard Group</p>
              <h1 className="text-sm font-semibold text-zinc-200">
                {isAdmin ? "Painel Administrativo" : "Logistics Hub"} • {user.location}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button 
                onClick={() => router.push('/admin')}
                className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all bg-zinc-900/50"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}
            <button onClick={handleLogout} className="w-10 h-10 rounded-full border border-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Action Grid */}
        <section className="grid grid-cols-2 gap-4">
          <button 
            onClick={startCamera}
            className="luxury-card group p-8 flex flex-col items-center gap-4 text-center ring-1 ring-white/0 hover:ring-white/20 active:scale-95"
          >
            <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center transition-transform group-hover:scale-110">
              <Camera className="w-7 h-7" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-black">Registrar Transporte</span>
          </button>
          
          <button 
            onClick={() => setShowOrderForm(true)}
            className="luxury-card group p-8 flex flex-col items-center gap-4 text-center ring-1 ring-white/0 hover:ring-white/20 active:scale-95"
          >
            <div className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center transition-transform group-hover:scale-110">
              <Package className="w-7 h-7 text-zinc-400" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400">Novo Pedido CD</span>
          </button>
        </section>

        {/* Dynamic Forms Overlay */}
        <AnimatePresence>
          {capturedPhoto && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="luxury-card p-6 space-y-6"
            >
              <div className="aspect-square rounded-xl overflow-hidden relative">
                <img src={capturedPhoto} alt="Snapshot" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setCapturedPhoto(null)} 
                  className="absolute top-4 right-4 p-2 bg-black/60 rounded-full backdrop-blur-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Destino de Entrega</label>
                  <select 
                    className="input-luxury appearance-none"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  >
                    <option value="" disabled>Escolha a Unidade</option>
                    {locationsData.locations.map(loc => (
                      <option key={loc.id} value={loc.name} className="bg-black">{loc.name}</option>
                    ))}
                  </select>
                </div>
                <button 
                  disabled={!destination || isSubmitting}
                  onClick={createTransport}
                  className="btn-luxury w-full disabled:opacity-50"
                >
                  {isSubmitting ? "Enviando..." : "Confirmar Transporte"}
                </button>
              </div>
            </motion.div>
          )}

          {showOrderForm && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="luxury-card p-6 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <h3 className="text-[10px] uppercase tracking-widest font-black">Requisição de Insumos</h3>
                <button onClick={() => setShowOrderForm(false)}>
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>

              {/* Basket Items */}
              <div className="space-y-3">
                {orderBasket.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 animate-in slide-in-from-left-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-xs text-zinc-500">• {item.quantity}</span>
                    </div>
                    <button onClick={() => removeFromBasket(i)} className="text-zinc-600 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>

              {/* Add Item Form */}
              <div className="grid grid-cols-[1fr,80px,50px] gap-2">
                <input 
                  type="text" 
                  placeholder="Insumo..." 
                  className="input-luxury text-sm"
                  value={currentProduct}
                  onChange={(e) => setCurrentProduct(e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Qtd" 
                  className="input-luxury text-sm px-2 text-center"
                  value={currentQty}
                  onChange={(e) => setCurrentQty(e.target.value)}
                />
                <button 
                  disabled={!currentProduct}
                  onClick={addToBasket}
                  className="h-11 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {orderBasket.length > 0 && (
                <button 
                  disabled={isSubmitting}
                  onClick={submitOrder}
                  className="btn-luxury w-full bg-white text-black mt-4 flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? "Processando..." : (
                    <>
                      Enviar Lista ao CD
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity Feed */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] uppercase tracking-widest font-black text-zinc-600">Fluxo de Logística</h2>
            <div className="flex gap-2 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-zinc-800 rounded-full"/> Offline-First</span>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "p-5 flex flex-col gap-4 active:scale-[0.98] transition-all",
                  item.type === 'transport' ? "luxury-card" : "luxury-card-dashed"
                )}
              >
                <div className="flex gap-5">
                  {item.type === 'transport' ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-800">
                      <img src={(item as TransportItem).photoUrl} alt="Logistic" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-zinc-950 border border-zinc-800/50 flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-zinc-700" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="truncate">
                        {item.type === 'transport' ? (
                          <div className="flex items-center gap-2 text-xs font-bold tracking-tight">
                            <span className="text-zinc-200">{(item as TransportItem).origin}</span>
                            <ArrowRight className="w-3 h-3 text-zinc-600" />
                            <span className="text-zinc-500">{(item as TransportItem).destination}</span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <h3 className="text-xs font-bold text-zinc-200">
                              {item.items && item.items.length > 0 
                                ? item.items.map(i => i.productName).join(', ') 
                                : "Lista de Insumos"}
                            </h3>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                              {item.items && item.items.length > 0 
                                ? `${item.items.length} itens solicitados` 
                                : "Requisição ao CD"}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="badge-minimal bg-black border-zinc-800 text-zinc-500 whitespace-nowrap">
                        {item.status}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <span className="text-zinc-800">#{item.id.slice(0, 4)}</span>
                    </div>
                  </div>
                </div>

                {/* AI / CD Context Actions */}
                {item.type === 'transport' && canUpdate && (
                  <div className="border-t border-zinc-800 pt-3 flex flex-col gap-3">
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="text"
                          placeholder="Falar algo sobre este transporte..."
                          className="input-luxury h-9 text-[10px] pl-10 bg-zinc-950 border-zinc-900"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAIUpdate(item.id, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                        <Mic className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                      </div>
                      {isCD && item.status === 'Pendente' && (
                        <button 
                          onClick={() => handleAIUpdate(item.id, "Iniciar transporte agora")}
                          className="btn-luxury h-9 px-4 text-[10px] bg-zinc-800 text-zinc-300"
                        >
                          Assumir
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            
            {items.length === 0 && (
              <div className="py-20 text-center space-y-4 opacity-20">
                <div className="w-12 h-12 border border-zinc-800 rounded-full mx-auto flex items-center justify-center">
                   <Clock className="w-5 h-5" />
                </div>
                <p className="text-[10px] uppercase tracking-widest font-black">Nenhuma atividade registrada</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Fullscreen Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
          >
            <div className="relative w-full h-full max-w-lg bg-zinc-900 flex items-center justify-center overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              {/* Camera Frame Overlay */}
              <div className="absolute inset-0 border-[60px] border-black/40 pointer-events-none">
                 <div className="w-full h-full border border-white/20" />
              </div>
              
              <button 
                onClick={stopCamera}
                className="absolute top-12 right-8 p-3 bg-black/50 rounded-full backdrop-blur-xl border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="absolute bottom-20 flex flex-col items-center gap-6">
                 <p className="text-[10px] uppercase tracking-[0.5em] font-black text-white/40 drop-shadow-xl">Centralize a Produção</p>
                 <button 
                  onClick={takePhoto}
                  className="w-24 h-24 rounded-full border-[6px] border-white/20 p-1 hover:scale-105 active:scale-95 transition-all"
                >
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                     <div className="w-12 h-12 border-2 border-black/10 rounded-full" />
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
