
import React, { useState, useRef } from 'react';
import { FlaskConical, AlertTriangle, Zap, CheckCircle2, Moon, Sun, Droplets, Shield } from 'lucide-react';
import { analyzeRoutine } from '../services/geminiService';
import { RoutineBuilderResult } from '../types';

const RoutineBuilder: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoutineBuilderResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        setResult(null); 
      };
      reader.readAsDataURL(file);
    }
  };

  const processRoutine = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const analysis = await analyzeRoutine(base64Data);
      setResult(analysis);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 md:pb-0 animate-[fadeIn_0.5s_ease-out]">
      <div className="text-center mb-8">
          <div className="inline-block relative">
              <h2 className="font-serif text-3xl text-pink-900 relative z-10">Laboratorio de Rutinas</h2>
              <div className="absolute -bottom-2 w-full h-3 bg-purple-200/50 -rotate-1 z-0 rounded-full"></div>
          </div>
          <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">
            Sube una foto con <strong>todos tus productos juntos</strong>. 
            Nuestra IA química analizará sinergias, antagonismos y creará el orden perfecto.
          </p>
      </div>
      
      <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/60 relative overflow-hidden">
        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-purple-300 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50/30 transition-colors group relative"
          >
            <div className="absolute inset-0 bg-grid-purple-100/20 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-100">
              <FlaskConical className="text-purple-500" size={36} />
            </div>
            <p className="text-gray-700 font-bold text-lg">Subir Foto de la Rutina Completa</p>
            <p className="text-xs text-gray-400 mt-2 bg-white/60 px-3 py-1 rounded-full">Botellas, frascos y tubos</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 max-h-[350px] bg-gray-50 flex justify-center">
                <img src={image} alt="Products" className="h-full object-contain" />
                {!loading && (
                    <button 
                        onClick={() => {setImage(null); setResult(null);}}
                        className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                    >
                        ✕
                    </button>
                )}
            </div>

            {!result && (
              <button
                onClick={processRoutine}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-indigo-500 hover:shadow-purple-200 hover:scale-[1.01]'
                }`}
              >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        Simulando reacciones químicas...
                    </span>
                ) : '⚗️ Formular mi Rutina'}
              </button>
            )}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-8 animate-[fadeIn_0.5s_ease-out]">
            
            {/* 1. DETECTED PRODUCTS (Brief) */}
            <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Productos Identificados
                </h3>
                <div className="flex flex-wrap gap-2">
                    {result.productos_detectados.map((prod, idx) => (
                        <div key={idx} className="bg-white/70 px-3 py-2 rounded-lg border border-gray-100 shadow-sm text-sm text-gray-700 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            {prod.nombre_estimado}
                            <span className="text-xs text-gray-400 ml-1">
                                ({prod.activos_principales.join(', ') || 'Base'})
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. INTERACTIONS ANALYSIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.analisis_interacciones_global.map((inter, idx) => {
                    const isAntagonism = inter.tipo_interaccion.toLowerCase().includes('antagonismo') || inter.tipo_interaccion.toLowerCase().includes('riesgo');
                    return (
                        <div key={idx} className={`p-5 rounded-2xl border ${isAntagonism ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {isAntagonism ? <AlertTriangle className="text-red-500" size={20} /> : <Zap className="text-green-500" size={20} />}
                                <h4 className={`font-bold text-sm uppercase ${isAntagonism ? 'text-red-700' : 'text-green-700'}`}>
                                    {inter.tipo_interaccion}
                                </h4>
                            </div>
                            <p className="text-xs font-bold mb-2 text-gray-700">
                                {inter.productos_implicados.join(' + ')}
                            </p>
                            <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                                {inter.razon_quimica}
                            </p>
                            <div className={`text-xs px-2 py-1 rounded inline-block font-medium ${isAntagonism ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                💡 {inter.recomendacion}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 3. OPTIMIZED ROUTINE TIMELINE */}
            <div className="bg-white/50 rounded-3xl border border-white/60 p-6">
                <h3 className="font-serif text-2xl text-gray-800 mb-6 text-center">Tu Rutina Optimizada</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Morning */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                            <Sun className="text-orange-400" size={24} />
                            <h4 className="font-bold text-gray-700">Mañana (Protección)</h4>
                        </div>
                        <div className="space-y-4">
                            {result.rutina_optimizada_sugerida.pasos_manana.map((step, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center border border-orange-200">
                                            {i + 1}
                                        </div>
                                        {i < result.rutina_optimizada_sugerida.pasos_manana.length - 1 && (
                                            <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                                        )}
                                    </div>
                                    <div className="pb-2">
                                        <p className="text-sm font-medium text-gray-800 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100">
                                            {step}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Night */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                            <Moon className="text-indigo-400" size={24} />
                            <h4 className="font-bold text-gray-700">Noche (Reparación)</h4>
                        </div>
                        <div className="space-y-4">
                            {result.rutina_optimizada_sugerida.pasos_noche.map((step, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center border border-indigo-200">
                                            {i + 1}
                                        </div>
                                        {i < result.rutina_optimizada_sugerida.pasos_noche.length - 1 && (
                                            <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                                        )}
                                    </div>
                                    <div className="pb-2">
                                        <p className="text-sm font-medium text-gray-800 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100">
                                            {step}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Detailed Reasoning Accordion-like */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                     <h4 className="font-bold text-gray-500 text-xs uppercase mb-4 flex items-center gap-2">
                        <Droplets size={14}/> Lógica de Formulación
                     </h4>
                     <div className="space-y-3">
                        {result.rutina_optimizada_sugerida.orden_detallado.map((detail, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm bg-gray-50/50 p-3 rounded-lg">
                                <span className="font-bold text-purple-700">{detail.producto}</span>
                                <div className="hidden sm:block h-px flex-1 bg-gray-200 mx-4"></div>
                                <span className="text-gray-500 italic text-xs">{detail.razon}</span>
                            </div>
                        ))}
                     </div>
                </div>
            </div>

            {/* Warning Footer */}
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-xs text-yellow-800 flex items-start gap-2">
                <Shield size={16} className="shrink-0 mt-0.5"/>
                <p>{result.advertencias_generales}</p>
            </div>

            <button 
                onClick={() => {setImage(null); setResult(null);}}
                className="w-full mt-4 py-3 text-purple-600 font-medium hover:bg-purple-50 rounded-xl transition-colors border border-transparent hover:border-purple-100"
            >
                Analizar otra rutina
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutineBuilder;