"use client";

import { useState } from "react";
import { Brain, AlertTriangle, CheckCircle, Loader2, Info, Activity } from "lucide-react";
import { obtenerDiagnosticoIA, DiagnosticoIA } from "@/services/api";

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

  const renderIconoEstado = (estado: string) => {
    switch (estado) {
      case "OPTIMO":
        return <CheckCircle className="w-8 h-8 text-agro-green" />;
      case "ADVERTENCIA":
        return <AlertTriangle className="w-8 h-8 text-agro-orange" />;
      case "CRITICO":
        return <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />;
      default:
        return <Info className="w-8 h-8 text-gray-500" />;
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
          {/* Tarjeta de Severidad Principal */}
          <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex items-start gap-4">
            <div className="p-3 bg-slate-800 rounded-full">
              {renderIconoEstado(diagnostico.estado_general)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                Estado General del Cultivo
              </h3>
              <p
                className={`text-2xl font-bold mt-1 ${
                  diagnostico.estado_general === "OPTIMO"
                    ? "text-agro-green"
                    : diagnostico.estado_general === "ADVERTENCIA"
                    ? "text-agro-orange"
                    : "text-red-500"
                }`}
              >
                {diagnostico.estado_general}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tarjeta Riesgo */}
            <div className="bg-agro-dark border border-agro-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Riesgo Detectado
              </h3>
              <p className="text-white text-lg font-medium">
                {diagnostico.riesgo_detectado}
              </p>
            </div>

            {/* Tarjeta Recomendacion */}
            <div className="bg-agro-dark border border-agro-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Recomendación Técnica
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {diagnostico.recomendacion_tecnica}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Estado Vacio (Antes de solicitar analisis) */
        <div className="h-64 border-2 border-dashed border-agro-border rounded-xl flex flex-col items-center justify-center text-gray-500">
          <Brain className="w-12 h-12 mb-3 opacity-20" />
          <p>Presiona el botón para procesar el historial reciente de Supabase.</p>
        </div>
      )}
    </div>
  );
}
