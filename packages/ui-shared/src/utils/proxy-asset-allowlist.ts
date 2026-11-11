/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Path prefixes the carbonio-proxy embedded-resource guard allows for image/media
 * requests. Must mirror the allowlist map in `nginx.conf.web.template`
 */
export const PROXY_EMBEDDED_RESOURCE_ALLOWLIST_PREFIXES: ReadonlyArray<string> = [
  '/static/',
  '/service/home/~/',
  '/service/preview/',
  '/services/files/preview/',
  '/services/docs/editor/',
  '/services/chats/preview/',
  '/services/chats/attachments/',
  '/services/chats/rooms/',
  '/meeting/',
  '/files/public/link/access/assets/',
];

/** Total parser — returns null for any unparseable input, so exceptions never escape. */
function parseUrl(candidate: string): URL | null {
  try {
    return new URL(candidate);
  } catch {
    return null;
  }
}

function isHttps(url: URL): boolean {
  return url.protocol === 'https:';
}

function targetsHostname(hostname: string): (url: URL) => boolean {
  return (url) => url.hostname === hostname.toLowerCase();
}

function isPathOutsideAllowlist(url: URL): boolean {
  return !PROXY_EMBEDDED_RESOURCE_ALLOWLIST_PREFIXES.some((prefix) =>
    url.pathname.startsWith(prefix),
  );
}

/**
 * Returns true when `url` is an https URL pointing at the same hostname as the
 * current deployment (port ignored, cookies and the proxy guard are not
 * port-scoped) on a path outside the embedded-resource allowlist — i.e. the
 * proxy guard would reject it with a 403 when loaded as an image or favicon.
 * Empty, whitespace, unparseable, `http:` and different-host URLs return false.
 */
export function isSameOriginUrlOutsideProxyAllowlist(url: string, hostname?: string): boolean {
  const currentHostname = hostname ?? globalThis.location?.hostname ?? '';
  const parsed = parseUrl(url.trim());
  const guards: Array<(url: URL) => boolean> = [
    isHttps,
    targetsHostname(currentHostname),
    isPathOutsideAllowlist,
  ];
  return parsed != null && guards.every((guard) => guard(parsed));
}
