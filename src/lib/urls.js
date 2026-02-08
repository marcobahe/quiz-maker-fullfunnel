/**
 * Centralized URL helpers for public quiz player.
 *
 * The public quiz player lives on play.quizmebaby.app,
 * separate from the app/dashboard (go.quizmebaby.app).
 */

export const PLAYER_ORIGIN = 'https://play.quizmebaby.app';

/**
 * Build the public URL for a quiz.
 * @param {string} slug - quiz slug or id
 * @param {Record<string, string>} [params] - optional query params
 */
export function getQuizPlayerUrl(slug, params) {
  const url = new URL(`/q/${slug}`, PLAYER_ORIGIN);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return url.toString();
}
