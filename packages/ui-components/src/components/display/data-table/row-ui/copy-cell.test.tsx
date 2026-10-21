/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';

import { DataTableCopyCell } from './copy-cell';

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

describe('DataTableCopyCell', () => {
  it('shows a Copied tooltip after the copy button is clicked', () => {
    const onCopy = vi.fn();
    render(
      <DataTableCopyCell value="user@demo.io" onCopy={onCopy}>
        user@demo.io
      </DataTableCopyCell>,
    );

    expect(screen.queryByText('Copied')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Copy user@demo.io' }));
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Copied')).toBeTruthy();
  });

  it('does not render a copy button when the value is empty', () => {
    render(
      <DataTableCopyCell value="" onCopy={vi.fn()}>
        empty
      </DataTableCopyCell>,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
});
