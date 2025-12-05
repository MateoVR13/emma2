

import React, { useState, useRef } from 'react';
import { Camera, AlertTriangle, CheckCircle, XCircle, Beaker, Info, Sparkles, ScrollText, AlertOctagon, Lightbulb } from 'lucide-react';
import { analyzeIngredients } from '../services/geminiService';
import { IngredientAnalysis, User } from '../types';

interface IngredientScannerProps {
  user: User;
}

const IngredientScanner: React.FC<IngredientScannerProps> = ({ user }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IngredientAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user skin type from history if available
  const userSkinType = user.history.length > 0 ? user.history[0].skinType : "No especificado";

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

  const processIngredients = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const analysis = await analyzeIngredients(base64Data, userSkinType);
      setResult(analysis);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getComedogenicColor = (rating: string) => {
      switch(rating) {
          case 'Alto': return 'bg-red-100 text-red-700 border-red-200';
          case 'Medio': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
          case 'Bajo': return 'bg-green-100 text-green-700 border-green-200';
          default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-24 md:pb-0">
      <div className="text-center mb-8">
          <div className="inline-block relative">
              <h2 className="font-serif text-3xl text-pink-900 relative z-10">Escáner de Ingredientes</h2>
              <div className="absolute -bottom-2 w-full h-3 bg-pink-200/50 -rotate-1 z-0 rounded-full"></div>
          </div>
          <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
            Sube una foto de la lista de ingredientes.
            <br/>Análisis experto basado en tu piel: <span className="font-bold text-pink-600 capitalize">{userSkinType}</span>.
          </p>
      </div>
      
      <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/60 relative overflow-hidden">
        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-pink-300 rounded-2xl h-72 flex flex-col items-center justify-center cursor-pointer hover:bg-pink-50/30 transition-colors group relative"
          >
            <div className="absolute inset-0 bg-grid-pink-100/20 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-pink-100">
              <Camera className="text-pink-500" size={36} />
            </div>
            <p className="text-gray-700 font-bold text-lg">Tomar Foto de Ingredientes</p>
            <p className="text-xs text-gray-400 mt-2 bg-white/60 px-3 py-1 rounded-full">Asegúrate que el texto sea legible</p>
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
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                <img src={image} alt="Ingredients" className="w-full max-h-[300px] object-contain bg-black/5" />
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
                onClick={processIngredients}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:shadow-xl hover:scale-[1.01]'
                }`}
              >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        Analizando base de datos dermatológica...
                    </span>
                ) : '🔍 Analizar Ingredientes'}
              </button>
            )}
          </div>
        )}

        {result && (
          <div className="mt-8 animate-[fadeIn_0.5s_ease-out] space-y-6">
            
            {/* Top Cards: Comedogenic & Suitability */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Comedogenic Status */}
                <div className={`p-5 rounded-2xl border ${getComedogenicColor(result.nivel_comedogenico_total)}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Beaker size={20} />
                        <h3 className="font-bold text-sm uppercase tracking-wider">Nivel Comedogénico</h3>
                    </div>
                    <p className="text-2xl font-serif font-bold">
                        {result.nivel_comedogenico_total}
                    </p>
                    <p className="text-xs mt-1 opacity-80">
                        {result.nivel_comedogenico_total === 'Bajo' ? 'Seguro: No obstruye poros (0-1).' : result.nivel_comedogenico_total === 'Medio' ? 'Precaución (2).' : 'Alto Riesgo: Obstruye poros (3-5).'}
                    </p>
                </div>

                {/* Suitability */}
                <div className={`p-5 rounded-2xl border ${result.es_recomendable_para_usuario ? 'bg-green-50 border-green-200 text-green-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                     <div className="flex items-center gap-2 mb-2">
                        {result.es_recomendable_para_usuario ? <CheckCircle size={20} /> : <AlertOctagon size={20} />}
                        <h3 className="font-bold text-sm uppercase tracking-wider">Compatibilidad</h3>
                    </div>
                    <p className="text-2xl font-serif font-bold">
                        {result.es_recomendable_para_usuario ? 'Recomendado' : 'Evitar'}
                    </p>
                     <p className="text-xs mt-1 opacity-80">
                        Para piel: <span className="font-bold">{result.tipo_piel_usuario}</span>
                    </p>
                </div>
            </div>

            {/* AI Explanation & Suggestion */}
            <div className="bg-white/50 p-5 rounded-2xl border border-white/60 space-y-4">
                <div className="flex items-start gap-3">
                    <Info className="text-blue-500 shrink-0 mt-1" size={20} />
                    <p className="text-gray-700 italic leading-relaxed text-sm">
                        "{result.analisis_general}"
                    </p>
                </div>
                {result.sugerencia_final && (
                    <div className="flex items-start gap-3 pt-3 border-t border-gray-200/50">
                        <Lightbulb className="text-yellow-500 shrink-0 mt-1" size={20} />
                        <p className="text-gray-800 font-medium text-sm">
                            {result.sugerencia_final}
                        </p>
                    </div>
                )}
            </div>

            {/* Ingredients Lists */}
            <div className="space-y-4">
                {result.problemas_encontrados.length > 0 && (
                    <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                        <h4 className="font-bold text-red-800 text-sm mb-3 flex items-center gap-2">
                            <AlertTriangle size={16} /> Ingredientes Conflictivos:
                        </h4>
                        <div className="space-y-3">
                            {result.problemas_encontrados.map((item, i) => (
                                <div key={i} className="bg-white/80 p-3 rounded-lg border border-red-100 shadow-sm text-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-red-700">{item.ingrediente}</span>
                                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">{item.riesgo}</span>
                                    </div>
                                    <p className="text-gray-600 text-xs">{item.explicacion}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {result.ingredientes_beneficiosos.length > 0 && (
                    <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                        <h4 className="font-bold text-green-800 text-sm mb-3 flex items-center gap-2">
                            <Sparkles size={16} /> Beneficios Clave:
                        </h4>
                        <div className="space-y-3">
                            {result.ingredientes_beneficiosos.map((item, i) => (
                                <div key={i} className="bg-white/80 p-3 rounded-lg border border-green-100 shadow-sm text-sm">
                                     <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-green-700">{item.ingrediente}</span>
                                        <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase">{item.beneficio}</span>
                                    </div>
                                    <p className="text-gray-600 text-xs">{item.explicacion}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Full List Button */}
            {result.lista_ingredientes_detectados_ocr.length > 0 && (
                 <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-600 text-xs mb-2 flex items-center gap-2 uppercase tracking-wide">
                        <ScrollText size={14} /> Ingredientes Detectados (OCR)
                    </h4>
                    <p className="text-xs text-gray-400 font-mono leading-relaxed">
                        {result.lista_ingredientes_detectados_ocr.join(", ")}
                    </p>
                 </div>
            )}

            <button 
                onClick={() => {setImage(null); setResult(null);}}
                className="w-full mt-4 py-3 text-pink-600 font-medium hover:bg-pink-50 rounded-xl transition-colors border border-transparent hover:border-pink-100"
            >
                Escanear otro producto
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientScanner;