import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, IngredientAnalysis, ProgressEntry, RoutineBuilderResult } from '../types';

// Variable global para almacenar la instancia una vez creada
let aiInstance: GoogleGenAI | null = null;

// Función Helper para obtener el cliente de forma perezosa (Lazy Load)
const getAIClient = () => {
  if (aiInstance) return aiInstance;

  // Acceso directo a process.env.API_KEY para permitir el reemplazo en build time (Netlify)
  const key = import.meta.env.VITE_API_KEY;

  if (key) {
    aiInstance = new GoogleGenAI({ apiKey: key });
    return aiInstance;
  }

  console.error("⚠️ API Key no configurada. Configura la variable de entorno API_KEY en Netlify.");
  return null;
};

export const analyzeSkinImage = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = getAIClient();

  if (!ai) {
    console.error("❌ Error: API Key no encontrada al intentar analizar imagen.");
    throw new Error("No se detectó la API Key. Configura API_KEY en las variables de entorno.");
  }

  const prompt = `Analiza esta imagen facial dermatológicamente. Identifica el tipo de piel, ingredientes que se deben evitar y condiciones visibles. 
  Responde estrictamente en formato JSON con la siguiente estructura:
  {
    "skinType": "string (ej. Grasa, Seca)",
    "avoidIngredients": ["string", "string"],
    "conditions": ["string", "string"],
    "recommendations": "string (consejo breve)"
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skinType: { type: Type.STRING },
            avoidIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            conditions: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("La IA devolvió una respuesta vacía.");
    
    return JSON.parse(text) as AnalysisResult;

  } catch (error: any) {
    console.error("❌ Falló el análisis:", error);
    throw new Error(error.message || "Error de conexión con el servicio de IA");
  }
};

export const analyzeIngredients = async (base64Image: string, userSkinType: string): Promise<IngredientAnalysis> => {
  const ai = getAIClient();

  if (!ai) {
     throw new Error("API Key no encontrada. Configura API_KEY en Netlify.");
  }

  const prompt = `
### ROL y OBJETIVO

Eres un **Asistente Experto en Cosmetología y Dermatología** de alto nivel. Tu función principal es un análisis **multimodal y riguroso**. Debes ejecutar **OCR** para extraer los ingredientes de la imagen proporcionada por el usuario y, posteriormente, analizar esa lista basándote estrictamente en esta base de conocimiento para determinar la seguridad y la idoneidad del producto para el tipo de piel declarado por el usuario.

**CONTEXTO DEL USUARIO:**
Tipo de Piel: "${userSkinType || 'Desconocido'}"

---

### BASE DE CONOCIMIENTO (Reglas de Análisis y Datos)

Utiliza la siguiente lógica de clasificación y la lista de referencia de ingredientes:

#### 1. Nivel Comedogénico (Riesgo de obstrucción de poros):
| Nivel | Clasificación | Acción sobre Piel Grasa/Acnéica |
| :---: | :---: | :--- |
| **0-1** | Muy Bajo | Generalmente seguro para todos los tipos de piel. |
| **2** | Bajo a Moderado | Usar con precaución. Puede ser oclusivo en altas concentraciones. |
| **3-5** | Alto Riesgo | **NO RECOMENDADO** (Obstruye poros, alto potencial acnéico). |

**⚠️ INGREDIENTES A EVITAR (Comedogénicos Típicos Nivel 3-5):**
* **Aceites/Lípidos:** Coconut Oil (Aceite de Coco), Cocoa Butter, Wheat Germ Oil (Aceite de Gérmen de Trigo), Lanolin, Oleic Acid, Isopropyl Isostearate.
* **Químicos/Ésteres:** Isopropyl Myristate, Isopropyl Palmitate, Myristyl Myristate, Stearyl Heptanoate.
* **Otros:** Carrageenan, Cualquier 'Algae Extract' (Extracto de Algas).

#### 2. Compatibilidad por Tipo de Piel:

| Tipo de Piel | Ingredientes Clave Recomendados | Ingredientes Clave a Evitar (Riesgos) |
| :---: | :---: | :---: |
| **Grasa/Acnéica** | Salicylic Acid, Niacinamida, Arcillas (Clay), Retinoides, Zinc. | Aceites minerales, Siliconas pesadas (ej. Dimethicone), Ingredientes Comedogénicos > 2. |
| **Seca** | Hyaluronic Acid, Glicerina, Ceramidas, Escualeno (Squalane), Shea Butter (Manteca de Karité). | Alcohol Denat (alcohol secante), Sulfatos (SLS/SLES), Fragancias fuertes. |
| **Sensible** | Centella Asiática (Cica), Aloe Vera, Alantoína, Pantenol (B5), Bisabolol. | Alcohol, Fragancias/Parfum/Perfume, Aceites Esenciales fuertes, Colores Artificiales (CI - Color Index). |
| **Mixta** | Niacinamida, Ácido Hialurónico (para zonas secas), Ingredientes ligeros y no comedogénicos. | Ingredientes muy oclusivos, alcoholes secantes. |

---

### FORMATO DE SALIDA REQUERIDO

**Toda la respuesta debe ser SOLO en formato JSON.**
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analisis_general: { type: Type.STRING },
            tipo_piel_usuario: { type: Type.STRING },
            es_recomendable_para_usuario: { type: Type.BOOLEAN },
            nivel_comedogenico_total: { type: Type.STRING, enum: ["Bajo", "Medio", "Alto"] },
            lista_ingredientes_detectados_ocr: { type: Type.ARRAY, items: { type: Type.STRING } },
            sugerencia_final: { type: Type.STRING },
            problemas_encontrados: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                    ingrediente: { type: Type.STRING },
                    riesgo: { type: Type.STRING },
                    explicacion: { type: Type.STRING }
                }
              }
            },
            ingredientes_beneficiosos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                    ingrediente: { type: Type.STRING },
                    beneficio: { type: Type.STRING },
                    explicacion: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}') as IngredientAnalysis;
  } catch (error: any) {
    console.error("Error analizando ingredientes:", error);
    throw new Error("No pudimos leer los ingredientes. Asegúrate de que la foto sea clara y contenga texto.");
  }
};

export const analyzeRoutine = async (base64Image: string): Promise<RoutineBuilderResult> => {
  const ai = getAIClient();
  if (!ai) throw new Error("API Key no encontrada. Configura API_KEY en Netlify.");

  const prompt = `
### ROL y OBJETIVO

Eres un **Químico Formulador y Dermatólogo Experto en Entrega de Activos por IA**. Tu misión es analizar una imagen de múltiples productos de cuidado de la piel y proporcionar un plan de rutina optimizado. Debes identificar el orden de aplicación (layering) y alertar sobre cualquier combinación química peligrosa o ineficaz. Tu análisis debe ser profundo, considerando no solo los activos, sino también los vehículos de entrega (excipientes).

---

### BASE DE CONOCIMIENTO (Reglas de Análisis Químico y Farmacología Cutánea)

Utiliza la siguiente lógica de clasificación y la lista de referencia de ingredientes para predecir el comportamiento de las formulaciones:

#### 1. PROPIEDADES DE LOS EXCIPIENTES (VEHÍCULOS DE ENTREGA):
* **Oclusivos Clave:** Petrolatum, Mineral Oil, Dimethicone (altas conc.), Paraffin, Lanolin, Waxes (Cera Alba, Carnauba Wax).
    * **Función:** Forman una barrera física, reduciendo la Trans-Epidermal Water Loss (TEWL).
    * **Implicación:** Bloquean la absorción de ingredientes aplicados *después* o los retienen excesivamente.
* **Humectantes Clave:** Glycerin, Hyaluronic Acid, Urea, Sodium PCA, Propylene Glycol, Butylene Glycol.
    * **Función:** Atraen agua a la superficie de la piel.
    * **Implicación:** Potencian la hidratación, pueden mejorar la penetración en ambientes húmedos.
* **Solventes/Penetradores:** Alcohol Denat, Ethanol (altas conc.), Isopropyl Alcohol.
    * **Función:** Disuelven ingredientes, pueden aumentar la penetración (a riesgo de irritación).
    * **Implicación:** Potencian la absorción de activos, pero secan y desestabilizan la barrera.

#### 2. INTERACCIONES DE ACTIVOS (SINERGIA / ANTAGONISMO):

| Activo Clave | Interacción Potencial con | Efecto Predicho (Antagonismo/Sinergia) | Razón Química |
| :--- | :--- | :--- | :--- |
| **Retinoides** | **Ácidos Exfoliantes** (AHA, BHA) | **Antagonismo/Riesgo:** Irritación severa, sobre-exfoliación. | Ambos aumentan el *turnover* celular. |
| **Vitamina C Pura** | **Exfoliantes Químicos** (AHA, BHA) | **Antagonismo de Estabilidad/Riesgo:** Desestabilización de Vit. C por diferencia de pH; irritación. | La Vit. C es pH-dependiente. |
| **Niacinamida** | **Vitamina C Pura** (Ácido L-Ascórbico) | **Antagonismo Potencial:** En formulaciones con bajo pH, puede formar niacina, causando *flushing*. | Interacción de pH y formación de subproductos. |
| **Péptidos** | **AHA/BHA** | **Antagonismo:** Los ácidos pueden desnaturalizar o romper las estructuras de los péptidos. | Sensibilidad de los péptidos al pH ácido. |
| **Ácido Hialurónico** | **Humectantes** (Glycerin, Urea) | **Sinergia:** Potencia la hidratación profunda por efecto acumulativo. | Mecanismos de hidratación complementarios. |
| **Antioxidantes** | **Filtros Solares** (SPF) | **Sinergia:** Potencian la protección contra el estrés oxidativo. | Mecanismos de protección complementarios. |
| **Activos Ligeros** | **Oclusivos Pesados** APLICADOS ANTES | **Antagonismo de Absorción:** Bloqueo de penetración. | La capa oclusiva impide el paso. |

#### 3. REGLA DE ORDEN (LAYER ESTRATÉGICO):
* Aplica siempre de **Menor a Mayor Peso Molecular** (Líquido/Sérum -> Crema -> Oclusivo/SPF).

---

### TAREA Y FORMATO DE SALIDA REQUERIDO

1.  **OCR Profundo:** Extrae todos los ingredientes listados en cada producto de la imagen.
2.  **Identificación:** Clasifica cada ingrediente como activo, excipiente o ambos, identificando su función (humectante, oclusivo, solvente, etc.).
3.  **Predicción de Interacción:** Analiza cómo interactuarían estos ingredientes entre sí (Regla 2) y con los excipientes (Regla 1) si se usan en una rutina.
4.  **Optimización:** Sugiere un orden de aplicación y advierte sobre combinaciones problemáticas, explicando la razón química.
5.  **Toda la respuesta debe ser estrictamente en formato JSON.**
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productos_detectados: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nombre_estimado: { type: Type.STRING },
                  ingredientes_detectados: { type: Type.ARRAY, items: { type: Type.STRING } },
                  activos_principales: { type: Type.ARRAY, items: { type: Type.STRING } },
                  excipientes_clave_detectados: {
                    type: Type.OBJECT,
                    properties: {
                      oclusivos: { type: Type.ARRAY, items: { type: Type.STRING } },
                      humectantes: { type: Type.ARRAY, items: { type: Type.STRING } },
                      solventes: { type: Type.ARRAY, items: { type: Type.STRING } },
                      emulsionantes: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  }
                }
              }
            },
            analisis_interacciones_global: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tipo_interaccion: { type: Type.STRING },
                  productos_implicados: { type: Type.ARRAY, items: { type: Type.STRING } },
                  razon_quimica: { type: Type.STRING },
                  recomendacion: { type: Type.STRING }
                }
              }
            },
            rutina_optimizada_sugerida: {
              type: Type.OBJECT,
              properties: {
                pasos_manana: { type: Type.ARRAY, items: { type: Type.STRING } },
                pasos_noche: { type: Type.ARRAY, items: { type: Type.STRING } },
                orden_detallado: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      producto: { type: Type.STRING },
                      paso: { type: Type.STRING },
                      razon: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            advertencias_generales: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}') as RoutineBuilderResult;
  } catch (error: any) {
    console.error("Error analizando rutina:", error);
    throw new Error("No se pudo analizar la rutina. Asegúrate de que la foto muestre claramente los productos.");
  }
};

export const chatWithEmma = async (history: {role: string, parts: {text: string}[]}[], userMessage: string) => {
   const ai = getAIClient();
   if (!ai) return "Error de conexión con AI. Verifica tu API Key.";

   const systemInstruction = `Eres Emma, la mascota virtual de la app Emma Glow. 
   Tu personalidad es empática y experta en skincare.
   Ayuda al usuario con presupuestos y consejos.`;

   try {
     const chat = ai.chats.create({
       model: 'gemini-2.5-flash',
       config: { systemInstruction },
       history: history
     });

     const result = await chat.sendMessage({ message: userMessage });
     return result.text;
   } catch (error: any) {
     return `Error: ${error.message}`;
   }
};

export const generateProgressReport = async (entries: ProgressEntry[], productName: string): Promise<string> => {
    const ai = getAIClient();
    if (!ai) throw new Error("API Key missing");
  
    const dataPoints = entries.map(e => 
      `Fecha: ${e.date}, Score Piel: ${e.score}/100, Notas: ${e.notes}`
    ).join('\n');
  
    const prompt = `
      Actúa como una dermatóloga experta analizando el progreso de un paciente usando el producto "${productName}".
      Aquí están los registros semanales con fotos analizadas (Score 0-100, donde 100 es piel perfecta):
      ${dataPoints}
      
      Genera un reporte breve pero detallado en español que incluya:
      1. Análisis de tendencia (¿Está mejorando el score?).
      2. Pronóstico para el próximo mes si sigue así.
      3. Recomendación de ajuste si es necesario.
      Usa emojis y tono profesional pero alentador.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return response.text || "No se pudo generar el reporte.";
    } catch (e) {
      console.error(e);
      return "Error generando el pronóstico.";
    }
  };
