/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DataTableSelectAllMatching } from './select-all-matching';

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

describe('DataTableSelectAllMatching', () => {
  it('announces the selected page rows and offers to select every match', () => {
    const onSelectAllMatching = vi.fn();
    render(
      <DataTableSelectAllMatching
        count={1234}
        pageCount={5}
        onSelectAllMatching={onSelectAllMatching}
      />,
    );
    const status = screen.getByRole('status');
    expect(status.textContent).toContain('All 5 rows on this page are selected.');
    const button = screen.getByRole('button', { name: 'Select all 1,234 matching' });
    fireEvent.click(button);
    expect(onSelectAllMatching).toHaveBeenCalledTimes(1);
  });

  it('supports a custom page-selected label', () => {
    render(
      <DataTableSelectAllMatching
        count={10}
        pageCount={5}
        pageSelectedLabel={(pageCount) => `${pageCount} righe selezionate`}
        onSelectAllMatching={vi.fn()}
      />,
    );
    expect(screen.getByText('5 righe selezionate')).toBeTruthy();
  });
});
