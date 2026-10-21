import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { LineChart as LineChartIcon, RefreshCw } from "lucide-react";
import { DatosTelemetriaHistorica } from "@/types";
import { etiquetaLectura } from "@/lib/tiempo";

interface GraficaRecienteProps {
  historial: DatosTelemetriaHistorica[];
  cargando: boolean;
}

export function GraficaReciente({ historial, cargando }: GraficaRecienteProps) {
  const datosGrafica = historial.map((d) => {
    let tiempo = typeof d.tiempo === "string" ? d.tiempo : "";
    if (!tiempo && d.creado_en) {
      tiempo = etiquetaLectura(d.creado_en, {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    const temp = Number(d.temperatura) || 0;
    const indice =
      d.indice_calor !== undefined && d.indice_calor !== null
        ? Number(d.indice_calor)
        : temp;

    return {
      tiempo: tiempo || "--:--",
      temperatura: temp,
      humedad: Number(d.humedad_ambiente) || 0,
      humedad_suelo: Number(d.humedad_suelo) || 0,
      indice_calor: indice,
    };
  });

  return (
    <section
      aria-label="Evolución reciente del invernadero"
      className="bg-agro-dark/80 backdrop-blur-sm border border-agro-border rounded-2xl p-3.5 sm:p-6 h-[340px] sm:h-[400px] lg:h-[430px] flex flex-col shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
          <LineChartIcon className="w-4 h-4 text-agro-green shrink-0" />
          <span>Evolución Reciente del Invernadero</span>
        </h3>
        <span className="text-[11px] sm:text-xs text-gray-400 font-mono self-start sm:self-auto">
          {historial.length} mediciones registradas
        </span>
      </div>

      <div className="flex-1 w-full min-h-[240px] sm:min-h-[280px] flex items-center justify-center">
        {cargando ? (
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-agro-green" />
            <span>Consultando lecturas recientes...</span>
          </div>
        ) : historial.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-800 rounded-xl text-gray-500 max-w-md">
            <LineChartIcon className="w-8 h-8 opacity-25 text-agro-green mb-2" />
            <p className="text-xs font-medium text-gray-400">Sin lecturas recientes suficientes</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Las curvas de evolución se trazarán automáticamente al recibir las primeras mediciones del cultivo.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={datosGrafica} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="dashTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dashHum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dashSuelo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dashIndice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
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
              <Legend
                wrapperStyle={{ fontSize: "10px", color: "#94a3b8", paddingTop: "6px" }}
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="temperatura"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#dashTemp)"
                strokeWidth={2}
                name="Temperatura (°C)"
              />
              <Area
                type="monotone"
                dataKey="humedad"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#dashHum)"
                strokeWidth={2}
                name="Humedad Aire (%)"
              />
              <Area
                type="monotone"
                dataKey="humedad_suelo"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#dashSuelo)"
                strokeWidth={2}
                name="Humedad Suelo (%)"
              />
              <Area
                type="monotone"
                dataKey="indice_calor"
                stroke="#f43f5e"
                strokeDasharray="3 3"
                fillOpacity={1}
                fill="url(#dashIndice)"
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