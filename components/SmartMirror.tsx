




import React, { useEffect, useRef, useState, useMemo } from 'react';
import { FilesetResolver, FaceLandmarker, HandLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { SKINCARE_ROUTINES, DIAGNOSTICS_DB } from '../constants';
import { SkincareRoutine, RoutineStep, EngineOutput, DiagnosticDefinition } from '../types';
import { Play, Pause, ChevronRight, Lock, Activity, ShieldCheck, RefreshCw, Sparkles, Clock, Volume2, AlertOctagon, Zap } from 'lucide-react';

const SmartMirror: React.FC = () => {
  const [selectedRoutine, setSelectedRoutine] = useState<SkincareRoutine | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [cameraActive, setCameraActive] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  
  // Engine State
  const [engineOutput, setEngineOutput] = useState<EngineOutput | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [stepTimer, setStepTimer] = useState(0);

  // Diagnosis State
  const [activeDiagnosis, setActiveDiagnosis] = useState<DiagnosticDefinition | null>(null);
  const [diagnosisTimer, setDiagnosisTimer] = useState(0);
  const diagnosisTriggeredRef = useRef<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const requestRef = useRef<number | null>(null);

  // Kinetic Analysis State
  const previousHandPosRef = useRef<{x: number, y: number} | null>(null);
  const lastAnalysisTimeRef = useRef<number>(0);
  const qualityScoresRef = useRef<number[]>([]); // Buffer for smoothing

  // --- INITIALIZATION ---
  useEffect(() => {
    const loadModels = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading AI models:", error);
      }
    };
    loadModels();
  }, []);

  // --- AUTOMATIC TIMER ---
  useEffect(() => {
    let interval: any;
    
    // Diagnosis Timer Priority
    if (activeDiagnosis && diagnosisTimer > 0) {
        interval = setInterval(() => {
            setDiagnosisTimer(prev => {
                if (prev <= 1) {
                    // End Diagnosis
                    setActiveDiagnosis(null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }

    // Routine Timer
    if (selectedRoutine && activeStepIndex >= 0 && !isPaused && stepTimer > 0 && !activeDiagnosis) {
        interval = setInterval(() => {
            setStepTimer(prev => {
                if (prev <= 1) {
                    // Auto-advance
                    if (activeStepIndex < selectedRoutine.pasos.length - 1) {
                        nextStep();
                        // Time is set in nextStep but we need to return something here
                        return 0; 
                    } else {
                        finishRoutine();
                        return 0;
                    }
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [selectedRoutine, activeStepIndex, isPaused, stepTimer, activeDiagnosis, diagnosisTimer]);

  // --- KINETIC ENGINE CORE ---
  const runKineticAnalysis = (handLandmarks: any[][], step: RoutineStep): { score: number, vector: [number, number, number], error?: string } => {
     if (handLandmarks.length === 0) return { score: 0, vector: [0,0,0] };

     const indexTip = handLandmarks[0][8]; // Index finger tip
     const now = performance.now();
     
     // 1. Calculate Delta Vector (Movement)
     if (!previousHandPosRef.current || (now - lastAnalysisTimeRef.current) > 500) {
         previousHandPosRef.current = { x: indexTip.x, y: indexTip.y };
         lastAnalysisTimeRef.current = now;
         return { score: 0, vector: [0,0,0] }; // Waiting for next frame to diff
     }

     const rawDx = indexTip.x - previousHandPosRef.current.x;
     const rawDy = indexTip.y - previousHandPosRef.current.y;
     
     // IMPORTANT: MediaPipe Y is inverted (0 is top). 
     // We convert to Cartesian where Y+ is UP for comparison with "Ideal Vectors" from DB
     const dx = rawDx; 
     const dy = -rawDy; // Invert Y delta so UP is POSITIVE

     // Update prev for next frame
     previousHandPosRef.current = { x: indexTip.x, y: indexTip.y };
     lastAnalysisTimeRef.current = now;

     // 2. Magnitude Check (Is user moving?)
     const magnitude = Math.sqrt(dx*dx + dy*dy);
     if (magnitude < 0.005) return { score: 0, vector: [0,0,0] }; // Too slow / still

     // 3. Normalize User Vector
     const uX = dx / magnitude;
     const uY = dy / magnitude;

     // 4. Dot Product with Ideal Vector
     const ideal = step.metricas_calidad.vector_direccion_ideal;
     const dotProduct = (uX * ideal[0]) + (uY * ideal[1]); 

     // 5. Check Critical Errors (e.g., Pulling down)
     if (step.metricas_calidad.umbral_error_critico_y !== undefined) {
         // Check if user Y component is below the critical threshold
         if (uY < step.metricas_calidad.umbral_error_critico_y) {
             return { score: 0, vector: [uX, uY, 0], error: "CRITICAL_DOWN" };
         }
     }

     // 6. Calculate Score (0-100) based on alignment and tolerance
     // Dot product 1.0 = 100%, < Tolerance = 0%
     const tolerance = step.metricas_calidad.tolerancia_vector_max_desviacion;
     let score = 0;
     
     if (dotProduct >= tolerance) {
         // Map [tolerance, 1.0] to [0, 100]
         score = ((dotProduct - tolerance) / (1.0 - tolerance)) * 100;
     }

     return { score, vector: [uX, uY, 0] };
  };

  const predictWebcam = () => {
    if (!videoRef.current || !canvasRef.current || !faceLandmarkerRef.current || !handLandmarkerRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    let startTimeMs = performance.now();
    if (lastVideoTimeRef.current !== video.currentTime) {
      lastVideoTimeRef.current = video.currentTime;
      
      const faceResults = faceLandmarkerRef.current.detectForVideo(video, startTimeMs);
      const handResults = handLandmarkerRef.current.detectForVideo(video, startTimeMs);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const drawingUtils = new DrawingUtils(ctx);

      // --- KINETIC LOGIC EXECUTION ---
      if (selectedRoutine && activeStepIndex >= 0 && !isPaused) {
          const currentStep = selectedRoutine.pasos[activeStepIndex];
          
          // --- SIMULATED DIAGNOSIS TRIGGER ---
          // "Bio-Coach" Simulation Logic: Trigger redness alert at Step 2 around 45s mark for demo
          if (!diagnosisTriggeredRef.current && activeStepIndex === 1 && stepTimer < 45 && stepTimer > 40) {
              diagnosisTriggeredRef.current = true;
              // Trigger 'ROJEZ' diagnosis
              const diag = DIAGNOSTICS_DB.find(d => d.diagnostico_id === 'ROJEZ');
              if (diag) {
                  setActiveDiagnosis(diag);
                  setDiagnosisTimer(diag.tiempo_focus_seg);
              }
          }

          // 1. Analyze Movement (Only if not in Diagnosis Mode or if Diagnosis requires specific movement)
          let analysis: { score: number, vector: [number, number, number], error?: string } = { score: 0, vector: [0,0,0] };
          
          if (!activeDiagnosis) {
             analysis = runKineticAnalysis(handResults.landmarks, currentStep);
          } else {
             // Logic for Diagnosis Focus (Checking stillness/pressure)
             // For 'ROJEZ', vector_obligatorio_foco is {x:0, y:0, z:0.5} which implies stillness
             // We can reuse kinetic analysis but checking for LOW magnitude instead
             // For this demo, we assume perfect score if active diagnosis to guide user visually
             analysis = { score: 100, vector: [0,0,0] }; 
          }
          
          // 2. Buffer Score (Smoothing)
          if (analysis.score > 0 || analysis.error) {
              qualityScoresRef.current.push(analysis.score);
              if (qualityScoresRef.current.length > 20) qualityScoresRef.current.shift();
          }
          
          // 3. Calculate Average Quality
          const avgScore = qualityScoresRef.current.length > 0 
            ? qualityScoresRef.current.reduce((a,b) => a+b, 0) / qualityScoresRef.current.length 
            : 0;

          // 4. Feedback Logic
          let feedbackStatus: 'correct' | 'warning' | 'error' = 'correct';
          let feedbackText = "";
          
          if (analysis.error === 'CRITICAL_DOWN') {
              feedbackStatus = 'error';
              feedbackText = "¡ALTO! No arrastres hacia abajo.";
          } else if (avgScore < 50 && avgScore > 0) {
              feedbackStatus = 'warning';
              feedbackText = "Corrige la dirección del vector.";
          } else if (avgScore > 80) {
              feedbackStatus = 'correct';
              feedbackText = "¡Excelente técnica!";
          }

          const newEngineOutput: EngineOutput = {
              timestamp_ms: Date.now(),
              estado_motor: activeDiagnosis ? 'DIAGNOSTICO' : 'ACTIVO',
              metricas_generales: {
                  rutina_actual_id: selectedRoutine.rutina_id,
                  progreso_porcentaje_total: ((activeStepIndex) / selectedRoutine.pasos.length) * 100,
                  tiempo_total_rutina_restante_seg: 0 
              },
              paso_actual: {
                  orden: currentStep.orden,
                  nombre: currentStep.nombre,
                  tiempo_transcurrido_paso_seg: currentStep.duracion_seg - stepTimer,
                  tiempo_restante_paso_seg: stepTimer,
                  porcentaje_calidad_tecnica: Math.floor(avgScore),
                  feedback_mecanico: {
                      status: feedbackStatus,
                      comando_voz_accion: feedbackText,
                      correccion_ar_vector: analysis.vector
                  },
                  diagnostico_activo: activeDiagnosis ? {
                      alerta_activa: true,
                      tipo: activeDiagnosis.nombre,
                      zona_afectada_landmarks: [1], // Nose/Center for general alert
                      comando_voz_diagnostico: activeDiagnosis.comando_voz_alerta,
                      producto_sugerido: activeDiagnosis.producto_aplicar,
                      tiempo_restante_diagnostico: diagnosisTimer
                  } : null
              }
          };
          setEngineOutput(newEngineOutput);

          // --- AR RENDERING ---
          if (faceResults.faceLandmarks.length > 0) {
              const face = faceResults.faceLandmarks[0];
              
              if (activeDiagnosis) {
                  // Draw Alert Overlay for Diagnosis
                  const nose = face[1];
                  ctx.beginPath();
                  ctx.arc(nose.x * canvas.width, nose.y * canvas.height, 60, 0, 2 * Math.PI);
                  ctx.fillStyle = "rgba(220, 38, 38, 0.2)"; // Red tint
                  ctx.fill();
                  ctx.strokeStyle = "#ef4444";
                  ctx.lineWidth = 2;
                  ctx.setLineDash([5, 5]);
                  ctx.stroke();
                  ctx.setLineDash([]);
                  
                  // Pulse Effect
                  const scale = 1 + Math.sin(Date.now() / 200) * 0.1;
                  ctx.beginPath();
                  ctx.arc(nose.x * canvas.width, nose.y * canvas.height, 60 * scale, 0, 2 * Math.PI);
                  ctx.strokeStyle = "rgba(220, 38, 38, 0.5)";
                  ctx.lineWidth = 1;
                  ctx.stroke();

              } else {
                  // Standard Routine AR
                  // Draw Guide Line (Ideal Vector)
                  drawARVector(ctx, face[currentStep.startLandmarkIndex], face[currentStep.endLandmarkIndex], 'IDEAL');
                  
                  // Draw User Vector (Feedback)
                  if (handResults.landmarks.length > 0 && analysis.vector[0] !== 0) {
                      const hand = handResults.landmarks[0][8];
                      drawARVectorSimple(ctx, hand, analysis.vector, feedbackStatus);
                  }
              }
          }

      } else {
         // Idle mode
         if (faceResults.faceLandmarks.length > 0) {
             drawingUtils.drawConnectors(faceResults.faceLandmarks[0], FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: '#ffffff20', lineWidth: 0.5 });
         }
      }

      // Hands always visible
      if (handResults.landmarks) {
        for (const landmarks of handResults.landmarks) {
          drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: '#DB2777', lineWidth: 2 });
        }
      }
    }

    if (cameraActive) {
        requestRef.current = requestAnimationFrame(predictWebcam);
    }
  };

  const drawARVector = (ctx: CanvasRenderingContext2D, start: any, end: any, type: 'IDEAL') => {
      if (!start || !end) return;
      const x1 = start.x * ctx.canvas.width;
      const y1 = start.y * ctx.canvas.height;
      const x2 = end.x * ctx.canvas.width;
      const y2 = end.y * ctx.canvas.height;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = '#4ade80'; // Green
      ctx.lineWidth = 4;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Arrowhead
      const angle = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 10 * Math.cos(angle - Math.PI / 6), y2 - 10 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x2 - 10 * Math.cos(angle + Math.PI / 6), y2 - 10 * Math.sin(angle + Math.PI / 6));
      ctx.fillStyle = '#4ade80';
      ctx.fill();
  };

  const drawARVectorSimple = (ctx: CanvasRenderingContext2D, origin: any, vector: [number, number, number], status: string) => {
      const x1 = origin.x * ctx.canvas.width;
      const y1 = origin.y * ctx.canvas.height;
      
      // Scale vector for visibility (50px length)
      // Remember Y is inverted in vector (Up is +), so we invert back for canvas (Up is -)
      const x2 = x1 + (vector[0] * 80);
      const y2 = y1 + (-vector[1] * 80); 

      const color = status === 'correct' ? '#4ade80' : status === 'error' ? '#ef4444' : '#facc15';

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.stroke();
  };

  // --- ACTIONS ---

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => {
             requestRef.current = requestAnimationFrame(predictWebcam);
        });
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const handleStartRoutine = (routine: SkincareRoutine) => {
    if (routine.isPremium) return;
    setSelectedRoutine(routine);
    setActiveStepIndex(0);
    setStepTimer(routine.pasos[0].duracion_seg);
    qualityScoresRef.current = [];
    diagnosisTriggeredRef.current = false; // Reset trigger
    setActiveDiagnosis(null);
    startCamera();
  };

  const nextStep = () => {
      if (!selectedRoutine) return;
      if (activeStepIndex < selectedRoutine.pasos.length - 1) {
          const nextIdx = activeStepIndex + 1;
          setActiveStepIndex(nextIdx);
          setStepTimer(selectedRoutine.pasos[nextIdx].duracion_seg);
          qualityScoresRef.current = []; // Reset buffer
      } else {
          finishRoutine();
      }
  };

  const finishRoutine = () => {
      setCameraActive(false);
      setSelectedRoutine(null);
      setActiveStepIndex(-1);
      setEngineOutput(null);
      setActiveDiagnosis(null);
      alert("¡Rutina finalizada! Piel radiante conseguida.");
  };

  // --- RENDER ---
  return (
    <div className="pb-24 md:pb-0 min-h-screen">
      {!selectedRoutine ? (
        // SELECTION SCREEN
        <div className="max-w-4xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
            <div className="text-center">
                <h2 className="font-serif text-4xl text-pink-900 mb-2">Emma Kinetic-AR</h2>
                <p className="text-gray-600">Bio-Coach facial manos libres con diagnóstico en tiempo real.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SKINCARE_ROUTINES.map(routine => (
                    <div key={routine.rutina_id} className={`glass-card p-6 rounded-3xl border border-white/60 relative overflow-hidden group ${routine.isPremium ? 'opacity-90' : 'cursor-pointer hover:shadow-pink-200/50'}`}
                         onClick={() => handleStartRoutine(routine)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${
                                routine.categoria === 'DRAINAGE' ? 'bg-blue-100 text-blue-600' : 
                                routine.categoria === 'LIFTING' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                            }`}>
                                {routine.categoria === 'DRAINAGE' && <Activity size={24} />}
                                {routine.categoria === 'LIFTING' && <Sparkles size={24} />}
                                {routine.categoria === 'REHAB' && <ShieldCheck size={24} />}
                            </div>
                            <span className="text-xs font-bold bg-white px-2 py-1 rounded-full text-gray-500 border border-gray-100">
                                {routine.dificultad}
                            </span>
                        </div>
                        <h3 className="font-bold text-xl text-gray-800 mb-2">{routine.nombre}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{routine.descripcion}</p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/50">
                            <span className="text-xs text-pink-600 font-medium">{Math.floor(routine.total_duracion_seg / 60)} min • {routine.pasos.length} Pasos</span>
                            <button className="bg-black text-white p-2 rounded-full hover:bg-pink-600 transition-colors">
                                <Play size={16} fill="white" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {!modelsLoaded && <div className="text-center p-4 text-gray-400">Iniciando motor de visión...</div>}
        </div>
      ) : (
        // AR INTERFACE
        <div className="max-w-5xl mx-auto relative h-[85vh] bg-black rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/20">
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full transform -scale-x-100" />

            {/* ENGINE HUD */}
            <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 pointer-events-none">
                
                {/* Top Bar: Progress & Quality */}
                <div className="flex justify-between items-start">
                    <div className="glass-panel p-4 rounded-2xl pointer-events-auto min-w-[200px]">
                        <h3 className="font-bold text-pink-900 text-sm mb-1">{selectedRoutine.nombre}</h3>
                        <div className="flex items-center gap-3">
                             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                             <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                                 <div className="bg-pink-500 h-full transition-all duration-1000" style={{width: `${engineOutput?.metricas_generales.progreso_porcentaje_total || 0}%`}}></div>
                             </div>
                        </div>
                    </div>
                    
                    {/* Quality Gauge (Hidden if in Diagnosis) */}
                    {!activeDiagnosis && (
                        <div className="glass-panel p-3 rounded-2xl flex items-center gap-4">
                            <div className="text-right">
                                <span className="text-[10px] uppercase text-gray-500 font-bold block">Calidad Técnica</span>
                                <span className={`font-mono font-bold text-2xl ${
                                    (engineOutput?.paso_actual?.porcentaje_calidad_tecnica || 0) > 80 ? 'text-green-600' : 
                                    (engineOutput?.paso_actual?.porcentaje_calidad_tecnica || 0) < 50 ? 'text-red-500' : 'text-yellow-600'
                                }`}>
                                    {engineOutput?.paso_actual?.porcentaje_calidad_tecnica || 0}%
                                </span>
                            </div>
                            <div className="relative w-12 h-12">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="4" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#db2777" strokeWidth="4" strokeDasharray={`${engineOutput?.paso_actual?.porcentaje_calidad_tecnica || 0}, 100`} />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                {/* Center: Dynamic Alerts & Voice Commands */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full px-4">
                    {activeDiagnosis && engineOutput?.paso_actual?.diagnostico_activo ? (
                        <div className="inline-block bg-red-600/90 backdrop-blur-md text-white px-8 py-6 rounded-[30px] shadow-2xl animate-pulse max-w-lg border border-red-400">
                            <div className="flex items-center gap-3 justify-center mb-4">
                                <AlertOctagon size={32} />
                                <span className="uppercase tracking-widest font-bold">Diagnóstico Activo</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{engineOutput.paso_actual.diagnostico_activo.tipo}</h3>
                            <p className="text-lg leading-relaxed mb-4">{engineOutput.paso_actual.diagnostico_activo.comando_voz_diagnostico}</p>
                            
                            <div className="bg-white/20 p-3 rounded-xl flex items-center justify-center gap-3">
                                <Zap size={20}/>
                                <span className="font-bold">Aplicar: {engineOutput.paso_actual.diagnostico_activo.producto_sugerido}</span>
                            </div>
                        </div>
                    ) : (
                        engineOutput?.paso_actual?.feedback_mecanico.status !== 'correct' && (
                            <div className="inline-block bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold shadow-lg">
                                {engineOutput?.paso_actual?.feedback_mecanico.comando_voz_accion}
                            </div>
                        )
                    )}
                </div>

                {/* Bottom: Step Controller */}
                <div className="glass-panel p-6 rounded-3xl pointer-events-auto flex items-center gap-6">
                    {/* Timer Circle */}
                    <div className="relative flex items-center justify-center shrink-0">
                         <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${activeDiagnosis ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                             <span className={`font-mono font-bold text-xl ${activeDiagnosis ? 'text-red-600' : 'text-gray-700'}`}>
                                 {activeDiagnosis ? engineOutput?.paso_actual?.diagnostico_activo?.tiempo_restante_diagnostico : stepTimer}s
                             </span>
                         </div>
                         <Clock className={`absolute -top-1 -right-1 bg-white rounded-full p-0.5 ${activeDiagnosis ? 'text-red-500' : 'text-pink-500'}`} size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                        {activeDiagnosis ? (
                             <>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-md uppercase animate-pulse">
                                        PAUSA POR DIAGNÓSTICO
                                    </span>
                                </div>
                                <h2 className="text-xl font-serif font-bold text-gray-900 truncate">
                                    Tratamiento Focalizado
                                </h2>
                             </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md uppercase">
                                        Paso {activeStepIndex + 1}/{selectedRoutine.pasos.length}
                                    </span>
                                    {isPaused && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md font-bold">PAUSADO</span>}
                                </div>
                                <h2 className="text-xl font-serif font-bold text-gray-900 truncate">
                                    {selectedRoutine.pasos[activeStepIndex].nombre}
                                </h2>
                                <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                    <Volume2 size={14} />
                                    <p className="italic truncate">"{selectedRoutine.pasos[activeStepIndex].comando_voz_inicio}"</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {!activeDiagnosis && (
                            <>
                                <button onClick={() => setIsPaused(!isPaused)} className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                                    {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                                </button>
                                <button onClick={nextStep} className="p-4 rounded-full bg-black text-white hover:bg-gray-800 transition-colors">
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
      )}
    </div>
  );
};

export default SmartMirror;
