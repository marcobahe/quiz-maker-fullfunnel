/**
 * SSRF guard — validates that a URL points to an external, public host.
 *
 * Blocks:
 *  - 127.0.0.0/8    (loopback)
 *  - 10.0.0.0/8     (private class A)
 *  - 172.16.0.0/12  (private class B)
 *  - 192.168.0.0/16 (private class C)
 *  - 169.254.0.0/16 (link-local / cloud metadata)
 *  - 0.0.0.0/8      (this network)
 *  - 100.64.0.0/10  (CGNAT)
 *  - ::1 / fc00::/7 / fe80::/10 (IPv6 private/loopback)
 *  - ::ffff:0:0/96  (IPv4-mapped IPv6)
 *
 * Usage:
 *   import { assertPublicUrl } from '@/lib/ssrfGuard';
 *   await assertPublicUrl(urlString); // throws if blocked
 */

import dns from 'dns';
import net from 'net';

const BLOCKED_CIDRS_V4 = [
  { prefix: '127.0.0.0', bits: 8 },    // loopback
  { prefix: '10.0.0.0', bits: 8 },     // private class A
  { prefix: '172.16.0.0', bits: 12 },  // private class B
  { prefix: '192.168.0.0', bits: 16 }, // private class C
  { prefix: '169.254.0.0', bits: 16 }, // link-local (AWS/GCP metadata)
  { prefix: '0.0.0.0', bits: 8 },      // this network
  { prefix: '100.64.0.0', bits: 10 },  // CGNAT
  { prefix: '192.0.0.0', bits: 24 },   // IETF protocol assignments
  { prefix: '198.18.0.0', bits: 15 },  // benchmarking
  { prefix: '240.0.0.0', bits: 4 },    // reserved
];

function ipv4ToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc * 256 + parseInt(octet, 10)) >>> 0, 0);
}

function isBlockedIpv4(ip) {
  const ipInt = ipv4ToInt(ip);
  for (const { prefix, bits } of BLOCKED_CIDRS_V4) {
    const maskInt = bits === 32 ? 0xffffffff : (~0 << (32 - bits)) >>> 0;
    if ((ipInt & maskInt) === (ipv4ToInt(prefix) & maskInt)) return true;
  }
  return false;
}

/**
 * Checks whether a resolved IPv6 address is in a private/reserved range.
 * Handles: loopback (::1), unique-local (fc00::/7), link-local (fe80::/10),
 * and IPv4-mapped (::ffff:0:0/96).
 */
function isBlockedIpv6(ip) {
  const normalized = ip.toLowerCase().replace(/^\[|\]$/g, '');

  // Loopback
  if (normalized === '::1') return true;

  // IPv4-mapped IPv6: ::ffff:<ipv4> — extract and check embedded IPv4
  if (normalized.startsWith('::ffff:')) {
    const embedded = normalized.slice(7); // everything after "::ffff:"
    // Could be dotted-decimal (::ffff:127.0.0.1) or hex (::ffff:7f00:1)
    if (net.isIPv4(embedded)) {
      return isBlockedIpv4(embedded);
    }
    // Hex form: two 16-bit groups, e.g. "7f00:0001"
    const hexParts = embedded.split(':');
    if (hexParts.length === 2) {
      const hi = parseInt(hexParts[0], 16);
      const lo = parseInt(hexParts[1], 16);
      const dotted = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
      return isBlockedIpv4(dotted);
    }
    return true; // block anything ::ffff:* we can't parse
  }

  // Unique local (fc00::/7) and link-local (fe80::/10)
  // Parse first 16-bit group; handles full and compressed notation
  const firstGroup = normalized.split(':')[0];
  if (!firstGroup) return true; // compressed forms starting with :: (not ::1 or ::ffff:*) — block
  const firstWord = parseInt(firstGroup, 16);
  if ((firstWord & 0xfe00) === 0xfc00) return true; // fc00::/7
  if ((firstWord & 0xffc0) === 0xfe80) return true; // fe80::/10

  return false;
}

/**
 * Asserts that `urlString` is safe to fetch (not SSRF-able).
 * Resolves both A (IPv4) and AAAA (IPv6) records and checks every address.
 * @param {string} urlString
 * @throws {Error} if the URL or its resolved IPs are blocked
 */
export async function assertPublicUrl(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    throw new Error('Webhook URL inválida');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Webhook URL deve usar protocolo http ou https');
  }

  const hostname = url.hostname;

  // Bare IPv4 in the URL
  if (net.isIPv4(hostname)) {
    if (isBlockedIpv4(hostname)) {
      throw new Error('Webhook URL aponta para endereço IP privado ou reservado');
    }
    return;
  }

  // Bare IPv6 in the URL (e.g. http://[::1]/...)
  if (net.isIPv6(hostname)) {
    if (isBlockedIpv6(hostname)) {
      throw new Error('Webhook URL aponta para endereço IPv6 privado ou reservado');
    }
    return;
  }

  // Hostname — resolve A and AAAA records in parallel; check every returned address.
  // Using resolve4/resolve6 explicitly so that a successful A lookup never silently
  // skips AAAA records (the original bug with dns.promises.resolve() and no type arg).
  const [v4Result, v6Result] = await Promise.allSettled([
    dns.promises.resolve4(hostname),
    dns.promises.resolve6(hostname),
  ]);

  const addresses = [
    ...(v4Result.status === 'fulfilled' ? v4Result.value : []),
    ...(v6Result.status === 'fulfilled' ? v6Result.value : []),
  ];

  if (addresses.length === 0) {
    throw new Error('Não foi possível resolver o hostname do webhook');
  }

  for (const addr of addresses) {
    if (net.isIPv4(addr) && isBlockedIpv4(addr)) {
      throw new Error('Webhook URL resolve para endereço IP privado ou reservado');
    }
    if (net.isIPv6(addr) && isBlockedIpv6(addr)) {
      throw new Error('Webhook URL resolve para endereço IPv6 privado ou reservado');
    }
  }
}
