"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  LineChart,
  Calendar,
  RefreshCw,
  Thermometer,
  Droplets,
  Leaf,
  Layers,
} from "lucide-react";
import { obtenerDatosGrafica, DatosTelemetriaHistorica } from "@/services/api";

// Datos de prueba (fallback en caso de que el backend local aun no tenga registros)
const mockData: DatosTelemetriaHistorica[] = [
  { tiempo: "08:00", temperatura: 22, humedad_ambiente: 65, humedad_suelo: 58, creado_en: "2026-10-14T08:00:00Z", id_dispositivo: "invernadero_prueba_01" },
  { tiempo: "09:00", temperatura: 24, humedad_ambiente: 62, humedad_suelo: 56, creado_en: "2026-10-14T09:00:00Z", id_dispositivo: "invernadero_prueba_01" },
  { tiempo: "10:00", temperatura: 26, humedad_ambiente: 58, humedad_suelo: 54, creado_en: "2026-10-14T10:00:00Z", id_dispositivo: "invernadero_prueba_01" },
  { tiempo: "11:00", temperatura: 28, humedad_ambiente: 55, humedad_suelo: 52, creado_en: "2026-10-14T11:00:00Z", id_dispositivo: "invernadero_prueba_01" },
  { tiempo: "12:00", temperatura: 30, humedad_ambiente: 50, humedad_suelo: 50, creado_en: "2026-10-14T12:00:00Z", id_dispositivo: "invernadero_prueba_01" },
  { tiempo: "13:00", temperatura: 31, humedad_ambiente: 48, humedad_suelo: 48, creado_en: "2026-10-14T13:00:00Z", id_dispositivo: "invernadero_prueba_01" },
  { tiempo: "14:00", temperatura: 31, humedad_ambiente: 45, humedad_suelo: 46, creado_en: "2026-10-14T14:00:00Z", id_dispositivo: "invernadero_prueba_01" },
];

export default function Analitica() {
  const [datos, setDatos] = useState<DatosTelemetriaHistorica[]>(mockData);
  const [cargando, setCargando] = useState<boolean>(true);
  const [usandoMock, setUsandoMock] = useState<boolean>(false);
  const [rango, setRango] = useState<"24h" | "7d">("24h");
  const [limite, setLimite] = useState<number>(24);

  const consultarHistorial = (cantidad: number) => {
    setCargando(true);
    obtenerDatosGrafica(cantidad)
      .then((respuesta) => {
        if (respuesta && respuesta.length > 0) {
          // Invertir orden para desplegar cronologicamente de izquierda a derecha
          setDatos([...respuesta].reverse());
          setUsandoMock(false);
        } else {
          setDatos(mockData);
          setUsandoMock(true);
        }
        setCargando(false);
      })
      .catch(() => {
        setDatos(mockData);
        setUsandoMock(true);
        setCargando(false);
      });
  };

  useEffect(() => {
    let cancelado = false;

    obtenerDatosGrafica(limite)
      .then((respuesta) => {
        if (!cancelado) {
          if (respuesta && respuesta.length > 0) {
            setDatos([...respuesta].reverse());
            setUsandoMock(false);
          } else {
            setDatos(mockData);
            setUsandoMock(true);
          }
          setCargando(false);
        }
      })
      .catch(() => {
        if (!cancelado) {
          setDatos(mockData);
          setUsandoMock(true);
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [limite]);

  const datosGrafica = useMemo(() => {
    return datos.map((d) => {
      let etiquetaTiempo = typeof d.tiempo === "string" ? d.tiempo : "";
      if (!etiquetaTiempo && d.creado_en) {
        try {
          const fecha = new Date(d.creado_en);
          etiquetaTiempo = fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch {
          etiquetaTiempo = "--:--";
        }
      }
      return {
        tiempo: etiquetaTiempo || "00:00",
        temperatura: Number(d.temperatura) || 0,
        humedad: Number(d.humedad_ambiente) || 0,
        humedad_suelo: Number(d.humedad_suelo) || 0,
        fechaCompleta: d.creado_en || "",
        id_dispositivo: d.id_dispositivo || "invernadero_01",
      };
    });
  }, [datos]);

  const metricas = useMemo(() => {
    if (!datos.length) {
      return {
        tempPromedio: "0",
        tempMax: "0",
        tempMin: "0",
        humAmbPromedio: "0",
        humSueloPromedio: "0",
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
      {/* Cabecera del Modulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <LineChart className="w-6 h-6 text-agro-green" />
            Análisis Histórico
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Tendencias de telemetría extraídas de PostgreSQL (Supabase).
          </p>
        </div>

        {/* Selector de tiempo y refresco */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-sm">
            <button
              onClick={() => {
                setRango("24h");
                setLimite(24);
              }}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                rango === "24h"
                  ? "bg-slate-700 text-white shadow-sm font-medium"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              24h
            </button>
            <button
              onClick={() => {
                setRango("7d");
                setLimite(50);
              }}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                rango === "7d"
                  ? "bg-slate-700 text-white shadow-sm font-medium"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              7d
            </button>
            <button
              onClick={() => setLimite((prev) => (prev === 24 ? 50 : 24))}
              className="px-3 py-1 text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Calendar className="w-4 h-4" /> Filtro
            </button>
          </div>

          <button
            onClick={() => consultarHistorial(limite)}
            disabled={cargando}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-300 px-3.5 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Metricas Resumidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-agro-dark border border-agro-border rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs uppercase font-medium">
            <span>Temperatura Promedio</span>
            <Thermometer className="w-5 h-5 text-agro-orange" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {metricas.tempPromedio}
            </span>
            <span className="text-gray-400 text-sm">°C</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-2">
            Rango: {metricas.tempMin}°C min / {metricas.tempMax}°C max
          </span>
        </div>

        <div className="bg-agro-dark border border-agro-border rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs uppercase font-medium">
            <span>Humedad Ambiental Promedio</span>
            <Droplets className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {metricas.humAmbPromedio}
            </span>
            <span className="text-gray-400 text-sm">%</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-2">
            Régimen óptimo de transpiración
          </span>
        </div>

        <div className="bg-agro-dark border border-agro-border rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs uppercase font-medium">
            <span>Humedad de Sustrato</span>
            <Leaf className="w-5 h-5 text-agro-green" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {metricas.humSueloPromedio}
            </span>
            <span className="text-gray-400 text-sm">%</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-2">
            Lectura media volumétrica
          </span>
        </div>

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
                  <td className="py-3 px-4 text-gray-400 font-mono">
                    {item.creado_en ? new Date(item.creado_en).toLocaleString() : String(item.tiempo || "--")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
