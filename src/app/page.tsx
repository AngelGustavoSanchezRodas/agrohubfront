"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { Thermometer, Droplets, Leaf } from "lucide-react";
import { alternarBombaAgua } from "@/services/api";

interface Telemetria {
  temperatura: number | string;
  humedad_ambiente: number | string;
  humedad_suelo: number | string;
  timestamp?: string;
}

export default function Home() {
  const [bombaActiva, setBombaActiva] = useState(false);
  const [cargando, setCargando] = useState(false);

  const manejarControlBomba = async () => {
    setCargando(true);
    try {
      const nuevoEstado = !bombaActiva;
      await alternarBombaAgua(nuevoEstado);
      setBombaActiva(nuevoEstado);
    } catch {
      alert("Fallo al enviar comando al invernadero");
    } finally {
      setCargando(false);
    }
  };

  const [datos, setDatos] = useState<Telemetria>({
    temperatura: "--.-",
    humedad_ambiente: "--",
    humedad_suelo: "--",
  });

  useEffect(() => {
    const invernaderoRef = ref(db, "invernadero/invernadero_prueba_01/estado_actual");

    const unsubscribe = onValue(invernaderoRef, (snapshot) => {
      if (snapshot.exists()) {
        setDatos(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Panel de Control</h2>
        <p className="text-gray-400">Monitoreo general del invernadero en tiempo real.</p>
        {datos.timestamp && (
          <p className="text-xs text-agro-green mt-1">
            Última actualización: {new Date(datos.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tarjeta 1: Temperatura */}
        <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-medium tracking-wide text-sm uppercase">Temperatura</span>
            <Thermometer className="text-agro-orange w-6 h-6" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-white">{datos.temperatura}</span>
            <span className="text-gray-400 text-lg">°C</span>
          </div>
        </div>

        {/* Tarjeta 2: Humedad Ambiental */}
        <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-medium tracking-wide text-sm uppercase">Humedad Amb.</span>
            <Droplets className="text-blue-400 w-6 h-6" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-white">{datos.humedad_ambiente}</span>
            <span className="text-gray-400 text-lg">%</span>
          </div>
        </div>

        {/* Tarjeta 3: Humedad del Suelo */}
        <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-medium tracking-wide text-sm uppercase">Suelo</span>
            <Leaf className="text-amber-600 w-6 h-6" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-white">{datos.humedad_suelo}</span>
            <span className="text-gray-400 text-lg">%</span>
          </div>
        </div>

        {/* Tarjeta 4: Controles Rápidos (Conectada a FastAPI) */}
        <div
          onClick={cargando ? undefined : manejarControlBomba}
          className={`border rounded-xl p-6 flex flex-col justify-center items-center transition-colors ${
            cargando
              ? "bg-gray-800 border-gray-700 cursor-wait opacity-50"
              : bombaActiva
              ? "bg-agro-green border-agro-green cursor-pointer"
              : "bg-agro-orange border-agro-orange cursor-pointer hover:opacity-90"
          }`}
        >
          <span className="text-black font-bold text-lg uppercase tracking-wider mb-1">
            Bomba de Agua
          </span>
          <span className="text-black/80 text-sm font-semibold">
            {cargando ? "PROCESANDO..." : bombaActiva ? "ESTADO: ENCENDIDO" : "ESTADO: APAGADO"}
          </span>
        </div>
      </div>

      <div className="bg-agro-dark border border-agro-border rounded-xl p-6 mt-4 min-h-[300px] flex items-center justify-center">
        <span className="text-gray-500">Aquí irá la gráfica de historial de datos de Supabase...</span>
      </div>
    </div>
  );
}