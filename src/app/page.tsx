"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { Thermometer, Droplets, Leaf, Activity } from "lucide-react";

interface Telemetria {
  temperatura: number | string;
  humedad_ambiente: number | string;
  humedad_suelo: number | string;
  estado_bomba?: boolean;
  timestamp?: string;
}

export default function Dashboard() {
  const [datos, setDatos] = useState<Telemetria>({
    temperatura: "--.-",
    humedad_ambiente: "--",
    humedad_suelo: "--",
    estado_bomba: false,
  });

  useEffect(() => {
    // Escucha pasiva a Firebase
    const invernaderoRef = ref(db, 'invernadero/invernadero_prueba_01/estado_actual');

    const unsubscribe = onValue(invernaderoRef, (snapshot) => {
      if (snapshot.exists()) {
        setDatos(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Estado en Tiempo Real</h2>
        <p className="text-gray-400 text-sm mt-1">Lecturas directas desde el hardware de borde.</p>
        {datos.timestamp && (
          <p className="text-xs text-agro-green mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-agro-green animate-pulse"></span>
            Último pulso: {new Date(datos.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
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

        {/* Tarjeta 2: Humedad Ambiental */}
        <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-medium tracking-wide text-xs uppercase">Humedad Amb.</span>
            <Droplets className="text-blue-400 w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold text-white">{datos.humedad_ambiente}</span>
            <span className="text-gray-500 text-lg">%</span>
          </div>
        </div>

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

      </div>

      {/* Espacio reservado para la vista rápida de la gráfica */}
      <div className="bg-agro-dark border border-agro-border rounded-xl p-6 mt-2 h-96 flex flex-col">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">Tendencia Reciente</h3>
        <div className="flex-1 border border-dashed border-gray-700/50 rounded-lg flex items-center justify-center">
          <span className="text-gray-500 text-sm">El gráfico de área de Recharts se inyectará aquí</span>
        </div>
      </div>

    </div>
  );
}