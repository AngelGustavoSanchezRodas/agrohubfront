"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import {
  Thermometer,
  Droplets,
  Leaf,
  Activity,
  Zap,
  RefreshCw,
  LineChart as LineChartIcon,
} from "lucide-react";
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
  obtenerDatosGrafica,
  alternarBombaAgua,
  DatosTelemetriaHistorica,
} from "@/services/api";

interface Telemetria {
  temperatura: number | string;
  humedad_ambiente: number | string;
  humedad_suelo: number | string;
  estado_bomba?: boolean;
  timestamp?: string;
  luz_uv?: number;
  radiacion_solar?: number;
}

export default function Dashboard() {
  const [dispositivoActual, setDispositivoActual] = useState<string>("invernadero_prueba_01");
  const [listaNodos, setListaNodos] = useState<string[]>(["invernadero_prueba_01"]);
  const [datos, setDatos] = useState<Telemetria>({
    temperatura: "--.-",
    humedad_ambiente: "--",
    humedad_suelo: "--",
    estado_bomba: false,
  });
  const [historial, setHistorial] = useState<DatosTelemetriaHistorica[]>([]);
  const [cargandoGrafica, setCargandoGrafica] = useState<boolean>(true);
  const [ejecutandoBomba, setEjecutandoBomba] = useState<boolean>(false);
  const [mensajeBomba, setMensajeBomba] = useState<string | null>(null);

  // 1. Deteccion de nodos disponibles en Firebase
  useEffect(() => {
    const todosInvernaderosRef = ref(db, "invernadero");
    const unsubscribe = onValue(todosInvernaderosRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val() as Record<string, unknown>;
        const keys = Object.keys(val);
        if (keys.length > 0) {
          setListaNodos(keys);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Escucha reactiva en tiempo real al nodo seleccionado en Firebase
  useEffect(() => {
    const invernaderoRef = ref(db, `invernadero/${dispositivoActual}/estado_actual`);

    const unsubscribe = onValue(invernaderoRef, (snapshot) => {
      if (snapshot.exists()) {
        setDatos(snapshot.val() as Telemetria);
      } else {
        setDatos({
          temperatura: "--.-",
          humedad_ambiente: "--",
          humedad_suelo: "--",
          estado_bomba: false,
        });
      }
    });

    return () => unsubscribe();
  }, [dispositivoActual]);

  // 3. Cargar tendencia reciente real desde PostgreSQL (Supabase)
  useEffect(() => {
    let cancelado = false;

    obtenerDatosGrafica(15, dispositivoActual)
      .then((res) => {
        if (!cancelado) {
          setHistorial(Array.isArray(res) ? [...res].reverse() : []);
          setCargandoGrafica(false);
        }
      })
      .catch(() => {
        if (!cancelado) {
          setHistorial([]);
          setCargandoGrafica(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [dispositivoActual]);

  const toggleBomba = async () => {
    setEjecutandoBomba(true);
    setMensajeBomba(null);
    try {
      const nuevoEstado = !datos.estado_bomba;
      await alternarBombaAgua(nuevoEstado);
      setMensajeBomba(`Comando transmitido: Bomba de agua ${nuevoEstado ? "ENCENDIDA" : "APAGADA"}.`);
    } catch {
      setMensajeBomba("No se pudo contactar con el actuador. Verifique la API Key.");
    } finally {
      setEjecutandoBomba(false);
    }
  };

  const datosGrafica = historial.map((d) => {
    let tiempo = typeof d.tiempo === "string" ? d.tiempo : "";
    if (!tiempo && d.creado_en) {
      try {
        tiempo = new Date(d.creado_en).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        tiempo = "--:--";
      }
    }
    return {
      tiempo: tiempo || "00:00",
      temperatura: Number(d.temperatura) || 0,
      humedad: Number(d.humedad_ambiente) || 0,
      humedad_suelo: Number(d.humedad_suelo) || 0,
    };
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Cabecera con selector dinamico de invernadero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Estado en Tiempo Real</h2>
          <p className="text-gray-400 text-sm mt-1">Lecturas directas desde el microcontrolador de campo vía Firebase.</p>
          {datos.timestamp && (
            <p className="text-xs text-agro-green mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-agro-green animate-pulse"></span>
              Último pulso: {new Date(datos.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>

        {listaNodos.length > 1 && (
          <div className="flex items-center gap-2 bg-agro-dark border border-agro-border p-1.5 rounded-xl text-xs">
            <span className="text-gray-400 px-2 font-medium">Nodo:</span>
            {listaNodos.map((nodo) => (
              <button
                key={nodo}
                onClick={() => setDispositivoActual(nodo)}
                className={`px-3 py-1.5 rounded-lg transition-colors font-mono cursor-pointer ${
                  dispositivoActual === nodo
                    ? "bg-slate-800 text-agro-orange font-semibold border border-agro-orange/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {nodo}
              </button>
            ))}
          </div>
        )}
      </div>

      {mensajeBomba && (
        <div className="p-3 bg-black/60 border border-agro-green text-agro-green text-xs rounded-xl flex items-center justify-between">
          <span>{mensajeBomba}</span>
          <button
            onClick={() => setMensajeBomba(null)}
            className="text-gray-400 hover:text-white text-[11px] underline ml-4 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Tarjetas de Telemetria en Vivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tarjeta 1: Temperatura */}
        <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-medium tracking-wide text-xs uppercase">Temperatura</span>
            <Thermometer className="text-agro-orange w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold text-white">{datos.temperatura}</span>
            <span className="text-gray-500 text-lg">°C</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-3 block">Sensor DHT22 / BME280</span>
        </div>

        {/* Tarjeta 2: Humedad Ambiental */}
        <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-medium tracking-wide text-xs uppercase">Humedad Amb.</span>
            <Droplets className="text-blue-400 w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold text-white">{datos.humedad_ambiente}</span>
            <span className="text-gray-500 text-lg">%</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-3 block">Humedad relativa del aire</span>
        </div>

        {/* Tarjeta 3: Humedad del Suelo */}
        <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-medium tracking-wide text-xs uppercase">Sustrato</span>
            <Leaf className="text-agro-green w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold text-white">{datos.humedad_suelo}</span>
            <span className="text-gray-500 text-lg">%</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-3 block">Sonda capacitiva de suelo</span>
        </div>

        {/* Tarjeta 4: Estado del Actuador */}
        <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-medium tracking-wide text-xs uppercase">Bomba de Agua</span>
            <Activity className={datos.estado_bomba ? "text-agro-green w-5 h-5" : "text-gray-600 w-5 h-5"} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider border ${
              datos.estado_bomba 
                ? "bg-agro-green/10 text-agro-green border-agro-green/20" 
                : "bg-gray-800 text-gray-400 border-gray-700"
            }`}>
              {datos.estado_bomba ? "OPERANDO" : "EN ESPERA"}
            </span>

            <button
              onClick={toggleBomba}
              disabled={ejecutandoBomba}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-agro-orange" />
              <span>{ejecutandoBomba ? "..." : datos.estado_bomba ? "Apagar" : "Encender"}</span>
            </button>
          </div>
          <span className="text-[11px] text-gray-500 mt-3 block">Control de relé por API</span>
        </div>
      </div>

      {/* Grafica de Tendencia Reciente Recharts (Exclusivamente con datos de Supabase) */}
      <div className="bg-agro-dark border border-agro-border rounded-xl p-6 h-96 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
            <LineChartIcon className="w-4 h-4 text-agro-green" />
            Tendencia Reciente (Supabase)
          </h3>
          <span className="text-xs text-gray-500 font-mono">
            {historial.length} lecturas persistidas
          </span>
        </div>

        <div className="flex-1 w-full min-h-[260px] flex items-center justify-center">
          {cargandoGrafica ? (
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-agro-green" />
              <span>Consultando historial reciente...</span>
            </div>
          ) : historial.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-800 rounded-lg text-gray-500 max-w-md">
              <LineChartIcon className="w-8 h-8 opacity-25 text-agro-green mb-2" />
              <p className="text-xs font-medium text-gray-400">Sin historial en base de datos</p>
              <p className="text-[11px] text-gray-500 mt-1">
                La curva de tendencia se generará automáticamente en cuanto el backend reciba y persista las primeras lecturas del microcontrolador.
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
    </div>
  );
}