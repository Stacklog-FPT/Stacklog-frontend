// Use relative `/api/` in development so the Vite dev server can proxy requests
// to the real backend and avoid CORS issues. In production this resolves to
// the real API host.
export const REACT_API_URL = import.meta.env.DEV ? '/api/' : 'https://stacklog.id.vn/api/';
