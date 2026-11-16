/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DataTableLiveRegion } from './live-region';
import { TableUiProvider, useTableUiStore } from './table-ui-store';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string, options?: Record<string, string>) => {
      if (defaultValue === undefined) {
        return key;
      }
      if (options === undefined) {
        return defaultValue;
      }
      return defaultValue.replace(
        /\{\{(\w+)\}\}/g,
        (_match: string, name: string) => options[name] ?? '',
      );
    },
    i18n: { resolvedLanguage: 'en-US', language: 'en-US' },
  }),
}));

function AnnounceProbe({ label }: { label: string }) {
  const store = useTableUiStore();
  return (
    <button type="button" onClick={() => store.getState().announce('Copied')}>
      {label}
    </button>
  );
}

function LiveRegionHarness() {
  return (
    <TableUiProvider>
      <DataTableLiveRegion />
      <AnnounceProbe label="Announce copy" />
    </TableUiProvider>
  );
}

describe('DataTableLiveRegion', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('clears the message after announcing so identical repeats re-announce', () => {
    render(<LiveRegionHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Announce copy' }));
    expect(screen.getByText('Copied')).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.queryByText('Copied')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Announce copy' }));
    expect(screen.getByText('Copied')).toBeTruthy();
  });
});
