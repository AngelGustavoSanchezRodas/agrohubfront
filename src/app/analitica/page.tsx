"use client";

import { useState, useEffect, useMemo } from "react";
import { LineChart, AlertCircle, Cpu } from "lucide-react";
import { obtenerDatosGrafica, obtenerDispositivos } from "@/services/api";
import { obtenerDispositivoActivo, guardarDispositivoActivo } from "@/lib/dispositivos";
import { etiquetaLectura } from "@/lib/tiempo";
import { DatosTelemetriaHistorica, MetricasResumen, DispositivoBackend } from "@/types";
import {
  MetricasCards,
  FiltrosToolbar,
  GraficaTendencia,
  TablaTelemetria,
  PuntoGrafica,
} from "@/componentes/analitica";

export default function Analitica() {
  const [dispositivos, setDispositivos] = useState<DispositivoBackend[]>([]);
  const [dispositivoId, setDispositivoId] = useState<string>(obtenerDispositivoActivo());
  const [datos, setDatos] = useState<DatosTelemetriaHistorica[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [limite, setLimite] = useState<number>(24);

  useEffect(() => {
    obtenerDispositivos().then((lista) => {
      if (Array.isArray(lista) && lista.length > 0) {
        setDispositivos(lista);
        if (!lista.some((d) => d.id_dispositivo === dispositivoId)) {
          const primero = lista[0].id_dispositivo;
          setDispositivoId(primero);
          guardarDispositivoActivo(primero);
        }
      }
    });
  }, [dispositivoId]);

  const consultarHistorial = (cantidad: number, idEstacion = dispositivoId) => {
    setCargando(true);
    setError(null);
    obtenerDatosGrafica(cantidad, idEstacion)
      .then((respuesta) => {
        setDatos(Array.isArray(respuesta) && respuesta.length > 0 ? [...respuesta].reverse() : []);
        setCargando(false);
      })
      .catch((err) => {
        setDatos([]);
        setError(
          err instanceof Error ? err.message : "No se pudo recuperar el historial de lecturas."
        );
        setCargando(false);
      });
  };

  useEffect(() => {
    let cancelado = false;

    obtenerDatosGrafica(limite, dispositivoId)
      .then((respuesta) => {
        if (!cancelado) {
          setDatos(Array.isArray(respuesta) && respuesta.length > 0 ? [...respuesta].reverse() : []);
          setCargando(false);
        }
      })
      .catch((err) => {
        if (!cancelado) {
          setDatos([]);
          setError(
            err instanceof Error ? err.message : "No se pudo conectar con el servicio de historial."
          );
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [limite, dispositivoId]);

  const datosGrafica: PuntoGrafica[] = useMemo(() => {
    return datos.map((d) => {
      let etiquetaTiempo = typeof d.tiempo === "string" ? d.tiempo : "";
      if (!etiquetaTiempo && d.creado_en) {
        etiquetaTiempo = etiquetaLectura(d.creado_en, {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      const temp = Number(d.temperatura) || 0;
      const indice = d.indice_calor !== undefined && d.indice_calor !== null ? Number(d.indice_calor) : temp;

      return {
        tiempo: etiquetaTiempo || "--:--",
        temperatura: temp,
        humedad: Number(d.humedad_ambiente) || 0,
        humedad_suelo: Number(d.humedad_suelo) || 0,
        indice_calor: indice,
      };
    });
  }, [datos]);

  const metricas: MetricasResumen = useMemo(() => {
    if (!datos.length) {
      return {
        tempPromedio: "--",
        tempMax: "--",
        tempMin: "--",
        humAmbPromedio: "--",
        humSueloPromedio: "--",
        indiceCalorPromedio: "--",
      };
    }

    const temps = datos.map((d) => Number(d.temperatura) || 0);
    const humAmb = datos.map((d) => Number(d.humedad_ambiente) || 0);
    const humSuelo = datos.map((d) => Number(d.humedad_suelo) || 0);
    const indicesCalor = datos.map((d) => (d.indice_calor !== undefined && d.indice_calor !== null ? Number(d.indice_calor) : Number(d.temperatura) || 0));
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

    return {
      tempPromedio: (sum(temps) / temps.length).toFixed(1),
      tempMax: Math.max(...temps).toFixed(1),
      tempMin: Math.min(...temps).toFixed(1),
      humAmbPromedio: (sum(humAmb) / humAmb.length).toFixed(1),
      humSueloPromedio: (sum(humSuelo) / humSuelo.length).toFixed(1),
      indiceCalorPromedio: (sum(indicesCalor) / indicesCalor.length).toFixed(1),
    };
  }, [datos]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Cabecera y controles de filtro temporal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-agro-border/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <LineChart className="w-5 h-5 sm:w-6 sm:h-6 text-agro-green" />
            Análisis Histórico del Cultivo
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
            Evolución temporal de variables climáticas y niveles de humedad en suelo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {dispositivos.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-950 border border-agro-border rounded-xl px-2.5 py-1.5">
              <Cpu className="w-3.5 h-3.5 text-agro-green shrink-0" />
              <select
                aria-label="Seleccionar estación analítica"
                value={dispositivoId}
                onChange={(e) => {
                  const nuevo = e.target.value;
                  setDispositivoId(nuevo);
                  guardarDispositivoActivo(nuevo);
                  consultarHistorial(limite, nuevo);
                }}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                {dispositivos.map((d) => (
                  <option key={d.id_dispositivo} value={d.id_dispositivo} className="bg-slate-900 text-white">
                    {d.nombre || d.id_dispositivo}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Barra de herramientas para rangos */}
          <FiltrosToolbar
            limite={limite}
            setLimite={setLimite}
            consultarHistorial={(cant) => consultarHistorial(cant, dispositivoId)}
            cargando={cargando}
          />
        </div>
      </div>

      {/* Alerta de error si falla la consulta */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tarjetas de Metricas Clave */}
      <MetricasCards metricas={metricas} totalMuestras={datos.length} />

      {/* Grafica de Evolucion Cronologica */}
      <GraficaTendencia datosGrafica={datosGrafica} cargando={cargando} />

      {/* Tabla Detallada de Lecturas */}
      <TablaTelemetria datos={datos} cargando={cargando} />
    </div>
  );
}
