'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Plus, 
  ArrowRight, 
  Package, 
  Clock, 
  LogOut,
  X,
  Trash2,
  Send,
  Mic,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  GripVertical,
  DownloadCloud,
  User,
  History,
  Map,
  ClipboardList,
  Share,
  Info
} from 'lucide-react';
import locationsData from '@/data/locations.json';
import { cn } from '@/lib/utils';

// Types
interface TransportItem {
  id: string;
  type: 'transport';
  photoUrl: string;
  origin: string;
  destination: string;
  status: string;
  createdAt: string;
  userName?: string;
  deliveredAt?: string;
  deliveryPhotoUrl?: string;
}

interface OrderItem {
  id: string;
  type: 'order';
  status: string;
  createdAt: string;
  userName?: string;
  items?: { productName: string; quantity: string }[];
}

type FeedItem = TransportItem | OrderItem;

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'register' | 'deliver'>('register');
  const [activeDeliveryId, setActiveDeliveryId] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isPWA, setIsPWA] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [destination, setDestination] = useState('');
  
  // Accordion State
  const [activeItemsOpen, setActiveItemsOpen] = useState(true);
  const [completedItemsOpen, setCompletedItemsOpen] = useState(false);

  // Order Basket State
  const [orderBasket, setOrderBasket] = useState<{ name: string; quantity: string }[]>([]);
  const [currentProduct, setCurrentProduct] = useState('');
  const [currentQty, setCurrentQty] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if running in PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsPWA(isStandalone);

    // iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDetected = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDetected);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      if (!isStandalone) setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If it's iOS and not PWA, show banner after short delay
    if (iosDetected && !isStandalone) {
      setTimeout(() => setShowInstallBanner(true), 2000);
    }

    const fetchSession = async () => {
      const userData = localStorage.getItem('mallard_user');
      if (!userData) {
        router.push('/login');
        return;
      }
      const parsedUser = JSON.parse(userData);
      
      // Force onboarding if profile is incomplete
      if (!parsedUser.name || !parsedUser.location || parsedUser.name === 'Pendente') {
        router.push('/login');
        return;
      }
      
      setUser(parsedUser);
      
      try {
        const [transRes, orderRes] = await Promise.all([
          fetch('/api/transfers'),
          fetch('/api/orders')
        ]);
        
        const transfers = await transRes.json();
        const orders = await orderRes.json();
        
        const isAdmin = parsedUser.role === 'ADMIN' || parsedUser.role === 'SUPER_ADMIN';
        
        let combined: FeedItem[] = [
          ...transfers.map((t: any) => ({ ...t, type: 'transport' })),
          ...orders.map((o: any) => ({ ...o, type: 'order' }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Apply 24h filter for non-admins for completed
        if (!isAdmin) {
          const now = new Date().getTime();
          const dayInMs = 24 * 60 * 60 * 1000;
          combined = combined.filter(item => {
            if (item.status === 'Entregue' || item.status === 'Concluído') {
              const deliveryTime = (item as any).deliveredAt 
                ? new Date((item as any).deliveredAt).getTime() 
                : new Date(item.createdAt).getTime();
              return (now - deliveryTime) < dayInMs;
            }
            return true;
          });
        }
        
        setItems(combined);
      } catch (err) {
        console.error("Fetch error", err);
      }
    };

    fetchSession();

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [router, isPWA]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowInstallGuide(true);
      setShowInstallBanner(false);
      return;
    }
    
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const startCamera = (mode: 'register' | 'deliver', id?: string) => {
    setCameraMode(mode);
    if (id) setActiveDeliveryId(id);
    setShowCamera(true);
    setCapturedPhoto(null);
    setTimeout(async () => {
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
    }, 100);
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
        const dataUrl = canvas.toDataURL('image/jpeg');
        if (cameraMode === 'deliver' && activeDeliveryId) {
          handleDeliveryCompletion(activeDeliveryId, dataUrl);
          stopCamera();
        } else {
          setCapturedPhoto(dataUrl);
          stopCamera();
        }
      }
    }
  };

  const handleDeliveryCompletion = async (id: string, photo: string) => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/transfers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'Entregue',
          deliveryPhotoUrl: photo
        })
      });
      window.location.reload();
    } catch (err) {
      alert("Erro na entrega: " + err);
    } finally {
      setIsSubmitting(false);
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
      window.location.reload();
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/transfers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      window.location.reload();
    } catch (err) {
      alert("Erro ao atualizar: " + err);
    } finally {
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

  const handleAIUpdate = async (id: string, text: string) => {
    if (!text.trim()) return;
    setIsSubmitting(true);
    try {
      const aiRes = await fetch('/api/ai/process-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const { status } = await aiRes.json();
      if (!status) throw new Error("IA não identificou status");
      
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

  const activeItems = items.filter(item => !['Entregue', 'Concluído'].includes(item.status));
  const completedItems = items.filter(item => ['Entregue', 'Concluído'].includes(item.status));

  return (
    <div className="bg-black text-white min-h-screen pb-32">
      <div className="lux-container space-y-8 animate-in fade-in duration-700">
        
        {/* Header Branding */}
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-white/5">
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
             {/* PWA Install Link in Header */}
             {!isPWA && (installPrompt || isIOS) && (
               <button 
                  onClick={handleInstallClick}
                  className="bg-zinc-900 border border-emerald-900/40 text-emerald-500 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-full flex items-center gap-2 hover:bg-emerald-500 hover:text-black transition-all shadow-xl shadow-emerald-500/5 active:scale-95"
               >
                 <DownloadCloud className="w-3.5 h-3.5" />
                 Instalar WebApp
               </button>
             )}
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
            onClick={() => startCamera('register')}
            className="luxury-card group p-8 flex flex-col items-center gap-4 text-center ring-1 ring-white/0 hover:ring-white/20 active:scale-95"
          >
            <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xl shadow-white/10">
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
        <AnimatePresence mode="wait">
          {capturedPhoto && cameraMode === 'register' && (
            <motion.div 
              key="transport-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="luxury-card p-6 space-y-6"
            >
              <div className="aspect-square rounded-xl overflow-hidden relative border border-zinc-800">
                <img src={capturedPhoto} alt="Snapshot" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setCapturedPhoto(null)} 
                  className="absolute top-4 right-4 p-2 bg-black/60 rounded-full backdrop-blur-md border border-white/10"
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
                      <option key={loc.id} value={loc.name} className="bg-black text-white">{loc.name}</option>
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
              key="order-form"
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
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
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
                  className="btn-luxury w-full bg-white text-black mt-4 flex items-center justify-center gap-2 group shadow-2xl shadow-white/5"
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

        {/* Activity Feed Accordion */}
        <section className="space-y-4">
          
          {/* Active Items Group */}
          <div className="space-y-4">
            <button 
              onClick={() => setActiveItemsOpen(!activeItemsOpen)}
              className="w-full flex items-center justify-between px-1 group outline-none"
            >
              <h2 className="text-[10px] uppercase tracking-widest font-black text-zinc-400 group-hover:text-white transition-colors flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/>
                Solicitações Ativas ({activeItems.length})
              </h2>
              {activeItemsOpen ? <ChevronUp className="w-4 h-4 text-zinc-600"/> : <ChevronDown className="w-4 h-4 text-zinc-600"/>}
            </button>
            
            <AnimatePresence initial={false}>
              {activeItemsOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  {activeItems.map((item, idx) => (
                    <SwipeableCard 
                      key={item.id} 
                      item={item} 
                      user={user} 
                      idx={idx} 
                      onAction={updateStatus}
                      onDeliver={(id: string) => startCamera('deliver', id)}
                      onAI={handleAIUpdate}
                    />
                  ))}
                  {activeItems.length === 0 && (
                     <div className="py-12 text-center border border-zinc-900 rounded-2xl border-dashed opacity-30">
                        <p className="text-[10px] uppercase tracking-widest">Sem atividades pendentes</p>
                     </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Completed Items Group */}
          <div className="space-y-4">
            <button 
              onClick={() => setCompletedItemsOpen(!completedItemsOpen)}
              className="w-full flex items-center justify-between px-1 group outline-none"
            >
              <h2 className="text-[10px] uppercase tracking-widest font-black text-zinc-600 group-hover:text-white transition-colors">
                Finalizadas {isAdmin ? `(${completedItems.length})` : "(Últimas 24h)"}
              </h2>
              {completedItemsOpen ? <ChevronUp className="w-4 h-4 text-zinc-600"/> : <ChevronDown className="w-4 h-4 text-zinc-600"/>}
            </button>
            
            <AnimatePresence initial={false}>
              {completedItemsOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  {completedItems.map((item, idx) => (
                    <div key={item.id} className="opacity-60 grayscale scale-[0.98]">
                       <SwipeableCard 
                          item={item} 
                          user={user} 
                          idx={idx} 
                          onAction={() => {}}
                          onAI={() => {}}
                        />
                    </div>
                  ))}
                  {completedItems.length === 0 && (
                     <div className="py-8 text-center border border-zinc-900 rounded-2xl border-dashed opacity-20">
                        <p className="text-[10px] uppercase tracking-widest">Vazio</p>
                     </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </section>
      </div>

      {/* Floating Install Notification Banner */}
      <AnimatePresence>
        {!isPWA && showInstallBanner && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-6 right-6 z-60"
          >
            <div className="luxury-card p-4 flex items-center justify-between gap-4 bg-zinc-950/90 border-emerald-900/40 shadow-2xl shadow-emerald-900/10 active:scale-95 transition-transform" onClick={handleInstallClick}>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                     <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Instalar App Mallard</p>
                    <p className="text-[9px] text-zinc-500 font-bold">Experiência mobile completa e agilidade.</p>
                  </div>
               </div>
               <button className="text-zinc-600" onClick={(e) => { e.stopPropagation(); setShowInstallBanner(false); }}>
                  <X className="w-4 h-4" />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Install Guide Modal */}
      <AnimatePresence>
        {showInstallGuide && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-110 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="luxury-card w-full max-w-sm p-8 space-y-8 border-emerald-900/20">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DownloadCloud className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Guia de Instalação iOS</h3>
                  </div>
                  <button onClick={() => setShowInstallGuide(false)}>
                    <X className="w-4 h-4 text-zinc-700" />
                  </button>
               </div>

               <div className="space-y-6">
                  <div className="flex gap-4">
                     <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">1</div>
                     <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                        Toque no botão de <span className="text-white font-bold bg-zinc-900 px-1.5 py-0.5 rounded flex-inline items-center gap-1 inline-flex"><Share className="w-3 h-3" /> Compartilhar</span> na barra do Safari.
                     </p>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">2</div>
                     <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                        Role para baixo e selecione a opção <span className="text-white font-bold">"Adicionar à Tela de Início"</span>.
                     </p>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">3</div>
                     <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                        Toque em <span className="text-emerald-500 font-black">Adicionar</span> no canto superior direito.
                     </p>
                  </div>
               </div>

               <button 
                  onClick={() => setShowInstallGuide(false)}
                  className="btn-luxury w-full mt-4 text-[10px] font-black uppercase"
               >
                  Entendido
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black flex flex-col items-center justify-center p-4"
          >
            <div className="relative w-full h-full max-w-lg bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 border-60 border-black/40 pointer-events-none">
                 <div className="w-full h-full border border-white/20" />
              </div>
              
              <button 
                onClick={stopCamera}
                className="absolute top-8 right-8 p-3 bg-black/50 rounded-full backdrop-blur-xl border border-white/10 pointer-events-auto"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              
              <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center gap-6 pointer-events-auto">
                 <p className="text-[10px] uppercase tracking-[0.5em] font-black text-white/40 drop-shadow-xl text-center">
                   {cameraMode === 'deliver' ? "FOTO COMPROBATÓRIA DE ENTREGA" : "REGISTRO DE SAÍDA - MALLARD"}
                 </p>
                 <button 
                  onClick={takePhoto}
                  className="w-20 h-20 rounded-full border-4 border-white/20 p-1 hover:scale-105 active:scale-95 transition-all bg-transparent"
                >
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                     <div className="w-10 h-10 border-2 border-black/10 rounded-full" />
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

// Interação Luxo: Swipe-to-Reveal + Expansão com Detalhes Operacionais
function SwipeableCard({ item, user, idx, onAction, onDeliver, onAI }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCD = user?.role === 'CD';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const canUpdate = isCD || isAdmin;

  const isCompleted = ['Entregue', 'Concluído'].includes(item.status);

  return (
    <div className="relative group overflow-hidden rounded-3xl">
      {/* Hidden Action Buttons behind card */}
      {!isCompleted && isCD && (
        <div className="absolute inset-y-0 right-0 w-32 flex items-center justify-end px-4 gap-2 bg-zinc-900/40">
           {item.status === 'Pendente' && (
             <button 
              onClick={(e) => { e.stopPropagation(); onAction(item.id, 'Em Preparação'); }}
              className="bg-white text-black text-[10px] font-black uppercase tracking-tighter px-4 py-3 rounded-xl shadow-2xl hover:bg-zinc-200 transition-colors"
             >
               Assumir
             </button>
           )}
           {item.status === 'Em Preparação' && (
              <button 
                onClick={(e) => { e.stopPropagation(); onAction(item.id, 'Em Trânsito'); }}
                className="bg-zinc-800 text-white text-[10px] font-black uppercase tracking-tighter px-4 py-3 rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-colors"
              >
                Saída
              </button>
           )}
           {item.status === 'Em Trânsito' && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDeliver(item.id); }}
                className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-tighter px-4 py-3 rounded-xl shadow-2xl hover:bg-emerald-400 transition-colors"
              >
                Entregar
              </button>
           )}
        </div>
      )}

      <motion.div 
        onClick={() => setIsExpanded(!isExpanded)}
        drag={canUpdate && !isCompleted ? "x" : false}
        dragConstraints={{ right: 0, left: -100 }}
        dragElastic={0.05}
        className={cn(
          "relative z-10 p-5 flex flex-col gap-4 bg-black border border-zinc-900 rounded-3xl touch-pan-y cursor-pointer transition-all hover:border-zinc-700 active:scale-[0.99]",
          item.type === 'transport' ? "luxury-card" : "luxury-card-dashed"
        )}
      >
        <div className="flex gap-4">
          {!isCompleted && canUpdate && (
            <div className="flex items-center gap-2 opacity-10">
               <GripVertical className="w-3 h-3 text-white"/>
            </div>
          )}
          
          {item.type === 'transport' ? (
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-800 shadow-xl shadow-black/50">
              <img src={item.photoUrl} alt="Logistic" className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500" />
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
                    <span className="text-zinc-200">{item.origin}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-600" />
                    <span className="text-zinc-400">{item.destination}</span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-zinc-200">
                      {item.items && item.items.length > 0 ? item.items.map((i:any) => i.productName).join(', ') : "Lista Insumos"}
                    </h3>
                  </div>
                )}
              </div>
              <div className={cn(
                "badge-minimal whitespace-nowrap shadow-sm",
                item.status === 'Em Preparação' ? "bg-amber-950/20 text-amber-500 border-amber-900/50" : 
                item.status === 'Em Trânsito' ? "bg-blue-950/20 text-blue-500 border-blue-900/50" :
                item.status === 'Entregue' ? "bg-emerald-950/20 text-emerald-500 border-emerald-900/50" :
                "bg-black border-zinc-800 text-zinc-500"
              )}>
                {item.status}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2">
              <div className="flex items-center gap-1.5 font-bold">
                <Clock className="w-3 h-3" />
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <span className="text-zinc-800 font-black">#{item.id.slice(0, 4)}</span>
            </div>
          </div>
        </div>

        {/* Operational Detailed View - Objective & Luxury */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               className="overflow-hidden border-t border-zinc-900 pt-4 space-y-5"
            >
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                     <p className="text-[8px] uppercase tracking-widest text-zinc-600 font-black flex items-center gap-1.5">
                        <Map className="w-2.5 h-2.5" /> Logística Origem
                     </p>
                     <div className="text-xs text-zinc-300 font-medium">
                        {item.type === 'transport' ? item.origin : "Centro de Distribuição"}
                     </div>
                  </div>
                  <div className="space-y-1.5">
                     <p className="text-[8px] uppercase tracking-widest text-zinc-600 font-black flex items-center gap-1.5">
                        <Map className="w-2.5 h-2.5" /> Destino Final
                     </p>
                     <div className="text-xs text-zinc-300 font-medium">
                        {item.type === 'transport' ? item.destination : "Unidade Mallard"}
                     </div>
                  </div>
               </div>

               {/* Items List for Orders */}
               {item.type === 'order' && item.items && item.items.length > 0 && (
                  <div className="space-y-2 bg-zinc-950/50 p-3 rounded-2xl border border-zinc-900">
                     <p className="text-[8px] uppercase tracking-widest text-zinc-600 font-black flex items-center gap-1.5">
                        <ClipboardList className="w-2.5 h-2.5" /> Lista de Materiais
                     </p>
                     <div className="space-y-1.5">
                        {item.items.map((material: any, i: number) => (
                           <div key={i} className="flex items-center justify-between text-[11px]">
                              <span className="text-zinc-400">• {material.productName}</span>
                              <span className="text-zinc-500 font-black uppercase">QTD: {material.quantity}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                     <p className="text-[8px] uppercase tracking-widest text-zinc-600 font-black flex items-center gap-1.5">
                        <History className="w-2.5 h-2.5" /> Registro Sistema
                     </p>
                     <div className="text-[10px] text-zinc-400 font-medium">
                        {new Date(item.createdAt).toLocaleString()}
                     </div>
                  </div>
                  <div className="space-y-1.5">
                     <p className="text-[8px] uppercase tracking-widest text-zinc-600 font-black flex items-center gap-1.5">
                        <User className="w-2.5 h-2.5" /> Responsável Entrada
                     </p>
                     <div className="text-[10px] text-zinc-400 font-medium">
                        {item.userName || "Admin Sistema"}
                     </div>
                  </div>
               </div>

               {/* AI Quick Command */}
               {item.type === 'transport' && canUpdate && !isCompleted && (
                 <div className="pt-2">
                    <div className="relative group/input">
                        <input 
                          type="text"
                          placeholder="Comando de voz ou instrução rápida..."
                          className="input-luxury h-9 text-[9px] pl-9 bg-zinc-950/80 border-zinc-800 text-zinc-500 focus:text-white transition-all focus:border-white/20"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e: any) => {
                            if (e.key === 'Enter') {
                              onAI(item.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                        <Mic className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-700 group-focus-within/input:text-emerald-500 transition-colors" />
                    </div>
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
