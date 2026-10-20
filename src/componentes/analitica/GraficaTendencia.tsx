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
  lux: number;
}

interface GraficaTendenciaProps {
  datosGrafica: PuntoGrafica[];
  cargando: boolean;
}

export function GraficaTendencia({ datosGrafica, cargando }: GraficaTendenciaProps) {
  return (
    <div className="bg-agro-dark border border-agro-border rounded-xl p-6 h-[500px] flex flex-col">
      {/* Cabecera y leyendas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Evolución de Variables Ambientales
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-agro-orange font-medium">
            <span className="w-3 h-3 rounded-full bg-agro-orange inline-block"></span>
            Temperatura (°C)
          </span>
          <span className="flex items-center gap-1.5 text-blue-400 font-medium">
            <span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span>
            Humedad Amb. (%)
          </span>
          <span className="flex items-center gap-1.5 text-agro-green font-medium">
            <span className="w-3 h-3 rounded-full bg-agro-green inline-block"></span>
            Sustrato (%)
          </span>
          <span className="flex items-center gap-1.5 text-amber-300 font-medium">
            <span className="w-3 h-3 rounded-full bg-amber-300 inline-block"></span>
            Luz (lx)
          </span>
        </div>
      </div>

      {/* Contenedor del grafico o estados vacios */}
      <div className="flex-1 w-full min-h-[350px] flex items-center justify-center">
        {cargando ? (
          <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-agro-green" />
            <p className="text-xs">Recuperando registros históricos del cultivo...</p>
          </div>
        ) : datosGrafica.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-md border border-dashed border-agro-border rounded-xl text-gray-500">
            <LineChart className="w-12 h-12 mb-3 opacity-20 text-agro-green" />
            <p className="text-sm font-medium text-gray-300">
              No hay lecturas registradas en este período
            </p>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Las curvas de evolución agronómica se generarán automáticamente conforme se acumulen lecturas en la estación de monitoreo.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={datosGrafica}
              margin={{ top: 10, right: 18, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSuelo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLux" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="tiempo"
                stroke="#64748b"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="pct"
                stroke="#64748b"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="lux"
                orientation="right"
                stroke="#64748b"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                width={42}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  color: "#f8fafc",
                  borderRadius: "0.75rem",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                }}
                itemStyle={{ color: "#e2e8f0" }}
                labelStyle={{
                  color: "#94a3b8",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              />

              <Area
                yAxisId="pct"
                type="monotone"
                dataKey="temperatura"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorTemp)"
                strokeWidth={2}
                name="Temp (°C)"
              />
              <Area
                yAxisId="pct"
                type="monotone"
                dataKey="humedad"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorHum)"
                strokeWidth={2}
                name="Humedad Amb. (%)"
              />
              <Area
                yAxisId="pct"
                type="monotone"
                dataKey="humedad_suelo"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorSuelo)"
                strokeWidth={2}
                name="Humedad Suelo (%)"
              />
              <Area
                yAxisId="lux"
                type="monotone"
                dataKey="lux"
                stroke="#fbbf24"
                fillOpacity={1}
                fill="url(#colorLux)"
                strokeWidth={2}
                name="Luz (lx)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
