import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alertas y Umbrales Críticos",
  description:
    "Monitoreo continuo de eventos críticos de cultivo: déficit hídrico en sustrato, estrés térmico y condiciones de proliferación de hongos.",
  openGraph: {
    title: "Alertas del Sistema | AgroHub",
    description: "Detección de umbrales agronómicos críticos y resolución de alertas en tiempo real.",
  },
};

export default function AlertasSistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}