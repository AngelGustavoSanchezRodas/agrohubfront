import { Activity } from "lucide-react";

interface MetricasDispositivosProps {
  totalDispositivos: number;
  totalOnline: number;
  totalOffline: number;
}

export function MetricasDispositivos({
  totalDispositivos,
  totalOnline,
  totalOffline,
}: MetricasDispositivosProps) {
  const disponibilidad =
    totalDispositivos > 0 ? Math.round((totalOnline / totalDispositivos) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <div className="bg-agro-dark/80 backdrop-blur-sm border border-agro-border rounded-2xl p-3.5 sm:p-5">
        <span className="text-[11px] sm:text-xs font-medium uppercase text-gray-400">Total Estaciones</span>
        <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">{totalDispositivos}</div>
        <span className="text-[10px] sm:text-[11px] text-gray-500 mt-1 block truncate">Nodos en campo</span>
      </div>

      <div className="bg-agro-dark/80 backdrop-blur-sm border border-agro-border rounded-2xl p-3.5 sm:p-5">
        <span className="text-[11px] sm:text-xs font-medium uppercase text-gray-400">Operativas</span>
        <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-agro-green">{totalOnline}</div>
        <span className="text-[10px] sm:text-[11px] text-gray-500 mt-1 block truncate">Transmitiendo en vivo</span>
      </div>

      <div className="bg-agro-dark/80 backdrop-blur-sm border border-agro-border rounded-2xl p-3.5 sm:p-5">
        <span className="text-[11px] sm:text-xs font-medium uppercase text-gray-400">Sin Señal</span>
        <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-red-500">{totalOffline}</div>
        <span className="text-[10px] sm:text-[11px] text-gray-500 mt-1 block truncate">En espera de datos</span>
      </div>

      <div className="bg-agro-dark/80 backdrop-blur-sm border border-agro-border rounded-2xl p-3.5 sm:p-5">
        <span className="text-[11px] sm:text-xs font-medium uppercase text-gray-400">Disponibilidad</span>
        <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-blue-400 flex items-center gap-2">
          <span>{disponibilidad}%</span>
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-agro-green shrink-0" />
        </div>
        <span className="text-[10px] sm:text-[11px] text-gray-500 mt-1 block truncate">Cobertura de red</span>
      </div>
    </div>
  );
}