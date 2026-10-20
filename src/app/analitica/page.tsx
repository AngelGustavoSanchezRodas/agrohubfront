"use client";

import { useState, useEffect, useMemo } from "react";
import { LineChart, AlertCircle } from "lucide-react";
import { obtenerDatosGrafica } from "@/services/api";
import { DatosTelemetriaHistorica, MetricasResumen } from "@/types";
import {
  MetricasCards,
  FiltrosToolbar,
  GraficaTendencia,
  TablaTelemetria,
  PuntoGrafica,
} from "@/componentes/analitica";

export default function Analitica() {
  const [datos, setDatos] = useState<DatosTelemetriaHistorica[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rango, setRango] = useState<"24h" | "7d">("24h");
  const [limite, setLimite] = useState<number>(24);
  const [dispositivoId] = useState<string>("invernadero_prueba_01");

  const consultarHistorial = (cantidad: number) => {
    setCargando(true);
    setError(null);
    obtenerDatosGrafica(cantidad, dispositivoId)
      .then((respuesta) => {
        setDatos(Array.isArray(respuesta) && respuesta.length > 0 ? [...respuesta].reverse() : []);
        setCargando(false);
      })
      .catch((err) => {
        setDatos([]);
        setError(
          err instanceof Error ? err.message : "No se pudo recuperar el historial de lecturas."
        );
        setCargando(false);
      });
  };

  useEffect(() => {
    let cancelado = false;

    obtenerDatosGrafica(limite, dispositivoId)
      .then((respuesta) => {
        if (!cancelado) {
          setDatos(Array.isArray(respuesta) && respuesta.length > 0 ? [...respuesta].reverse() : []);
          setCargando(false);
        }
      })
      .catch((err) => {
        if (!cancelado) {
          setDatos([]);
          setError(
            err instanceof Error ? err.message : "No se pudo conectar con el servicio de historial."
          );
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [limite, dispositivoId]);

  const datosGrafica: PuntoGrafica[] = useMemo(() => {
    return datos.map((d) => {
      let etiquetaTiempo = typeof d.tiempo === "string" ? d.tiempo : "";
      if (!etiquetaTiempo && d.creado_en) {
        try {
          const fecha = new Date(d.creado_en);
          etiquetaTiempo = fecha.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          etiquetaTiempo = "--:--";
        }
      }
      return {
        tiempo: etiquetaTiempo || "00:00",
        temperatura: Number(d.temperatura) || 0,
        humedad: Number(d.humedad_ambiente) || 0,
        humedad_suelo: Number(d.humedad_suelo) || 0,
      };
    });
  }, [datos]);

  const metricas: MetricasResumen = useMemo(() => {
    if (!datos.length) {
      return {
        tempPromedio: "--",
        tempMax: "--",
        tempMin: "--",
        humAmbPromedio: "--",
        humSueloPromedio: "--",
      };
    }

    const temps = datos.map((d) => Number(d.temperatura) || 0);
    const humAmb = datos.map((d) => Number(d.humedad_ambiente) || 0);
    const humSuelo = datos.map((d) => Number(d.humedad_suelo) || 0);
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

    return {
      tempPromedio: (sum(temps) / temps.length).toFixed(1),
      tempMax: Math.max(...temps).toFixed(1),
      tempMin: Math.min(...temps).toFixed(1),
      humAmbPromedio: (sum(humAmb) / humAmb.length).toFixed(1),
      humSueloPromedio: (sum(humSuelo) / humSuelo.length).toFixed(1),
    };
  }, [datos]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabecera y controles de filtro temporal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <LineChart className="w-6 h-6 text-agro-green" />
            Análisis Histórico del Cultivo
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Evolución temporal de variables climáticas y niveles de humedad en suelo.
          </p>
        </div>

        <FiltrosToolbar
          rango={rango}
          setRango={setRango}
          limite={limite}
          setLimite={setLimite}
          consultarHistorial={consultarHistorial}
          cargando={cargando}
        />
      </div>

      {/* Alerta de error si aplica */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tarjetas resumen de metricas */}
      <MetricasCards
        metricas={metricas}
        totalMuestras={datos.length}
      />

      {/* Gráfico de Área Recharts */}
      <GraficaTendencia datosGrafica={datosGrafica} cargando={cargando} />

<<<<<<< Updated upstream
      {/* Tabla cronológica de lecturas */}
      <TablaTelemetria datos={datos} cargando={cargando} />
=======
        <div className="bg-agro-dark border border-agro-border rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs uppercase font-medium">
            <span>Puntos Analizados</span>
            <Layers className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {datos.length}
            </span>
            <span className="text-gray-400 text-sm">muestras</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-2">
            {usandoMock ? "Modo simulación de respaldo" : "Origen: Supabase PostgreSQL"}
          </span>
        </div>
      </div>

      {/* Contenedor del Grafico Recharts */}
      <div className="bg-agro-dark border border-agro-border rounded-xl p-6 h-[500px] flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Temperatura vs Humedad (Sector Norte)
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
          </div>
        </div>

        <div className="flex-1 w-full min-h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={datosGrafica} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* Gradiente para Temperatura (Naranja) */}
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                {/* Gradiente para Humedad Ambiental (Azul) */}
                <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                {/* Gradiente para Humedad de Suelo (Verde) */}
                <linearGradient id="colorSuelo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                stroke="#64748b"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
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
                labelStyle={{ color: "#94a3b8", fontWeight: "bold", marginBottom: "4px" }}
              />

              <Area
                type="monotone"
                dataKey="temperatura"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorTemp)"
                strokeWidth={2}
                name="Temp (°C)"
              />
              <Area
                type="monotone"
                dataKey="humedad"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorHum)"
                strokeWidth={2}
                name="Humedad Amb. (%)"
              />
              <Area
                type="monotone"
                dataKey="humedad_suelo"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorSuelo)"
                strokeWidth={2}
                name="Humedad Suelo (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla Relacional de Registros */}
      <div className="bg-agro-dark border border-agro-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-1">
          Tabla de Telemetría Relacional
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Registros procesados y almacenados en la tabla telemetria_historica.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="uppercase bg-slate-950/70 text-gray-400 border-b border-agro-border font-semibold">
              <tr>
                <th className="py-3 px-4">Dispositivo</th>
                <th className="py-3 px-4">Temperatura</th>
                <th className="py-3 px-4">Humedad Amb.</th>
                <th className="py-3 px-4">Suelo</th>
                <th className="py-3 px-4">Luz</th>
                <th className="py-3 px-4">Bomba</th>
                <th className="py-3 px-4">Marca de Tiempo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-agro-border/50">
              {datos.slice().reverse().map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-gray-300">
                    {String(item.id_dispositivo || "invernadero_prueba_01")}
                  </td>
                  <td className="py-3 px-4 font-semibold text-agro-orange">
                    {item.temperatura}°C
                  </td>
                  <td className="py-3 px-4 text-blue-400 font-medium">
                    {item.humedad_ambiente}%
                  </td>
                  <td className="py-3 px-4 text-agro-green font-medium">
                    {item.humedad_suelo}%
                  </td>
                  <td className="py-3 px-4 text-amber-300 font-medium">
                    {item.intensidad_luz_lux != null ? `${item.intensidad_luz_lux} lx` : "--"}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {item.estado_bomba === true ? "Encendida" : item.estado_bomba === false ? "Apagada" : "--"}
                  </td>
                  <td className="py-3 px-4 text-gray-400 font-mono">
                    {item.creado_en ? new Date(item.creado_en).toLocaleString() : String(item.tiempo || "--")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
>>>>>>> Stashed changes
    </div>
  );
}
