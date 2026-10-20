"use client";

import { useState, useEffect, useMemo } from "react";
import { LineChart, AlertCircle } from "lucide-react";
import { obtenerDatosGrafica } from "@/services/api";
import { DISPOSITIVO_ACTIVO } from "@/lib/dispositivos";
import { etiquetaLectura } from "@/lib/tiempo";
import { DatosTelemetriaHistorica, MetricasResumen } from "@/types";
import {
  MetricasCards,
  FiltrosToolbar,
  GraficaTendencia,
  TablaTelemetria,
  PuntoGrafica,
} from "@/componentes/analitica";

export default function Analitica() {
  const [datos, setDatos] = useState<DatosTelemetriaHistorica[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [limite, setLimite] = useState<number>(24);
  const [dispositivoId] = useState<string>(DISPOSITIVO_ACTIVO);

  const consultarHistorial = (cantidad: number) => {
    setCargando(true);
    setError(null);
    obtenerDatosGrafica(cantidad, dispositivoId)
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
      return {
        tiempo: etiquetaTiempo || "--:--",
        temperatura: Number(d.temperatura) || 0,
        humedad: Number(d.humedad_ambiente) || 0,
        humedad_suelo: Number(d.humedad_suelo) || 0,
        lux: Number(d.intensidad_luz_lux) || 0,
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
      };
    }

    const temps = datos.map((d) => Number(d.temperatura) || 0);
    const humAmb = datos.map((d) => Number(d.humedad_ambiente) || 0);
    const humSuelo = datos.map((d) => Number(d.humedad_suelo) || 0);
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

    return {
      tempPromedio: (sum(temps) / temps.length).toFixed(1),
      tempMax: Math.max(...temps).toFixed(1),
      tempMin: Math.min(...temps).toFixed(1),
      humAmbPromedio: (sum(humAmb) / humAmb.length).toFixed(1),
      humSueloPromedio: (sum(humSuelo) / humSuelo.length).toFixed(1),
    };
  }, [datos]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabecera y controles de filtro temporal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <LineChart className="w-6 h-6 text-agro-green" />
            Análisis Histórico del Cultivo
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Evolución temporal de variables climáticas y niveles de humedad en suelo.
          </p>
        </div>

        <FiltrosToolbar
          limite={limite}
          setLimite={setLimite}
          consultarHistorial={consultarHistorial}
          cargando={cargando}
        />
      </div>

      {/* Alerta de error si aplica */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tarjetas resumen de metricas */}
      <MetricasCards
        metricas={metricas}
        totalMuestras={datos.length}
      />

      {/* Gráfico de Área Recharts */}
      <GraficaTendencia datosGrafica={datosGrafica} cargando={cargando} />

      <TablaTelemetria datos={datos} cargando={cargando} />
    </div>
  );
}
