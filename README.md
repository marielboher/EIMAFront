# EIMA Front (React + Vite)

Frontend en **React (JavaScript/JSX)** para consumir endpoints de una API en **.NET**.

## Requisitos

- Node 20+
- npm

## Configuración

Copiá el archivo de variables de entorno:

```bash
copy .env.example .env
```

Editá `VITE_API_BASE_URL` apuntando a tu backend .NET.

## Instalar dependencias

```bash
npm install
```

## Correr en desarrollo

```bash
npm run dev
```

## Estructura

- `src/config/env.js`: variables de entorno tipadas “a mano”
- `src/lib/http.js`: cliente `axios` con `baseURL`
- `src/routes/router.jsx`: router principal
- `src/screens/`: pantallas (feature-first simple)
