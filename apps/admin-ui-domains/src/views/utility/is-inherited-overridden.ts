/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function isInheritedOverridden(
  liveValue: string | undefined,
  accountValue: string | undefined,
  inheritedValue: string | undefined,
): boolean {
  return (
    liveValue !== undefined &&
    (accountValue !== undefined ||
      (inheritedValue !== undefined && liveValue !== inheritedValue))
  );
}
