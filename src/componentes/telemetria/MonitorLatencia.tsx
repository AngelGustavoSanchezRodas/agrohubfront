"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { fechaLecturaHeltec } from "@/lib/tiempo";

export interface MonitorLatenciaProps {
  datosFirebase?: {
    timestamp?: string;
  } | null;
  className?: string;
}

// Asumiendo que 'datosFirebase' es el estado donde guardas el JSON recibido por onValue
export default function MonitorLatencia({
  datosFirebase,
  className = "",
}: MonitorLatenciaProps) {
  const [conexionPerdida, setConexionPerdida] = useState(false);

  useEffect(() => {
    if (!datosFirebase?.timestamp) return;

    const verificarConexion = () => {
      // Convertir el timestamp ISO de Firebase a milisegundos
      // Se contempla la conversion con la zona horaria de la estacion Heltec ESP32
      const fecha =
        fechaLecturaHeltec(datosFirebase.timestamp as string) ??
        new Date(datosFirebase.timestamp as string);
      const tiempoLectura = fecha.getTime();
      const tiempoActual = Date.now();

      if (Number.isNaN(tiempoLectura)) {
        setConexionPerdida(true);
        return;
      }

      // Calcular diferencia en minutos
      const diferenciaMinutos = (tiempoActual - tiempoLectura) / 1000 / 60;

      // Actualizar estado si el ESP32 lleva mas de 2 minutos sin enviar datos
      setConexionPerdida(diferenciaMinutos > 2);
    };

    // Ejecutar la validacion cada 30 segundos en segundo plano
    const intervalo = setInterval(verificarConexion, 30000);
    verificarConexion();

    return () => clearInterval(intervalo);
  }, [datosFirebase]);

  return (
    <div
      className={`p-4 rounded-md font-medium text-white transition-colors flex items-center gap-2 ${
        conexionPerdida ? "bg-red-600" : "bg-green-500"
      } ${className}`.trim()}
    >
      {conexionPerdida ? (
        <>
          <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>Señal de hardware perdida</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>En línea y sincronizado</span>
        </>
      )}
    </div>
  );
}

export { MonitorLatencia };
