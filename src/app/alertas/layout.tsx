import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnósticos IA y Análisis Agronómico",
  description:
    "Evaluación agronómica mediante inteligencia artificial de balance hídrico, riesgo térmico y recomendaciones por cultivo.",
  openGraph: {
    title: "Diagnósticos IA | AgroHub",
    description: "Evaluación agronómica y recomendaciones personalizadas por cultivo.",
  },
};

export default function AlertasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}