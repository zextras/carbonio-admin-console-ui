/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

type ResolveRestoreTimestampParams = {
  requestedDate?: number;
  creationTimestamp?: number;
  deletedTimestamp?: number;
};

export function resolveRestoreTimestamp({
  requestedDate,
  creationTimestamp,
  deletedTimestamp,
}: ResolveRestoreTimestampParams): number | undefined {
  if (!requestedDate) {
    return undefined;
  }

  let timestamp = requestedDate;
  if (timestamp > Date.now()) {
    timestamp = Date.now();
  }
  if (deletedTimestamp && timestamp > deletedTimestamp) {
    timestamp = deletedTimestamp;
  }
  if (creationTimestamp && timestamp < creationTimestamp) {
    timestamp = creationTimestamp;
  }
  return timestamp;
}

export function endOfDayTimestamp(date: Date): number {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy.getTime();
}

export function startOfDayTimestamp(date: Date): number {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}
