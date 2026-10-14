import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Evitar que Next.js inicialice Firebase multiples veces
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getDatabase(app);