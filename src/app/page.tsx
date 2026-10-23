"use client";

import { useEffect, useState, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { Cpu } from "lucide-react";
import { obtenerDatosGrafica, obtenerDispositivos } from "@/services/api";
import { obtenerDispositivoActivo, guardarDispositivoActivo } from "@/lib/dispositivos";
import { horaLecturaHeltec } from "@/lib/tiempo";
import { TelemetriaEnVivo, DatosTelemetriaHistorica, DispositivoBackend } from "@/types";
import {
  ControlActuador,
  GraficaReciente,
  PanelTelemetria,
} from "@/componentes/telemetria";

const LECTURA_VACIA: TelemetriaEnVivo = {
  temperatura: "--.-",
  humedad_ambiente: "--",
  humedad_suelo: "--",
  intensidad_luz_lux: "--",
  indice_calor: "--.-",
  estado_bomba: false,
};

export default function Dashboard() {
  const [dispositivos, setDispositivos] = useState<DispositivoBackend[]>([]);
  const [dispositivoActual, setDispositivoActual] = useState<string>(obtenerDispositivoActivo());
  const [datos, setDatos] = useState<TelemetriaEnVivo>(LECTURA_VACIA);
  const [controlBomba, setControlBomba] = useState<{
    accion?: string;
    origen?: string;
    timestamp?: string;
  } | null>(null);
  const [historial, setHistorial] = useState<DatosTelemetriaHistorica[]>([]);
  const [cargandoGrafica, setCargandoGrafica] = useState<boolean>(true);

  // Cargar catalogo real de dispositivos para selector
  useEffect(() => {
    obtenerDispositivos().then((lista) => {
      if (Array.isArray(lista) && lista.length > 0) {
        setDispositivos(lista);
        if (!lista.some((d) => d.id_dispositivo === dispositivoActual)) {
          const primero = lista[0].id_dispositivo;
          setDispositivoActual(primero);
          guardarDispositivoActivo(primero);
        }
      }
    });
  }, [dispositivoActual]);

  // Escuchar estado en tiempo real de Firebase
  useEffect(() => {
    const invernaderoRef = ref(db, `invernadero/${dispositivoActual}/estado_actual`);

    const unsubscribe = onValue(invernaderoRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val() as Record<string, unknown>;
        const temp = Number(val.temperatura);
        const hum = Number(val.humedad_ambiente);
        let indice: number | string | undefined = val.indice_calor as number | string | undefined;

        // Estimacion de confort termico si no viene precalculado
        if (indice === undefined && !isNaN(temp) && !isNaN(hum)) {
          indice = temp >= 26.7 ? Math.round((temp + (hum * 0.1)) * 10) / 10 : temp;
        }

        setDatos({
          temperatura: val.temperatura !== undefined ? Number(val.temperatura).toFixed(1) : "--.-",
          humedad_ambiente: val.humedad_ambiente !== undefined ? Number(val.humedad_ambiente).toFixed(0) : "--",
          humedad_suelo: val.humedad_suelo !== undefined ? Number(val.humedad_suelo).toFixed(0) : "--",
          intensidad_luz_lux: val.intensidad_luz_lux !== undefined ? Number(val.intensidad_luz_lux).toFixed(0) : "--",
          indice_calor: indice !== undefined ? Number(indice).toFixed(1) : "--.-",
          estado_bomba: Boolean(val.estado_bomba),
          timestamp: typeof val.timestamp === "string" ? val.timestamp : undefined,
        });
      } else {
        setDatos(LECTURA_VACIA);
      }
    });

    return () => unsubscribe();
  }, [dispositivoActual]);

  // Escuchar metadatos de control del actuador en Firebase
  useEffect(() => {
    const controlRef = ref(db, `invernadero/${dispositivoActual}/control/bomba`);
    const unsubscribe = onValue(controlRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val() as Record<string, unknown>;
        setControlBomba({
          accion: typeof val.accion === "string" ? val.accion : undefined,
          origen: typeof val.origen === "string" ? val.origen : undefined,
          timestamp: typeof val.timestamp === "string" ? val.timestamp : undefined,
        });
      } else {
        setControlBomba(null);
      }
    });

    return () => unsubscribe();
  }, [dispositivoActual]);

  // Consultar historial
  useEffect(() => {
    let cancelado = false;

    obtenerDatosGrafica(20, dispositivoActual)
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

  // Evaluacion agronomica de estados
  const badgeTemperatura = useMemo(() => {
    const t = Number(datos.temperatura);
    if (isNaN(t)) return undefined;
    if (t < 15) return { texto: "Fresco", clase: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
    if (t > 30) return { texto: "Calor Alto", clase: "bg-red-500/10 text-red-400 border-red-500/30" };
    return { texto: "Óptimo", clase: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
  }, [datos.temperatura]);

  const badgeHumedadAmb = useMemo(() => {
    const h = Number(datos.humedad_ambiente);
    if (isNaN(h)) return undefined;
    if (h < 40) return { texto: "Seco", clase: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
    if (h > 80) return { texto: "Húmedo", clase: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
    return { texto: "Adecuado", clase: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
  }, [datos.humedad_ambiente]);

  const badgeSustrato = useMemo(() => {
    const s = Number(datos.humedad_suelo);
    if (isNaN(s)) return undefined;
    if (datos.estado_bomba) return { texto: "Riego en Curso", clase: "bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse" };
    if (s < 50) return { texto: "Riego Requerido", clase: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
    return { texto: "Sustrato Hidratado", clase: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
  }, [datos.humedad_suelo, datos.estado_bomba]);

  const badgeLuz = useMemo(() => {
    const l = Number(datos.intensidad_luz_lux);
    if (isNaN(l)) return undefined;
    if (l < 5000) return { texto: "Baja Radiación", clase: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
    if (l > 45000) return { texto: "Alta Radiación", clase: "bg-red-500/10 text-red-400 border-red-500/30" };
    return { texto: "Óptimo", clase: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
  }, [datos.intensidad_luz_lux]);

  const badgeIndiceCalor = useMemo(() => {
    const ic = Number(datos.indice_calor);
    const t = Number(datos.temperatura);
    if (isNaN(ic)) return undefined;
    if (ic > 38) return { texto: "Estrés Térmico", clase: "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse" };
    if (ic > 32) return { texto: "Precaución", clase: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
    if (!isNaN(t) && t < 26.7) return { texto: "Confortable", clase: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
    return { texto: "Estable", clase: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
  }, [datos.indice_calor, datos.temperatura]);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto">
      {/* Cabecera Principal con Selector de Estacion Dinamico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-agro-border/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Monitoreo en Tiempo Real
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
            Variables agroclimáticas y condiciones del sustrato en el invernadero.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {dispositivos.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-950 border border-agro-border rounded-xl px-2.5 py-1">
              <Cpu className="w-3.5 h-3.5 text-agro-green shrink-0" />
              <select
                aria-label="Seleccionar estación activa"
                value={dispositivoActual}
                onChange={(e) => {
                  const nuevo = e.target.value;
                  setDispositivoActual(nuevo);
                  guardarDispositivoActivo(nuevo);
                }}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                {dispositivos.map((d) => (
                  <option key={d.id_dispositivo} value={d.id_dispositivo} className="bg-slate-900 text-white">
                    {d.nombre || d.id_dispositivo}
                  </option>
                ))}
              </select>
            </div>
          )}

          {datos.timestamp && (
            <span className="text-xs text-gray-400 font-mono">
              Última lectura: {horaLecturaHeltec(datos.timestamp)}
            </span>
          )}
        </div>
      </div>

      {/* Panel Unificado de Telemetría en Vivo y Perro Guardián */}
      <PanelTelemetria
        datosFirebase={datos}
        badges={{
          temperatura: badgeTemperatura,
          humedadAmb: badgeHumedadAmb,
          sustrato: badgeSustrato,
          luz: badgeLuz,
          indiceCalor: badgeIndiceCalor,
        }}
      />

      {/* Panel de Actuador de Riego y Control */}
      <div className="grid grid-cols-1 gap-6">
        <ControlActuador
          estadoBomba={!!datos.estado_bomba}
          origen={controlBomba?.origen}
          accion={controlBomba?.accion}
          timestamp={controlBomba?.timestamp}
        />
      </div>

      {/* Grafica de Evolucion Cronologica */}
      <div className="grid grid-cols-1 gap-6">
        <GraficaReciente historial={historial} cargando={cargandoGrafica} />
      </div>
    </div>
  );
}