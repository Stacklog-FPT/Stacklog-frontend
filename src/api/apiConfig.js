// Use relative `/api/` in development so the Vite dev server can proxy requests
// to the real backend and avoid CORS issues. In production this resolves to
// the real API host.
export const REACT_API_URL = import.meta.env.DEV ? '/api/' : 'https://stacklog.id.vn/api/';

// For socket connections: use same strategy as REACT_API_URL
// In dev: '/api/' goes through Vite proxy (avoids CORS)
// In prod: 'https://stacklog.id.vn/api/' connects directly
export const SOCKET_BASE_URL = REACT_API_URL;
