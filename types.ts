
export interface Product {
  id: string;
  nombre: string;
  marca: string;
  tipo: string;
  precio: number;
  ingredientes: string;
  puntos_venta: string;
  origen: 'internacional' | 'local';
  imageUrl: string;
}

export interface AnalysisResult {
  date: string;
  skinType: string;
  avoidIngredients: string[];
  conditions: string[];
  recommendations?: string;
}

export interface ProgressEntry {
  id: string;
  date: string;
  photoUrl: string;
  notes: string;
  analysis: AnalysisResult;
  score: number; // 0-100 calculated skin health score
}

export interface ProductTracker {
  id: string;
  product: Product;
  startDate: string;
  status: 'active' | 'completed';
  entries: ProgressEntry[];
  lastUpdate?: string;
}

export interface User {
  username: string;
  isLoggedIn: boolean;
  history: AnalysisResult[];
  routineHistory: RoutineSession[];
  trackers: ProductTracker[];
}

export interface IngredientProblem {
  ingrediente: string;
  riesgo: string;
  explicacion: string;
}

export interface IngredientBenefit {
  ingrediente: string;
  beneficio: string;
  explicacion: string;
}

export interface IngredientAnalysis {
  analisis_general: string;
  tipo_piel_usuario: string;
  es_recomendable_para_usuario: boolean;
  nivel_comedogenico_total: 'Bajo' | 'Medio' | 'Alto';
  lista_ingredientes_detectados_ocr: string[];
  problemas_encontrados: IngredientProblem[];
  ingredientes_beneficiosos: IngredientBenefit[];
  sugerencia_final: string;
}

// --- ROUTINE BUILDER TYPES ---

export interface DetectedProduct {
  nombre_estimado: string;
  ingredientes_detectados: string[];
  activos_principales: string[];
  excipientes_clave_detectados: {
    oclusivos?: string[];
    humectantes?: string[];
    solventes?: string[];
    emulsionantes?: string[];
  };
}

export interface InteractionAnalysis {
  tipo_interaccion: string;
  productos_implicados: string[];
  razon_quimica: string;
  recomendacion: string;
}

export interface RoutineStepDetail {
  producto: string;
  paso: string;
  razon: string;
}

export interface RoutineBuilderResult {
  productos_detectados: DetectedProduct[];
  analisis_interacciones_global: InteractionAnalysis[];
  rutina_optimizada_sugerida: {
    pasos_manana: string[];
    pasos_noche: string[];
    orden_detallado: RoutineStepDetail[];
  };
  advertencias_generales: string;
}

export enum ViewState {
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  ANALYSIS = 'ANALYSIS',
  INGREDIENTS = 'INGREDIENTS',
  ROUTINE_BUILDER = 'ROUTINE_BUILDER',
  SMART_MIRROR = 'SMART_MIRROR',
  ADVISOR = 'ADVISOR',
  SHOP = 'SHOP',
  EDUCATION = 'EDUCATION',
  REACTION = 'REACTION',
  PRODUCT_HISTORY = 'PRODUCT_HISTORY'
}

export interface CartItem extends Product {
  quantity: number;
}

// --- KINETIC AR ENGINE TYPES (DB V3) ---

export interface QualityMetrics {
  vector_direccion_ideal: [number, number, number]; // [x, y, z] normalized. Y+ is Up.
  tolerancia_vector_max_desviacion: number; // 0.0 to 1.0 (Dot product or angle threshold)
  velocidad_max_cm_seg: number;
  presion_ideal_simulada: 'BAJA' | 'MEDIA' | 'ALTA' | 'MEDIA_ALTA';
  umbral_error_critico_y?: number; // Critical threshold for Y (e.g. -0.5 for pulling down)
}

export interface RoutineStep {
  orden: number;
  nombre: string;
  producto_asociado: string;
  duracion_seg: number;
  comando_voz_inicio: string;
  // Visual Guides (Mapped from DB Anatomy)
  startLandmarkIndex: number; 
  endLandmarkIndex: number;
  // Kinetic Engine Data
  metricas_calidad: QualityMetrics;
}

export interface DiagnosticDefinition {
  diagnostico_id: string;
  nombre: string;
  etiqueta_cv: string;
  prioridad: number;
  producto_aplicar: string;
  tiempo_focus_seg: number;
  comando_voz_alerta: string;
  vector_obligatorio_foco: { x: number, y: number, z: number };
}

export interface SkincareRoutine {
  rutina_id: string;
  nombre: string;
  descripcion: string;
  categoria: 'DRAINAGE' | 'LIFTING' | 'PRODUCT_APP' | 'REHAB';
  dificultad: 'Beginner' | 'Pro';
  isPremium: boolean;
  total_duracion_seg: number;
  pasos: RoutineStep[];
  recommendedProducts?: string[];
}

export interface EngineOutput {
  timestamp_ms: number;
  estado_motor: 'ACTIVO' | 'PAUSA' | 'COMPLETADO' | 'DIAGNOSTICO';
  metricas_generales: {
    rutina_actual_id: string;
    progreso_porcentaje_total: number;
    tiempo_total_rutina_restante_seg: number;
  };
  paso_actual: {
    orden: number;
    nombre: string;
    tiempo_transcurrido_paso_seg: number;
    tiempo_restante_paso_seg: number;
    porcentaje_calidad_tecnica: number;
    feedback_mecanico: {
      status: 'correct' | 'warning' | 'error';
      razon_fallo?: string;
      comando_voz_accion?: string;
      correccion_ar_vector?: [number, number, number];
    };
    diagnostico_activo?: {
      alerta_activa: boolean;
      tipo: string;
      zona_afectada_landmarks: number[];
      comando_voz_diagnostico: string;
      producto_sugerido: string;
      tiempo_restante_diagnostico?: number;
    } | null;
  } | null;
}

export interface RoutineSession {
  date: string;
  routineId: string;
  score: number; // 0-100
  completedSteps: number;
}
