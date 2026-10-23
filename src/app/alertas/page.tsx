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
import {
  CULTIVO_POR_DEFECTO,
  CULTIVOS_DISPONIBLES,
  limpiarListaCultivos,
  esNombreCultivoValido,
  formatearNombreCultivo,
} from "@/lib/cultivos";
import { obtenerDispositivoActivo, guardarDispositivoActivo } from "@/lib/dispositivos";
import { DiagnosticoIA, DispositivoBackend } from "@/types";
import { TarjetaSeveridad, DetalleDiagnostico } from "@/componentes/alertas";

export default function DiagnosticosIA() {
  const [cargando, setCargando] = useState(false);
  const [guardandoCultivo, setGuardandoCultivo] = useState(false);
  const [diagnostico, setDiagnostico] = useState<DiagnosticoIA | null>(null);
  const [cultivoDiagnostico, setCultivoDiagnostico] = useState<string>(CULTIVO_POR_DEFECTO);
  const [cultivo, setCultivo] = useState<string>(CULTIVO_POR_DEFECTO);
  const [opcionesCultivo, setOpcionesCultivo] = useState<string[]>([...CULTIVOS_DISPONIBLES]);
  const [dispositivos, setDispositivos] = useState<DispositivoBackend[]>([]);
  const [estacion, setEstacion] = useState<string>(obtenerDispositivoActivo());
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoCultivo, setNuevoCultivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    obtenerCultivosIA()
      .then((data) => {
        if (!cancelado) {
          const ids = (data.cultivos || []).map((c) => c.id);
          const filtrados = limpiarListaCultivos(ids.length > 0 ? ids : [...CULTIVOS_DISPONIBLES]);
          setOpcionesCultivo(filtrados.length > 0 ? filtrados : [...CULTIVOS_DISPONIBLES]);
        }
      })
      .catch(() => {
        if (!cancelado) {
          setOpcionesCultivo([...CULTIVOS_DISPONIBLES]);
        }
      });

    obtenerDispositivos()
      .then((lista) => {
        if (cancelado) return;
        setDispositivos(lista);
        const actual = lista.find((d) => d.id_dispositivo === estacion) || lista[0];
        if (actual) {
          setEstacion(actual.id_dispositivo);
          if (actual.cultivo && esNombreCultivoValido(actual.cultivo)) {
            const nombre = formatearNombreCultivo(String(actual.cultivo));
            setCultivo(nombre);
            setOpcionesCultivo((prev) => limpiarListaCultivos([...prev, nombre]));
          }
        }
      })
      .catch(() => {
        // Manejo silencioso
      });

    obtenerDiagnosticoIA(estacion)
      .then((res) => {
        if (!cancelado) {
          setDiagnostico(res.diagnostico);
          setCultivoDiagnostico(res.cultivo);
        }
      })
      .catch(() => {
        // En espera de que se genere o sincronice diagnostico
      });

    return () => {
      cancelado = true;
    };
  }, [estacion]);

  const agregarCultivo = async () => {
    const nombre = nuevoCultivo.trim();
    if (!esNombreCultivoValido(nombre)) {
      setError("Ingresa un nombre agronómico válido (ej: Hierbabuena, Cilantro, Chile). Mínimo 3 caracteres.");
      return;
    }

    const nombreFormateado = formatearNombreCultivo(nombre);
    setGuardandoCultivo(true);
    setError(null);
    setAviso(null);
    try {
      const data = await registrarCultivoIA(nombreFormateado);
      const ids = (data.cultivos || []).map((c) => c.id);
      const listaLimpia = limpiarListaCultivos([...ids, data.cultivo]);
      setOpcionesCultivo(listaLimpia);
      setCultivo(formatearNombreCultivo(data.cultivo));
      setNuevoCultivo("");
      setMostrarFormulario(false);
      setAviso(`"${formatearNombreCultivo(data.cultivo)}" ya está disponible en el selector.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo agregar el cultivo."
      );
    } finally {
      setGuardandoCultivo(false);
    }
  };

  const solicitarAnalisis = async () => {
    const cultivoEfectivo = esNombreCultivoValido(cultivo)
      ? formatearNombreCultivo(cultivo)
      : CULTIVO_POR_DEFECTO;

    setCargando(true);
    setError(null);
    setAviso(null);
    setDiagnostico(null);
    try {
      try {
        await actualizarCultivoDispositivo(estacion, cultivoEfectivo);
      } catch {
        // El diagnostico igual puede usar el query param
      }
      const resultado = await obtenerDiagnosticoIA(estacion, cultivoEfectivo);
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
              <Brain className="w-6 h-6 text-purple-400 shrink-0" />
              <span>Diagnóstico con IA</span>
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Evaluación agronómica y recomendaciones técnicas basadas en telemetría real.
            </p>
          </div>

          <button
            onClick={solicitarAnalisis}
            disabled={cargando || !cultivo}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-sm w-full sm:w-auto shrink-0"
          >
            {cargando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Activity className="w-5 h-5" />
            )}
            {cargando ? "Evaluando cultivo..." : "Generar diagnóstico"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3 flex-wrap">
          {dispositivos.length > 1 && (
            <label className="flex flex-col gap-2 flex-1 min-w-[180px] max-w-xs">
              <span className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                Estación de Monitoreo
              </span>
              <select
                value={estacion}
                onChange={(e) => {
                  setEstacion(e.target.value);
                  guardarDispositivoActivo(e.target.value);
                  setDiagnostico(null);
                  setError(null);
                  setAviso(null);
                }}
                className="bg-slate-950 border border-agro-border rounded-xl px-4 py-2.5 text-base sm:text-sm text-white focus:outline-none focus:border-agro-green w-full"
              >
                {dispositivos.map((d) => (
                  <option key={d.id_dispositivo} value={d.id_dispositivo}>
                    {d.nombre || d.id_dispositivo}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="flex flex-col gap-2 flex-1 min-w-[200px] max-w-sm">
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
            evaluacionLuz={diagnostico.evaluacion_luz}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Sin diagnóstico previo en Firebase. Selecciona un cultivo y genera una evaluación.
        </p>
      )}
    </div>
  );
}