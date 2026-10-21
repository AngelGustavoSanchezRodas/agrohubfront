import { Thermometer, Droplets, Leaf, Flame } from "lucide-react";
import { MetricasResumen } from "@/types";

interface MetricasCardsProps {
  metricas: MetricasResumen;
  totalMuestras: number;
}

export function MetricasCards({ metricas, totalMuestras }: MetricasCardsProps) {
  const tieneDatos = totalMuestras > 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {/* Tarjeta 1: Temperatura Promedio */}
      <div className="bg-agro-dark/80 backdrop-blur-sm border border-agro-border hover:border-slate-700 rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between transition-all">
        <div className="flex items-center justify-between text-gray-400 text-[11px] sm:text-xs uppercase font-medium">
          <span className="truncate">Temp. Promedio</span>
          <div className="p-1.5 rounded-lg bg-slate-950/60 text-agro-orange shrink-0">
            <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-3xl font-bold text-white">
            {metricas.tempPromedio}
          </span>
          {tieneDatos && <span className="text-gray-400 text-xs sm:text-sm">°C</span>}
        </div>
        <span className="text-[10px] sm:text-[11px] text-gray-500 mt-2 truncate">
          {tieneDatos
            ? `Rango: ${metricas.tempMin}°C - ${metricas.tempMax}°C`
            : "Sin lecturas registradas"}
        </span>
      </div>

      {/* Tarjeta 2: Humedad Ambiental Promedio */}
      <div className="bg-agro-dark/80 backdrop-blur-sm border border-agro-border hover:border-slate-700 rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between transition-all">
        <div className="flex items-center justify-between text-gray-400 text-[11px] sm:text-xs uppercase font-medium">
          <span className="truncate">Humedad Aire</span>
          <div className="p-1.5 rounded-lg bg-slate-950/60 text-blue-400 shrink-0">
            <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-3xl font-bold text-white">
            {metricas.humAmbPromedio}
          </span>
          {tieneDatos && <span className="text-gray-400 text-xs sm:text-sm">%</span>}
        </div>
        <span className="text-[10px] sm:text-[11px] text-gray-500 mt-2 truncate">
          {tieneDatos ? "Promedio relativo del aire" : "Sin lecturas registradas"}
        </span>
      </div>

      {/* Tarjeta 3: Humedad de Sustrato */}
      <div className="bg-agro-dark/80 backdrop-blur-sm border border-agro-border hover:border-slate-700 rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between transition-all">
        <div className="flex items-center justify-between text-gray-400 text-[11px] sm:text-xs uppercase font-medium">
          <span className="truncate">Humedad Suelo</span>
          <div className="p-1.5 rounded-lg bg-slate-950/60 text-agro-green shrink-0">
            <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-3xl font-bold text-white">
            {metricas.humSueloPromedio}
          </span>
          {tieneDatos && <span className="text-gray-400 text-xs sm:text-sm">%</span>}
        </div>
        <span className="text-[10px] sm:text-[11px] text-gray-500 mt-2 truncate">
          {tieneDatos ? "Humedad en zona de raíces" : "Sin lecturas registradas"}
        </span>
      </div>

      {/* Tarjeta 4: Indice de Calor Promedio */}
      <div className="bg-agro-dark/80 backdrop-blur-sm border border-agro-border hover:border-slate-700 rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between transition-all">
        <div className="flex items-center justify-between text-gray-400 text-[11px] sm:text-xs uppercase font-medium">
          <span className="truncate">Índice Calor Prom.</span>
          <div className="p-1.5 rounded-lg bg-slate-950/60 text-rose-400 shrink-0">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-3xl font-bold text-white">
            {metricas.indiceCalorPromedio}
          </span>
          {tieneDatos && <span className="text-gray-400 text-xs sm:text-sm">°C</span>}
        </div>
        <span className="text-[10px] sm:text-[11px] text-gray-500 mt-2 truncate">
          {tieneDatos ? `${totalMuestras} muestras evaluadas` : "Esperando telemetría"}
        </span>
      </div>
    </div>
  );
}