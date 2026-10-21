import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analítica y Tendencias Agroclimáticas",
  description:
    "Análisis histórico y tendencias temporales de temperatura, humedad del aire, humedad del sustrato e índice de calor en el cultivo.",
  openGraph: {
    title: "Analítica y Tendencias | AgroHub",
    description: "Historial de mediciones y gráficos de tendencias agroclimáticas en tiempo real.",
  },
};

export default function AnaliticaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}