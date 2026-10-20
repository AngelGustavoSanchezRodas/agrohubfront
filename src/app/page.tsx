"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
<<<<<<< Updated upstream
import { Thermometer, Droplets, Leaf } from "lucide-react";
import { obtenerDatosGrafica } from "@/services/api";
import { TelemetriaEnVivo, DatosTelemetriaHistorica } from "@/types";
import {
  TarjetaSensor,
  ControlActuador,
  GraficaReciente,
} from "@/componentes/telemetria";
=======
import { Thermometer, Droplets, Leaf, Activity, Sun } from "lucide-react";

interface Telemetria {
  temperatura: number | string;
  humedad_ambiente: number | string;
  humedad_suelo: number | string;
  intensidad_luz_lux?: number | string;
  estado_bomba?: boolean;
  timestamp?: string;
}
>>>>>>> Stashed changes

export default function Dashboard() {
  const [dispositivoActual] = useState<string>("invernadero_prueba_01");
  const [datos, setDatos] = useState<TelemetriaEnVivo>({
    temperatura: "--.-",
    humedad_ambiente: "--",
    humedad_suelo: "--",
    intensidad_luz_lux: "--",
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
<<<<<<< Updated upstream
      {/* Cabecera limpia sin sobreinformación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Monitoreo del Cultivo</h2>
          <p className="text-gray-400 text-sm mt-1">
            Condiciones climáticas y parámetros de humedad del suelo en tiempo real.
=======
      
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Estado en Tiempo Real</h2>
        <p className="text-gray-400 text-sm mt-1">El Heltec publica en la API y el panel lee el estado vivo desde Firebase.</p>
        {datos.timestamp && (
          <p className="text-xs text-agro-green mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-agro-green animate-pulse"></span>
            Último pulso: {new Date(datos.timestamp).toLocaleTimeString()}
>>>>>>> Stashed changes
          </p>
          {datos.timestamp && (
            <p className="text-xs text-agro-green mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-agro-green animate-pulse"></span>
              Última lectura: {new Date(datos.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

<<<<<<< Updated upstream
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
=======
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        
        {/* Tarjeta 1: Temperatura */}
        <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-medium tracking-wide text-xs uppercase">Temperatura</span>
            <Thermometer className="text-agro-orange w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold text-white">{datos.temperatura}</span>
            <span className="text-gray-500 text-lg">°C</span>
          </div>
        </div>
>>>>>>> Stashed changes

        <TarjetaSensor
          titulo="Humedad Amb."
          valor={datos.humedad_ambiente}
          unidad="%"
          subtitulo="Humedad relativa del aire"
          icono={Droplets}
          iconoColorClass="text-blue-400"
        />

<<<<<<< Updated upstream
        <TarjetaSensor
          titulo="Sustrato"
          valor={datos.humedad_suelo}
          unidad="%"
          subtitulo="Humedad del suelo"
          icono={Leaf}
          iconoColorClass="text-agro-green"
        />
=======
        {/* Tarjeta 3: Humedad del Suelo */}
        <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-medium tracking-wide text-xs uppercase">Sustrato</span>
            <Leaf className="text-emerald-500 w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold text-white">{datos.humedad_suelo}</span>
            <span className="text-gray-500 text-lg">%</span>
          </div>
        </div>

        <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-medium tracking-wide text-xs uppercase">Luz</span>
            <Sun className="text-amber-300 w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold text-white">{datos.intensidad_luz_lux ?? "--"}</span>
            <span className="text-gray-500 text-lg">lx</span>
          </div>
        </div>

        {/* Tarjeta 4: Estado del Actuador (Solo Lectura) */}
        <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex flex-col">
           <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-medium tracking-wide text-xs uppercase">Bomba de Agua</span>
            <Activity className={datos.estado_bomba ? "text-agro-green w-5 h-5" : "text-gray-600 w-5 h-5"} />
          </div>
          <div className="flex items-center h-full">
             <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider border ${
              datos.estado_bomba 
                ? "bg-agro-green/10 text-agro-green border-agro-green/20" 
                : "bg-gray-800 text-gray-400 border-gray-700"
            }`}>
              {datos.estado_bomba ? "OPERANDO" : "EN ESPERA"}
            </span>
          </div>
        </div>
>>>>>>> Stashed changes

        <ControlActuador
          estadoBomba={!!datos.estado_bomba}
        />
      </div>

      {/* Gráfica de Tendencia Reciente */}
      <GraficaReciente historial={historial} cargando={cargandoGrafica} />
    </div>
  );
}