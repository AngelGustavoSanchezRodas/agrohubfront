"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { obtenerAlertas, resolverAlerta } from "@/services/api";
import { AlertaAgronomica } from "@/types";

export default function AlertasSistema() {
  const [cargandoAlertas, setCargandoAlertas] = useState(true);
  const [alertas, setAlertas] = useState<AlertaAgronomica[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstacion, setFiltroEstacion] = useState<string>("TODAS");

  const estacionesDisponibles = useMemo(() => {
    const setIds = new Set<string>();
    for (const a of alertas) {
      if (a.id_dispositivo) setIds.add(a.id_dispositivo);
    }
    return Array.from(setIds);
  }, [alertas]);

  const alertasFiltradas = useMemo(() => {
    if (filtroEstacion === "TODAS") return alertas;
    return alertas.filter((a) => a.id_dispositivo === filtroEstacion);
  }, [alertas, filtroEstacion]);

  const cargarAlertas = async () => {
    setCargandoAlertas(true);
    setError(null);
    try {
      const data = await obtenerAlertas();
      setAlertas(data);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "";
      setError(
        mensaje === "Failed to fetch"
          ? "No se pudo consultar la API ni Firebase. Las alertas no están disponibles."
          : mensaje || "No se pudieron consultar las alertas."
      );
    } finally {
      setCargandoAlertas(false);
    }
  };

  useEffect(() => {
    let cancelado = false;

    obtenerAlertas()
      .then((data) => {
        if (!cancelado) {
          setAlertas(data);
          setCargandoAlertas(false);
        }
      })
      .catch((err) => {
        if (!cancelado) {
          const mensaje = err instanceof Error ? err.message : "";
          setError(
            mensaje === "Failed to fetch"
              ? "No se pudo consultar la API ni Firebase. Las alertas no están disponibles."
              : mensaje || "No se pudieron consultar las alertas."
          );
          setCargandoAlertas(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const marcarResuelta = async (idAlerta: number, idDispositivo?: string | null) => {
    setError(null);
    try {
      await resolverAlerta(idAlerta, idDispositivo || undefined);
      await cargarAlertas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo resolver la alerta.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-agro-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-agro-orange" />
            Alertas del sistema
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Monitoreo continuo de condiciones críticas registradas en las estaciones de campo.
          </p>
        </div>

        {estacionesDisponibles.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Estación:</span>
            <select
              value={filtroEstacion}
              onChange={(e) => setFiltroEstacion(e.target.value)}
              className="bg-slate-950 border border-agro-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-agro-green"
            >
              <option value="TODAS">Todas las estaciones</option>
              {estacionesDisponibles.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {cargandoAlertas ? (
          <p className="text-sm text-gray-400">Consultando alertas...</p>
        ) : error && alertasFiltradas.length === 0 ? null : alertasFiltradas.length === 0 ? (
          <p className="text-sm text-gray-400">
            No se registran alertas activas de riesgo para el cultivo.
          </p>
        ) : (
          alertasFiltradas.map((alerta) => (
            <article
              key={`${alerta.id_dispositivo || "global"}-${alerta.id}`}
              className="bg-agro-dark border border-agro-border rounded-xl p-5 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-white">{alerta.tipo_riesgo}</span>
                  <span className="text-gray-500">{alerta.severidad}</span>
                  <span className="text-gray-500">{alerta.estado}</span>
                </div>
                {alerta.estado === "ACTIVA" && (
                  <button
                    onClick={() => marcarResuelta(alerta.id, alerta.id_dispositivo)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-agro-border text-gray-300 hover:text-white"
                  >
                    Marcar resuelta
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-300">{alerta.mensaje_diagnostico}</p>
              <p className="text-[11px] text-gray-500">
                {alerta.id_dispositivo || "Sin dispositivo"}
                {alerta.creado_en ? ` · ${new Date(alerta.creado_en).toLocaleString()}` : ""}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
