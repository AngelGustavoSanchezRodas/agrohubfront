"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Thermometer,
  Droplets,
  Leaf,
  SunMedium,
  Flame,
} from "lucide-react";
import { fechaLecturaHeltec } from "@/lib/tiempo";
import { TelemetriaEnVivo } from "@/types";

export interface BadgeEstado {
  texto: string;
  clase: string;
}

export interface PanelTelemetriaProps {
  datosFirebase?:
    | TelemetriaEnVivo
    | {
        temperatura?: number | string;
        humedad_ambiente?: number | string;
        humedad_suelo?: number | string;
        intensidad_luz_lux?: number | string;
        indice_calor?: number | string;
        timestamp?: string;
        [key: string]: unknown;
      }
    | null;
  badges?: {
    temperatura?: BadgeEstado;
    humedadAmb?: BadgeEstado;
    sustrato?: BadgeEstado;
    luz?: BadgeEstado;
    indiceCalor?: BadgeEstado;
  };
  className?: string;
}

export default function PanelTelemetria({
  datosFirebase,
  badges,
  className = "",
}: PanelTelemetriaProps) {
  const [conexionPerdida, setConexionPerdida] = useState(false);

  useEffect(() => {
    if (!datosFirebase?.timestamp) return;

    const verificarLatencia = () => {
      const fecha =
        fechaLecturaHeltec(datosFirebase.timestamp as string) ??
        new Date(datosFirebase.timestamp as string);
      const tiempoLectura = fecha.getTime();

      if (Number.isNaN(tiempoLectura)) {
        setConexionPerdida(true);
        return;
      }

      const diferenciaMinutos = (Date.now() - tiempoLectura) / 1000 / 60;
      setConexionPerdida(diferenciaMinutos > 2);
    };

    const intervalo = setInterval(verificarLatencia, 30000);
    verificarLatencia();
    return () => clearInterval(intervalo);
  }, [datosFirebase]);

  const tieneTimestamp = Boolean(datosFirebase?.timestamp);
  const tempTexto =
    datosFirebase?.temperatura != null && datosFirebase.temperatura !== ""
      ? `${datosFirebase.temperatura}°C`
      : "--.-";
  const humAmbTexto =
    datosFirebase?.humedad_ambiente != null && datosFirebase.humedad_ambiente !== ""
      ? `${datosFirebase.humedad_ambiente}%`
      : "--";
  const humSueloTexto =
    datosFirebase?.humedad_suelo != null && datosFirebase.humedad_suelo !== ""
      ? `${datosFirebase.humedad_suelo}%`
      : "--";
  const luzTexto =
    datosFirebase?.intensidad_luz_lux != null && datosFirebase.intensidad_luz_lux !== ""
      ? `${datosFirebase.intensidad_luz_lux} Lux`
      : "--";
  const indiceTexto =
    datosFirebase?.indice_calor != null && datosFirebase.indice_calor !== ""
      ? `${datosFirebase.indice_calor}°C`
      : "--.-";

  return (
    <section
      aria-label="Panel de telemetría en tiempo real"
      className={`p-4 sm:p-6 bg-slate-900/90 rounded-2xl shadow-md text-white border border-slate-800 backdrop-blur-sm ${className}`.trim()}
    >
      {/* Indicador de Perro Guardián en tiempo real */}
      <div
        className={`mb-4 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-between gap-3 transition-colors ${
          !tieneTimestamp
            ? "bg-slate-950 text-gray-400 border border-slate-800"
            : conexionPerdida
            ? "bg-red-950/80 text-red-200 border border-red-500/40"
            : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
        }`}
      >
        <div className="flex items-center gap-2">
          {!tieneTimestamp ? (
            <>
              <Clock className="w-4 h-4 shrink-0 text-amber-400" aria-hidden="true" />
              <span>En espera de telemetría de hardware</span>
            </>
          ) : conexionPerdida ? (
            <>
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" aria-hidden="true" />
              <span>Alerta: Señal de ESP32 perdida (sin lectura &gt; 2 min)</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>Hardware En Línea y transmitiendo</span>
            </>
          )}
        </div>
        <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">
          Fuente: Firebase Realtime
        </span>
      </div>

      {/* Grid Único de Sensores sin duplicidad */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Temperatura */}
        <div className="p-3.5 sm:p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Temperatura
            </span>
            <Thermometer className="w-4 h-4 text-orange-400 shrink-0" aria-hidden="true" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight my-1">
            {tempTexto}
          </p>
          {badges?.temperatura && (
            <div className="mt-1">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badges.temperatura.clase}`}>
                {badges.temperatura.texto}
              </span>
            </div>
          )}
        </div>

        {/* Humedad Ambiente */}
        <div className="p-3.5 sm:p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Hum. Aire
            </span>
            <Droplets className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight my-1">
            {humAmbTexto}
          </p>
          {badges?.humedadAmb && (
            <div className="mt-1">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badges.humedadAmb.clase}`}>
                {badges.humedadAmb.texto}
              </span>
            </div>
          )}
        </div>

        {/* Humedad Suelo */}
        <div className="p-3.5 sm:p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Hum. Suelo
            </span>
            <Leaf className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight my-1">
            {humSueloTexto}
          </p>
          {badges?.sustrato && (
            <div className="mt-1">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badges.sustrato.clase}`}>
                {badges.sustrato.texto}
              </span>
            </div>
          )}
        </div>

        {/* Luminosidad Destacada */}
        <div className="p-3.5 sm:p-4 bg-yellow-950/20 rounded-xl border border-yellow-600/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">
              Luz (Lux)
            </span>
            <SunMedium className="w-4 h-4 text-yellow-300 shrink-0" aria-hidden="true" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-300 tracking-tight my-1">
            {luzTexto}
          </p>
          {badges?.luz && (
            <div className="mt-1">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badges.luz.clase}`}>
                {badges.luz.texto}
              </span>
            </div>
          )}
        </div>

        {/* Índice de Calor */}
        <div className="p-3.5 sm:p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Índice Calor
            </span>
            <Flame className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight my-1">
            {indiceTexto}
          </p>
          {badges?.indiceCalor && (
            <div className="mt-1">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badges.indiceCalor.clase}`}>
                {badges.indiceCalor.texto}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export { PanelTelemetria };
