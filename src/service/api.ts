// src/services/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const alternarBombaAgua = async (encender: boolean) => {
  try {
    const respuesta = await fetch(`${API_URL}/api/control/bomba`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado: encender }),
    });

    if (!respuesta.ok) {
      throw new Error("Error en la comunicacion con el servidor");
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error ejecutando comando:", error);
    throw error;
  }
};