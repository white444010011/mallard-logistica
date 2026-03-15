'use client';

import { useState } from 'react';
import { Package, Plus, Minus, Send, ShoppingBag, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Product = {
  id: string;
  name: string;
  description: string | null;
  availableStock: number;
  imageUrl: string | null;
};

type CartItem = Product & { quantity: number };

export function UserDashboard({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
         if (existing.quantity >= product.availableStock) return prev;
         return prev.map((item) => 
           item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
         );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing && existing.quantity > 1) {
         return prev.map((item) => 
           item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
         );
      }
      return prev.filter((item) => item.id !== productId);
    });
  };

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.map(c => ({ id: c.id, quantity: c.quantity })) }),
      });

      if (!res.ok) throw new Error('Falha ao criar pedido');
      
      setCart([]);
      setIsCartOpen(false);
      alert('Pedido enviado com sucesso!'); // Replaced with a proper toast later
      router.refresh();
      
    } catch (error) {
       alert('Erro ao enviar pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-gray-200">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">Estoque Disponível</h1>
           <p className="text-sm text-gray-500 mt-1">Selecione os itens para solicitar envio.</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
           <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
           <p className="text-gray-500 font-medium">Nenhum item em estoque no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
          {products.map((product) => {
            const cartItem = cart.find(c => c.id === product.id);
            const qty = cartItem ? cartItem.quantity : 0;
            
            return (
              <div key={product.id} className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.06)] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                  )}
                  <div className="mt-3 inline-block bg-gray-100 px-2.5 py-1 rounded text-xs font-semibold text-gray-600">
                    Estoque: {product.availableStock}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  {qty > 0 ? (
                    <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-full border border-gray-100">
                      <button 
                        onClick={() => handleRemoveFromCart(product.id)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-700 hover:text-black hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold w-6 text-center">{qty}</span>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        disabled={qty >= product.availableStock}
                        className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full shadow-sm hover:bg-gray-800 disabled:opacity-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar à Lista
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button for Cart (Mobile material style) */}
      {cartTotalItems > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 bg-black text-white p-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 z-40 flex items-center gap-3"
        >
          <div className="relative">
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
              {cartTotalItems}
            </span>
          </div>
          <span className="font-semibold pr-2 hidden md:block">Finalizar Pedido</span>
        </button>
      )}

      {/* Cart Bottom Sheet / Dialog */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          
          <div className="relative w-full md:w-96 bg-white h-full shadow-2xl flex flex-col md:rounded-l-2xl animate-in slide-in-from-right duration-300">
             <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
               <h2 className="text-xl font-bold flex items-center gap-2">
                 <ShoppingBag className="w-5 h-5" />
                 Seu Pedido
               </h2>
               <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                 <X className="w-5 h-5" />
               </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 mt-10">Sua lista está vazia.</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                       <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-4">
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Qtd: {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-full">
                            <button onClick={() => handleRemoveFromCart(item.id)} className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm"><Minus className="w-3 h-3" /></button>
                            <span className="font-medium text-sm w-4 text-center">{item.quantity}</span>
                            <button onClick={() => handleAddToCart(item)} className="w-7 h-7 flex items-center justify-center bg-black text-white rounded-full"><Plus className="w-3 h-3" /></button>
                          </div>
                       </div>
                    ))}
                  </div>
                )}
             </div>

             <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={handleSubmitOrder}
                  disabled={cart.length === 0 || isSubmitting}
                  className="w-full h-14 bg-black text-white rounded-xl shadow-lg hover:shadow-xl font-medium tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Solicitação ao CD
                    </>
                  )}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
