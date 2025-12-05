import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, AlertCircle, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { analyzeSkinImage } from '../services/geminiService';
import { AnalysisResult, User } from '../types';

interface AnalysisProps {
  user: User;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

const Analysis: React.FC<AnalysisProps> = ({ user, onAnalysisComplete }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const startCamera = async () => {
      try {
          setIsCameraOpen(true);
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
      } catch (err) {
          console.error("Error accessing camera:", err);
          alert("No pudimos acceder a la cámara. Por favor verifica los permisos.");
          setIsCameraOpen(false);
      }
  };

  const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
      setIsCameraOpen(false);
  };

  const capturePhoto = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
              // Flip horizontally for mirror effect if needed, but usually raw capture is better for analysis
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg');
              setImage(dataUrl);
              setResult(null);
              stopCamera();
          }
      }
  };

  const processImage = async () => {
    if (!image) return;
    setLoading(true);
    try {
      // Remove data URL prefix for API
      const base64Data = image.split(',')[1];
      const data = await analyzeSkinImage(base64Data);
      
      const enrichedData = {
        ...data,
        date: new Date().toLocaleDateString()
      };
      
      setResult(enrichedData);
      onAnalysisComplete(enrichedData);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
      return () => {
          stopCamera();
      };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto pb-24 md:pb-0">
      <h2 className="font-serif text-3xl text-pink-900 mb-6 text-center">Análisis de Piel con IA</h2>
      
      <div className="glass-panel p-6 rounded-3xl shadow-xl border border-white/60 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-50"></div>

        {!image && !isCameraOpen ? (
          <div className="space-y-4">
             {/* Camera Option */}
             <button 
                onClick={startCamera}
                className="w-full border-2 border-dashed border-pink-400 bg-pink-50/50 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-pink-100/50 transition-colors group relative overflow-hidden"
             >
                <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-pink-300 z-10">
                   <Camera className="text-white" size={32} />
                </div>
                <p className="text-pink-900 font-bold text-lg z-10">Abrir Cámara</p>
                <p className="text-xs text-pink-700 mt-1 z-10">Toma una foto al instante</p>
             </button>

             {/* Upload Option */}
             <div className="text-center">
                 <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">- O -</span>
             </div>

             <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 rounded-xl border border-pink-200 text-pink-600 font-bold hover:bg-white transition-colors flex items-center justify-center gap-2"
             >
                <Upload size={18}/> Subir desde Galería
             </button>
             
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
             />
          </div>
        ) : isCameraOpen ? (
            // LIVE CAMERA VIEW
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] md:aspect-video flex flex-col">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover flex-1" />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="absolute top-4 right-4 z-20">
                    <button onClick={stopCamera} className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-md">
                        <X size={24} />
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center bg-gradient-to-t from-black/60 to-transparent">
                    <button 
                        onClick={capturePhoto}
                        className="w-16 h-16 rounded-full border-4 border-white bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors"
                    >
                        <div className="w-12 h-12 bg-white rounded-full"></div>
                    </button>
                </div>
            </div>
        ) : (
          // PREVIEW & ANALYSIS
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-square md:aspect-video bg-black/5">
                <img src={image!} alt="Analysis" className="w-full h-full object-cover" />
                {!result && !loading && (
                    <button 
                        onClick={() => setImage(null)}
                        className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-md"
                    >
                        <RefreshCw size={20} />
                    </button>
                )}
            </div>

            {!result && (
              <button
                onClick={processImage}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-pink-500 to-rose-400 hover:shadow-pink-300/50 hover:-translate-y-1'
                }`}
              >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        Analizando poros y textura...
                    </span>
                ) : '✨ Analizar Mi Piel'}
              </button>
            )}
          </div>
        )}

        {result && (
          <div className="mt-8 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="text-green-500" size={28} />
                <h3 className="text-2xl font-serif text-gray-800">Resultados</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/40 p-4 rounded-2xl border border-white/50">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Tipo de Piel</p>
                <p className="text-xl font-bold text-pink-700 capitalize">{result.skinType}</p>
              </div>
              
              <div className="bg-white/40 p-4 rounded-2xl border border-white/50">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Condiciones</p>
                <div className="flex flex-wrap gap-2">
                  {result.conditions.map((c, i) => (
                    <span key={i} className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-md font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 bg-red-50/50 p-5 rounded-2xl border border-red-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-400 shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-red-800 mb-2">Ingredientes a Evitar</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-red-700/80">
                    {result.avoidIngredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-green-50/50 p-5 rounded-2xl border border-green-100">
                <p className="text-sm text-green-800 italic">
                    "{result.recommendations}"
                </p>
            </div>

            <button 
                onClick={() => {setImage(null); setResult(null);}}
                className="w-full mt-6 py-3 text-pink-600 font-medium hover:bg-pink-50 rounded-xl transition-colors"
            >
                Realizar nuevo análisis
            </button>
          </div>
        )}
      </div>

      {/* History Preview */}
      {user.history.length > 0 && !result && !isCameraOpen && (
        <div className="mt-8 glass-panel p-6 rounded-3xl">
            <h3 className="font-serif text-xl mb-4 text-gray-700">Historial Reciente</h3>
            <div className="space-y-3">
                {user.history.slice(0, 3).map((h, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white/40 rounded-xl border border-white/60">
                        <span className="text-sm text-gray-500">{h.date}</span>
                        <span className="font-medium text-pink-700">{h.skinType}</span>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;