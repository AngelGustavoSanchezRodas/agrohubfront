# AgroHub Frontend

Panel de control y monitoreo en tiempo real para invernaderos agrícolas. Esta aplicación web permite visualizar lecturas de sensores de telemetría (temperatura, humedad ambiental y humedad de suelo) transmitidas mediante Firebase Realtime Database.

---

## Requisitos Previos

Antes de comenzar, asegúrese de contar con las siguientes herramientas instaladas en su entorno:

- **Node.js**: Versión 20.x o superior.
- **pnpm**: Gestor de paquetes oficial del proyecto (uso estrictamente obligatorio). No utilice `npm` ni `yarn` para evitar inconsistencias en el árbol de dependencias y el archivo `pnpm-lock.yaml`. Si no tiene `pnpm` instalado:
  ```bash
  npm install -g pnpm
  ```
- **Git**: Sistema de control de versiones.

---

## Guía de Instalación y Ejecución

Siga los pasos descritos a continuación para clonar, configurar y ejecutar el proyecto localmente.

### 1. Clonar el Repositorio

Abra su terminal y ejecute el siguiente comando para clonar el proyecto:

```bash
git clone https://github.com/tu-usuario/agrohubfront.git
cd agrohubfront
```

*(Reemplace la URL por la ruta real de su repositorio si aplica).*

### 2. Instalar Dependencias

Instale todos los paquetes requeridos utilizando estrictamente `pnpm`:

```bash
pnpm install
```

> [!IMPORTANT]
> El uso de `pnpm` es de carácter estricto y obligatorio. No ejecute `npm install` ni `yarn install`, ya que alterará la resolución de paquetes y romperá el archivo de bloqueo `pnpm-lock.yaml`.

### 3. Configuración de Variables de Entorno

El proyecto requiere la conexión a Firebase Realtime Database. Copie el archivo de ejemplo `.env.example` a `.env`:

En Windows (PowerShell):
```powershell
Copy-Item .env.example .env
```

En Linux / macOS:
```bash
cp .env.example .env
```

Abra el archivo `.env` y configure la URL de su instancia de Firebase Realtime Database:

```env
NEXT_PUBLIC_FIREBASE_URL=https://tu-proyecto-firebase-default-rtdb.firebaseio.com/
```

### 4. Ejecutar en Modo Desarrollo

Inicie el servidor de desarrollo local con Turbopack:

```bash
pnpm dev
```

El servidor estará disponible en [http://localhost:3000](http://localhost:3000).

### 5. Compilación para Producción

Para compilar la aplicación y validar la integridad de tipos antes de desplegar:

```bash
# Generar la versión optimizada de producción
pnpm build

# Ejecutar el servidor de producción localmente
pnpm start
```

---

## Scripts Disponibles

En el archivo `package.json` se encuentran definidos los siguientes comandos:

- `pnpm dev`: Inicia el servidor de desarrollo con Next.js y Turbopack.
- `pnpm build`: Compila y optimiza la aplicación para producción.
- `pnpm start`: Levanta el servidor con la compilación generada en producción.
- `pnpm lint`: Ejecuta el análisis estático de código con ESLint.

---

## Estructura del Proyecto

```text
agrohubfront/
├── src/
│   ├── app/
│   │   ├── globals.css      # Estilos globales y definición de tema Tailwind v4
│   │   ├── layout.tsx       # Estructura principal, barra superior y contenedor
│   │   └── page.tsx         # Vista principal del panel de telemetría y controles
│   ├── componentes/         # Componentes modulares de interfaz
│   ├── lib/
│   │   └── firebase.ts      # Inicialización y cliente de Firebase Realtime Database
│   └── service/             # Servicios y llamadas a endpoints
├── .env.example             # Plantilla de variables de entorno requeridas
├── next.config.ts           # Configuración de Next.js y loaders de Turbopack
├── package.json             # Dependencias y scripts del proyecto
├── tsconfig.json            # Configuración de compilación de TypeScript y alias
└── README.md                # Documentación del proyecto
```

---

## Tecnologías Utilizadas

- **Framework**: Next.js 16 (App Router con Turbopack)
- **Biblioteca de interfaz**: React 19
- **Estilos**: Tailwind CSS v4
- **Base de datos en tiempo real**: Firebase Realtime Database SDK v13
- **Lenguaje**: TypeScript 5
