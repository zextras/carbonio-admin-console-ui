/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DataTableLiveRegion } from './live-region';
import { DataTableStaleBanner } from './stale-banner';
import { TableUiProvider } from './table-ui-store';

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
  }),
}));

type StaleHarnessProps = {
  message?: string;
  reloadLabel?: string;
  dismissLabel?: string;
  onReload: () => void;
  onDismiss: () => void;
};

function StaleHarness({
  message,
  reloadLabel,
  dismissLabel,
  onReload,
  onDismiss,
}: StaleHarnessProps) {
  return (
    <TableUiProvider>
      {/* The live region consumes the UI-store announcement the banner
          publishes on reload, mirroring the composed view. */}
      <DataTableLiveRegion />
      <DataTableStaleBanner
        message={message}
        reloadLabel={reloadLabel}
        dismissLabel={dismissLabel}
        onReload={onReload}
        onDismiss={onDismiss}
      />
    </TableUiProvider>
  );
}

describe('DataTableStaleBanner', () => {
  it('renders the default message and action labels', () => {
    render(<StaleHarness onReload={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByText('Data changed on the server.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeTruthy();
  });

  it('renders custom message and action labels', () => {
    render(
      <StaleHarness
        message="Data changed on the server (7 items updated)."
        reloadLabel="Refresh"
        dismissLabel="Ignore"
        onReload={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );
    expect(screen.getByText('Data changed on the server (7 items updated).')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ignore' })).toBeTruthy();
  });

  it('reloads and announces the reload through the live region', () => {
    const onReload = vi.fn();
    render(<StaleHarness onReload={onReload} onDismiss={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(onReload).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Reloaded')).toBeTruthy();
  });

  it('dismisses without announcing a reload', () => {
    const onDismiss = vi.fn();
    render(<StaleHarness onReload={vi.fn()} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Reloaded')).toBeNull();
  });
});
