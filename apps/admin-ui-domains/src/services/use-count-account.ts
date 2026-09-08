/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */



export function parseAccountCount(res: unknown): number {
  const coses = (res as { cos?: Record<string, { name?: string; _content?: string }> })?.cos;
  if (!coses) {
    return 0;
  }
  let counter = 0;
  for (const key in coses) {
    if (coses[key]?.name !== 'defaultExternal') {
      counter += Number(coses[key]?._content ?? 0);
    }
  }
  return counter;
}
