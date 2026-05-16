/**
 * SSRF guard — validates that a URL points to an external, public host.
 *
 * Blocks:
 *  - 127.0.0.0/8   (loopback)
 *  - 10.0.0.0/8    (private class A)
 *  - 172.16.0.0/12 (private class B)
 *  - 192.168.0.0/16(private class C)
 *  - 169.254.0.0/16(link-local / cloud metadata)
 *  - 0.0.0.0/8     (this network)
 *  - 100.64.0.0/10 (CGNAT)
 *  - ::1 / fc00::/7 / fe80::/10 (IPv6 private/loopback)
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

function isBlockedIpv6(ip) {
  const normalized = ip.toLowerCase().replace(/^\[|\]$/g, '');
  // Loopback
  if (normalized === '::1') return true;
  // Unique local (fc00::/7)
  const firstWord = parseInt(normalized.split(':')[0] || '0', 16);
  if ((firstWord & 0xfe00) === 0xfc00) return true;
  // Link-local (fe80::/10)
  if ((firstWord & 0xffc0) === 0xfe80) return true;
  return false;
}

/**
 * Asserts that `urlString` is safe to fetch (not SSRF-able).
 * Resolves DNS and checks every returned address.
 * @param {string} urlString
 * @throws {Error} if the URL or its resolved IP is blocked
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

  // Hostname — resolve all addresses (v4 + v6) and check each
  let addresses;
  try {
    addresses = await dns.promises.resolve(hostname);
  } catch {
    // Fallback: dns.resolve may not support all record types; try lookup
    try {
      const result = await dns.promises.lookup(hostname, { all: true });
      addresses = result.map((r) => r.address);
    } catch {
      throw new Error('Não foi possível resolver o hostname do webhook');
    }
  }

  if (!addresses || addresses.length === 0) {
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
