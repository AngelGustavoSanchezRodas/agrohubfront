"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { Thermometer, Droplets, Leaf } from "lucide-react";
import { obtenerDatosGrafica } from "@/services/api";
import { TelemetriaEnVivo, DatosTelemetriaHistorica } from "@/types";
import {
  TarjetaSensor,
  ControlActuador,
  GraficaReciente,
} from "@/componentes/telemetria";

export default function Dashboard() {
  const [dispositivoActual] = useState<string>("invernadero_prueba_01");
  const [datos, setDatos] = useState<TelemetriaEnVivo>({
    temperatura: "--.-",
    humedad_ambiente: "--",
    humedad_suelo: "--",
    estado_bomba: false,
  });
  const [historial, setHistorial] = useState<DatosTelemetriaHistorica[]>([]);
  const [cargandoGrafica, setCargandoGrafica] = useState<boolean>(true);

  // Escucha reactiva en vivo de las variables ambientales
  useEffect(() => {
    const invernaderoRef = ref(db, `invernadero/${dispositivoActual}/estado_actual`);

    const unsubscribe = onValue(invernaderoRef, (snapshot) => {
      if (snapshot.exists()) {
        setDatos(snapshot.val() as TelemetriaEnVivo);
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

  // Cargar tendencia de lecturas recientes
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
      {/* Cabecera limpia sin sobreinformación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Monitoreo del Cultivo</h2>
          <p className="text-gray-400 text-sm mt-1">
            Condiciones climáticas y parámetros de humedad del suelo en tiempo real.
          </p>
          {datos.timestamp && (
            <p className="text-xs text-agro-green mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-agro-green animate-pulse"></span>
              Última lectura: {new Date(datos.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Tarjetas de Telemetría en Vivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <ControlActuador
          estadoBomba={!!datos.estado_bomba}
        />
      </div>

      {/* Gráfica de Tendencia Reciente */}
      <GraficaReciente historial={historial} cargando={cargandoGrafica} />
    </div>
  );
}