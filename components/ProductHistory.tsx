
import React, { useState, useRef } from 'react';
import { User, ProductTracker, ProgressEntry, Product } from '../types';
import { analyzeSkinImage, generateProgressReport } from '../services/geminiService';
import { Camera, Calendar, TrendingUp, ArrowRight, Plus, Sparkles, ChevronRight, BarChart3, LineChart } from 'lucide-react';
import { parseProductsCSV } from '../constants';

interface ProductHistoryProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const ProductHistory: React.FC<ProductHistoryProps> = ({ user, onUpdateUser }) => {
  const [selectedTracker, setSelectedTracker] = useState<ProductTracker | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // MOCK DATA GENERATOR (If no trackers exist for demo)
  const initializeMockData = () => {
    const mockProduct = parseProductsCSV()[0]; // Use first product
    const mockTracker: ProductTracker = {
      id: 'mock-1',
      product: mockProduct,
      startDate: '2023-10-01',
      status: 'active',
      entries: [
        {
          id: 'e1',
          date: '2023-10-01',
          photoUrl: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?q=80&w=500',
          notes: 'Inicio del tratamiento. Piel un poco seca.',
          score: 65,
          analysis: { date: '2023-10-01', skinType: 'Seca', conditions: ['Deshidratación', 'Rojeces'], avoidIngredients: [] }
        },
        {
          id: 'e2',
          date: '2023-10-08',
          photoUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=500',
          notes: 'Siento menos tirantez.',
          score: 72,
          analysis: { date: '2023-10-08', skinType: 'Mixta', conditions: ['Deshidratación leve'], avoidIngredients: [] }
        },
        {
          id: 'e3',
          date: '2023-10-15',
          photoUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=500',
          notes: 'Mucho mejor luminosidad.',
          score: 85,
          analysis: { date: '2023-10-15', skinType: 'Normal', conditions: [], avoidIngredients: [] }
        }
      ]
    };
    onUpdateUser({ ...user, trackers: [mockTracker] });
    setSelectedTracker(mockTracker);
  };

  const handleAddEntry = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTracker) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // 1. Analyze Image
        const analysis = await analyzeSkinImage(base64String.split(',')[1]);
        
        // 2. Calculate Score (Simple heuristic: 100 - 10 per condition)
        const calculatedScore = Math.max(100 - (analysis.conditions.length * 10), 50);

        const newEntry: ProgressEntry = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          photoUrl: base64String,
          notes: 'Actualización semanal',
          analysis: analysis,
          score: calculatedScore
        };

        // 3. Update State
        const updatedTracker = {
            ...selectedTracker,
            entries: [...selectedTracker.entries, newEntry]
        };

        const updatedTrackers = user.trackers.map(t => t.id === selectedTracker.id ? updatedTracker : t);
        onUpdateUser({ ...user, trackers: updatedTrackers });
        setSelectedTracker(updatedTracker);
      };
      reader.readAsDataURL(file);
    } catch (error) {
        console.error(error);
        alert("Error al procesar la imagen");
    } finally {
        setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedTracker) return;
    setLoading(true);
    const report = await generateProgressReport(selectedTracker.entries, selectedTracker.product.nombre);
    setAiReport(report);
    setLoading(false);
  };

  // --- CHART COMPONENT ---
  const ProgressChart = ({ entries }: { entries: ProgressEntry[] }) => {
     if (entries.length < 2) return <div className="text-xs text-gray-400 text-center py-8">Necesitas al menos 2 registros para ver la gráfica.</div>;
     
     const maxScore = 100;
     const points = entries.map((e, i) => {
         const x = (i / (entries.length - 1)) * 100;
         const y = 100 - e.score; // Invert because SVG y=0 is top
         return `${x},${y}`;
     }).join(' ');

     return (
        <div className="w-full h-40 relative mt-4">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="25" x2="100" y2="25" stroke="#eee" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#eee" strokeWidth="0.5" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="#eee" strokeWidth="0.5" />
                
                {/* Area Gradient */}
                <defs>
                    <linearGradient id="scoreGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#db2777" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#db2777" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polygon points={`0,100 ${points} 100,100`} fill="url(#scoreGradient)" />

                {/* Line */}
                <polyline fill="none" stroke="#db2777" strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />
                
                {/* Dots */}
                {entries.map((e, i) => {
                    const x = (i / (entries.length - 1)) * 100;
                    const y = 100 - e.score;
                    return (
                        <g key={i}>
                            <circle cx={x} cy={y} r="3" fill="#fff" stroke="#db2777" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
                            <text x={x} y={y - 10} fontSize="8" textAnchor="middle" fill="#888" className="font-sans font-bold">{e.score}</text>
                        </g>
                    );
                })}
            </svg>
            <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                <span>Inicio</span>
                <span>Actual</span>
            </div>
        </div>
     );
  };

  // --- RENDER ---

  if (selectedTracker) {
    // DETAIL VIEW
    const lastEntry = selectedTracker.entries[selectedTracker.entries.length - 1];
    const firstEntry = selectedTracker.entries[0];

    return (
        <div className="pb-24 md:pb-0 animate-[fadeIn_0.3s_ease-out]">
             {/* Header */}
             <button onClick={() => setSelectedTracker(null)} className="text-gray-500 flex items-center gap-1 text-sm mb-4 hover:text-pink-600 transition-colors">
                 <ArrowRight className="rotate-180" size={16} /> Volver a mis tratamientos
             </button>

             <div className="glass-panel p-6 rounded-3xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl -z-10 opacity-60"></div>
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="font-serif text-2xl text-pink-900">{selectedTracker.product.nombre}</h2>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <Calendar size={14} /> Iniciado el {selectedTracker.startDate}
                        </p>
                    </div>
                    <div className="text-center bg-white/50 p-3 rounded-xl border border-white/60">
                        <span className="block text-xs text-gray-400 uppercase font-bold">Health Score</span>
                        <span className="text-3xl font-serif text-pink-600 font-bold">{lastEntry.score}</span>
                    </div>
                </div>

                {/* CHART */}
                <div className="mt-6">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <LineChart size={16} /> Evolución de la Piel
                    </h3>
                    <ProgressChart entries={selectedTracker.entries} />
                </div>
             </div>

             {/* AI FORECAST */}
             <div className="glass-card p-6 rounded-3xl mb-6 border-l-4 border-l-purple-400">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-purple-900 flex items-center gap-2">
                         <Sparkles size={18} /> Pronóstico IA
                     </h3>
                     {!aiReport && (
                        <button 
                            onClick={handleGenerateReport} 
                            disabled={loading}
                            className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-bold hover:bg-purple-200 transition-colors"
                        >
                            {loading ? 'Analizando...' : 'Generar Pronóstico Final'}
                        </button>
                     )}
                 </div>
                 
                 {aiReport ? (
                     <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line animate-[fadeIn_0.5s_ease-in]">
                         {aiReport}
                     </div>
                 ) : (
                     <p className="text-xs text-gray-500 italic">
                         Genera un análisis dermatológico basado en tus fotos y tendencias.
                     </p>
                 )}
             </div>

             {/* BEFORE / AFTER */}
             <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="glass-panel p-3 rounded-2xl text-center">
                     <span className="text-xs font-bold text-gray-400 mb-2 block">DÍA 1</span>
                     <img src={firstEntry.photoUrl} className="w-full h-32 object-cover rounded-xl bg-gray-100" alt="Start" />
                 </div>
                 <div className="glass-panel p-3 rounded-2xl text-center">
                     <span className="text-xs font-bold text-pink-500 mb-2 block">HOY</span>
                     <img src={lastEntry.photoUrl} className="w-full h-32 object-cover rounded-xl bg-gray-100" alt="Current" />
                 </div>
             </div>

             {/* TIMELINE */}
             <div className="space-y-6 relative">
                 <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-pink-100"></div>
                 
                 {/* Add Entry Button */}
                 <div className="relative pl-14">
                    <div className="absolute left-[15px] top-1 w-8 h-8 rounded-full bg-pink-500 border-4 border-white z-10 flex items-center justify-center shadow-md">
                        <Plus size={16} className="text-white"/>
                    </div>
                    <div className="glass-card p-4 rounded-2xl border-dashed border-2 border-pink-300 hover:bg-pink-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <h4 className="font-bold text-pink-700">Registrar Avance Semanal</h4>
                        <p className="text-xs text-gray-500 mt-1">Toma una foto para actualizar tu gráfica.</p>
                        {loading && <p className="text-xs text-pink-600 mt-2 font-bold animate-pulse">Analizando piel...</p>}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAddEntry} />
                 </div>

                 {/* Entries List */}
                 {[...selectedTracker.entries].reverse().map((entry) => (
                     <div key={entry.id} className="relative pl-14 animate-[fadeIn_0.3s_ease-out]">
                         <div className="absolute left-5 top-4 w-3 h-3 rounded-full bg-pink-300 border-2 border-white z-10"></div>
                         <div className="glass-panel p-4 rounded-2xl flex gap-4">
                             <img src={entry.photoUrl} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="Entry" />
                             <div>
                                 <div className="flex justify-between items-start w-full">
                                    <span className="text-xs font-bold text-gray-400">{entry.date}</span>
                                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-pink-600 font-bold border border-pink-100">Score: {entry.score}</span>
                                 </div>
                                 <p className="text-sm font-medium text-gray-800 mt-1">{entry.notes}</p>
                                 {entry.analysis.conditions.length > 0 && (
                                     <div className="flex flex-wrap gap-1 mt-2">
                                         {entry.analysis.conditions.map((c, i) => (
                                             <span key={i} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded">
                                                 {c}
                                             </span>
                                         ))}
                                     </div>
                                 )}
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
        </div>
    );
  }

  // DASHBOARD VIEW
  return (
    <div className="w-full max-w-4xl mx-auto pb-24 md:pb-0">
        <div className="text-center mb-10">
            <h2 className="font-serif text-3xl text-pink-900">Historial de Productos</h2>
            <p className="text-gray-500 mt-2">Monitorea la efectividad real de tu rutina con evidencia fotográfica.</p>
        </div>

        {(!user.trackers || user.trackers.length === 0) ? (
            <div className="glass-panel p-10 rounded-3xl text-center space-y-6">
                <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-[float_4s_ease-in-out_infinite]">
                    <TrendingUp className="text-pink-400" size={40} />
                </div>
                <h3 className="font-serif text-xl text-gray-800">No estás siguiendo ningún tratamiento</h3>
                <p className="text-gray-500 max-w-sm mx-auto">Comienza a registrar tu progreso para obtener gráficas de evolución y pronósticos de IA.</p>
                <button 
                    onClick={initializeMockData} // Demo convenience
                    className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl"
                >
                    Iniciar Demo de Tracking
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.trackers.map(tracker => (
                    <div 
                        key={tracker.id} 
                        onClick={() => setSelectedTracker(tracker)}
                        className="glass-card p-6 rounded-3xl cursor-pointer hover:bg-white/70 group transition-all duration-300 border border-white/60 relative overflow-hidden"
                    >
                         <div className="flex items-center gap-4 mb-4 relative z-10">
                             <img src={tracker.product.imageUrl} className="w-16 h-16 rounded-2xl object-cover shadow-sm" alt={tracker.product.nombre} />
                             <div>
                                 <h3 className="font-bold text-gray-800 line-clamp-1">{tracker.product.nombre}</h3>
                                 <p className="text-xs text-pink-600 font-medium">{tracker.product.marca}</p>
                             </div>
                         </div>
                         
                         <div className="space-y-3 relative z-10">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Estado</span>
                                <span className="text-green-600 font-bold bg-green-50 px-2 rounded-lg flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Activo
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Registros</span>
                                <span className="font-bold text-gray-800">{tracker.entries.length} semanas</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Último Score</span>
                                <span className="font-bold text-pink-600">{tracker.entries[tracker.entries.length-1].score}/100</span>
                            </div>
                         </div>

                         {/* Sparkline / Mini Chart Visual */}
                         <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 pointer-events-none">
                             <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                                 <path d="M0,20 L10,15 L30,18 L50,10 L70,5 L100,0 L100,20 Z" fill="#db2777" />
                             </svg>
                         </div>
                    </div>
                ))}

                {/* Add New Placeholer */}
                <div className="border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center p-6 text-gray-400 hover:bg-gray-50 cursor-pointer transition-colors min-h-[200px]">
                    <Plus size={32} className="mb-2" />
                    <span className="font-medium">Agregar Nuevo Producto</span>
                </div>
            </div>
        )}
    </div>
  );
};

export default ProductHistory;
