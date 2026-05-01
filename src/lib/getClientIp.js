/**
 * Extracts the client IP address from a Next.js Request object.
 * Checks x-forwarded-for (proxy/CDN), x-real-ip, then falls back to 'unknown'.
 *
 * @param {Request} request
 * @returns {string}
 */
export function getClientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
