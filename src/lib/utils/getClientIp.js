/**
 * Extracts the client IP address from a Next.js request.
 * Checks x-forwarded-for (first IP in chain) then x-real-ip, falling back to 'unknown'.
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
