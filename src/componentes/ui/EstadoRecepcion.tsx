"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import { lecturaReciente } from "@/lib/tiempo";

export function EstadoRecepcion() {
  const [recibiendo, setRecibiendo] = useState(false);

  useEffect(() => {
    const nodo = ref(db, "invernadero/invernadero_prueba_01/estado_actual");
    const unsubscribe = onValue(nodo, (snapshot) => {
      const timestamp = snapshot.exists()
        ? String(snapshot.val()?.timestamp || "")
        : "";
      setRecibiendo(lecturaReciente(timestamp));
    });
    return () => unsubscribe();
  }, []);

  return (
    <span className="flex items-center gap-2">
      <span
        className={`w-2 h-2 rounded-full ${
          recibiendo ? "bg-agro-green" : "bg-amber-400"
        }`}
      ></span>
      {recibiendo ? "Recepción activa" : "Sin recepción"}
    </span>
  );
}
