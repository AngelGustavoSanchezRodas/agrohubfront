import { Activity, Waves } from "lucide-react";

interface ControlActuadorProps {
  estadoBomba: boolean;
  ejecutando?: boolean;
  onToggle?: () => void;
}

export function ControlActuador({ estadoBomba }: ControlActuadorProps) {
  return (
    <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 font-medium tracking-wide text-xs uppercase">
          Sistema de Riego
        </span>
        <Waves className={estadoBomba ? "text-agro-green w-5 h-5 animate-pulse" : "text-gray-600 w-5 h-5"} />
      </div>

      <div className="my-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider border ${
              estadoBomba
                ? "bg-agro-green/10 text-agro-green border-agro-green/30"
                : "bg-gray-800 text-gray-400 border-gray-700"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {estadoBomba ? "IRRIGACIÓN ACTIVA" : "EN ESPERA"}
          </span>
        </div>
      </div>

      <span className="text-[11px] text-gray-500 mt-2 block">
        {estadoBomba
          ? "Bomba de agua en operación nominal"
          : "Circuito de riego en monitoreo pasivo"}
      </span>
    </div>
  );
}
