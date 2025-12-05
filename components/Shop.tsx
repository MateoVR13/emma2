import React, { useEffect, useState, useRef } from 'react';
import { parseProductsCSV } from '../constants';
import { Product, CartItem } from '../types';
import { MapPin, ShoppingCart, Minus, FileText, Filter, ArrowDown } from 'lucide-react';
import AbstractText from './AbstractText';

interface ShopProps {
  addToCart: (product: Product) => void;
  cart: CartItem[];
  removeFromCart: (id: string) => void;
}

const Shop: React.FC<ShopProps> = ({ addToCart, cart, removeFromCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'all' | 'local' | 'internacional'>('all');
  const cartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load default data from constants.ts (Internal CSV)
    const data = parseProductsCSV();
    setProducts(data);
  }, []);

  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.origen === filter);

  // Calculate cart total
  const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const scrollToCart = () => {
    cartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24 md:pb-0 relative">
      {/* Product List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-4 gap-4 sticky top-20 z-30 py-2">
            <div className="bg-white/30 backdrop-blur-md px-4 py-1 rounded-xl shadow-sm border border-white/50 text-pink-900">
                <AbstractText text="Boutique" baseSize="lg" align="left" />
            </div>
            
            <div className="flex bg-white/50 backdrop-blur-md rounded-2xl p-1.5 border border-white/60 shadow-sm">
                {(['all', 'local', 'internacional'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-300 ${
                            filter === f 
                            ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg shadow-pink-200' 
                            : 'text-gray-500 hover:text-pink-500 hover:bg-white/50'
                        }`}
                    >
                        {f === 'all' ? 'Ver Todo' : f}
                    </button>
                ))}
            </div>
        </div>

        {filteredProducts.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-2xl">
                <FileText className="mx-auto text-gray-400 mb-2" size={40} />
                <p className="text-gray-500">No hay productos disponibles.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredProducts.map(product => (
                    <div key={product.id} className="glass-card rounded-2xl flex flex-col justify-between h-full group overflow-hidden border border-white/60">
                        {/* Image Area */}
                        <div className="relative h-48 overflow-hidden bg-white flex items-center justify-center">
                            <img 
                                src={product.imageUrl} 
                                alt={product.nombre}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                    e.currentTarget.src = `https://placehold.co/600x400/FCE7F3/DB2777?text=${encodeURIComponent(product.nombre.slice(0, 15))}`;
                                }}
                                className="w-full h-full object-contain p-2 transform group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-2 right-2">
                                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold shadow-sm backdrop-blur-md ${
                                    product.origen === 'local' ? 'bg-yellow-100/90 text-yellow-700' : 'bg-blue-100/90 text-blue-700'
                                }`}>
                                    {product.origen}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 flex flex-col flex-grow">
                            <div className="mb-3">
                                <p className="text-xs font-bold text-pink-500 mb-1 tracking-wide uppercase">{product.marca}</p>
                                <h3 className="font-serif text-lg font-bold text-gray-800 mb-1 leading-tight line-clamp-2 min-h-[3rem] italic">{product.nombre}</h3>
                                <div className="h-px w-12 bg-pink-200 my-3"></div>
                                <p className="text-xs text-gray-500 line-clamp-2 italic">✨ {product.ingredientes}</p>
                            </div>

                            <div className="mt-auto pt-4">
                                <div className="flex justify-between items-end mb-4">
                                     <div>
                                        <p className="text-[10px] text-gray-400 mb-0.5">Precio</p>
                                        <span className="text-xl font-bold text-gray-800">
                                            ${product.precio.toLocaleString('es-CO')}
                                        </span>
                                     </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="bg-pink-50 border border-pink-100 text-pink-700 py-2.5 rounded-xl text-[10px] font-bold hover:bg-pink-100 flex items-center justify-center gap-1 transition-colors">
                                        <MapPin size={12} /> {product.puntos_venta.split(',')[0]}
                                    </button>
                                    <button 
                                        onClick={() => addToCart(product)}
                                        className="bg-black text-white py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-1 shadow-lg shadow-gray-200 group-hover:shadow-pink-200"
                                    >
                                        <ShoppingCart size={14} /> Agregar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Floating Checkout Button for Mobile */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-40 lg:hidden animate-[float_0.5s_ease-out]">
            <button 
                onClick={scrollToCart} 
                className="w-full bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center border border-gray-700"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-pink-500 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                        {cartItemCount}
                    </div>
                    <span className="font-medium text-sm">Ver mi bolsa</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-lg">${total.toLocaleString('es-CO')}</span>
                    <ArrowDown size={18} className="text-gray-400" />
                </div>
            </button>
        </div>
      )}

      {/* Cart Sidebar / Section */}
      <div ref={cartRef} className="glass-panel p-6 rounded-3xl h-fit sticky top-24 border border-white/60 shadow-xl scroll-mt-24">
        <h3 className="font-serif text-xl text-gray-800 mb-6 flex items-center gap-2 border-b border-pink-100 pb-4 italic">
            <ShoppingCart size={20} className="text-pink-500"/> Tu Bolsa
        </h3>
        
        {cart.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="text-gray-300" size={24} />
                </div>
                <p className="font-medium">Tu bolsa está vacía.</p>
                <p className="text-xs mt-2 px-4">¡Explora nuestra selección curada para empezar a brillar!</p>
            </div>
        ) : (
            <>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map(item => (
                        <div key={item.id} className="flex gap-3 bg-white/40 p-3 rounded-xl border border-white/50 hover:bg-white/60 transition-colors animate-[fadeIn_0.3s_ease-out]">
                            <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.nombre}</p>
                                <p className="text-xs text-pink-600 font-medium">${item.precio.toLocaleString('es-CO')}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] font-bold bg-white w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-gray-100">x{item.quantity}</span>
                                <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-gray-400 hover:text-red-400 p-1"
                                >
                                    <Minus size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="border-t border-pink-100 mt-6 pt-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Subtotal</span>
                        <span className="text-sm font-bold text-gray-800">${total.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Envío</span>
                        <span className="text-sm font-bold text-green-600">Gratis</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
                        <span className="font-serif font-bold text-lg text-gray-900 italic">Total</span>
                        <span className="font-serif font-bold text-xl text-pink-600">
                            ${total.toLocaleString('es-CO')}
                        </span>
                    </div>
                    
                    <button className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl font-serif italic text-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                        Finalizar Compra <ShoppingCart size={16} />
                    </button>
                    <p className="text-[10px] text-center text-gray-400 flex items-center justify-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Checkout Seguro
                    </p>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default Shop;