"use client";

import { useState } from "react";
import { Brain, Loader2, Activity } from "lucide-react";
import { obtenerDiagnosticoIA } from "@/services/api";
import { DiagnosticoIA } from "@/types";
import { TarjetaSeveridad, DetalleDiagnostico } from "@/componentes/alertas";

export default function AlertasIA() {
  const [cargando, setCargando] = useState(false);
  const [idDispositivo, setIdDispositivo] = useState<string>("invernadero_prueba_01");
  const [diagnostico, setDiagnostico] = useState<DiagnosticoIA | null>(null);
  const [error, setError] = useState<string | null>(null);

  const solicitarAnalisis = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerDiagnosticoIA(idDispositivo.trim() || "invernadero_prueba_01");
      setDiagnostico(data);
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "No se pudo completar el análisis. Verifica que el backend esté corriendo.";
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Cabecera con selector dinamico de dispositivo */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-agro-border pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            Cerebro Agrónomo
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Análisis de condiciones impulsado por Gemini 1.5. Evalúa riesgos en tiempo real.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-agro-border rounded-lg px-3 py-2">
            <span className="text-[11px] text-gray-500 font-mono">Nodo:</span>
            <input
              type="text"
              value={idDispositivo}
              onChange={(e) => setIdDispositivo(e.target.value)}
              placeholder="invernadero_prueba_01"
              className="bg-transparent text-xs text-white font-mono focus:outline-none w-36"
            />
          </div>

          <button
            onClick={solicitarAnalisis}
            disabled={cargando}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(147,51,234,0.3)] cursor-pointer text-xs sm:text-sm"
          >
            {cargando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Activity className="w-5 h-5" />
            )}
            {cargando ? "Evaluando telemetría..." : "Generar Diagnóstico Actual"}
          </button>
        </div>
      </div>

      {/* Mensaje de Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Resultados del Analisis */}
      {diagnostico ? (
        <div className="space-y-6">
          <TarjetaSeveridad estadoGeneral={diagnostico.estado_general} />
          <DetalleDiagnostico
            riesgoDetectado={diagnostico.riesgo_detectado}
            recomendacionTecnica={diagnostico.recomendacion_tecnica}
          />
        </div>
      ) : (
        /* Estado Vacio (Antes de solicitar analisis) */
        <div className="h-64 border-2 border-dashed border-agro-border rounded-xl flex flex-col items-center justify-center text-gray-500">
          <Brain className="w-12 h-12 mb-3 opacity-20" />
          <p>Presiona el botón para procesar el historial reciente de Supabase o Firebase.</p>
        </div>
      )}
    </div>
  );
}
