import { Thermometer, Droplets, Leaf, Layers } from "lucide-react";
import { MetricasResumen } from "@/types";

interface MetricasCardsProps {
  metricas: MetricasResumen;
  totalMuestras: number;
  origenDato?: string;
}

export function MetricasCards({ metricas, totalMuestras, origenDato }: MetricasCardsProps) {
  const tieneDatos = totalMuestras > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Tarjeta 1: Temperatura Promedio */}
      <div className="bg-agro-dark border border-agro-border rounded-xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-gray-400 text-xs uppercase font-medium">
          <span>Temperatura Promedio</span>
          <Thermometer className="w-5 h-5 text-agro-orange" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {metricas.tempPromedio}
          </span>
          {tieneDatos && <span className="text-gray-400 text-sm">°C</span>}
        </div>
        <span className="text-[11px] text-gray-500 mt-2">
          {tieneDatos
            ? `Rango: ${metricas.tempMin}°C min / ${metricas.tempMax}°C max`
            : "Sin lecturas registradas"}
        </span>
      </div>

      {/* Tarjeta 2: Humedad Ambiental Promedio */}
      <div className="bg-agro-dark border border-agro-border rounded-xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-gray-400 text-xs uppercase font-medium">
          <span>Humedad Ambiental Promedio</span>
          <Droplets className="w-5 h-5 text-blue-400" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {metricas.humAmbPromedio}
          </span>
          {tieneDatos && <span className="text-gray-400 text-sm">%</span>}
        </div>
        <span className="text-[11px] text-gray-500 mt-2">
          {tieneDatos ? "Régimen agronómico registrado" : "Sin lecturas registradas"}
        </span>
      </div>

      {/* Tarjeta 3: Humedad de Sustrato */}
      <div className="bg-agro-dark border border-agro-border rounded-xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-gray-400 text-xs uppercase font-medium">
          <span>Humedad de Sustrato</span>
          <Leaf className="w-5 h-5 text-agro-green" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {metricas.humSueloPromedio}
          </span>
          {tieneDatos && <span className="text-gray-400 text-sm">%</span>}
        </div>
        <span className="text-[11px] text-gray-500 mt-2">
          {tieneDatos ? "Contenido volumétrico medio" : "Sin lecturas registradas"}
        </span>
      </div>

      {/* Tarjeta 4: Puntos Analizados y Origen */}
      <div className="bg-agro-dark border border-agro-border rounded-xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-gray-400 text-xs uppercase font-medium">
          <span>Puntos Analizados</span>
          <Layers className="w-5 h-5 text-purple-400" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {totalMuestras}
          </span>
          <span className="text-gray-400 text-sm">muestras</span>
        </div>
        <span className="text-[11px] text-gray-500 mt-2">
          {tieneDatos
            ? `Origen: ${origenDato || "Supabase / Firebase"}`
            : "Esperando lecturas de Supabase o Firebase"}
        </span>
      </div>
    </div>
  );
}
