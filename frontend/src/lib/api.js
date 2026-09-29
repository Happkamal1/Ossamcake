/**
 * Centralized API configuration for OssamCake frontend.
 *
 * Production:  VITE_API_BASE_URL="https://ossamcake.duckdns.org/api/v1"
 *              Nginx proxies /api/* to the Express backend.
 *
 * Development: VITE_API_BASE_URL="http://localhost:5000/api/v1"
 *              OR rely on the Vite dev-server proxy in vite.config.js
 *              which forwards /api/* to the local backend.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "/api/v1";

export { API_BASE_URL };

/**
 * Resolve a backend-relative image/upload path to a displayable URL.
 *
 * Examples:
 *   getImageUrl("/uploads/cake.jpg")
 *     → "/uploads/cake.jpg"           (production – served by Nginx)
 * 
 *     → "http://dev-server:5000/uploads/cake.jpg"  (dev with full base URL, or similar)
 *
 *   getImageUrl("https://res.cloudinary.com/…")
 *     → unchanged (already absolute)
 *
 *   getImageUrl(null) → ""
 */
export function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  // When API_BASE_URL is a full URL (local dev), prepend the backend origin
  // so that images served by Express (e.g. /uploads/…) resolve correctly.
  if (API_BASE_URL.startsWith("http")) {
    const origin = new URL(API_BASE_URL).origin;
    return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  }

  // Production: path is already relative (e.g. "/uploads/cake.jpg"),
  // Nginx will serve it from the same domain.
  return path.startsWith("/") ? path : `/${path}`;
}
