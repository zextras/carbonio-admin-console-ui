/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../../../web-components';

import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Dropdown, type DropdownItem } from '../Dropdown';

function buildItems(): Array<DropdownItem> {
  return [
    { id: 'apple', label: 'Apple', onClick: vi.fn() },
    { id: 'banana', label: 'Banana', onClick: vi.fn() },
    { id: 'divider', type: 'divider' },
    { id: 'cherry', label: 'Cherry', onClick: vi.fn() },
  ];
}

function getItem(name: string) {
  return page.getByRole('menuitem', { name, exact: true });
}

async function openDropdown() {
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect.element(page.getByRole('menu')).toBeVisible();
}

describe('Dropdown', () => {
  it('opens a menu with menuitems and focuses the first item', async () => {
    const onOpen = vi.fn();
    render(
      <Dropdown items={buildItems()} onOpen={onOpen}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(page.getByRole('menuitem').elements()).toHaveLength(3);
    await expect.element(getItem('Apple')).toHaveFocus();
  });

  it('focuses the selected item when the menu opens', async () => {
    const items = buildItems();
    items[1].selected = true;
    render(
      <Dropdown items={items}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();

    await expect.element(getItem('Banana')).toHaveFocus();
  });

  it('calls the item onClick, closes and restores focus to the trigger', async () => {
    const items = buildItems();
    const onClose = vi.fn();
    render(
      <Dropdown items={items} onClose={onClose}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();
    await getItem('Banana').click();

    expect(items[1].onClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Open menu' })).toHaveFocus();
  });

  it('restores focus to the first focusable descendant when the trigger is not focusable', async () => {
    render(
      <Dropdown items={buildItems()}>
        <div>
          <button type="button">Open menu</button>
        </div>
      </Dropdown>,
    );

    await openDropdown();
    await userEvent.keyboard('{Escape}');

    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Open menu' })).toHaveFocus();
  });

  it('does not restore focus to the trigger when disableRestoreFocus is set', async () => {
    render(
      <Dropdown items={buildItems()} disableRestoreFocus>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();
    await userEvent.keyboard('{Escape}');

    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Open menu' })).not.toHaveFocus();
  });

  it('closes when the trigger is clicked again', async () => {
    const onTriggerClick = vi.fn();
    render(
      <Dropdown items={buildItems()}>
        <button type="button" onClick={onTriggerClick}>
          Open menu
        </button>
      </Dropdown>,
    );

    await openDropdown();
    await page.getByRole('button', { name: 'Open menu' }).click();

    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    expect(onTriggerClick).toHaveBeenCalledTimes(2);
  });

  it('does not open when disabled', async () => {
    render(
      <Dropdown items={buildItems()} disabled>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await page.getByRole('button', { name: 'Open menu' }).click();

    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
  });

  it('closes when clicking outside the menu', async () => {
    const onClose = vi.fn();
    render(
      <>
        <button type="button">Outside</button>
        <Dropdown items={buildItems()} onClose={onClose}>
          <button type="button">Open menu</button>
        </Dropdown>
      </>,
    );

    await openDropdown();
    await page.getByRole('button', { name: 'Outside' }).click();

    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('stays open when clicking an element marked with data-keep-open', async () => {
    render(
      <>
        <button type="button" data-keep-open>
          Keep open
        </button>
        <Dropdown items={buildItems()}>
          <button type="button">Open menu</button>
        </Dropdown>
      </>,
    );

    await openDropdown();
    await page.getByRole('button', { name: 'Keep open' }).click();

    await expect.element(page.getByRole('menu')).toBeVisible();
  });

  it('moves focus with the arrow keys and wraps around', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();
    await expect.element(getItem('Apple')).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(getItem('Banana')).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(getItem('Cherry')).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(getItem('Apple')).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}');
    await expect.element(getItem('Cherry')).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}');
    await expect.element(getItem('Banana')).toHaveFocus();
  });

  it('jumps to the first and last item with Ctrl+ArrowUp and Ctrl+ArrowDown', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();

    await userEvent.keyboard('{Control>}{ArrowDown}{/Control}');
    await expect.element(getItem('Cherry')).toHaveFocus();

    await userEvent.keyboard('{Control>}{ArrowUp}{/Control}');
    await expect.element(getItem('Apple')).toHaveFocus();
  });

  it('wraps focus to the opposite end when a focus sentinel receives focus', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();
    const sentinels = page.getByRole('menu').getByRole('button');

    (sentinels.first().element() as HTMLElement).focus();
    await expect.element(getItem('Cherry')).toHaveFocus();

    (sentinels.last().element() as HTMLElement).focus();
    await expect.element(getItem('Apple')).toHaveFocus();
  });

  it('activates the focused item with Enter and closes the menu', async () => {
    const items = buildItems();
    render(
      <Dropdown items={items}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    expect(items[1].onClick).toHaveBeenCalledTimes(1);
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(
      <Dropdown items={buildItems()} onClose={onClose}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();
    await userEvent.keyboard('{Escape}');

    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps the menu open after clicking a keepOpen item', async () => {
    const items = buildItems();
    items[0].keepOpen = true;
    render(
      <Dropdown items={items}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();
    await getItem('Apple').click();

    expect(items[0].onClick).toHaveBeenCalledTimes(1);
    await expect.element(page.getByRole('menu')).toBeVisible();
  });

  it('keeps the menu open after clicking an item in multiple mode', async () => {
    const items = buildItems();
    render(
      <Dropdown items={items} multiple>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();
    await getItem('Apple').click();
    await getItem('Cherry').click();

    expect(items[0].onClick).toHaveBeenCalledTimes(1);
    expect(items[3].onClick).toHaveBeenCalledTimes(1);
    await expect.element(page.getByRole('menu')).toBeVisible();
  });

  it('does not call onClick of a disabled item', async () => {
    const items = buildItems();
    items[0].disabled = true;
    render(
      <Dropdown items={items}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();
    await getItem('Apple').click({ force: true });

    expect(items[0].onClick).not.toHaveBeenCalled();
  });

  it('opens from the keyboard on a non-button trigger when handleTriggerEvents is set', async () => {
    render(
      <Dropdown items={buildItems()} handleTriggerEvents>
        <input aria-label="Trigger input" />
      </Dropdown>,
    );

    await page.getByRole('textbox', { name: 'Trigger input' }).click();
    await expect.element(page.getByRole('menu')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();

    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('menu')).toBeVisible();
  });

  it('sizes the menu like the trigger when width is 100%', async () => {
    render(
      <Dropdown items={buildItems()} width="100%" disableAutoFocus>
        <button type="button" style={{ width: '300px' }}>
          Open menu
        </button>
      </Dropdown>,
    );

    await openDropdown();

    await expect.element(page.getByRole('menu')).toHaveStyle({ maxWidth: '100%' });
    await expect.element(getItem('Apple')).not.toHaveFocus();
  });

  describe('nested items', () => {
    function buildNestedItems(): Array<DropdownItem> {
      return [
        { id: 'first', label: 'First', onClick: vi.fn() },
        {
          id: 'more',
          label: 'More',
          items: [
            { id: 'sub-a', label: 'Sub A', onClick: vi.fn() },
            { id: 'sub-b', label: 'Sub B', onClick: vi.fn() },
          ],
        },
      ];
    }

    it('opens the submenu on hover and calls the sub item onClick', async () => {
      const items = buildNestedItems();
      render(
        <Dropdown items={items}>
          <button type="button">Open menu</button>
        </Dropdown>,
      );

      await openDropdown();
      await getItem('More').hover();

      await expect.element(getItem('Sub A')).toBeVisible();
      await getItem('Sub B').click();

      expect(items[1].items?.[1].onClick).toHaveBeenCalledTimes(1);
    });

    it('opens the submenu with ArrowRight and closes it with ArrowLeft', async () => {
      render(
        <Dropdown items={buildNestedItems()}>
          <button type="button">Open menu</button>
        </Dropdown>,
      );

      await openDropdown();
      await userEvent.keyboard('{ArrowDown}');
      await expect.element(getItem('More')).toHaveFocus();

      await userEvent.keyboard('{ArrowRight}');
      await expect.element(getItem('Sub A')).toBeVisible();
      await expect.element(getItem('Sub A')).toHaveFocus();

      await userEvent.keyboard('{ArrowLeft}');
      await expect.element(getItem('Sub A')).not.toBeInTheDocument();
      await expect.element(getItem('More')).toHaveFocus();
      await expect.element(page.getByRole('menu')).toBeVisible();
    });

    it('navigates the submenu with the keyboard without moving focus in the parent menu', async () => {
      const items = buildNestedItems();
      render(
        <Dropdown items={items}>
          <button type="button">Open menu</button>
        </Dropdown>,
      );

      await openDropdown();
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(getItem('Sub A')).toHaveFocus();

      await userEvent.keyboard('{ArrowDown}');
      await expect.element(getItem('Sub B')).toHaveFocus();

      await userEvent.keyboard('{ArrowUp}');
      await expect.element(getItem('Sub A')).toHaveFocus();

      await userEvent.keyboard('{Control>}{ArrowDown}{/Control}');
      await expect.element(getItem('Sub B')).toHaveFocus();

      await userEvent.keyboard('{Control>}{ArrowUp}{/Control}');
      await expect.element(getItem('Sub A')).toHaveFocus();

      await userEvent.keyboard('{Enter}');
      expect(items[1].items?.[0].onClick).toHaveBeenCalledTimes(1);
      expect(items[0].onClick).not.toHaveBeenCalled();
    });

    it('closes the submenu with Escape without closing the parent menu', async () => {
      render(
        <Dropdown items={buildNestedItems()}>
          <button type="button">Open menu</button>
        </Dropdown>,
      );

      await openDropdown();
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(getItem('Sub A')).toBeVisible();

      await userEvent.keyboard('{Escape}');

      await expect.element(getItem('Sub A')).not.toBeInTheDocument();
      await expect.element(getItem('More')).toBeVisible();
    });

    it('closes the submenu after the mouse leaves it', async () => {
      render(
        <Dropdown items={buildNestedItems()}>
          <button type="button">Open menu</button>
        </Dropdown>,
      );

      await openDropdown();
      await getItem('More').hover();
      await expect.element(getItem('Sub A')).toBeVisible();

      await getItem('First').hover();

      await expect.element(getItem('Sub A')).not.toBeInTheDocument();
    });

    it('keeps the submenu open when the mouse comes back before the close delay', async () => {
      render(
        <Dropdown items={buildNestedItems()}>
          <button type="button">Open menu</button>
        </Dropdown>,
      );

      await openDropdown();
      await getItem('More').hover();
      await expect.element(getItem('Sub A')).toBeVisible();

      await getItem('First').hover();
      await getItem('Sub A').hover();
      await new Promise((resolve) => {
        setTimeout(resolve, 700);
      });

      await expect.element(getItem('Sub A')).toBeVisible();
    });
  });
});
