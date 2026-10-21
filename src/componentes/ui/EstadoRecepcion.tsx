"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import { DISPOSITIVO_ACTIVO } from "@/lib/dispositivos";
import { lecturaReciente } from "@/lib/tiempo";

export function EstadoRecepcion() {
  const [recibiendo, setRecibiendo] = useState(false);

  useEffect(() => {
    const nodo = ref(db, `invernadero/${DISPOSITIVO_ACTIVO}/estado_actual`);
    const unsubscribe = onValue(nodo, (snapshot) => {
      const timestamp = snapshot.exists()
        ? String(snapshot.val()?.timestamp || "")
        : "";
      setRecibiendo(lecturaReciente(timestamp));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-agro-border text-xs font-medium">
      <span
        className={`w-2 h-2 rounded-full ${
          recibiendo ? "bg-agro-green animate-pulse" : "bg-amber-400"
        }`}
      />
      <span className={recibiendo ? "text-agro-green" : "text-amber-400"}>
        {recibiendo ? "En línea" : "Sin conexión"}
      </span>
    </div>
  );
}