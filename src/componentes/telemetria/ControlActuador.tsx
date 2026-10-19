import { Activity, Zap } from "lucide-react";

interface ControlActuadorProps {
  estadoBomba: boolean;
  ejecutando: boolean;
  onToggle: () => void;
}

export function ControlActuador({ estadoBomba, ejecutando, onToggle }: ControlActuadorProps) {
  return (
    <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 font-medium tracking-wide text-xs uppercase">
          Bomba de Agua
        </span>
        <Activity className={estadoBomba ? "text-agro-green w-5 h-5" : "text-gray-600 w-5 h-5"} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider border ${
            estadoBomba
              ? "bg-agro-green/10 text-agro-green border-agro-green/20"
              : "bg-gray-800 text-gray-400 border-gray-700"
          }`}
        >
          {estadoBomba ? "OPERANDO" : "EN ESPERA"}
        </span>

        <button
          onClick={onToggle}
          disabled={ejecutando}
          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-agro-orange" />
          <span>{ejecutando ? "..." : estadoBomba ? "Apagar" : "Encender"}</span>
        </button>
      </div>

      <span className="text-[11px] text-gray-500 mt-3 block">Control de relé por API</span>
    </div>
  );
}
