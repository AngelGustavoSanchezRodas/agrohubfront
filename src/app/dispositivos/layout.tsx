import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estaciones y Sectores de Cultivo",
  description:
    "Catálogo y estado operativo de las estaciones de monitoreo instaladas en campo, disponibilidad y cobertura de red.",
  openGraph: {
    title: "Estaciones y Sectores | AgroHub",
    description: "Monitoreo del estado de conexión y métricas de estaciones de telemetría agrícola.",
  },
};

export default function DispositivosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}