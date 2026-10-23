import React from "react";
import { Activity, Droplets, CheckCircle2 } from "lucide-react";
import { horaLecturaHeltec } from "@/lib/tiempo";

interface ControlActuadorProps {
  estadoBomba: boolean;
  origen?: string | null;
  accion?: string | null;
  timestamp?: string | null;
  ejecutando?: boolean;
  onToggle?: () => void;
}

export function ControlActuador({
  estadoBomba,
  origen,
  accion,
  timestamp,
}: ControlActuadorProps) {
  const modoTexto = origen
    ? origen === "MANUAL_WEB"
      ? "Control Web Manual"
      : origen === "ESP32_AUTO"
      ? "ESP32 Automático"
      : String(origen)
    : "Monitoreo de Bomba";

  const detalleTexto = accion
    ? `Último comando registrado: ${accion}${timestamp ? ` (${horaLecturaHeltec(timestamp)})` : ""}`
    : estadoBomba
    ? "Actuador encendido reportado por telemetría."
    : "Actuador apagado reportado por telemetría.";

  return (
    <div className="bg-agro-dark/80 backdrop-blur-sm border border-agro-border hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-agro-green" />
          <span className="text-gray-400 font-semibold tracking-wider text-[11px] uppercase">
            Sistema de Riego
          </span>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-950 border border-agro-border text-gray-400 font-medium">
          {modoTexto}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all ${
              estadoBomba
                ? "bg-agro-green/15 text-agro-green border-agro-green/40 shadow-sm shadow-agro-green/20"
                : "bg-slate-950/80 text-gray-400 border-agro-border"
            }`}
          >
            {estadoBomba ? (
              <Activity className="w-3.5 h-3.5 animate-spin text-agro-green" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-gray-500" />
            )}
            {estadoBomba ? "RIEGO EN CURSO" : "RIEGO EN ESPERA"}
          </span>
        </div>

        <p className="text-xs text-gray-400 sm:text-right font-mono text-[11px]">
          {detalleTexto}
        </p>
      </div>
    </div>
  );
}