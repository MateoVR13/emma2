import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import AbstractText from './AbstractText';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-white via-pink-50 to-emma-almond">
      {/* Maximalist Background Decor */}
      <div className="absolute top-[-15%] left-[-15%] w-[600px] h-[600px] bg-emma-tickled rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-200 rounded-full mix-blend-multiply filter blur-[60px] opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-[20%] right-[20%] w-[200px] h-[200px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[40px] opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="glass-panel p-8 md:p-14 rounded-[3rem] w-full max-w-lg relative z-10 shadow-2xl border-2 border-white/80">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-tr from-emma-tickled to-pink-400 rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg transform rotate-6 border-4 border-white ring-4 ring-pink-100 hover:rotate-12 transition-transform duration-500">
             <Sparkles className="text-white" size={40} />
          </div>
          <div className="mb-4">
            <AbstractText text="Emma Glow" baseSize="xl" />
          </div>
          <p className="text-black font-sans tracking-widest text-sm uppercase font-bold opacity-60">Santuario Digital de Belleza</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 group">
            <label className="text-xs font-bold text-pink-400 ml-4 uppercase tracking-widest group-focus-within:text-emma-tickled transition-colors">Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-8 py-5 rounded-[2rem] bg-white/60 border-2 border-transparent focus:border-emma-tickled focus:bg-white focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all text-black placeholder-gray-400 font-sans text-xl shadow-inner"
              placeholder="ej. BellaSwan"
              required
            />
          </div>
          
          <div className="space-y-2 group">
             <label className="text-xs font-bold text-pink-400 ml-4 uppercase tracking-widest group-focus-within:text-emma-tickled transition-colors">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-8 py-5 rounded-[2rem] bg-white/60 border-2 border-transparent focus:border-emma-tickled focus:bg-white focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all text-black placeholder-gray-400 font-sans text-xl shadow-inner"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-black text-white py-5 rounded-[2rem] font-serif text-3xl hover:bg-emma-tickled hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-200 transition-all flex items-center justify-center gap-3 shadow-lg group mt-8"
          >
            Ingresar <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </form>

        <div className="mt-10 text-center">
             <p className="text-sm text-gray-400 font-serif italic">
                Al ingresar aceptas brillar con luz propia.
             </p>
        </div>
      </div>
    </div>
  );
};

export default Login;