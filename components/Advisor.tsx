import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { chatWithEmma } from '../services/geminiService';
import AnimatedAvatar from './AnimatedAvatar';

const Advisor: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: '¡Hola! Soy Emma, tu asesora de belleza. 🎀✨ ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    // Prepare history for API
    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const response = await chatWithEmma(history, userMsg);
    
    setMessages(prev => [...prev, { role: 'model', text: response || "Tuve un pequeño error, ¿puedes repetir?" }]);
    setIsTyping(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[600px] w-full max-w-3xl mx-auto glass-panel rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-white/60">
       {/* Header with Animated Character */}
       <div className="bg-pink-100/80 backdrop-blur-md p-4 border-b border-pink-200 flex items-center gap-4">
            {/* Use the new Animated Component with larger size for visibility */}
            <div className="shrink-0">
                <AnimatedAvatar size="md" />
            </div>
            
            <div>
                <h3 className="font-serif font-bold text-2xl text-pink-900 leading-none">Emma</h3>
                <p className="text-xs text-pink-700 font-medium flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online & Ready to Glow
                </p>
            </div>
       </div>

       {/* Chat Area */}
       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/20">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm font-sans ${
                        msg.role === 'user' 
                        ? 'bg-pink-500 text-white rounded-br-none' 
                        : 'bg-white text-gray-700 rounded-bl-none border border-pink-100'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                        <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce delay-75"></span>
                        <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce delay-150"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
       </div>

       {/* Input Area */}
       <div className="p-4 bg-white/40 border-t border-white/60">
           <div className="flex gap-2">
               <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pregunta algo sobre tu piel..."
                className="flex-1 bg-white/70 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-300 outline-none shadow-inner font-sans"
               />
               <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-pink-500 text-white p-3 rounded-xl hover:bg-pink-600 disabled:opacity-50 transition-colors shadow-lg shadow-pink-200"
               >
                   <Send size={20} />
               </button>
           </div>
       </div>
    </div>
  );
};

export default Advisor;