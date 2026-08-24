/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useState } from 'react';

export type ChipItem = { label: string; error?: boolean };

/**
 * Parses a comma-separated server value (e.g. `zimbraPrefMailForwardingAddress`)
 * into chip items. Inverse of `chipsToValue`.
 */
export function parseChipList(value: string | undefined): Array<ChipItem> {
  return value ? value.split(', ').map((ele: string) => ({ label: ele })) : [];
}

/**
 * Serializes chip items back into the comma-separated server format.
 */
export function chipsToValue(chips: Array<ChipItem>): string {
  return chips.map((chip) => chip.label).join(', ');
}

/**
 * Editable chip list seeded from a server value, using the render-adjust
 * pattern: local edits live in `chips`; when the server value changes the
 * list reseeds to match it.
 */
export function useChipList(
  value: string | undefined,
): [Array<ChipItem>, React.Dispatch<React.SetStateAction<Array<ChipItem>>>] {
  const [chips, setChips] = useState<Array<ChipItem>>(() => parseChipList(value));
  const [prevValue, setPrevValue] = useState(value);

  // adjust during render: reseed the editable list when server data changes
  if (prevValue !== value) {
    setPrevValue(value);
    setChips(parseChipList(value));
  }

  return [chips, setChips];
}
