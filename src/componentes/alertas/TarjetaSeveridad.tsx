import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import { EstadoSeveridadIA } from "@/types";

interface TarjetaSeveridadProps {
  estadoGeneral: EstadoSeveridadIA;
}

export function TarjetaSeveridad({ estadoGeneral }: TarjetaSeveridadProps) {
  const renderIcono = (estado: EstadoSeveridadIA) => {
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

  const colorTexto =
    estadoGeneral === "OPTIMO"
      ? "text-agro-green"
      : estadoGeneral === "ADVERTENCIA"
      ? "text-agro-orange"
      : estadoGeneral === "CRITICO"
      ? "text-red-500"
      : "text-gray-400";

  return (
    <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex items-start gap-4">
      <div className="p-3 bg-slate-800 rounded-full">{renderIcono(estadoGeneral)}</div>
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Estado General del Cultivo
        </h3>
        <p className={`text-2xl font-bold mt-1 ${colorTexto}`}>{estadoGeneral}</p>
      </div>
    </div>
  );
}
