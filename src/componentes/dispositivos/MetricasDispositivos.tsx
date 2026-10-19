import { Radio } from "lucide-react";

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-agro-dark border border-agro-border rounded-xl p-5">
        <span className="text-xs font-medium uppercase text-gray-400">Total Nodos</span>
        <div className="mt-2 text-3xl font-extrabold text-white">{totalDispositivos}</div>
        <span className="text-[11px] text-gray-500 mt-1 block">Detectados en la infraestructura</span>
      </div>

      <div className="bg-agro-dark border border-agro-border rounded-xl p-5">
        <span className="text-xs font-medium uppercase text-gray-400">En Línea</span>
        <div className="mt-2 text-3xl font-extrabold text-agro-green">{totalOnline}</div>
        <span className="text-[11px] text-gray-500 mt-1 block">Con pulsos de telemetría activos</span>
      </div>

      <div className="bg-agro-dark border border-agro-border rounded-xl p-5">
        <span className="text-xs font-medium uppercase text-gray-400">Desconectados</span>
        <div className="mt-2 text-3xl font-extrabold text-red-500">{totalOffline}</div>
        <span className="text-[11px] text-gray-500 mt-1 block">Sin reporte en ventana nominal</span>
      </div>

      <div className="bg-agro-dark border border-agro-border rounded-xl p-5">
        <span className="text-xs font-medium uppercase text-gray-400">Fuentes Activas</span>
        <div className="mt-2 text-2xl font-bold text-blue-400 flex items-center gap-2">
          <Radio className="w-5 h-5 text-agro-green" />
          <span>RTDB + PostgreSQL</span>
        </div>
        <span className="text-[11px] text-gray-500 mt-1 block">Sincronización bidireccional</span>
      </div>
    </div>
  );
}
