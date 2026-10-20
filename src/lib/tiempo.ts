const ZONA_HELTEC = "-06:00";
const SELLO_LOCAL_HELTEC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

export function fechaLecturaHeltec(timestamp: string): Date | null {
  const conZona = timestamp.endsWith("Z")
    ? `${timestamp.slice(0, -1)}${ZONA_HELTEC}`
    : timestamp;
  const fecha = new Date(conZona);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function fechaLectura(timestamp: string): Date | null {
  if (SELLO_LOCAL_HELTEC.test(timestamp)) {
    return fechaLecturaHeltec(timestamp);
  }
  const fecha = new Date(timestamp);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function etiquetaLectura(
  timestamp: string,
  opciones?: Intl.DateTimeFormatOptions
): string {
  const fecha = fechaLectura(timestamp);
  if (!fecha) {
    return timestamp;
  }
  return opciones ? fecha.toLocaleString(undefined, opciones) : fecha.toLocaleString();
}

export function horaLecturaHeltec(timestamp: string): string {
  const fecha = fechaLecturaHeltec(timestamp);
  return fecha ? fecha.toLocaleTimeString() : timestamp;
}

export function lecturaReciente(timestamp: string | undefined, minutosMaximos = 2): boolean {
  if (!timestamp) {
    return false;
  }
  const fecha = fechaLecturaHeltec(timestamp);
  if (!fecha) {
    return false;
  }
  const minutos = (Date.now() - fecha.getTime()) / 60000;
  return minutos >= 0 && minutos <= minutosMaximos;
}
