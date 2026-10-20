const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Esta variable se lee del .env local de Next.js
const API_KEY = process.env.NEXT_PUBLIC_AGROHUB_API_KEY;

export interface DatosTelemetriaHistorica {
  id?: number | string;
  temperatura: number;
  humedad_ambiente: number;
  humedad_suelo: number;
  creado_en: string;
  tiempo?: string;
  [key: string]: unknown;
}

interface RespuestaHistorial {
  status: string;
  total: number;
  datos: DatosTelemetriaHistorica[];
}

export const obtenerDatosGrafica = async (limite?: number): Promise<DatosTelemetriaHistorica[]> => {
  try {
    const url = limite ? `${API_URL}/api/historial?limite=${limite}` : `${API_URL}/api/historial`;
    const respuesta = await fetch(url, {
      headers: {
        "X-API-Key": API_KEY || "",
      },
    });

    if (!respuesta.ok) {
      throw new Error("Error al obtener el historial de telemetria");
    }

    const json = (await respuesta.json()) as RespuestaHistorial;
    return json.datos;
  } catch (error) {
    console.error("Error consultando historial:", error);
    throw error;
  }
};