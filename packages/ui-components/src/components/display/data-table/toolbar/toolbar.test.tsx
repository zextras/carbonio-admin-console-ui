/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DataTableToolbar } from './toolbar';

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

describe('DataTableToolbar', () => {
  it('renders a labelled toolbar region around its children', () => {
    render(
      <DataTableToolbar>
        <button type="button" onClick={vi.fn()}>
          Filters
        </button>
      </DataTableToolbar>,
    );
    expect(screen.getByRole('toolbar', { name: 'Table actions' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Filters' })).toBeTruthy();
  });

  it('supports a custom region label', () => {
    render(
      <DataTableToolbar label="Accounts actions">
        <span>content</span>
      </DataTableToolbar>,
    );
    expect(screen.getByRole('toolbar', { name: 'Accounts actions' })).toBeTruthy();
  });
});
