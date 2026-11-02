const configured = import.meta.env.VITE_API_BASE_URL

export const env = {
  // "proxy" = mismo origen (Vite reenvía /api a Render). Evita CORS en localhost.
  apiBaseUrl: configured === 'proxy' || configured === ''
    ? ''
    : (configured ?? 'https://eima.onrender.com'),
}

