/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { ListItems } from '../list-items';

const ITEMS = [
  { id: 'list', name: 'List', isSelected: true },
  { id: 'reports', name: 'Reports', isSelected: true },
  { id: 'disabled', name: 'Disabled', isSelected: false },
];

describe('ListItems', () => {
  it('should render all items', async () => {
    await setupBrowserTest(
      <ListItems items={ITEMS} selectedOperationItem="list" setSelectedOperationItem={vi.fn()} />,
    );

    await expect.element(page.getByText('List')).toBeVisible();
    await expect.element(page.getByText('Reports')).toBeVisible();
    await expect.element(page.getByText('Disabled')).toBeVisible();
  });

  it('should mark only the selected item as current', async () => {
    await setupBrowserTest(
      <ListItems items={ITEMS} selectedOperationItem="list" setSelectedOperationItem={vi.fn()} />,
    );

    await expect
      .element(page.getByRole('button', { name: 'List' }))
      .toHaveAttribute('aria-current', 'true');
    await expect
      .element(page.getByRole('button', { name: 'Reports' }))
      .not.toHaveAttribute('aria-current', 'true');
  });

  it('should call setSelectedOperationItem when an item is clicked', async () => {
    const setSelectedOperationItem = vi.fn();
    await setupBrowserTest(
      <ListItems
        items={ITEMS}
        selectedOperationItem="list"
        setSelectedOperationItem={setSelectedOperationItem}
      />,
    );

    await page.getByRole('button', { name: 'Reports' }).click();

    expect(setSelectedOperationItem).toHaveBeenCalledWith('reports');
  });

  it('should call setSelectedOperationItem when Enter is pressed on an item', async () => {
    const setSelectedOperationItem = vi.fn();
    await setupBrowserTest(
      <ListItems
        items={ITEMS}
        selectedOperationItem="list"
        setSelectedOperationItem={setSelectedOperationItem}
      />,
    );

    await userEvent.type(page.getByRole('button', { name: 'Reports' }), '{Enter}');

    expect(setSelectedOperationItem).toHaveBeenCalledWith('reports');
  });

  it('should call setSelectedOperationItem when Space is pressed on an item', async () => {
    const setSelectedOperationItem = vi.fn();
    await setupBrowserTest(
      <ListItems
        items={ITEMS}
        selectedOperationItem="list"
        setSelectedOperationItem={setSelectedOperationItem}
      />,
    );

    await userEvent.type(page.getByRole('button', { name: 'Reports' }), ' ');

    expect(setSelectedOperationItem).toHaveBeenCalledWith('reports');
  });

  it('should not call setSelectedOperationItem for a disabled item on click', async () => {
    const setSelectedOperationItem = vi.fn();
    await setupBrowserTest(
      <ListItems
        items={ITEMS}
        selectedOperationItem="list"
        setSelectedOperationItem={setSelectedOperationItem}
      />,
    );

    await page.getByRole('button', { name: 'Disabled' }).click();

    expect(setSelectedOperationItem).not.toHaveBeenCalled();
  });

  it('should not call setSelectedOperationItem for a disabled item on Enter', async () => {
    const setSelectedOperationItem = vi.fn();
    await setupBrowserTest(
      <ListItems
        items={ITEMS}
        selectedOperationItem="list"
        setSelectedOperationItem={setSelectedOperationItem}
      />,
    );

    await userEvent.type(page.getByRole('button', { name: 'Disabled' }), '{Enter}');

    expect(setSelectedOperationItem).not.toHaveBeenCalled();
  });
});
