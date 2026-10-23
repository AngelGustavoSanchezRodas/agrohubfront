export const CULTIVO_POR_DEFECTO = "Tomate";

export const CULTIVOS_DISPONIBLES = [
  "Tomate",
  "Lechuga",
  "Pimiento",
  "Fresa",
  "Albahaca",
  "Pepino",
] as const;

export type CultivoId = (typeof CULTIVOS_DISPONIBLES)[number];

/** Valores residuales, genéricos o de pruebas que deben excluirse del selector. */
const VALORES_INVALIDOS = new Set([
  "string",
  "null",
  "undefined",
  "none",
  "test",
  "prueba",
  "ejemplo",
  "cultivo",
  "default",
  "nan",
  "unknown",
]);

/**
 * Valida si un texto corresponde a un nombre agronómico legítimo.
 */
export function esNombreCultivoValido(nombre: string | null | undefined): boolean {
  if (!nombre) return false;
  const limpio = nombre.trim();
  if (limpio.length < 3 || limpio.length > 50) return false;
  if (VALORES_INVALIDOS.has(limpio.toLowerCase())) return false;
  // Solo letras con tildes, espacios o guiones
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s-]+$/.test(limpio);
}

/**
 * Formatea y capitaliza adecuadamente el nombre del cultivo.
 */
export function formatearNombreCultivo(nombre: string): string {
  const palabras = nombre.trim().toLowerCase().split(/\s+/);
  return palabras
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/**
 * Filtra, sanitiza y desduplica la lista de cultivos para la interfaz.
 */
export function limpiarListaCultivos(cultivos: string[]): string[] {
  const vistos = new Set<string>();
  const resultado: string[] = [];

  for (const item of cultivos) {
    if (!esNombreCultivoValido(item)) continue;
    const formateado = formatearNombreCultivo(item);
    const clave = formateado.toLowerCase();
    if (!vistos.has(clave)) {
      vistos.add(clave);
      resultado.push(formateado);
    }
  }

  // Garantizar que los cultivos base esten disponibles
  for (const base of CULTIVOS_DISPONIBLES) {
    const clave = base.toLowerCase();
    if (!vistos.has(clave)) {
      vistos.add(clave);
      resultado.unshift(base);
    }
  }

  return resultado;
}

/** Tipos de alertas automáticas generadas por umbrales agronómicos y sensores reales. */
export const TIPOS_ALERTA_SISTEMA = new Set([
  "ESTRES_HIDRICO",
  "GOLPE_CALOR",
  "RIESGO_HELADA",
  "PROLIFERACION_HONGOS",
  "LUZ_INSUFICIENTE",
  "EXCESO_RADIACION",
  "DEFICIENCIA_HUMEDAD",
  "EXCESO_HUMEDAD",
  "ANOMALIA_SENSOR",
]);

export function esAlertaSistema(tipoRiesgo: string): boolean {
  if (!tipoRiesgo) return false;
  const limpio = tipoRiesgo.trim().toUpperCase();
  return TIPOS_ALERTA_SISTEMA.has(limpio) || !VALORES_INVALIDOS.has(limpio.toLowerCase());
}