"use client";

import { useEffect, useState } from "react";
import { Brain, Loader2, Activity, Bell } from "lucide-react";
import { obtenerAlertas, obtenerDiagnosticoIA, resolverAlerta } from "@/services/api";
import { AlertaAgronomica, DiagnosticoIA } from "@/types";
import { TarjetaSeveridad, DetalleDiagnostico } from "@/componentes/alertas";

export default function AlertasIA() {
  const [cargando, setCargando] = useState(false);
  const [cargandoAlertas, setCargandoAlertas] = useState(true);
  const [diagnostico, setDiagnostico] = useState<DiagnosticoIA | null>(null);
  const [alertas, setAlertas] = useState<AlertaAgronomica[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cargarAlertas = async () => {
    setCargandoAlertas(true);
    setError(null);
    try {
      const data = await obtenerAlertas();
      setAlertas(data);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "";
      setError(
        mensaje === "Failed to fetch"
          ? "No se pudo consultar la API. Las alertas guardadas no están disponibles."
          : mensaje || "No se pudieron consultar las alertas agronomicas."
      );
    } finally {
      setCargandoAlertas(false);
    }
  };

  useEffect(() => {
    cargarAlertas();
  }, []);

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

  const marcarResuelta = async (idAlerta: number) => {
    setError(null);
    try {
      await resolverAlerta(idAlerta);
      await cargarAlertas();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo resolver la alerta."
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-agro-border pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-agro-orange" />
            Alertas del cultivo
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Registros guardados en Supabase a partir de las lecturas del Heltec.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {cargandoAlertas ? (
          <p className="text-sm text-gray-400">Consultando alertas...</p>
        ) : error ? null : alertas.length === 0 ? (
          <p className="text-sm text-gray-400">No hay alertas registradas.</p>
        ) : (
          alertas.map((alerta) => (
            <article
              key={alerta.id}
              className="bg-agro-dark border border-agro-border rounded-xl p-5 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-white">{alerta.tipo_riesgo}</span>
                  <span className="text-gray-500">{alerta.severidad}</span>
                  <span className="text-gray-500">{alerta.estado}</span>
                </div>
                {alerta.estado === "ACTIVA" && (
                  <button
                    onClick={() => marcarResuelta(alerta.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-agro-border text-gray-300 hover:text-white"
                  >
                    Marcar resuelta
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-300">{alerta.mensaje_diagnostico}</p>
              <p className="text-[11px] text-gray-500">
                {alerta.id_dispositivo || "Sin dispositivo"} 
                {alerta.creado_en ? ` · ${new Date(alerta.creado_en).toLocaleString()}` : ""}
              </p>
            </article>
          ))
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-agro-border pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            Diagnóstico agronómico
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Evaluación bajo demanda con el historial ya guardado.
          </p>
        </div>

        <button
          onClick={solicitarAnalisis}
          disabled={cargando}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-sm self-start sm:self-auto"
        >
          {cargando ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Activity className="w-5 h-5" />
          )}
          {cargando ? "Evaluando condiciones..." : "Generar diagnóstico"}
        </button>
      </div>

      {diagnostico ? (
        <div className="space-y-6">
          <TarjetaSeveridad estadoGeneral={diagnostico.estado_general} />
          <DetalleDiagnostico
            riesgoDetectado={diagnostico.riesgo_detectado}
            recomendacionTecnica={diagnostico.recomendacion_tecnica}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          El diagnóstico aparece aquí cuando se solicita. No hay un resultado previo guardado en esta pantalla.
        </p>
      )}
    </div>
  );
}
