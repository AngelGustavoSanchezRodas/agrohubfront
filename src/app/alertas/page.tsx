"use client";

import { useEffect, useState } from "react";
import { Brain, Loader2, Activity, Leaf, Plus } from "lucide-react";
import {
  obtenerDiagnosticoIA,
  obtenerDispositivos,
  obtenerCultivosIA,
  registrarCultivoIA,
  actualizarCultivoDispositivo,
} from "@/services/api";
import { CULTIVO_POR_DEFECTO, CULTIVOS_DISPONIBLES } from "@/lib/cultivos";
import { DISPOSITIVO_ACTIVO } from "@/lib/dispositivos";
import { DiagnosticoIA } from "@/types";
import { TarjetaSeveridad, DetalleDiagnostico } from "@/componentes/alertas";

export default function DiagnosticosIA() {
  const [cargando, setCargando] = useState(false);
  const [guardandoCultivo, setGuardandoCultivo] = useState(false);
  const [diagnostico, setDiagnostico] = useState<DiagnosticoIA | null>(null);
  const [cultivoDiagnostico, setCultivoDiagnostico] = useState<string>(CULTIVO_POR_DEFECTO);
  const [cultivo, setCultivo] = useState<string>(CULTIVO_POR_DEFECTO);
  const [opcionesCultivo, setOpcionesCultivo] = useState<string[]>([...CULTIVOS_DISPONIBLES]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoCultivo, setNuevoCultivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargarCultivos = async () => {
    try {
      const data = await obtenerCultivosIA();
      const ids = data.cultivos.map((c) => c.id);
      setOpcionesCultivo(ids.length > 0 ? ids : [...CULTIVOS_DISPONIBLES]);
    } catch {
      setOpcionesCultivo([...CULTIVOS_DISPONIBLES]);
    }
  };

  useEffect(() => {
    cargarCultivos();
    obtenerDispositivos()
      .then((lista) => {
        const actual = lista.find((d) => d.id_dispositivo === DISPOSITIVO_ACTIVO);
        if (actual?.cultivo) {
          const nombre = String(actual.cultivo);
          setCultivo(nombre);
          setOpcionesCultivo((prev) =>
            prev.some((c) => c.toLowerCase() === nombre.toLowerCase())
              ? prev
              : [...prev, nombre]
          );
        }
      })
      .catch(() => {
        // Se mantiene Tomate por defecto
      });
  }, []);

  const agregarCultivo = async () => {
    const nombre = nuevoCultivo.trim();
    if (nombre.length < 2) {
      setError("Escribe un nombre de cultivo o planta (mínimo 2 caracteres).");
      return;
    }

    setGuardandoCultivo(true);
    setError(null);
    setAviso(null);
    try {
      const data = await registrarCultivoIA(nombre);
      const ids = data.cultivos.map((c) => c.id);
      setOpcionesCultivo(ids.length > 0 ? ids : [...opcionesCultivo, data.cultivo]);
      setCultivo(data.cultivo);
      setNuevoCultivo("");
      setMostrarFormulario(false);
      setAviso(`"${data.cultivo}" ya está disponible en el selector.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo agregar el cultivo."
      );
    } finally {
      setGuardandoCultivo(false);
    }
  };

  const solicitarAnalisis = async () => {
    setCargando(true);
    setError(null);
    setAviso(null);
    setDiagnostico(null);
    try {
      try {
        await actualizarCultivoDispositivo(DISPOSITIVO_ACTIVO, cultivo);
      } catch {
        // El diagnostico igual puede usar el query param
      }
      const resultado = await obtenerDiagnosticoIA(DISPOSITIVO_ACTIVO, cultivo);
      if (
        cultivo &&
        resultado.cultivo.toLowerCase() !== cultivo.toLowerCase()
      ) {
        throw new Error(
          `Se pidió diagnóstico de ${cultivo}, pero la API devolvió ${resultado.cultivo}. Revisa que el backend desplegado esté actualizado.`
        );
      }
      setDiagnostico(resultado.diagnostico);
      setCultivoDiagnostico(resultado.cultivo);
    } catch (err) {
      setDiagnostico(null);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo conectar con el servicio de análisis inteligente."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-6 border-b border-agro-border pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              Diagnóstico con IA
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Elige o agrega el cultivo del invernadero. La IA compara las lecturas con ese perfil y
              recomienda qué ajustar.
            </p>
          </div>

          <button
            onClick={solicitarAnalisis}
            disabled={cargando || !cultivo}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-sm w-full sm:w-auto"
          >
            {cargando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Activity className="w-5 h-5" />
            )}
            {cargando ? "Evaluando cultivo..." : "Generar diagnóstico"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <label className="flex flex-col gap-2 flex-1 max-w-sm">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-semibold flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-agro-green" />
              Tipo de cultivo o planta
            </span>
            <select
              value={cultivo}
              onChange={(e) => {
                setCultivo(e.target.value);
                setDiagnostico(null);
                setError(null);
                setAviso(null);
              }}
              className="bg-slate-950 border border-agro-border rounded-xl px-4 py-2.5 text-base sm:text-sm text-white focus:outline-none focus:border-agro-green w-full"
            >
              {opcionesCultivo.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => {
              setMostrarFormulario((v) => !v);
              setError(null);
              setAviso(null);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-agro-border text-xs font-medium text-gray-300 hover:text-white hover:border-agro-green/50 transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 text-agro-green" />
            Agregar cultivo
          </button>
        </div>

        {mostrarFormulario && (
          <div className="bg-slate-950/70 border border-agro-border rounded-xl p-4 space-y-3 max-w-lg">
            <p className="text-xs text-gray-400">
              Escribe el nombre de la planta. Quedará en el selector para los próximos diagnósticos.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={nuevoCultivo}
                onChange={(e) => setNuevoCultivo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void agregarCultivo();
                  }
                }}
                placeholder="Ej. Hierbabuena, Cilantro, Chile..."
                className="flex-1 bg-agro-dark border border-agro-border rounded-xl px-4 py-2.5 text-base sm:text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-agro-green"
              />
              <button
                type="button"
                onClick={() => void agregarCultivo()}
                disabled={guardandoCultivo}
                className="px-4 py-2.5 rounded-xl bg-agro-green/15 border border-agro-green/40 text-agro-green text-xs font-semibold hover:bg-agro-green/25 disabled:opacity-50 cursor-pointer"
              >
                {guardandoCultivo ? "Guardando..." : "Guardar en selector"}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
          {error}
        </div>
      )}
      {aviso && (
        <div className="p-4 bg-agro-green/10 border border-agro-green/30 rounded-xl text-agro-green text-xs">
          {aviso}
        </div>
      )}

      {diagnostico ? (
        <div className="space-y-6">
          <TarjetaSeveridad estadoGeneral={diagnostico.estado_general} />
          <DetalleDiagnostico
            cultivo={cultivoDiagnostico}
            riesgoDetectado={diagnostico.riesgo_detectado}
            recomendacionTecnica={diagnostico.recomendacion_tecnica}
            evaluacionHumedad={diagnostico.evaluacion_humedad}
            evaluacionTemperatura={diagnostico.evaluacion_temperatura}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Elige o agrega un cultivo y genera el diagnóstico. El resultado mostrará balance hídrico, condición térmica y recomendaciones agronómicas.
        </p>
      )}
    </div>
  );
}
