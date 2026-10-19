import React from "react";

interface TarjetaSensorProps {
  titulo: string;
  valor: number | string;
  unidad: string;
  subtitulo: string;
  icono: React.ElementType;
  iconoColorClass: string;
}

export function TarjetaSensor({
  titulo,
  valor,
  unidad,
  subtitulo,
  icono: Icono,
  iconoColorClass,
}: TarjetaSensorProps) {
  return (
    <div className="bg-agro-dark border border-agro-border rounded-xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 font-medium tracking-wide text-xs uppercase">
          {titulo}
        </span>
        <Icono className={`w-5 h-5 ${iconoColorClass}`} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-semibold text-white">{valor}</span>
        <span className="text-gray-500 text-lg">{unidad}</span>
      </div>
      <span className="text-[11px] text-gray-500 mt-3 block">{subtitulo}</span>
    </div>
  );
}
