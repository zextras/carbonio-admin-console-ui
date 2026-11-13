/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';

import { Paging, type PagingProps } from '../paging';

function createI18n() {
  const instance = i18next.createInstance();
  instance.init({ lng: 'en', resources: { en: { translation: {} } } });
  return instance;
}

const i18n = createI18n();

function renderPaging(props: PagingProps) {
  const view = render(
    <I18nextProvider i18n={i18n}>
      <Paging {...props} />
    </I18nextProvider>,
  );
  return {
    ...view,
    rerenderPaging: (nextProps: PagingProps) =>
      view.rerender(
        <I18nextProvider i18n={i18n}>
          <Paging {...nextProps} />
        </I18nextProvider>,
      ),
  };
}

function getPageIndicator() {
  return screen.getByText(/of \d+/);
}

describe('Paging', () => {
  it('navigates through pages and notifies every callback', () => {
    const callbacks = {
      firstPage: vi.fn(),
      lastPage: vi.fn(),
      nextPage: vi.fn(),
      previousPage: vi.fn(),
      setOffset: vi.fn(),
      onPageChange: vi.fn(),
    };
    renderPaging({ totalItem: 35, pageSize: 10, ...callbacks });

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(callbacks.nextPage).toHaveBeenCalledWith(2);
    expect(callbacks.setOffset).toHaveBeenLastCalledWith(10);
    expect(callbacks.onPageChange).toHaveBeenLastCalledWith(2);

    fireEvent.click(screen.getByRole('button', { name: 'Last page' }));
    expect(callbacks.lastPage).toHaveBeenCalledWith(4);
    expect(callbacks.setOffset).toHaveBeenLastCalledWith(30);
    expect(callbacks.onPageChange).toHaveBeenLastCalledWith(4);

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(callbacks.previousPage).toHaveBeenCalledWith(3);
    expect(callbacks.setOffset).toHaveBeenLastCalledWith(20);
    expect(callbacks.onPageChange).toHaveBeenLastCalledWith(3);

    fireEvent.click(screen.getByRole('button', { name: 'First page' }));
    expect(callbacks.firstPage).toHaveBeenCalledWith(1);
    expect(callbacks.setOffset).toHaveBeenLastCalledWith(0);
    expect(callbacks.onPageChange).toHaveBeenLastCalledWith(1);
  });

  it('disables every control when all items fit in a single page', () => {
    renderPaging({ totalItem: 5, pageSize: 10 });

    for (const name of ['First page', 'Previous page', 'Next page', 'Last page']) {
      expect(screen.getByRole('button', { name })).toHaveProperty('disabled', true);
    }
  });

  it('follows the controlled current page', () => {
    renderPaging({ totalItem: 50, pageSize: 10, currentPageProp: 3 });

    expect(getPageIndicator().textContent).toContain('3');
    expect(getPageIndicator().textContent).toContain('of 5');
  });

  it('goes back to the first page when the list becomes empty', () => {
    const { rerenderPaging } = renderPaging({ totalItem: 30, pageSize: 10 });

    fireEvent.click(screen.getByRole('button', { name: 'Last page' }));
    expect(getPageIndicator().textContent).toContain('3');

    rerenderPaging({ totalItem: 0, pageSize: 10 });
    expect(getPageIndicator().textContent).toContain('1');
    expect(getPageIndicator().textContent).toContain('of 0');

    rerenderPaging({ totalItem: 30, pageSize: 10 });
    expect(getPageIndicator().textContent).toContain('1');
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveProperty('disabled', true);
  });
});
