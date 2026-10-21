import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RefreshCw, LineChart } from "lucide-react";

export interface PuntoGrafica {
  tiempo: string;
  temperatura: number;
  humedad: number;
  humedad_suelo: number;
  indice_calor: number;
}

interface GraficaTendenciaProps {
  datosGrafica: PuntoGrafica[];
  cargando: boolean;
}

export function GraficaTendencia({ datosGrafica, cargando }: GraficaTendenciaProps) {
  return (
    <section
      aria-label="Evolución de variables ambientales"
      className="bg-agro-dark/80 backdrop-blur-sm border border-agro-border rounded-2xl p-3.5 sm:p-6 h-[360px] sm:h-[440px] lg:h-[480px] flex flex-col shadow-sm"
    >
      {/* Cabecera y leyendas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Evolución de Variables Ambientales
        </h3>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[10px] sm:text-xs">
          <span className="flex items-center gap-1.5 text-agro-orange font-medium">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-agro-orange inline-block"></span>
            Temp (°C)
          </span>
          <span className="flex items-center gap-1.5 text-blue-400 font-medium">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-400 inline-block"></span>
            Aire (%)
          </span>
          <span className="flex items-center gap-1.5 text-agro-green font-medium">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-agro-green inline-block"></span>
            Sustrato (%)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-medium">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-400 inline-block"></span>
            Índice Calor (°C)
          </span>
        </div>
      </div>

      {/* Contenedor del grafico o estados vacios */}
      <div className="flex-1 w-full min-h-[260px] sm:min-h-[320px] flex items-center justify-center">
        {cargando ? (
          <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
            <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-agro-green" />
            <p className="text-xs">Recuperando registros históricos del cultivo...</p>
          </div>
        ) : datosGrafica.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 max-w-md border border-dashed border-agro-border rounded-xl text-gray-500">
            <LineChart className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-20 text-agro-green" />
            <p className="text-xs sm:text-sm font-medium text-gray-300">
              No hay lecturas registradas en este período
            </p>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1.5 leading-relaxed">
              Las curvas de evolución agronómica se generarán conforme se acumulen lecturas en la estación de monitoreo.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={datosGrafica}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSuelo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorIndice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb7185" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="tiempo"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                minTickGap={25}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#64748b"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  color: "#f8fafc",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
                }}
              />
              <Area
                type="monotone"
                dataKey="temperatura"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorTemp)"
                strokeWidth={2}
                name="Temperatura (°C)"
              />
              <Area
                type="monotone"
                dataKey="humedad"
                stroke="#60a5fa"
                fillOpacity={1}
                fill="url(#colorHum)"
                strokeWidth={2}
                name="Humedad Aire (%)"
              />
              <Area
                type="monotone"
                dataKey="humedad_suelo"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorSuelo)"
                strokeWidth={2}
                name="Sustrato (%)"
              />
              <Area
                type="monotone"
                dataKey="indice_calor"
                stroke="#fb7185"
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorIndice)"
                strokeWidth={2}
                name="Índice Calor (°C)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}