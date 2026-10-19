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
  AlertCircle,
} from "lucide-react";
import { obtenerDatosGrafica, DatosTelemetriaHistorica } from "@/services/api";

export default function Analitica() {
  const [datos, setDatos] = useState<DatosTelemetriaHistorica[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rango, setRango] = useState<"24h" | "7d">("24h");
  const [limite, setLimite] = useState<number>(24);
  const [dispositivoId, setDispositivoId] = useState<string>("invernadero_prueba_01");

  const consultarHistorial = (cantidad: number, id: string = dispositivoId) => {
    setCargando(true);
    setError(null);
    obtenerDatosGrafica(cantidad, id)
      .then((respuesta) => {
        if (Array.isArray(respuesta) && respuesta.length > 0) {
          // Desplegar cronologicamente de izquierda a derecha
          setDatos([...respuesta].reverse());
        } else {
          setDatos([]);
        }
        setCargando(false);
      })
      .catch((err) => {
        setDatos([]);
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo recuperar el historial de Supabase."
        );
        setCargando(false);
      });
  };

  useEffect(() => {
    let cancelado = false;

    obtenerDatosGrafica(limite, dispositivoId)
      .then((respuesta) => {
        if (!cancelado) {
          if (Array.isArray(respuesta) && respuesta.length > 0) {
            setDatos([...respuesta].reverse());
          } else {
            setDatos([]);
          }
          setCargando(false);
        }
      })
      .catch((err) => {
        if (!cancelado) {
          setDatos([]);
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo conectar con el servicio de historial."
          );
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [limite, dispositivoId]);

  const datosGrafica = useMemo(() => {
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
        fechaCompleta: d.creado_en || "",
        id_dispositivo: d.id_dispositivo || "invernadero_prueba_01",
      };
    });
  }, [datos]);

  const metricas = useMemo(() => {
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
      {/* Cabecera del Modulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <LineChart className="w-6 h-6 text-agro-green" />
            Análisis Histórico
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Tendencias de telemetría extraídas de PostgreSQL (Supabase) o Firebase Realtime.
          </p>
        </div>

        {/* Selector de tiempo, dispositivo y refresco */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
            <span className="text-gray-400 font-mono text-[11px]">Nodo:</span>
            <input
              type="text"
              value={dispositivoId}
              onChange={(e) => setDispositivoId(e.target.value)}
              placeholder="invernadero_prueba_01"
              className="bg-transparent text-white font-mono focus:outline-none w-36 text-xs"
            />
          </div>

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
              <Calendar className="w-4 h-4" /> Filtro ({limite})
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

      {/* Aviso de error en caso de fallo de red o conexion */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
            {datos.length > 0 && <span className="text-gray-400 text-sm">°C</span>}
          </div>
          <span className="text-[11px] text-gray-500 mt-2">
            {datos.length > 0
              ? `Rango: ${metricas.tempMin}°C min / ${metricas.tempMax}°C max`
              : "Sin lecturas registradas"}
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
            {datos.length > 0 && <span className="text-gray-400 text-sm">%</span>}
          </div>
          <span className="text-[11px] text-gray-500 mt-2">
            {datos.length > 0 ? "Régimen agronómico registrado" : "Sin lecturas registradas"}
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
            {datos.length > 0 && <span className="text-gray-400 text-sm">%</span>}
          </div>
          <span className="text-[11px] text-gray-500 mt-2">
            {datos.length > 0 ? "Contenido volumétrico medio" : "Sin lecturas registradas"}
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
            {datos.length > 0
              ? `Origen: ${datos[0]?.origen_dato || "Supabase / Firebase"}`
              : "Esperando lecturas de Supabase o Firebase"}
          </span>
        </div>
      </div>

      {/* Contenedor del Grafico Recharts */}
      <div className="bg-agro-dark border border-agro-border rounded-xl p-6 h-[500px] flex flex-col">
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
          </div>
        </div>

        <div className="flex-1 w-full min-h-[350px] flex items-center justify-center">
          {cargando ? (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-agro-green" />
              <p className="text-xs">Recuperando registros de Supabase o Firebase...</p>
            </div>
          ) : datos.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 max-w-md border border-dashed border-agro-border rounded-xl text-gray-500">
              <LineChart className="w-12 h-12 mb-3 opacity-20 text-agro-green" />
              <p className="text-sm font-medium text-gray-300">
                No hay datos de telemetría registrados aún
              </p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Cuando el microcontrolador ESP32 transmita paquetes hacia el backend o Firebase, las tendencias se dibujarán automáticamente aquí.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={datosGrafica}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  {/* Gradiente Temperatura */}
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  {/* Gradiente Humedad Ambiental */}
                  <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  {/* Gradiente Humedad de Suelo */}
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
                  labelStyle={{
                    color: "#94a3b8",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
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
          )}
        </div>
      </div>

      {/* Tabla Relacional de Registros */}
      <div className="bg-agro-dark border border-agro-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-1">
          Tabla de Telemetría Relacional
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Registros procesados y persistidos en la tabla telemetria_historica de Supabase.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="uppercase bg-slate-950/70 text-gray-400 border-b border-agro-border font-semibold">
              <tr>
                <th className="py-3 px-4">Dispositivo</th>
                <th className="py-3 px-4">Temperatura</th>
                <th className="py-3 px-4">Humedad Amb.</th>
                <th className="py-3 px-4">Suelo</th>
                <th className="py-3 px-4">Origen</th>
                <th className="py-3 px-4">Marca de Tiempo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-agro-border/50">
              {datos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-xs">
                    {cargando
                      ? "Cargando registros..."
                      : "No se encontraron lecturas de telemetría en la base de datos ni en Firebase."}
                  </td>
                </tr>
              ) : (
                datos
                  .slice()
                  .reverse()
                  .map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
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
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700 bg-slate-900 text-gray-300">
                          {item.origen_dato || "Supabase"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 font-mono">
                        {item.creado_en
                          ? new Date(item.creado_en).toLocaleString()
                          : String(item.tiempo || "--")}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
