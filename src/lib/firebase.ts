import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_URL,
};

// Evitar que Next.js inicialice Firebase múltiples veces
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getDatabase(app);