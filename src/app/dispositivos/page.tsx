"use client";

import { useState, useEffect, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { Cpu, Search, Filter, RefreshCw, Plus, ShieldCheck, AlertCircle } from "lucide-react";
import { obtenerDispositivos, registrarDispositivo } from "@/services/api";
import { DispositivoBackend, DispositivoConsolidado, NodoFirebase } from "@/types";
import {
  MetricasDispositivos,
  TablaDispositivos,
  ModalRegistrarDispositivo,
} from "@/componentes/dispositivos";

export default function Dispositivos() {
  const [dispositivosBackend, setDispositivosBackend] = useState<DispositivoBackend[]>([]);
  const [nodosFirebase, setNodosFirebase] = useState<Record<string, NodoFirebase>>({});
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "ONLINE" | "OFFLINE">("TODOS");
  const [notificacion, setNotificacion] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState<boolean>(false);

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
        // En caso de error de lectura
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Consolidar informacion real entre Supabase y Firebase
  const dispositivos = useMemo<DispositivoConsolidado[]>(() => {
    const mapa = new Map<string, DispositivoConsolidado>();

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

  const handleRegistrar = async (datosNuevo: {
    id_dispositivo: string;
    nombre: string;
    ubicacion?: string;
  }) => {
    setError(null);
    try {
      await registrarDispositivo(datosNuevo);
      setNotificacion(`Dispositivo "${datosNuevo.id_dispositivo}" registrado con éxito en Supabase.`);
      sincronizarDispositivos();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al registrar el nuevo dispositivo en Supabase."
      );
      throw err;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabecera y acciones */}
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

      {/* Notificaciones */}
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

      {/* Metricas de dispositivos */}
      <MetricasDispositivos
        totalDispositivos={dispositivos.length}
        totalOnline={totalOnline}
        totalOffline={totalOffline}
      />

      {/* Busqueda y filtros */}
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

      {/* Tabla de microcontroladores */}
      <TablaDispositivos dispositivos={dispositivosFiltrados} cargando={cargando} />

      {/* Modal de creacion */}
      <ModalRegistrarDispositivo
        abierto={mostrarModal}
        onCerrar={() => setMostrarModal(false)}
        onRegistrar={handleRegistrar}
      />
    </div>
  );
}
