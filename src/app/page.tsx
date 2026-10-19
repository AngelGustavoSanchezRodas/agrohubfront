"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { Thermometer, Droplets, Leaf } from "lucide-react";
import { obtenerDatosGrafica, alternarBombaAgua } from "@/services/api";
import { TelemetriaEnVivo, DatosTelemetriaHistorica } from "@/types";
import {
  TarjetaSensor,
  ControlActuador,
  GraficaReciente,
} from "@/componentes/telemetria";

export default function Dashboard() {
  const [dispositivoActual, setDispositivoActual] = useState<string>("invernadero_prueba_01");
  const [listaNodos, setListaNodos] = useState<string[]>(["invernadero_prueba_01"]);
  const [datos, setDatos] = useState<TelemetriaEnVivo>({
    temperatura: "--.-",
    humedad_ambiente: "--",
    humedad_suelo: "--",
    estado_bomba: false,
  });
  const [historial, setHistorial] = useState<DatosTelemetriaHistorica[]>([]);
  const [cargandoGrafica, setCargandoGrafica] = useState<boolean>(true);
  const [ejecutandoBomba, setEjecutandoBomba] = useState<boolean>(false);
  const [mensajeBomba, setMensajeBomba] = useState<string | null>(null);

  // 1. Deteccion de nodos en Firebase RTDB
  useEffect(() => {
    const todosInvernaderosRef = ref(db, "invernadero");
    const unsubscribe = onValue(todosInvernaderosRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val() as Record<string, unknown>;
        const keys = Object.keys(val);
        if (keys.length > 0) {
          setListaNodos(keys);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Escucha reactiva en vivo del nodo seleccionado
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

  // 3. Cargar tendencia reciente (Supabase o Firebase)
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

  const toggleBomba = async () => {
    setEjecutandoBomba(true);
    setMensajeBomba(null);
    try {
      const nuevoEstado = !datos.estado_bomba;
      await alternarBombaAgua(nuevoEstado);
      setMensajeBomba(`Comando transmitido: Bomba de agua ${nuevoEstado ? "ENCENDIDA" : "APAGADA"}.`);
    } catch {
      setMensajeBomba("No se pudo contactar con el actuador. Verifique la API Key.");
    } finally {
      setEjecutandoBomba(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Cabecera con selector dinamico de invernadero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Estado en Tiempo Real</h2>
          <p className="text-gray-400 text-sm mt-1">
            Lecturas directas desde el microcontrolador de campo vía Firebase.
          </p>
          {datos.timestamp && (
            <p className="text-xs text-agro-green mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-agro-green animate-pulse"></span>
              Último pulso: {new Date(datos.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>

        {listaNodos.length > 1 && (
          <div className="flex items-center gap-2 bg-agro-dark border border-agro-border p-1.5 rounded-xl text-xs">
            <span className="text-gray-400 px-2 font-medium">Nodo:</span>
            {listaNodos.map((nodo) => (
              <button
                key={nodo}
                onClick={() => setDispositivoActual(nodo)}
                className={`px-3 py-1.5 rounded-lg transition-colors font-mono cursor-pointer ${
                  dispositivoActual === nodo
                    ? "bg-slate-800 text-agro-orange font-semibold border border-agro-orange/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {nodo}
              </button>
            ))}
          </div>
        )}
      </div>

      {mensajeBomba && (
        <div className="p-3 bg-black/60 border border-agro-green text-agro-green text-xs rounded-xl flex items-center justify-between">
          <span>{mensajeBomba}</span>
          <button
            onClick={() => setMensajeBomba(null)}
            className="text-gray-400 hover:text-white text-[11px] underline ml-4 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Tarjetas de Telemetria en Vivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TarjetaSensor
          titulo="Temperatura"
          valor={datos.temperatura}
          unidad="°C"
          subtitulo="Sensor DHT22 / BME280"
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
          subtitulo="Sonda capacitiva de suelo"
          icono={Leaf}
          iconoColorClass="text-agro-green"
        />

        <ControlActuador
          estadoBomba={!!datos.estado_bomba}
          ejecutando={ejecutandoBomba}
          onToggle={toggleBomba}
        />
      </div>

      {/* Grafica de Tendencia Reciente Recharts */}
      <GraficaReciente historial={historial} cargando={cargandoGrafica} />
    </div>
  );
}