"use client";

import { useState, useEffect, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import {
  Cpu,
  Wifi,
  WifiOff,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ShieldCheck,
  Radio,
  Thermometer,
  Droplets,
  Leaf,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  obtenerDispositivos,
  registrarDispositivo,
  DispositivoBackend,
} from "@/services/api";

interface DispositivoConsolidado {
  id: string;
  nombre: string;
  ubicacion: string;
  estado: "ONLINE" | "OFFLINE" | "INACTIVO";
  ultimaConexion: string;
  temperatura?: number | string;
  humedadAmbiente?: number | string;
  humedadSuelo?: number | string;
  origen: "Supabase" | "Firebase" | "Híbrido";
}

interface NodoFirebase {
  estado_actual?: {
    temperatura?: number;
    humedad_ambiente?: number;
    humedad_suelo?: number;
    timestamp?: string;
    id_dispositivo?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export default function Dispositivos() {
  const [dispositivosBackend, setDispositivosBackend] = useState<DispositivoBackend[]>([]);
  const [nodosFirebase, setNodosFirebase] = useState<Record<string, NodoFirebase>>({});
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "ONLINE" | "OFFLINE">("TODOS");
  const [notificacion, setNotificacion] = useState<string | null>(null);

  // Estado para el modal de registro manual en Supabase
  const [mostrarModal, setMostrarModal] = useState<boolean>(false);
  const [nuevoId, setNuevoId] = useState<string>("");
  const [nuevoNombre, setNuevoNombre] = useState<string>("");
  const [nuevaUbicacion, setNuevaUbicacion] = useState<string>("");
  const [guardando, setGuardando] = useState<boolean>(false);

  // 1. Cargar dispositivos desde Supabase/FastAPI
  const sincronizarDispositivos = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerDispositivos();
      setDispositivosBackend(Array.isArray(data) ? data : []);
      setNotificacion("Catálogo sincronizado exitosamente con el backend.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al sincronizar con el catálogo de Supabase."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    sincronizarDispositivos();
  }, []);

  // 2. Escuchar nodos en tiempo real desde Firebase RTDB
  useEffect(() => {
    const invernaderosRef = ref(db, "invernadero");
    const unsubscribe = onValue(
      invernaderosRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val() as Record<string, NodoFirebase>;
          setNodosFirebase(val || {});
        } else {
          setNodosFirebase({});
        }
      },
      () => {
        // En caso de error de permisos de Firebase
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Consolidar informacion real entre Supabase y Firebase
  const dispositivos = useMemo<DispositivoConsolidado[]>(() => {
    const mapa = new Map<string, DispositivoConsolidado>();

    // Primero incorporar dispositivos del catálogo de Supabase
    for (const d of dispositivosBackend) {
      mapa.set(d.id_dispositivo, {
        id: d.id_dispositivo,
        nombre: d.nombre || d.id_dispositivo,
        ubicacion: d.ubicacion || "Sin ubicación asignada",
        estado: d.estado_conexion?.toUpperCase() === "ONLINE" ? "ONLINE" : "OFFLINE",
        ultimaConexion: d.fecha_instalacion
          ? new Date(d.fecha_instalacion).toLocaleString()
          : "Sin registro",
        origen: "Supabase",
      });
    }

    // Incorporar o enriquecer con los nodos activos en Firebase
    for (const [id, nodo] of Object.entries(nodosFirebase)) {
      const estadoActual = nodo.estado_actual;
      const tienePulso = !!estadoActual?.timestamp;
      let timestampFormateado = "Sin telemetría";

      let esOnline = false;
      if (estadoActual?.timestamp) {
        try {
          const fechaPulso = new Date(estadoActual.timestamp);
          timestampFormateado = fechaPulso.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
          });
          // Se considera en linea si emitio pulso en los ultimos 30 minutos
          const deltaMinutos = (Date.now() - fechaPulso.getTime()) / (1000 * 60);
          esOnline = deltaMinutos >= 0 && deltaMinutos <= 30;
        } catch {
          timestampFormateado = String(estadoActual.timestamp);
        }
      }

      if (mapa.has(id)) {
        const existente = mapa.get(id)!;
        existente.origen = "Híbrido";
        existente.estado = esOnline ? "ONLINE" : "OFFLINE";
        if (tienePulso) existente.ultimaConexion = timestampFormateado;
        existente.temperatura = estadoActual?.temperatura;
        existente.humedadAmbiente = estadoActual?.humedad_ambiente;
        existente.humedadSuelo = estadoActual?.humedad_suelo;
      } else {
        mapa.set(id, {
          id,
          nombre: `Dispositivo ${id}`,
          ubicacion: "Invernadero en Campo",
          estado: esOnline ? "ONLINE" : "OFFLINE",
          ultimaConexion: timestampFormateado,
          temperatura: estadoActual?.temperatura,
          humedadAmbiente: estadoActual?.humedad_ambiente,
          humedadSuelo: estadoActual?.humedad_suelo,
          origen: "Firebase",
        });
      }
    }

    return Array.from(mapa.values());
  }, [dispositivosBackend, nodosFirebase]);

  // Filtros de busqueda y estado
  const dispositivosFiltrados = useMemo(() => {
    return dispositivos.filter((d) => {
      const coincideTexto =
        d.id.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.ubicacion.toLowerCase().includes(busqueda.toLowerCase());

      if (filtroEstado === "TODOS") return coincideTexto;
      return coincideTexto && d.estado === filtroEstado;
    });
  }, [dispositivos, busqueda, filtroEstado]);

  const totalOnline = dispositivos.filter((d) => d.estado === "ONLINE").length;
  const totalOffline = dispositivos.filter((d) => d.estado === "OFFLINE").length;

  const handleCrearDispositivo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoId.trim() || !nuevoNombre.trim()) return;

    setGuardando(true);
    setError(null);
    try {
      await registrarDispositivo({
        id_dispositivo: nuevoId.trim(),
        nombre: nuevoNombre.trim(),
        ubicacion: nuevaUbicacion.trim() || undefined,
      });
      setNotificacion(`Dispositivo "${nuevoId}" registrado con éxito en Supabase.`);
      setNuevoId("");
      setNuevoNombre("");
      setNuevaUbicacion("");
      setMostrarModal(false);
      sincronizarDispositivos();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al registrar el nuevo dispositivo en Supabase."
      );
    } finally {
      setGuardando(false);
    }
  };

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
            Gestión y monitoreo de microcontroladores ESP32 desde Supabase y Firebase.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setMostrarModal(true)}
            className="flex items-center gap-1.5 bg-agro-green hover:bg-emerald-600 text-black px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nodo</span>
          </button>

          <button
            onClick={sincronizarDispositivos}
            disabled={cargando}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-200 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} />
            <span>Sincronizar</span>
          </button>
        </div>
      </div>

      {/* Notificaciones y Alertas */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notificacion && (
        <div className="bg-black/60 border border-agro-green text-agro-green p-3.5 rounded-xl text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{notificacion}</span>
        </div>
      )}

      {/* Tarjetas de Metricas de Conectividad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-agro-dark border border-agro-border rounded-xl p-5">
          <span className="text-xs font-medium uppercase text-gray-400">Total Nodos</span>
          <div className="mt-2 text-3xl font-extrabold text-white">{dispositivos.length}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Detectados en la infraestructura</span>
        </div>

        <div className="bg-agro-dark border border-agro-border rounded-xl p-5">
          <span className="text-xs font-medium uppercase text-gray-400">En Línea</span>
          <div className="mt-2 text-3xl font-extrabold text-agro-green">{totalOnline}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Con pulsos de telemetría activos</span>
        </div>

        <div className="bg-agro-dark border border-agro-border rounded-xl p-5">
          <span className="text-xs font-medium uppercase text-gray-400">Desconectados</span>
          <div className="mt-2 text-3xl font-extrabold text-red-500">{totalOffline}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Sin reporte en ventana nominal</span>
        </div>

        <div className="bg-agro-dark border border-agro-border rounded-xl p-5">
          <span className="text-xs font-medium uppercase text-gray-400">Fuentes Activas</span>
          <div className="mt-2 text-2xl font-bold text-blue-400 flex items-center gap-2">
            <Radio className="w-5 h-5 text-agro-green" />
            <span>RTDB + PostgreSQL</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">Sincronización bidireccional</span>
        </div>
      </div>

      {/* Filtros y Busqueda */}
      <div className="bg-agro-dark border border-agro-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por ID, nombre o ubicación..."
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

      {/* Tabla Dinámica de Dispositivos */}
      <div className="bg-agro-dark border border-agro-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/50 border-b border-agro-border text-gray-400 uppercase tracking-wider text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Dispositivo</th>
              <th className="px-6 py-4">Ubicación</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Última Telemetría</th>
              <th className="px-6 py-4">Origen</th>
              <th className="px-6 py-4 text-right">Último Reporte</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-agro-border text-gray-300 text-xs">
            {dispositivosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  {cargando
                    ? "Consultando catálogo de hardware..."
                    : "No se encontraron microcontroladores registrados ni detectados en Firebase."}
                </td>
              </tr>
            ) : (
              dispositivosFiltrados.map((nodo) => (
                <tr key={nodo.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white text-sm">{nodo.nombre}</div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{nodo.id}</div>
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
                    {nodo.temperatura !== undefined ? (
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-agro-orange font-medium">
                          <Thermometer className="w-3.5 h-3.5" />
                          {nodo.temperatura}°C
                        </span>
                        <span className="flex items-center gap-1 text-blue-400 font-medium">
                          <Droplets className="w-3.5 h-3.5" />
                          {nodo.humedadAmbiente}%
                        </span>
                        <span className="flex items-center gap-1 text-agro-green font-medium">
                          <Leaf className="w-3.5 h-3.5" />
                          {nodo.humedadSuelo}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">Sin lecturas en vivo</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700 bg-slate-900 text-gray-300">
                      {nodo.origen}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-gray-400 flex items-center justify-end gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{nodo.ultimaConexion}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Registro de Nuevo Microcontrolador */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-agro-dark border border-agro-border rounded-2xl p-6 max-w-md w-full space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-agro-green" />
                Registrar Nuevo Microcontrolador
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Agrega el identificador del hardware al catálogo de public.dispositivos en Supabase.
              </p>
            </div>

            <form onSubmit={handleCrearDispositivo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  ID del Dispositivo
                </label>
                <input
                  type="text"
                  required
                  value={nuevoId}
                  onChange={(e) => setNuevoId(e.target.value)}
                  placeholder="ej: invernadero_02"
                  className="w-full bg-slate-950 border border-agro-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-agro-green font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Nombre Descriptivo
                </label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="ej: Nodo Central Cultivo Tomate"
                  className="w-full bg-slate-950 border border-agro-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-agro-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Ubicación Física (Opcional)
                </label>
                <input
                  type="text"
                  value={nuevaUbicacion}
                  onChange={(e) => setNuevaUbicacion(e.target.value)}
                  placeholder="ej: Sector Sur - Invernadero B"
                  className="w-full bg-slate-950 border border-agro-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-agro-green"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 bg-agro-green hover:bg-emerald-600 text-black font-bold rounded-xl text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {guardando ? "Registrando..." : "Guardar en Supabase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
