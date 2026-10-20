"use client";

import { useState, useEffect, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { Cpu, Search, Filter, RefreshCw, AlertCircle } from "lucide-react";
import { obtenerDispositivos } from "@/services/api";
import { fechaLecturaHeltec, lecturaReciente } from "@/lib/tiempo";
import { DISPOSITIVO_ACTIVO, esNodoObsoleto } from "@/lib/dispositivos";
import { DispositivoBackend, DispositivoConsolidado, NodoFirebase } from "@/types";
import {
  MetricasDispositivos,
  TablaDispositivos,
} from "@/componentes/dispositivos";

export default function Dispositivos() {
  const [dispositivosBackend, setDispositivosBackend] = useState<DispositivoBackend[]>([]);
  const [nodosFirebase, setNodosFirebase] = useState<Record<string, NodoFirebase>>({});
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "ONLINE" | "OFFLINE">("TODOS");

  // Cargar catálogo de estaciones activas
  const sincronizarDispositivos = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerDispositivos();
      setDispositivosBackend(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo sincronizar el estado de las estaciones."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    sincronizarDispositivos();
  }, []);

  // Escuchar estado en tiempo real de estaciones
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
        // En caso de interrupción en la conexión
      }
    );

    return () => unsubscribe();
  }, []);

  // Consolidar información real de estaciones
  const dispositivos = useMemo<DispositivoConsolidado[]>(() => {
    const mapa = new Map<string, DispositivoConsolidado>();

    for (const d of dispositivosBackend) {
      if (esNodoObsoleto(d.id_dispositivo)) {
        continue;
      }
      mapa.set(d.id_dispositivo, {
        id: d.id_dispositivo,
        nombre: d.nombre || d.id_dispositivo,
        ubicacion: d.ubicacion || "Sin ubicación registrada",
        estado: d.estado_conexion?.toUpperCase() === "ONLINE" ? "ONLINE" : "OFFLINE",
        ultimaConexion: d.fecha_instalacion
          ? new Date(d.fecha_instalacion).toLocaleString()
          : "Sin registro",
        origen: "Supabase",
      });
    }

    for (const [id, nodo] of Object.entries(nodosFirebase)) {
      if (esNodoObsoleto(id)) {
        continue;
      }
      const estadoActual = nodo.estado_actual;
      const tienePulso = !!estadoActual?.timestamp;
      let timestampFormateado = "Sin telemetría";

      let esOnline = false;
      if (estadoActual?.timestamp) {
        const fechaPulso = fechaLecturaHeltec(estadoActual.timestamp);
        timestampFormateado = fechaPulso
          ? fechaPulso.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
            })
          : String(estadoActual.timestamp);
        esOnline = lecturaReciente(estadoActual.timestamp);
      }

      if (mapa.has(id)) {
        const existente = mapa.get(id)!;
        existente.estado = esOnline ? "ONLINE" : "OFFLINE";
        if (tienePulso) existente.ultimaConexion = timestampFormateado;
        existente.temperatura = estadoActual?.temperatura;
        existente.humedadAmbiente = estadoActual?.humedad_ambiente;
        existente.humedadSuelo = estadoActual?.humedad_suelo;
      } else {
        mapa.set(id, {
          id,
          nombre: id,
          ubicacion: "Sin ubicación registrada",
          estado: esOnline ? "ONLINE" : "OFFLINE",
          ultimaConexion: timestampFormateado,
          temperatura: estadoActual?.temperatura,
          humedadAmbiente: estadoActual?.humedad_ambiente,
          humedadSuelo: estadoActual?.humedad_suelo,
          origen: "Firebase",
        });
      }
    }

    return Array.from(mapa.values()).sort((a, b) => {
      if (a.id === DISPOSITIVO_ACTIVO) return -1;
      if (b.id === DISPOSITIVO_ACTIVO) return 1;
      return a.id.localeCompare(b.id);
    });
  }, [dispositivosBackend, nodosFirebase]);

  const dispositivosFiltrados = useMemo(() => {
    return dispositivos.filter((d) => {
      const coincideTexto =
        d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.ubicacion.toLowerCase().includes(busqueda.toLowerCase());

      if (filtroEstado === "TODOS") return coincideTexto;
      return coincideTexto && d.estado === filtroEstado;
    });
  }, [dispositivos, busqueda, filtroEstado]);

  const totalOnline = dispositivos.filter((d) => d.estado === "ONLINE").length;
  const totalOffline = dispositivos.filter((d) => d.estado === "OFFLINE").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabecera limpia */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-400" />
            Estaciones de Monitoreo
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Estado de conectividad y variables ambientales de los sensores instalados en campo.
          </p>
        </div>

        <button
          onClick={sincronizarDispositivos}
          disabled={cargando}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-200 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin text-agro-green" : ""}`} />
          <span>Sincronizar</span>
        </button>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Métricas de estaciones */}
      <MetricasDispositivos
        totalDispositivos={dispositivos.length}
        totalOnline={totalOnline}
        totalOffline={totalOffline}
      />

      {/* Búsqueda y filtros */}
      <div className="bg-agro-dark border border-agro-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o ubicación..."
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
                {estado === "TODOS" ? "Todas" : estado === "ONLINE" ? "En Línea" : "Inactivas"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de estaciones */}
      <TablaDispositivos dispositivos={dispositivosFiltrados} cargando={cargando} />
    </div>
  );
}
