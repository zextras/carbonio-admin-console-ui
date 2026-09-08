/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DataTableSearch } from './search';

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

function setupSearch(value: string) {
  const onSearchChange = vi.fn();
  const utils = render(<DataTableSearch value={value} onSearchChange={onSearchChange} />);
  return { onSearchChange, ...utils };
}

function getSearchInput(): HTMLElement {
  return screen.getByRole('searchbox', { name: 'Search' });
}

describe('DataTableSearch', () => {
  it('defaults the accessible label and placeholder via i18n', () => {
    render(<DataTableSearch value="" onSearchChange={vi.fn()} />);
    expect(getSearchInput()).toBeTruthy();
  });

  it('calls onSearchChange on every keystroke', () => {
    const { onSearchChange } = setupSearch('');
    const input = getSearchInput();
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'ab' } });
    expect(onSearchChange).toHaveBeenCalledTimes(2);
    expect(onSearchChange).toHaveBeenNthCalledWith(1, 'a');
    expect(onSearchChange).toHaveBeenNthCalledWith(2, 'ab');
  });

  it('keeps the typed value locally when the parent does not echo it back', () => {
    const { onSearchChange } = setupSearch('');
    const input = getSearchInput();
    fireEvent.change(input, { target: { value: 'ab' } });
    expect(onSearchChange).toHaveBeenCalledWith('ab');
    expect((input as HTMLInputElement).value).toBe('ab');
  });

  it('adopts an external value change', () => {
    const onSearchChange = vi.fn();
    const { rerender } = render(<DataTableSearch value="" onSearchChange={onSearchChange} />);
    rerender(<DataTableSearch value="reset" onSearchChange={onSearchChange} />);
    expect((getSearchInput() as HTMLInputElement).value).toBe('reset');
  });

  it('ignores a parent re-render that still passes the stale prop value', () => {
    const onSearchChange = vi.fn();
    const { rerender } = render(<DataTableSearch value="" onSearchChange={onSearchChange} />);
    fireEvent.change(getSearchInput(), { target: { value: 'ab' } });
    rerender(<DataTableSearch value="" onSearchChange={onSearchChange} />);
    expect((getSearchInput() as HTMLInputElement).value).toBe('ab');
  });

  it('renders a custom placeholder and label', () => {
    render(
      <DataTableSearch
        value=""
        onSearchChange={vi.fn()}
        placeholder="Find accounts"
        label="Find"
      />,
    );
    const input = screen.getByRole('searchbox', { name: 'Find' }) as HTMLInputElement;
    expect(input.getAttribute('placeholder')).toBe('Find accounts');
  });
});
