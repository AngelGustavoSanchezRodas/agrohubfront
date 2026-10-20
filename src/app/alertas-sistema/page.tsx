"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { obtenerAlertas, resolverAlerta } from "@/services/api";
import { esAlertaSistema } from "@/lib/cultivos";
import { DISPOSITIVO_ACTIVO } from "@/lib/dispositivos";
import { AlertaAgronomica } from "@/types";

export default function AlertasSistema() {
  const [cargandoAlertas, setCargandoAlertas] = useState(true);
  const [alertas, setAlertas] = useState<AlertaAgronomica[]>([]);
  const [error, setError] = useState<string | null>(null);

  const alertasSistema = useMemo(
    () =>
      alertas.filter(
        (a) =>
          esAlertaSistema(a.tipo_riesgo) &&
          (!a.id_dispositivo || a.id_dispositivo === DISPOSITIVO_ACTIVO)
      ),
    [alertas]
  );

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
          ? "No se pudo consultar la API. Las alertas del sistema no están disponibles."
          : mensaje || "No se pudieron consultar las alertas."
      );
    } finally {
      setCargandoAlertas(false);
    }
  };

  useEffect(() => {
    cargarAlertas();
  }, []);

  const marcarResuelta = async (idAlerta: number) => {
    setError(null);
    try {
      await resolverAlerta(idAlerta);
      await cargarAlertas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo resolver la alerta.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-agro-border pb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-agro-orange" />
          Alertas del sistema
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Señales automáticas por umbrales del Heltec (suelo, calor, luz diurna, hongos). El
          diagnóstico por cultivo está en Diagnósticos IA.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {cargandoAlertas ? (
          <p className="text-sm text-gray-400">Consultando alertas...</p>
        ) : error && alertasSistema.length === 0 ? null : alertasSistema.length === 0 ? (
          <p className="text-sm text-gray-400">
            No hay alertas de umbral para la estación {DISPOSITIVO_ACTIVO}.
          </p>
        ) : (
          alertasSistema.map((alerta) => (
            <article
              key={alerta.id}
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
                    onClick={() => marcarResuelta(alerta.id)}
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
