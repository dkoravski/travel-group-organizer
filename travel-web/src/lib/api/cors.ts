const allowedOrigin = process.env.API_CORS_ORIGIN || "*";

export const apiCorsHeaders = {
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Origin": allowedOrigin,
};

export const apiCorsHeaderList = Object.entries(apiCorsHeaders).map(
  ([key, value]) => ({ key, value }),
);

export function applyApiCorsHeaders(headers: Headers) {
  for (const [key, value] of Object.entries(apiCorsHeaders)) {
    headers.set(key, value);
  }
}
