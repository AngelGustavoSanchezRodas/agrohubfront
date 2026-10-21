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

/** Tipos de alertas automáticas generadas por umbrales agronómicos reales. */
export const TIPOS_ALERTA_SISTEMA = new Set([
  "ESTRES_HIDRICO",
  "GOLPE_CALOR",
  "RIESGO_HELADA",
  "PROLIFERACION_HONGOS",
]);

export function esAlertaSistema(tipoRiesgo: string): boolean {
  return TIPOS_ALERTA_SISTEMA.has(tipoRiesgo);
}