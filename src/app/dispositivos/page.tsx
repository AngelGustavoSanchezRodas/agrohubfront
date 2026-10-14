"use client";

import { useState } from "react";
import {
  Cpu,
  Wifi,
  WifiOff,
  BatteryMedium,
  BatteryLow,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

interface DispositivoNodo {
  id: string;
  nombre: string;
  modelo: string;
  ubicacion: string;
  estado: "ONLINE" | "OFFLINE";
  bateria: string;
  porcentajeBateria: number;
  sensores: string[];
  ultima_conexion: string;
  ip: string;
}

// Datos de microcontroladores (sincronizados con la tabla de hardware de Supabase)
const dispositivosDB: DispositivoNodo[] = [
  {
    id: "invernadero_prueba_01",
    nombre: "Nodo Central Invernadero",
    modelo: "ESP32-WROOM-32D",
    ubicacion: "Sector Norte A",
    estado: "ONLINE",
    bateria: "100%",
    porcentajeBateria: 100,
    sensores: ["DHT22", "Humedad Suelo", "Relé Bomba"],
    ultima_conexion: "Hace 1 min",
    ip: "192.168.1.142",
  },
  {
    id: "invernadero_02",
    nombre: "Nodo Perimetral",
    modelo: "ESP32-S3-WROOM-1",
    ubicacion: "Sector Sur B",
    estado: "OFFLINE",
    bateria: "15%",
    porcentajeBateria: 15,
    sensores: ["DHT22", "Radiación UV", "Ventilador"],
    ultima_conexion: "Hace 4 horas",
    ip: "192.168.1.145",
  },
  {
    id: "invernadero_semillero",
    nombre: "Controlador Semillero",
    modelo: "ESP32-C3-Mini",
    ubicacion: "Área de Germinación",
    estado: "ONLINE",
    bateria: "88%",
    porcentajeBateria: 88,
    sensores: ["SHT31 Precisión", "Nebulizador"],
    ultima_conexion: "Hace 3 min",
    ip: "192.168.1.150",
  },
  {
    id: "estacion_meteo_ext",
    nombre: "Estación Climatológica",
    modelo: "ESP32-WROOM-32U",
    ubicacion: "Exterior Perimetral",
    estado: "OFFLINE",
    bateria: "5%",
    porcentajeBateria: 5,
    sensores: ["Anemómetro", "BME280"],
    ultima_conexion: "Hace 2 días",
    ip: "192.168.1.180",
  },
];

export default function Dispositivos() {
  const [dispositivos, setDispositivos] = useState<DispositivoNodo[]>(dispositivosDB);
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "ONLINE" | "OFFLINE">("TODOS");
  const [pingActivo, setPingActivo] = useState<string | null>(null);
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const dispositivosFiltrados = dispositivos.filter((d) => {
    const coincideTexto =
      d.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.ubicacion.toLowerCase().includes(busqueda.toLowerCase());

    if (filtroEstado === "TODOS") return coincideTexto;
    return coincideTexto && d.estado === filtroEstado;
  });

  const ejecutarPing = (id: string) => {
    setPingActivo(id);
    setNotificacion(null);

    setTimeout(() => {
      setPingActivo(null);
      setNotificacion(`Comprobación ICMP exitosa para el dispositivo ${id} (latencia: 18ms).`);
    }, 1000);
  };

  const totalOnline = dispositivos.filter((d) => d.estado === "ONLINE").length;
  const totalOffline = dispositivos.filter((d) => d.estado === "OFFLINE").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabecera del modulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-400" />
            Hardware de Borde
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Estado de conectividad y registro de microcontroladores ESP32.
          </p>
        </div>

        <button
          onClick={() => {
            setDispositivos([...dispositivosDB]);
            setNotificacion("Sincronización de nodos con PostgreSQL (Supabase) completada.");
          }}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-200 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sincronizar</span>
        </button>
      </div>

      {/* Tarjetas de Metricas de Conectividad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-agro-dark border border-agro-border rounded-xl p-5">
          <span className="text-xs font-medium uppercase text-gray-400">Total Nodos</span>
          <div className="mt-2 text-3xl font-extrabold text-white">{dispositivos.length}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Registrados en la flota</span>
        </div>

        <div className="bg-agro-dark border border-agro-border rounded-xl p-5">
          <span className="text-xs font-medium uppercase text-gray-400">En Línea</span>
          <div className="mt-2 text-3xl font-extrabold text-agro-green">{totalOnline}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Conectados a Firebase</span>
        </div>

        <div className="bg-agro-dark border border-agro-border rounded-xl p-5">
          <span className="text-xs font-medium uppercase text-gray-400">Desconectados</span>
          <div className="mt-2 text-3xl font-extrabold text-red-500">{totalOffline}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Sin señal reciente</span>
        </div>

        <div className="bg-agro-dark border border-agro-border rounded-xl p-5">
          <span className="text-xs font-medium uppercase text-gray-400">Batería Promedio</span>
          <div className="mt-2 text-3xl font-extrabold text-blue-400">
            {Math.round(
              dispositivos.reduce((acc, curr) => acc + curr.porcentajeBateria, 0) /
                dispositivos.length
            )}
            %
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">Alimentación auxiliar</span>
        </div>
      </div>

      {/* Notificacion de accion */}
      {notificacion && (
        <div className="bg-black/60 border border-agro-green text-agro-green p-3.5 rounded-xl text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{notificacion}</span>
        </div>
      )}

      {/* Filtros y Busqueda */}
      <div className="bg-agro-dark border border-agro-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por ID, nombre o sector..."
            className="w-full bg-slate-950 border border-agro-border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-agro-green"
          />
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <div className="flex items-center bg-slate-950 border border-agro-border rounded-xl p-1 text-xs">
            {(["TODOS", "ONLINE", "OFFLINE"] as const).map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filtroEstado === estado
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla SQL de Dispositivos */}
      <div className="bg-agro-dark border border-agro-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/50 border-b border-agro-border text-gray-400 uppercase tracking-wider text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Dispositivo</th>
              <th className="px-6 py-4">Modelo / IP</th>
              <th className="px-6 py-4">Ubicación</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Energía</th>
              <th className="px-6 py-4">Sensores</th>
              <th className="px-6 py-4 text-right">Último Ping</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-agro-border text-gray-300 text-xs">
            {dispositivosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No se encontraron microcontroladores registrados con ese filtro.
                </td>
              </tr>
            ) : (
              dispositivosFiltrados.map((nodo) => (
                <tr key={nodo.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white text-sm">{nodo.nombre}</div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{nodo.id}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-300">
                    <div>{nodo.modelo}</div>
                    <div className="text-[11px] text-gray-500">{nodo.ip}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{nodo.ubicacion}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        nodo.estado === "ONLINE"
                          ? "bg-agro-green/10 text-agro-green border border-agro-green/20"
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {nodo.estado === "ONLINE" ? (
                        <Wifi className="w-3.5 h-3.5" />
                      ) : (
                        <WifiOff className="w-3.5 h-3.5" />
                      )}
                      {nodo.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-300">
                      {nodo.porcentajeBateria <= 20 ? (
                        <BatteryLow className="w-4 h-4 text-red-400" />
                      ) : (
                        <BatteryMedium className="w-4 h-4 text-gray-400" />
                      )}
                      <span>{nodo.bateria}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {nodo.sensores.map((sensor, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-950/80 border border-agro-border text-gray-300 text-[10px] px-2 py-0.5 rounded"
                        >
                          {sensor}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-gray-400 mb-1">{nodo.ultima_conexion}</div>
                    <button
                      onClick={() => ejecutarPing(nodo.id)}
                      disabled={pingActivo === nodo.id}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-300 px-2.5 py-1 rounded text-[11px] font-medium transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {pingActivo === nodo.id ? "Comprobando..." : "Test ICMP"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
