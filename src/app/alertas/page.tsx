"use client";

import { useState } from "react";
import { Brain, Loader2, Activity } from "lucide-react";
import { obtenerDiagnosticoIA } from "@/services/api";
import { DiagnosticoIA } from "@/types";
import { TarjetaSeveridad, DetalleDiagnostico } from "@/componentes/alertas";

export default function AlertasIA() {
  const [cargando, setCargando] = useState(false);
  const [diagnostico, setDiagnostico] = useState<DiagnosticoIA | null>(null);
  const [error, setError] = useState<string | null>(null);

  const solicitarAnalisis = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerDiagnosticoIA("invernadero_prueba_01");
      setDiagnostico(data);
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "No se pudo conectar con el servicio de análisis inteligente.";
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Cabecera limpia */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-agro-border pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            Diagnóstico Agronómico con IA
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Evaluación fitosanitaria y ambiental bajo demanda impulsada por Gemini.
          </p>
        </div>

        <button
          onClick={solicitarAnalisis}
          disabled={cargando}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(147,51,234,0.3)] cursor-pointer text-xs sm:text-sm self-start sm:self-auto"
        >
          {cargando ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Activity className="w-5 h-5" />
          )}
          {cargando ? "Evaluando condiciones..." : "Generar Diagnóstico Actual"}
        </button>
      </div>

      {/* Mensaje de Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Resultados del Análisis */}
      {diagnostico ? (
        <div className="space-y-6">
          <TarjetaSeveridad estadoGeneral={diagnostico.estado_general} />
          <DetalleDiagnostico
            riesgoDetectado={diagnostico.riesgo_detectado}
            recomendacionTecnica={diagnostico.recomendacion_tecnica}
          />
        </div>
      ) : (
        /* Estado Vacío inicial */
        <div className="h-64 border-2 border-dashed border-agro-border rounded-xl flex flex-col items-center justify-center text-center p-6 text-gray-500">
          <Brain className="w-12 h-12 mb-3 opacity-20 text-purple-400" />
          <p className="text-sm text-gray-300 font-medium">
            Presiona el botón para generar una evaluación agronómica del cultivo
          </p>
          <p className="text-xs text-gray-500 mt-1 max-w-md">
            El modelo examina el comportamiento reciente de temperatura y humedad para identificar riesgos de estrés o plagas.
          </p>
        </div>
      )}
    </div>
  );
}
