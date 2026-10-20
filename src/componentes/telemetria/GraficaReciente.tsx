import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
    return {
      tiempo: tiempo || "--:--",
      temperatura: Number(d.temperatura) || 0,
      humedad: Number(d.humedad_ambiente) || 0,
    };
  });

  return (
    <div className="bg-agro-dark border border-agro-border rounded-xl p-6 h-96 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
          <LineChartIcon className="w-4 h-4 text-agro-green" />
          Últimas lecturas del historial
        </h3>
        <span className="text-xs text-gray-500 font-mono">
          {historial.length} lecturas
        </span>
      </div>

      <div className="flex-1 w-full min-h-[260px] flex items-center justify-center">
        {cargando ? (
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-agro-green" />
            <span>Consultando lecturas recientes...</span>
          </div>
        ) : historial.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-800 rounded-lg text-gray-500 max-w-md">
            <LineChartIcon className="w-8 h-8 opacity-25 text-agro-green mb-2" />
            <p className="text-xs font-medium text-gray-400">Sin lecturas recientes suficientes</p>
            <p className="text-[11px] text-gray-500 mt-1">
              La curva de evolución se trazará automáticamente al recibir las primeras mediciones del cultivo.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={datosGrafica} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="dashTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dashHum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="tiempo" stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  color: "#f8fafc",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="temperatura" stroke="#f59e0b" fillOpacity={1} fill="url(#dashTemp)" strokeWidth={2} name="Temp (°C)" />
              <Area type="monotone" dataKey="humedad" stroke="#3b82f6" fillOpacity={1} fill="url(#dashHum)" strokeWidth={2} name="Humedad (%)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
