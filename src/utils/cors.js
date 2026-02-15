// src/utils/cors.js

// If you want to also allow the naked domain, add it here:
const ALLOWED_ORIGINS = [
  'https://www.cdlnetworkllc.com',
  'https://cdlnetworkllc.com',
  'https://cdl-network-frontend.vercel.app',
];

export function withCors(handler) {
  return async (req, res) => {
    const origin = req.headers.origin;

    // Allow server-to-server calls (no Origin header), and browser calls only from allowed origins
   const isAllowedOrigin =
  !origin ||
  ALLOWED_ORIGINS.includes(origin) ||
  origin.endsWith(".vercel.app");

    if (!isAllowedOrigin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      // So caches don’t mix responses for different origins
      res.setHeader('Vary', 'Origin');
    }

    res.setHeader(
      'Access-Control-Allow-Methods',
      'POST, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type'
    );

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    return handler(req, res);
  };
}
