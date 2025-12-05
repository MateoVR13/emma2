

import React, { useState, useEffect } from 'react';
import { SKINCARE_DONTs, SCIENTIFIC_FACTS } from '../constants';
import { XCircle, Lightbulb, Sparkles, Microscope, Dna, Activity } from 'lucide-react';

// Extended database of tips for dynamic loading
const SKINCARE_FACTS = [
    { title: "La Regla de los 60 Segundos", text: "Lavar tu cara por 60 segundos completos permite que los activos del limpiador realmente penetren y disuelvan la suciedad." },
    { title: "El Orden Correcto", text: "Siempre aplica tus productos de más ligero (líquido) a más pesado (crema/aceite) para asegurar la absorción." },
    { title: "Hielo para la Inflamación", text: "Pasar un cubo de hielo envuelto en tela por las mañanas ayuda a desinflamar y cerrar poros visiblemente." },
    { title: "La Funda de tu Almohada", text: "Cambia tu funda de almohada cada 3 días. La seda acumula menos bacterias que el algodón." },
    { title: "SPF en Interiores", text: "Los rayos UVA atraviesan ventanas. Si trabajas cerca de una, ¡necesitas protector solar!" },
    { title: "Doble Limpieza Nocturna", text: "Usa un limpiador en aceite primero para derretir el maquillaje, seguido de uno acuoso para limpiar la piel." },
    { title: "Vitamina C + SPF", text: "Combinar Vitamina C antes de tu protector solar potencia la protección contra radicales libres x4." },
    { title: "Cuello y Escote", text: "La piel del cuello es más delgada y envejece más rápido. ¡Extiende toda tu rutina hasta el pecho!" }
];

const Education: React.FC = () => {
  const [dailyTips, setDailyTips] = useState<{title: string, text: string}[]>([]);

  useEffect(() => {
      // Shuffle and pick 3 random tips every time component mounts
      const shuffled = [...SKINCARE_FACTS].sort(() => 0.5 - Math.random());
      setDailyTips(shuffled.slice(0, 3));
  }, []);

  return (
    <div className="pb-24 md:pb-0 space-y-12 animate-[fadeIn_0.5s_ease-out]">
        
        {/* Dynamic Tips Section */}
        <section>
            <div className="text-center mb-8">
                 <h2 className="font-serif text-3xl text-pink-900 inline-flex items-center gap-2">
                    <Sparkles className="text-emma-gold" /> Sabiduría Skincare
                 </h2>
                 <p className="text-gray-500 mt-2">Datos nuevos cada vez que entras.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dailyTips.map((tip, idx) => (
                    <div key={idx} className="glass-card p-6 rounded-3xl border border-white/60 relative overflow-hidden group hover:bg-white transition-all duration-300">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                        <Lightbulb className="text-yellow-400 mb-3" size={32} />
                        <h3 className="text-xl font-serif text-gray-800 mb-2">{tip.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed font-sans">{tip.text}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* The 5 Don'ts */}
        <section>
            <h2 className="font-serif text-3xl text-pink-900 mb-8 text-center">Los 5 Mandamientos "Don't"</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SKINCARE_DONTs.map((item, idx) => (
                    <div key={idx} className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:bg-red-50/30 transition-colors">
                        <div className="absolute -right-4 -top-4 text-red-100 opacity-50 group-hover:opacity-80 transition-opacity">
                            <XCircle size={100} />
                        </div>
                        <h3 className="text-lg font-bold text-red-900/80 mb-2 relative z-10 font-serif">{item.title}</h3>
                        <p className="text-sm text-gray-600 relative z-10 leading-relaxed font-sans">{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Scientific Facts Section (Replaced DIY) */}
        <section className="max-w-5xl mx-auto">
             <div className="glass-panel p-8 rounded-[40px] border border-white/70 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-200 via-blue-200 to-purple-200 opacity-60"></div>
                
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <Microscope className="text-indigo-600" size={36} />
                    <h2 className="font-serif text-3xl text-indigo-900 text-center">Ciencia & Belleza</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {SCIENTIFIC_FACTS.map((fact, i) => (
                        <div key={i} className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/60 hover:shadow-lg transition-all duration-300 group">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner 
                                    ${fact.category === 'Piel' ? 'bg-pink-100 text-pink-600' : 
                                      fact.category === 'Cabello' ? 'bg-orange-100 text-orange-600' :
                                      fact.category === 'Uñas' ? 'bg-purple-100 text-purple-600' : 'bg-teal-100 text-teal-600'
                                    }`}
                                >
                                    {fact.category === 'Piel' && <Dna size={24} className="group-hover:rotate-180 transition-transform duration-700"/>}
                                    {fact.category === 'Cabello' && <Sparkles size={24} className="group-hover:animate-pulse"/>}
                                    {fact.category === 'Uñas' && <div className="w-4 h-6 border-2 border-current rounded-t-full"></div>}
                                    {fact.category === 'Salud' && <Activity size={24} className="group-hover:animate-bounce"/>}
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1 block">{fact.category}</span>
                                    <h3 className="font-serif text-xl font-bold text-gray-800 mb-2 leading-tight">{fact.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed font-sans">
                                        {fact.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 text-center">
                     <p className="text-xs text-indigo-400 italic font-medium bg-indigo-50 inline-block px-4 py-2 rounded-full border border-indigo-100">
                        *Datos basados en estudios dermatológicos y biológicos.
                     </p>
                </div>
             </div>
        </section>
    </div>
  );
};

export default Education;