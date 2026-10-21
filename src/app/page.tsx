"use client";

import { useEffect, useState, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { Thermometer, Droplets, Leaf, Flame } from "lucide-react";
import { obtenerDatosGrafica } from "@/services/api";
import { DISPOSITIVO_ACTIVO } from "@/lib/dispositivos";
import { horaLecturaHeltec } from "@/lib/tiempo";
import { TelemetriaEnVivo, DatosTelemetriaHistorica } from "@/types";
import {
  TarjetaSensor,
  ControlActuador,
  GraficaReciente,
} from "@/componentes/telemetria";

const LECTURA_VACIA: TelemetriaEnVivo = {
  temperatura: "--.-",
  humedad_ambiente: "--",
  humedad_suelo: "--",
  indice_calor: "--.-",
  estado_bomba: false,
};

export default function Dashboard() {
  const [dispositivoActual] = useState<string>(DISPOSITIVO_ACTIVO);
  const [datos, setDatos] = useState<TelemetriaEnVivo>(LECTURA_VACIA);
  const [historial, setHistorial] = useState<DatosTelemetriaHistorica[]>([]);
  const [cargandoGrafica, setCargandoGrafica] = useState<boolean>(true);

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
    if (s < 55.6) return { texto: "Riego Requerido", clase: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
    return { texto: "Sustrato Hidratado", clase: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
  }, [datos.humedad_suelo]);

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
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-agro-border/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Monitoreo en Tiempo Real
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
            Variables agroclimáticas y condiciones del sustrato en el invernadero.
          </p>
        </div>
        {datos.timestamp && (
          <span className="text-xs text-gray-400 self-start sm:self-auto font-mono">
            Última lectura: {horaLecturaHeltec(datos.timestamp)}
          </span>
        )}
      </div>

      {/* Grid de Sensores Ambientales: 2 columnas en movil, 4 en desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <TarjetaSensor
          titulo="Temperatura"
          valor={datos.temperatura ?? "--.-"}
          unidad="°C"
          subtitulo="Temperatura en cultivo"
          icono={Thermometer}
          iconoColorClass="text-agro-orange"
          badgeEstado={badgeTemperatura}
        />
        <TarjetaSensor
          titulo="Humedad Aire"
          valor={datos.humedad_ambiente ?? "--"}
          unidad="%"
          subtitulo="Humedad relativa del aire"
          icono={Droplets}
          iconoColorClass="text-blue-400"
          badgeEstado={badgeHumedadAmb}
        />
        <TarjetaSensor
          titulo="Humedad Suelo"
          valor={datos.humedad_suelo ?? "--"}
          unidad="%"
          subtitulo="Humedad en zona radicular"
          icono={Leaf}
          iconoColorClass="text-agro-green"
          badgeEstado={badgeSustrato}
        />
        <TarjetaSensor
          titulo="Índice de Calor"
          valor={datos.indice_calor ?? "--.-"}
          unidad="°C"
          subtitulo="Sensación térmica en planta"
          icono={Flame}
          iconoColorClass="text-rose-400"
          badgeEstado={badgeIndiceCalor}
        />
      </div>

      {/* Panel de Actuador de Riego y Control */}
      <div className="grid grid-cols-1 gap-6">
        <ControlActuador estadoBomba={!!datos.estado_bomba} />
      </div>

      {/* Grafica de Evolucion Cronologica */}
      <div className="grid grid-cols-1 gap-6">
        <GraficaReciente historial={historial} cargando={cargandoGrafica} />
      </div>
    </div>
  );
}