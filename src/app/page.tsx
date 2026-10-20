"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { Thermometer, Droplets, Leaf, Sun } from "lucide-react";
import { obtenerDatosGrafica } from "@/services/api";
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
  intensidad_luz_lux: "--",
  estado_bomba: false,
};

export default function Dashboard() {
  const [dispositivoActual] = useState<string>("invernadero_prueba_01");
  const [datos, setDatos] = useState<TelemetriaEnVivo>(LECTURA_VACIA);
  const [historial, setHistorial] = useState<DatosTelemetriaHistorica[]>([]);
  const [cargandoGrafica, setCargandoGrafica] = useState<boolean>(true);

  useEffect(() => {
    const invernaderoRef = ref(db, `invernadero/${dispositivoActual}/estado_actual`);

    const unsubscribe = onValue(invernaderoRef, (snapshot) => {
      if (snapshot.exists()) {
        setDatos(snapshot.val() as TelemetriaEnVivo);
      } else {
        setDatos(LECTURA_VACIA);
      }
    });

    return () => unsubscribe();
  }, [dispositivoActual]);

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

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Monitoreo del Cultivo</h2>
        <p className="text-gray-400 text-sm mt-1">
          El Heltec escribe el estado vivo en Firebase y esta pantalla lo muestra tal cual llega.
        </p>
        {datos.timestamp && (
          <p className="text-xs text-agro-green mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-agro-green animate-pulse"></span>
            Última lectura: {horaLecturaHeltec(datos.timestamp)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <TarjetaSensor
          titulo="Temperatura"
          valor={datos.temperatura}
          unidad="°C"
          subtitulo="Temperatura ambiental"
          icono={Thermometer}
          iconoColorClass="text-agro-orange"
        />
        <TarjetaSensor
          titulo="Humedad Amb."
          valor={datos.humedad_ambiente}
          unidad="%"
          subtitulo="Humedad relativa del aire"
          icono={Droplets}
          iconoColorClass="text-blue-400"
        />
        <TarjetaSensor
          titulo="Sustrato"
          valor={datos.humedad_suelo}
          unidad="%"
          subtitulo="Humedad del suelo"
          icono={Leaf}
          iconoColorClass="text-agro-green"
        />
        <TarjetaSensor
          titulo="Luz"
          valor={datos.intensidad_luz_lux ?? "--"}
          unidad="lx"
          subtitulo="Intensidad del TSL2561"
          icono={Sun}
          iconoColorClass="text-amber-300"
        />
        <ControlActuador estadoBomba={!!datos.estado_bomba} />
      </div>

      <GraficaReciente historial={historial} cargando={cargandoGrafica} />
    </div>
  );
}
