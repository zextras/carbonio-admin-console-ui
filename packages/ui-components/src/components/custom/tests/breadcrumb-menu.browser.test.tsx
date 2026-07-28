/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../../../web-components';

import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { BreadcrumbMenu } from '../breadcrumb-menu';

const ITEMS = [
  { id: 'a', label: 'Apple', onClick: vi.fn() },
  { id: 'b', label: 'Banana', onClick: vi.fn(), selected: true },
  { id: 'c', label: 'Cherry', onClick: vi.fn() },
];

describe('BreadcrumbMenu', () => {
  afterEach(() => {
    ITEMS.forEach((item) => item.onClick.mockClear());
  });

  async function openMenu() {
    const trigger = page.getByRole('button', { name: 'Show sections' });
    await trigger.click();
    return trigger;
  }

  it('exposes trigger aria-expanded toggle and menu roles on open', async () => {
    render(<BreadcrumbMenu items={ITEMS} triggerLabel="Show sections" />);
    const trigger = page.getByRole('button', { name: 'Show sections' });
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.element(page.getByRole('menu')).toBeVisible();
    expect(page.getByRole('menuitemradio').elements()).toHaveLength(3);
    await expect
      .element(page.getByRole('menuitemradio', { checked: true }))
      .toHaveTextContent('Banana');
  });

  it('focuses the selected item on open and moves with Arrow/Home/End', async () => {
    render(<BreadcrumbMenu items={ITEMS} triggerLabel="Show sections" />);
    await openMenu();

    await expect.element(page.getByRole('menuitemradio', { name: 'Banana' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(page.getByRole('menuitemradio', { name: 'Cherry' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect.element(page.getByRole('menuitemradio', { name: 'Apple' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect.element(page.getByRole('menuitemradio', { name: 'Cherry' })).toHaveFocus();
  });

  it('activates the focused item on Enter and closes the menu', async () => {
    render(<BreadcrumbMenu items={ITEMS} triggerLabel="Show sections" />);
    const trigger = await openMenu();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    expect(ITEMS[2]?.onClick).toHaveBeenCalledTimes(1);
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    render(<BreadcrumbMenu items={ITEMS} triggerLabel="Show sections" />);
    const trigger = await openMenu();
    await userEvent.keyboard('{Escape}');
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect.element(trigger).toHaveFocus();
  });

  it('light-dismisses when clicking outside', async () => {
    render(
      <>
        <BreadcrumbMenu items={ITEMS} triggerLabel="Show sections" />
        <button type="button">elsewhere</button>
      </>,
    );
    const trigger = await openMenu();
    await expect.element(page.getByRole('menu')).toBeVisible();
    await page.getByRole('button', { name: 'elsewhere' }).click();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
