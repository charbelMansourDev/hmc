import "server-only";

/**
 * The Mapbox token for the "Visit us" map, read at request time (no rebuild
 * needed when it changes). Only public tokens (pk.*) are ever sent to the page;
 * a secret token (sk.*) set here by mistake is ignored rather than leaked.
 * Restrict the token to the site's URLs in the Mapbox dashboard.
 */
export function publicMapboxToken(): string | null {
  const token = process.env.MAPBOX_TOKEN?.trim();
  return token && token.startsWith("pk.") ? token : null;
}
