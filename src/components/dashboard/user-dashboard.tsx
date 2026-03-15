'use client';

import { useState } from 'react';
import { Package, Plus, Minus, Send, ShoppingBag, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-end pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Estoque Disponível</h1>
           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Selecione os itens para solicitar envio.</p>
        </div>
      </div>

      {products.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum item em estoque no momento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
          {products.map((product) => {
            const cartItem = cart.find(c => c.id === product.id);
            const qty = cartItem ? cartItem.quantity : 0;
            
            return (
              <Card key={product.id} className="flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  {product.description && (
                    <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                  )}
                  <Badge variant="secondary" className="w-fit">
                    Estoque: {product.availableStock}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    {qty > 0 ? (
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveFromCart(product.id)}
                          className="w-8 h-8 p-0 rounded-full"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-bold w-6 text-center">{qty}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddToCart(product)}
                          disabled={qty >= product.availableStock}
                          className="w-8 h-8 p-0 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar à Lista
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating Action Button for Cart (Mobile material style) */}
      {cartTotalItems > 0 && !isCartOpen && (
        <Button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 p-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 z-40 flex items-center gap-3 h-auto"
        >
          <div className="relative">
            <ShoppingBag className="w-6 h-6" />
            <Badge className="absolute -top-2 -right-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm p-0">
              {cartTotalItems}
            </Badge>
          </div>
          <span className="font-semibold pr-2 hidden md:block">Finalizar Pedido</span>
        </Button>
      )}

      {/* Cart Bottom Sheet / Dialog */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          
          <div className="relative w-full md:w-96 bg-white dark:bg-slate-950 h-full shadow-2xl flex flex-col md:rounded-l-2xl animate-in slide-in-from-right duration-300">
             <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
               <h2 className="text-xl font-bold flex items-center gap-2">
                 <ShoppingBag className="w-5 h-5" />
                 Seu Pedido
               </h2>
               <Button variant="ghost" size="sm" onClick={() => setIsCartOpen(false)} className="p-2 rounded-full">
                 <X className="w-5 h-5" />
               </Button>
             </div>

             <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-slate-400 mt-10">Sua lista está vazia.</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                       <div key={item.id} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Qtd: {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-full">
                            <Button size="sm" variant="outline" onClick={() => handleRemoveFromCart(item.id)} className="w-7 h-7 p-0 rounded-full">
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-medium text-sm w-4 text-center">{item.quantity}</span>
                            <Button size="sm" variant="outline" onClick={() => handleAddToCart(item)} className="w-7 h-7 p-0 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900">
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                       </div>
                    ))}
                  </div>
                )}
             </div>

             <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <Button
                  onClick={handleSubmitOrder}
                  disabled={cart.length === 0 || isSubmitting}
                  className="w-full h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl shadow-lg hover:shadow-xl font-medium tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Solicitação ao CD
                    </>
                  )}
                </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
