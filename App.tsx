
import React, { useState, useEffect } from 'react';
import { User, ViewState, CartItem, Product, AnalysisResult } from './types';
import Login from './components/Login';
import NavBar from './components/NavBar';
import Analysis from './components/Analysis';
import IngredientScanner from './components/IngredientScanner';
import RoutineBuilder from './components/RoutineBuilder';
import Advisor from './components/Advisor';
import Shop from './components/Shop';
import Education from './components/Education';
import SmartMirror from './components/SmartMirror';
import ProductReviews from './components/ProductReviews';
import ProductHistory from './components/ProductHistory';
import AbstractText from './components/AbstractText';
import AnimatedAvatar from './components/AnimatedAvatar';
import { parseProductsCSV } from './constants';
import { CheckCircle, AlertCircle, Smile, Search, Star, Heart, Sparkles, TrendingUp, Camera, ScanBarcode, FlaskConical, MessageCircleHeart } from 'lucide-react';

// INTRO FLASH COMPONENT (Golden Sparkle Burst - 1 Second)
const IntroFlash = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1000); // 1 second flash as requested
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Generate random sparkles for the "many small sparkles" effect
  const randomSparkles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 8 + 2, // 2px to 10px
    delay: `${Math.random() * 0.5}s`,
    duration: `${Math.random() * 0.5 + 0.2}s`
  }));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white pointer-events-none overflow-hidden animate-[fadeOut_1s_ease-in-out_forwards]">
       <div className="relative w-full h-full flex items-center justify-center">
          
          {/* Central Golden Burst (Flash) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vmax] h-[150vmax] bg-radial-gradient from-emma-gold/40 via-yellow-100/20 to-transparent animate-[pulse_0.5s_ease-out_infinite]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-400/30 rounded-full blur-[80px] animate-scale-up-fade"></div>

          {/* Core Shine */}
          <div className="absolute z-20 animate-[ping_0.8s_cubic-bezier(0,0,0.2,1)_infinite]">
             <Sparkles size={180} className="text-emma-gold fill-emma-gold drop-shadow-[0_0_50px_rgba(255,215,0,1)]" />
          </div>

          {/* Random Small Brighter Sparkles everywhere */}
          {randomSparkles.map((s) => (
             <div 
                key={s.id}
                className="absolute bg-yellow-300 rounded-full shadow-[0_0_10px_#FDB022] animate-twinkle"
                style={{
                    left: s.left,
                    top: s.top,
                    width: `${s.size}px`,
                    height: `${s.size}px`,
                    animationDelay: s.delay,
                    animationDuration: s.duration
                }}
             />
          ))}
          
          {/* White Overlay to fade out */}
          <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
       </div>
    </div>
  );
};

const SELF_LOVE_QUOTES = [
    "Eres magia pura ✨",
    "Tu piel cuenta tu historia, ámala 💖",
    "Brilla con tu propia luz 🌟",
    "Hoy es un día perfecto para ser tú misma 🌷",
    "La belleza comienza en el momento en que decides ser tú misma 🦋",
    "Tu sonrisa es tu mejor accesorio 😊",
    "Cuidarte es un acto de amor revolucionario 💪",
    "Eres suficiente tal y como eres 💫"
];

const App: React.FC = () => {
  const [user, setUser] = useState<User>({ username: '', isLoggedIn: false, history: [], routineHistory: [], trackers: [] });
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | null}>({ message: '', type: null });
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const [reactionSearch, setReactionSearch] = useState("");
  const [showIntro, setShowIntro] = useState(false);
  const [randomQuote, setRandomQuote] = useState(SELF_LOVE_QUOTES[0]);

  // Trigger intro when logging in or refreshing if user is logged in
  useEffect(() => {
    if (user.isLoggedIn) {
        setShowIntro(true);
        // Randomize quote on entry
        setRandomQuote(SELF_LOVE_QUOTES[Math.floor(Math.random() * SELF_LOVE_QUOTES.length)]);
    }
  }, [user.isLoggedIn]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };

  const handleLogin = (username: string) => {
    setUser({ ...user, username, isLoggedIn: true });
    setView(ViewState.HOME);
  };

  const handleLogout = () => {
    setUser({ username: '', isLoggedIn: false, history: [], routineHistory: [], trackers: [] });
    setView(ViewState.LOGIN);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setUser(prev => ({
      ...prev,
      history: [result, ...prev.history]
    }));
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`¡${product.nombre} agregado a tu bolsa!`);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
        const existing = prev.find(p => p.id === id);
        if(existing && existing.quantity > 1) {
             return prev.map(p => p.id === id ? { ...p, quantity: p.quantity - 1 } : p);
        }
        return prev.filter(p => p.id !== id);
    });
  };

  if (!user.isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen text-black pb-20 md:pb-0 font-sans relative overflow-x-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      {/* Intro Flash (Golden) */}
      {showIntro && <IntroFlash onComplete={() => setShowIntro(false)} />}

      {/* Maximalist Background Elements - Fresh & Youthful */}
      <div className="fixed top-10 left-10 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none -z-10"></div>
      <div className="fixed top-20 right-20 w-56 h-56 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000 pointer-events-none -z-10"></div>
      <div className="fixed bottom-10 left-1/3 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-[60px] opacity-20 animate-blob pointer-events-none -z-10"></div>

      {/* Toast Notification */}
      {toast.type && (
        <div className="fixed top-4 md:top-24 left-1/2 transform -translate-x-1/2 z-[60] animate-[float_0.5s_ease-out] w-[90%] max-w-sm">
            <div className={`glass-panel p-4 rounded-2xl shadow-2xl border-2 flex items-center gap-3 ${
                toast.type === 'success' ? 'border-green-300 bg-green-50/90' : 'border-red-300 bg-red-50/90'
            }`}>
                {toast.type === 'success' ? <CheckCircle className="text-green-600" size={24} /> : <AlertCircle className="text-red-600" size={24} />}
                <p className={`text-lg font-bold font-sans ${toast.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
                    {toast.message}
                </p>
            </div>
        </div>
      )}

      <NavBar 
        currentView={view} 
        setView={setView} 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-24 animate-pop-in">
        {view === ViewState.HOME && (
          <div className="text-center space-y-12 pt-10">
             {/* Header Section */}
             <div className="relative inline-block mb-4 hover:scale-105 transition-transform duration-500">
                <div className="relative z-10">
                  <AbstractText text={`Hola, ${user.username}`} baseSize="2xl" />
                </div>
                {/* Decorative Sticker/Highlight */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[110%] h-8 bg-emma-almond -rotate-1 z-0 rounded-sm opacity-80 border-2 border-white border-dashed"></div>
             </div>
             
             <p className="text-xl text-black max-w-2xl mx-auto font-sans leading-relaxed bg-white/40 p-4 rounded-2xl border-2 border-dashed border-pink-200 shadow-sm inline-block">
               Bienvenida a tu <span className="font-bold text-emma-tickled">Diario de Piel</span>. <br/>
               Un espacio acogedor para cuidarte.
             </p>

             {/* Maximalist Cards Grid with LIVELY ANIMATIONS */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-8">
                {/* CARD 1: ANALYZE - Camera Animation */}
                <div 
                    onClick={() => setView(ViewState.ANALYSIS)}
                    className="glass-card p-6 rounded-[2rem] cursor-pointer group hover:bg-white relative overflow-hidden flex flex-col items-center text-center border-4 border-white shadow-[6px_6px_0px_rgba(244,127,190,0.3)] hover:shadow-pink-300/50"
                >
                    <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border-4 border-pink-200 shadow-inner relative overflow-hidden">
                        <Camera size={48} className="text-pink-500 relative z-10" />
                        {/* FLASH ANIMATION EFFECT */}
                        <div className="absolute inset-0 bg-white rounded-full animate-flash-camera opacity-0 z-0"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-white"></div>
                    </div>
                    <h3 className="font-serif text-3xl mb-1 text-emma-tickled drop-shadow-sm">Analiza</h3>
                    <p className="text-black text-sm font-sans font-medium px-2">Descubre lo que tu piel necesita hoy.</p>
                </div>

                {/* CARD 2: SCANNER - Barcode Scan Animation */}
                <div 
                    onClick={() => setView(ViewState.INGREDIENTS)}
                    className="glass-card p-6 rounded-[2rem] cursor-pointer group hover:bg-white relative overflow-hidden flex flex-col items-center text-center border-4 border-white shadow-[6px_6px_0px_rgba(253,224,71,0.3)]"
                >
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border-4 border-yellow-200 shadow-inner relative overflow-hidden">
                        <ScanBarcode size={48} className="text-yellow-600 relative z-0" />
                        {/* LASER SCAN ANIMATION */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 shadow-[0_0_10px_red] animate-scan-vertical z-10"></div>
                    </div>
                    <h3 className="font-serif text-3xl mb-1 text-yellow-600 drop-shadow-sm">Scanner</h3>
                    <p className="text-black text-sm font-sans font-medium px-2">¿Es seguro? Revisa los ingredientes.</p>
                </div>

                {/* CARD 3: MIXER - Bubbling Potion Animation */}
                <div 
                    onClick={() => setView(ViewState.ROUTINE_BUILDER)}
                    className="glass-card p-6 rounded-[2rem] cursor-pointer group hover:bg-white relative overflow-hidden flex flex-col items-center text-center border-4 border-white shadow-[6px_6px_0px_rgba(192,132,252,0.3)]"
                >
                     <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border-4 border-purple-200 shadow-inner relative overflow-hidden">
                        <FlaskConical size={48} className="text-purple-500 animate-mix-shake relative z-10" />
                        {/* RISING BUBBLES */}
                        <div className="absolute bottom-0 left-1/3 w-2 h-2 bg-purple-300 rounded-full animate-bubble-rise"></div>
                        <div className="absolute bottom-0 right-1/3 w-3 h-3 bg-purple-400 rounded-full animate-bubble-rise animation-delay-1000"></div>
                    </div>
                    <h3 className="font-serif text-3xl mb-1 text-purple-500 drop-shadow-sm">Mixer</h3>
                    <p className="text-black text-sm font-sans font-medium px-2">Crea pócimas mágicas para tu rutina.</p>
                </div>
                
                {/* CARD 4: EMMA CHAT - Complex Avatar Animation */}
                <div 
                    onClick={() => setView(ViewState.ADVISOR)}
                    className="glass-card p-6 rounded-[2rem] cursor-pointer group hover:bg-white relative overflow-hidden flex flex-col items-center text-center border-4 border-white shadow-[6px_6px_0px_rgba(96,165,250,0.3)]"
                >
                    <div className="mb-4 group-hover:scale-105 transition-transform">
                        {/* NEW ANIMATED AVATAR COMPONENT */}
                        <AnimatedAvatar size="md" />
                    </div>
                    <h3 className="font-serif text-3xl mb-1 text-blue-400 drop-shadow-sm">Emma Chat</h3>
                    <p className="text-black text-sm font-sans font-medium px-2">Tu mejor amiga experta en beauty.</p>
                </div>
             </div>

             {/* Self Love Quote Section - At the bottom, not too big */}
             <div className="mt-16 pb-8">
                <div className="max-w-md mx-auto bg-white/60 p-4 rounded-3xl border-2 border-pink-100 shadow-lg relative transform rotate-1 hover:rotate-0 transition-transform duration-500">
                    <Heart className="absolute -top-3 -right-3 text-pink-400 fill-pink-200 animate-bounce-slow" size={30} />
                    <Heart className="absolute -bottom-2 -left-2 text-pink-300 fill-pink-100" size={20} />
                    <h4 className="font-serif text-lg text-gray-400 mb-1">Nota para ti 💌</h4>
                    <p className="font-serif text-xl text-emma-tickled leading-tight italic">
                        "{randomQuote}"
                    </p>
                </div>
             </div>
          </div>
        )}

        {view === ViewState.ANALYSIS && (
          <Analysis user={user} onAnalysisComplete={handleAnalysisComplete} />
        )}

        {view === ViewState.INGREDIENTS && (
          <IngredientScanner user={user} />
        )}

        {view === ViewState.ROUTINE_BUILDER && (
          <RoutineBuilder />
        )}

        {view === ViewState.SMART_MIRROR && (
          <SmartMirror />
        )}

        {view === ViewState.ADVISOR && (
          <Advisor />
        )}

        {view === ViewState.SHOP && (
          <Shop addToCart={addToCart} cart={cart} removeFromCart={removeFromCart} />
        )}

        {view === ViewState.EDUCATION && (
          <Education />
        )}

        {view === ViewState.REACTION && (
          <div className="w-full max-w-6xl mx-auto pt-4 md:pt-10 pb-24">
             {!reviewProduct ? (
                <div className="space-y-6 animate-pop-in">
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 bg-emma-almond/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-white">
                            <Smile className="text-emma-tickled" size={48} />
                        </div>
                        <div className="text-emma-tickled mb-2">
                             <AbstractText text="Reacciones" baseSize="lg" />
                        </div>
                        <p className="text-black font-sans italic text-lg max-w-md mx-auto">Selecciona el producto que usaste para calificarlo y mejorar nuestro algoritmo.</p>
                    </div>

                    <div className="sticky top-20 z-20 bg-white/70 backdrop-blur-xl p-3 rounded-2xl border-2 border-pink-100 shadow-lg mb-4 max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400" size={20} />
                            <input 
                                type="text"
                                placeholder="Buscar producto por nombre o marca..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-transparent focus:outline-none placeholder-gray-500 text-black text-lg font-sans"
                                value={reactionSearch}
                                onChange={(e) => setReactionSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {parseProductsCSV()
                            .filter(p => p.nombre.toLowerCase().includes(reactionSearch.toLowerCase()) || p.marca.toLowerCase().includes(reactionSearch.toLowerCase()))
                            .map(p => (
                            <div key={p.id} onClick={() => setReviewProduct(p)} className="glass-card rounded-[2rem] cursor-pointer hover:bg-white/80 hover:shadow-xl transition-all border-2 border-white/60 overflow-hidden flex flex-col h-full group relative">
                                <div className="h-56 bg-white overflow-hidden relative flex items-center justify-center p-6">
                                    <img 
                                        src={p.imageUrl} 
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
                                        alt={p.nombre}
                                        loading="lazy"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement?.classList.add('bg-pink-50');
                                            const icon = document.createElement('div');
                                            icon.innerHTML = '<span class="text-4xl">🧴</span>';
                                            icon.className = 'flex items-center justify-center w-full h-full';
                                            e.currentTarget.parentElement?.appendChild(icon);
                                        }}
                                    />
                                    <div className="absolute top-3 right-3 bg-white/90 text-emma-tickled p-2 rounded-full shrink-0 shadow-md border border-pink-100">
                                        <Smile size={18} />
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col text-center">
                                    <h3 className="font-bold text-black text-sm md:text-base line-clamp-2 leading-tight mb-2 font-sans">{p.nombre}</h3>
                                    <p className="text-xs text-emma-tickled font-black uppercase mt-auto tracking-widest">{p.marca}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <ProductReviews product={reviewProduct} onBack={() => setReviewProduct(null)} />
            )}
          </div>
        )}

        {view === ViewState.PRODUCT_HISTORY && (
          <ProductHistory user={user} onUpdateUser={setUser} />
        )}
      </main>
    </div>
  );
};

export default App;
