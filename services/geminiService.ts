import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, IngredientAnalysis, ProgressEntry, RoutineBuilderResult } from '../types';

// Variable global para almacenar la instancia una vez creada
let aiInstance: GoogleGenAI | null = null;

// Función Helper para obtener el cliente con Lazy Load
const getAIClient = () => {
  if (aiInstance) return aiInstance;

  // Netlify + Vite: variables expuestas por import.meta.env
  const key = import.meta.env.VITE_API_KEY || '';

  if (key) {
    aiInstance = new GoogleGenAI({ apiKey: key });
    return aiInstance;
  }

  console.error("⚠️ API Key no configurada. Configura VITE_API_KEY en Netlify.");
  return null;
};

// Helper para limpiar respuestas de la IA que incluyen markdown o texto extra
const cleanJsonResponse = (text: string): string => {
  if (!text) return "{}";

  let clean = text.replace(/```json/g, '').replace(/```/g, '');

  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }

  return clean.trim();
};

export const analyzeSkinImage = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = getAIClient();

  if (!ai) {
    throw new Error("No se detectó la API Key. Configura VITE_API_KEY en Netlify.");
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

    const rawData = JSON.parse(cleanJsonResponse(text));

    const safeResult: AnalysisResult = {
      date: new Date().toLocaleDateString(),
      skinType: rawData.skinType || "Desconocido",
      avoidIngredients: Array.isArray(rawData.avoidIngredients) ? rawData.avoidIngredients : [],
      conditions: Array.isArray(rawData.conditions) ? rawData.conditions : [],
      recommendations: rawData.recommendations || "Sin recomendaciones específicas."
    };

    return safeResult;

  } catch (error: any) {
    console.error("Falló el análisis:", error);
    throw new Error(error.message || "Error de conexión con la IA");
  }
};

export const analyzeIngredients = async (base64Image: string, userSkinType: string): Promise<IngredientAnalysis> => {
  const ai = getAIClient();
  if (!ai) throw new Error("Configura VITE_API_KEY en Netlify.");

  const prompt = `
### ROL y OBJETIVO
Eres un Asistente Experto en Cosmetología y Dermatología. Analiza los ingredientes mediante OCR.

### JSON requerido:
{
  "analisis_general": "string",
  "tipo_piel_usuario": "string",
  "es_recomendable_para_usuario": boolean,
  "nivel_comedogenico_total": "Bajo" | "Medio" | "Alto",
  "lista_ingredientes_detectados_ocr": ["string"],
  "problemas_encontrados": [{"ingrediente": "string", "riesgo": "string", "explicacion": "string"}],
  "ingredientes_beneficiosos": [{"ingrediente": "string", "beneficio": "string", "explicacion": "string"}],
  "sugerencia_final": "string"
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
      config: { responseMimeType: 'application/json' }
    });

    const rawData = JSON.parse(cleanJsonResponse(response.text || '{}'));

    return {
      analisis_general: rawData.analisis_general || "No se pudo generar un análisis detallado.",
      tipo_piel_usuario: rawData.tipo_piel_usuario || userSkinType,
      es_recomendable_para_usuario: !!rawData.es_recomendable_para_usuario,
      nivel_comedogenico_total: rawData.nivel_comedogenico_total || "Bajo",
      lista_ingredientes_detectados_ocr: Array.isArray(rawData.lista_ingredientes_detectados_ocr) ? rawData.lista_ingredientes_detectados_ocr : [],
      problemas_encontrados: Array.isArray(rawData.problemas_encontrados) ? rawData.problemas_encontrados : [],
      ingredientes_beneficiosos: Array.isArray(rawData.ingredientes_beneficiosos) ? rawData.ingredientes_beneficiosos : [],
      sugerencia_final: rawData.sugerencia_final || ""
    };

  } catch (error: any) {
    console.error("Error analizando ingredientes:", error);
    throw new Error("No pudimos leer los ingredientes. La imagen no está clara.");
  }
};

export const analyzeRoutine = async (base64Image: string): Promise<RoutineBuilderResult> => {
  const ai = getAIClient();
  if (!ai) throw new Error("Configura VITE_API_KEY en Netlify.");

  const prompt = `
### OBJETIVO
Analiza productos de skincare, detecta ingredientes, interacciones y genera una rutina optimizada.

### OUTPUT JSON:
{
  "productos_detectados": [],
  "analisis_interacciones_global": [],
  "rutina_optimizada_sugerida": {
    "pasos_manana": [],
    "pasos_noche": [],
    "orden_detallado": []
  },
  "advertencias_generales": "string"
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
      config: { responseMimeType: 'application/json' }
    });

    const rawData = JSON.parse(cleanJsonResponse(response.text || '{}'));

    return {
      productos_detectados: Array.isArray(rawData.productos_detectados) ? rawData.productos_detectados : [],
      analisis_interacciones_global: Array.isArray(rawData.analisis_interacciones_global) ? rawData.analisis_interacciones_global : [],
      rutina_optimizada_sugerida: {
        pasos_manana: Array.isArray(rawData.rutina_optimizada_sugerida?.pasos_manana) ? rawData.rutina_optimizada_sugerida.pasos_manana : [],
        pasos_noche: Array.isArray(rawData.rutina_optimizada_sugerida?.pasos_noche) ? rawData.rutina_optimizada_sugerida.pasos_noche : [],
        orden_detallado: Array.isArray(rawData.rutina_optimizada_sugerida?.orden_detallado) ? rawData.rutina_optimizada_sugerida.orden_detallado : []
      },
      advertencias_generales: rawData.advertencias_generales || "Sin advertencias."
    };

  } catch (error: any) {
    console.error("Error analizando rutina:", error);
    throw new Error("No se pudo analizar la rutina.");
  }
};

export const chatWithEmma = async (history: { role: string, parts: { text: string }[] }[], userMessage: string) => {
  const ai = getAIClient();
  if (!ai) return "Error: API Key no configurada.";

  const systemInstruction = `Eres Emma, la mascota virtual experta en skincare.`;

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction },
      history
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
Actúa como dermatóloga experta analizando el progreso con el producto "${productName}".
Registros:
${dataPoints}
Genera un reporte breve en español.
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
