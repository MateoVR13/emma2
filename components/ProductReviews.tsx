import React, { useState, useEffect } from "react";
import { Star, MessageCircle, LineChart as IconLineChart, ArrowLeft, Sparkles, Check, X, BrainCircuit, ChevronRight } from "lucide-react";
import { Product } from "../types";
import { parseProductsCSV } from "../constants";

// --- TYPES ---
interface Review {
    id: number;
    rating: number;
    comment: string;
    experience: string;
    date: string;
    suggestion?: string;
}

interface UserProfile {
    skinType: string;
    concerns: string[];
    likedBrands: string[];
    dislikedTypes: string[];
    budgetTier: 'low' | 'mid' | 'high';
}

// --- HELPER COMPONENTS ---

// Custom simple Line Chart
const SimpleLineChart = ({ data }: { data: { index: number; rating: number }[] }) => {
  if (data.length < 2) return <div className="h-24 flex items-center justify-center text-gray-400 text-xs italic bg-white/30 rounded-xl">Insuficientes datos para gráfica</div>;

  const maxRating = 5;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.rating / maxRating) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="w-full h-40 relative border-l border-b border-gray-400/30 ml-2 mt-4 pr-2">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
         {[0, 25, 50, 75, 100].map(y => (
             <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f0f0f0" strokeWidth="0.5" />
         ))}
         <polyline
            fill="none"
            stroke="#db2777"
            strokeWidth="2"
            points={points}
            vectorEffect="non-scaling-stroke"
         />
         {data.map((d, i) => {
             const x = (i / (data.length - 1)) * 100;
             const y = 100 - (d.rating / maxRating) * 100;
             return (
                 <circle key={i} cx={x} cy={y} r="3" fill="#db2777" stroke="white" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
             )
         })}
      </svg>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface ProductReviewsProps {
  product: Product;
  onBack: () => void;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ product, onBack }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [experience, setExperience] = useState("");
  
  // Recommendations State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardAnswers, setWizardAnswers] = useState<any>({});
  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(null);

  // Load reviews specific to this product
  useEffect(() => {
      const saved = localStorage.getItem(`reviews_${product.id}`);
      if (saved) {
          try { setReviews(JSON.parse(saved)); } catch(e) {}
      } else {
        setReviews([]);
      }
  }, [product.id]);

  // --- LOGIC: HISTORY & LEARNING ---

  const updateUserProfile = (newRating: number, prod: Product) => {
    // Get existing profile or default
    const savedProfile = localStorage.getItem("emma_user_profile");
    let profile: UserProfile = savedProfile ? JSON.parse(savedProfile) : {
        skinType: 'unknown',
        concerns: [],
        likedBrands: [],
        dislikedTypes: [],
        budgetTier: 'mid'
    };

    // Learn from reaction
    if (newRating >= 4) {
        if (!profile.likedBrands.includes(prod.marca)) profile.likedBrands.push(prod.marca);
        // Remove from disliked if it was there
        profile.dislikedTypes = profile.dislikedTypes.filter(t => t !== prod.tipo);
    } else if (newRating <= 2) {
        // If they hated it, maybe they don't like this product type
        if (!profile.dislikedTypes.includes(prod.tipo)) profile.dislikedTypes.push(prod.tipo);
    }

    localStorage.setItem("emma_user_profile", JSON.stringify(profile));
    console.log("Profile Updated based on reaction:", profile);
  };

  const submitReview = () => {
    if (rating === 0 || comment.trim() === "") return;

    const baseReview: Review = {
      id: Date.now(),
      rating,
      comment,
      experience,
      date: new Date().toLocaleDateString(),
    };

    const analyzed = analyzeExperience(baseReview);
    const newReviews = [analyzed, ...reviews];

    setReviews(newReviews);
    localStorage.setItem(`reviews_${product.id}`, JSON.stringify(newReviews));
    
    // Trigger learning algorithm
    updateUserProfile(rating, product);

    setComment("");
    setExperience("");
    setRating(0);
  };

  const analyzeExperience = (review: Review): Review => {
    let suggestion = "";
    if (review.rating <= 2) {
      suggestion = "Notamos que este producto no fue ideal. Hemos actualizado tu perfil para evitar recomendarte texturas o marcas similares en el futuro.";
    } else if (review.rating === 3) {
      suggestion = "Una experiencia neutral es valiosa. Prueba combinándolo con un serum hidratante para potenciar su efecto.";
    } else {
      suggestion = "¡Genial! Hemos guardado esta marca en tus favoritos para priorizarla en futuras búsquedas.";
    }
    return { ...review, suggestion };
  };

  // --- LOGIC: QUIZ WIZARD ---

  const QUIZ_QUESTIONS = [
      {
          id: 'goal',
          question: "¿Cuál es tu objetivo principal hoy?",
          options: [
              { label: "Combatir Acné/Grasa", value: "acne" },
              { label: "Anti-edad / Arrugas", value: "aging" },
              { label: "Hidratación Profunda", value: "hydration" },
              { label: "Luminosidad / Manchas", value: "glow" }
          ]
      },
      {
          id: 'texture',
          question: "¿Qué texturas prefieres en tu piel?",
          options: [
              { label: "Ligeras (Geles/Aguas)", value: "gel" },
              { label: "Cremosas / Untuosas", value: "cream" },
              { label: "Aceites / Serums", value: "oil" }
          ]
      },
      {
          id: 'budget',
          question: "¿Cuál es tu presupuesto ideal?",
          options: [
              { label: "Económico (< $60k)", value: "low" },
              { label: "Calidad/Precio ($60k - $120k)", value: "mid" },
              { label: "Inversión (> $120k)", value: "high" }
          ]
      }
  ];

  const handleQuizAnswer = (key: string, value: string) => {
      setWizardAnswers({ ...wizardAnswers, [key]: value });
      if (wizardStep < QUIZ_QUESTIONS.length - 1) {
          setWizardStep(prev => prev + 1);
      } else {
          finishQuiz({ ...wizardAnswers, [key]: value });
      }
  };

  const finishQuiz = (finalAnswers: any) => {
      // Load all products
      const allProducts = parseProductsCSV();
      const savedProfile = localStorage.getItem("emma_user_profile");
      const profile: UserProfile = savedProfile ? JSON.parse(savedProfile) : { likedBrands: [], dislikedTypes: [] };

      // Scoring Algorithm
      const scoredProducts = allProducts.map(p => {
          let score = 0;

          // 1. Filter by Goal (Keywords in Name/Type/Ingredients)
          const searchStr = (p.nombre + p.tipo + p.ingredientes).toLowerCase();
          
          if (finalAnswers.goal === 'acne' && (searchStr.includes('salicílico') || searchStr.includes('control') || searchStr.includes('purifi'))) score += 10;
          if (finalAnswers.goal === 'aging' && (searchStr.includes('retinol') || searchStr.includes('hialurónico') || searchStr.includes('edad'))) score += 10;
          if (finalAnswers.goal === 'hydration' && (searchStr.includes('hidrat') || searchStr.includes('agua') || searchStr.includes('b5'))) score += 10;
          if (finalAnswers.goal === 'glow' && (searchStr.includes('vitamina c') || searchStr.includes('manchas') || searchStr.includes('ilum'))) score += 10;

          // 2. Filter by Texture (Type)
          if (finalAnswers.texture === 'gel' && p.tipo.toLowerCase().includes('limpia')) score += 5;
          if (finalAnswers.texture === 'cream' && p.tipo.toLowerCase().includes('crema')) score += 5;
          if (finalAnswers.texture === 'oil' && p.tipo.toLowerCase().includes('serum')) score += 5;

          // 3. Filter by Budget
          if (finalAnswers.budget === 'low' && p.precio < 60000) score += 5;
          if (finalAnswers.budget === 'mid' && p.precio >= 60000 && p.precio <= 120000) score += 5;
          if (finalAnswers.budget === 'high' && p.precio > 120000) score += 5;

          // 4. History Bias (The Learning Part)
          if (profile.likedBrands.includes(p.marca)) score += 3; // Boost liked brands
          if (profile.dislikedTypes.includes(p.tipo)) score -= 10; // Penalize disliked types

          // 5. Exclude current product
          if (p.id === product.id) score = -100;

          return { product: p, score };
      });

      // Sort by score
      scoredProducts.sort((a, b) => b.score - a.score);
      
      // Pick top result
      if (scoredProducts.length > 0 && scoredProducts[0].score > 0) {
          setRecommendedProduct(scoredProducts[0].product);
      } else {
          // Fallback if no specific match
          setRecommendedProduct(allProducts[0]); 
      }
      setWizardStep(prev => prev + 1); // Move to result view
  };

  const chartData = reviews.slice().reverse().map((r, i) => ({
    index: i + 1,
    rating: r.rating,
  }));

  // --- RENDER ---

  if (showWizard) {
      return (
          <div className="glass-panel p-8 rounded-3xl min-h-[400px] flex flex-col justify-between animate-[fadeIn_0.3s_ease-out]">
             {recommendedProduct ? (
                 // RESULT VIEW
                 <div className="text-center space-y-6">
                     <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-[bounce_2s_infinite]">
                         <Sparkles className="text-green-600" size={40} />
                     </div>
                     <div>
                        <h3 className="font-serif text-2xl text-gray-800">¡Lo encontramos!</h3>
                        <p className="text-gray-500 text-sm mt-2">Basado en tus respuestas y tu historial de reacciones:</p>
                     </div>
                     
                     <div className="bg-white/60 p-4 rounded-2xl border border-white shadow-sm transform hover:scale-105 transition-transform duration-300">
                         <img src={recommendedProduct.imageUrl} alt="" className="w-24 h-24 object-cover rounded-xl mx-auto mb-3 shadow-md" />
                         <h4 className="font-bold text-lg text-pink-900">{recommendedProduct.nombre}</h4>
                         <p className="text-xs text-gray-500 uppercase tracking-wide">{recommendedProduct.marca}</p>
                         <p className="font-bold text-gray-800 mt-2">${recommendedProduct.precio.toLocaleString('es-CO')}</p>
                     </div>

                     <div className="flex gap-3 pt-4">
                         <button onClick={() => setShowWizard(false)} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
                             Cerrar
                         </button>
                         {/* Here you could add navigation to shop */}
                         <button onClick={() => onBack()} className="flex-1 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-colors">
                             Ver en Tienda
                         </button>
                     </div>
                 </div>
             ) : (
                 // QUESTION VIEW
                 <>
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-serif text-xl text-pink-900 flex items-center gap-2">
                                <BrainCircuit size={24} /> Emma AI
                            </h3>
                            <button onClick={() => setShowWizard(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        </div>
                        
                        <div className="mb-2">
                            <span className="text-xs font-bold text-pink-500 uppercase tracking-wider">Paso {wizardStep + 1} de {QUIZ_QUESTIONS.length}</span>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
                                <div className="bg-pink-500 h-full rounded-full transition-all duration-500" style={{ width: `${((wizardStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}></div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-6 leading-tight">
                            {QUIZ_QUESTIONS[wizardStep].question}
                        </h2>

                        <div className="space-y-3">
                            {QUIZ_QUESTIONS[wizardStep].options.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleQuizAnswer(QUIZ_QUESTIONS[wizardStep].id, opt.value)}
                                    className="w-full text-left p-4 rounded-xl border border-pink-100 bg-white/50 hover:bg-pink-50 hover:border-pink-300 transition-all flex justify-between items-center group"
                                >
                                    <span className="font-medium text-gray-700 group-hover:text-pink-900">{opt.label}</span>
                                    <ChevronRight className="text-gray-300 group-hover:text-pink-500" size={20} />
                                </button>
                            ))}
                        </div>
                    </div>
                 </>
             )}
          </div>
      )
  }

  // --- STANDARD VIEW ---
  
  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-pink-600 font-medium hover:bg-pink-50 px-3 py-1.5 rounded-lg transition-colors">
        <ArrowLeft size={18} /> Volver
      </button>

      <div className="glass-panel p-6 rounded-3xl border border-white/60 space-y-6">
        {/* Product Header */}
        <div className="flex items-center gap-4 border-b border-pink-100 pb-4">
             <img src={product.imageUrl} alt={product.nombre} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
             <div>
                 <h3 className="font-serif text-2xl text-pink-900 leading-none mb-1">{product.nombre}</h3>
                 <p className="text-sm text-gray-500">{product.marca}</p>
             </div>
        </div>

        {/* AI Recommendation Banner */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">
            <div>
                <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                    <Sparkles size={16} /> ¿No es tu producto ideal?
                </h4>
                <p className="text-xs text-indigo-700/80 mt-1 max-w-[250px]">
                    Responde 3 preguntas y Emma usará tu historial para encontrar tu "Match" perfecto.
                </p>
            </div>
            <button 
                onClick={() => { setWizardStep(0); setRecommendedProduct(null); setShowWizard(true); }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-indigo-700 transition-colors"
            >
                Iniciar Quiz
            </button>
        </div>

        <h4 className="font-bold text-gray-700 flex items-center gap-2 mt-2">
            <MessageCircle size={20} className="text-pink-500"/> Cuéntanos tu experiencia
        </h4>

        {/* Form */}
        <div className="space-y-4 bg-white/40 p-5 rounded-2xl border border-white/50">
            <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Calificación</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        size={32}
                        className={`cursor-pointer transition-all hover:scale-110 ${
                        s <= rating ? "text-yellow-400 fill-yellow-400 drop-shadow-sm" : "text-gray-300"
                        }`}
                        onClick={() => setRating(s)}
                    />
                    ))}
                </div>
            </div>

            <textarea
                className="w-full p-3 border border-pink-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-300 outline-none bg-white/80"
                placeholder="Escribe tu reseña..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
            ></textarea>

            <textarea
                className="w-full p-3 border border-pink-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-300 outline-none bg-white/80"
                placeholder="Describe tu experiencia (¿Qué sentiste? ¿Fue efectivo?)"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                rows={2}
            ></textarea>

            <button
                onClick={submitReview}
                disabled={!comment || rating === 0}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white py-3 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
                Publicar Reacción
            </button>
        </div>

        {/* Dynamic Recommendation Box */}
        {reviews.length > 0 && reviews[0].suggestion && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl shadow-sm animate-[pulse_3s_infinite]">
                <h4 className="font-serif text-lg text-rose-800 mb-1 flex items-center gap-2">
                    <Check size={16} /> Perfil Actualizado
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">{reviews[0].suggestion}</p>
            </div>
        )}

        {/* Chart */}
        {reviews.length > 0 && (
            <div className="mt-6 bg-white/30 p-4 rounded-2xl">
                 <h4 className="font-serif text-lg text-gray-800 flex items-center gap-2 mb-2">
                    <IconLineChart size={20} className="text-pink-600"/> Historial de Satisfacción
                </h4>
                <SimpleLineChart data={chartData} />
            </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4 pt-4">
            <h4 className="font-bold text-gray-700 border-b border-gray-200 pb-2">Tu Historial</h4>
            {reviews.map((rev) => (
            <div key={rev.id} className="bg-white/70 p-4 rounded-xl border border-white/50 shadow-sm hover:bg-white/90 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < rev.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                        ))}
                    </div>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{rev.date}</span>
                </div>
                <p className="text-sm text-gray-800 font-medium mb-1">{rev.comment}</p>
            </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default ProductReviews;
