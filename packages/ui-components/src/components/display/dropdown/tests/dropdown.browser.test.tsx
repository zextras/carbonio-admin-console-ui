/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../../../../web-components';

import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Dropdown, type DropdownItem } from '../index';

function buildItems(): Array<DropdownItem> {
  return [
    { id: 'apple', label: 'Apple', onClick: vi.fn() },
    { id: 'banana', label: 'Banana', onClick: vi.fn() },
    { id: 'divider', type: 'divider' },
    { id: 'cherry', label: 'Cherry', onClick: vi.fn() },
  ];
}

/** Mirrors menus with no actions for the active context: the list starts with a divider. */
function buildDividerFirstItems(): Array<DropdownItem> {
  return [
    { id: 'divider', type: 'divider' },
    { id: 'cos', label: 'COS', onClick: vi.fn() },
    { id: 'divider-2', type: 'divider' },
    { id: 'domain', label: 'Domain', onClick: vi.fn() },
  ];
}

function getItem(name: string) {
  return page.getByRole('menuitem', { name, exact: true });
}

async function openDropdown() {
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect.element(page.getByRole('menu')).toBeVisible();
}

/** Focuses the trigger without a pointer click (keyboard modality). */
async function focusTrigger(): Promise<void> {
  const trigger = page.getByRole('button', { name: 'Open menu' });
  await expect.element(trigger).toBeVisible();
  (trigger.element() as HTMLElement).focus();
}

/** Opens the menu the way a keyboard user does: focus the trigger, press Enter. */
async function openDropdownWithKeyboard() {
  await focusTrigger();
  await userEvent.keyboard('{Enter}');
  await expect.element(page.getByRole('menu')).toBeVisible();
}

describe('Dropdown', () => {
  it('moves focus to the first item on a mouse open without painting it as focused', async () => {
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
    const focusedStyle = window.getComputedStyle(getItem('Apple').element() as HTMLElement);
    const restingStyle = window.getComputedStyle(getItem('Cherry').element() as HTMLElement);
    expect(focusedStyle.outlineStyle).toBe('none');
    expect(focusedStyle.backgroundColor).toBe(restingStyle.backgroundColor);
  });

  it('supports the arrow keys and Escape right after a mouse open', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(getItem('Banana')).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
  });

  it('focuses the first item after a leading divider when opened from the keyboard', async () => {
    render(
      <Dropdown items={buildDividerFirstItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdownWithKeyboard();

    await expect.element(getItem('COS')).toHaveFocus();
  });

  it('keeps exactly one tab stop when the menu starts with a divider', async () => {
    render(
      <Dropdown items={buildDividerFirstItems()} disableAutoFocus>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();

    const tabStops = page
      .getByRole('menuitem')
      .elements()
      .filter((item) => item.getAttribute('tabindex') === '0');
    expect(tabStops).toHaveLength(1);
    expect(tabStops[0]).toBe(getItem('COS').element());
  });

  it('focuses the first item after a leading divider when opened with the mouse', async () => {
    render(
      <Dropdown items={buildDividerFirstItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();
    await expect.element(getItem('COS')).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(getItem('Domain')).toHaveFocus();
  });

  it('focuses the first item when opened from the keyboard', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdownWithKeyboard();

    await expect.element(getItem('Apple')).toHaveFocus();
  });

  it('opens and focuses the first item when ArrowDown is pressed on the trigger', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await focusTrigger();
    await userEvent.keyboard('{ArrowDown}');

    await expect.element(page.getByRole('menu')).toBeVisible();
    await expect.element(getItem('Apple')).toHaveFocus();
  });

  it('opens and focuses the last item when ArrowUp is pressed on the trigger', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await focusTrigger();
    await userEvent.keyboard('{ArrowUp}');

    await expect.element(page.getByRole('menu')).toBeVisible();
    await expect.element(getItem('Cherry')).toHaveFocus();
  });

  it('moves focus to the item under the pointer without a focus ring', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();
    await getItem('Banana').hover();

    await expect.element(getItem('Banana')).toHaveFocus();
    await expect.element(getItem('Apple')).not.toHaveFocus();
    const item = getItem('Banana').element() as HTMLElement;
    expect(window.getComputedStyle(item).outlineStyle).toBe('none');
  });

  it('focuses the selected item when the menu opens', async () => {
    const items = buildItems();
    items[1].selected = true;
    render(
      <Dropdown items={items}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdownWithKeyboard();

    await expect
      .element(page.getByRole('menuitemradio', { name: 'Banana', exact: true }))
      .toHaveFocus();
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

    await openDropdownWithKeyboard();
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

  it('follows a controlled closed state and reports open intent', async () => {
    const onOpenChange = vi.fn();
    render(
      <Dropdown items={buildItems()} open={false} onOpenChange={onOpenChange}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await page.getByRole('button', { name: 'Open menu' }).click();

    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('keeps a controlled open menu mounted and reports close intent on Escape', async () => {
    const onOpenChange = vi.fn();
    render(
      <Dropdown items={buildItems()} open onOpenChange={onOpenChange}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await expect.element(page.getByRole('menu')).toBeVisible();
    await expect.element(getItem('Apple')).toHaveFocus();

    await userEvent.keyboard('{Escape}');

    await expect.element(page.getByRole('menu')).toBeVisible();
    expect(onOpenChange).toHaveBeenCalledWith(false);
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

  it('moves focus with the arrow keys and wraps around', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdownWithKeyboard();
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

    await openDropdownWithKeyboard();

    await userEvent.keyboard('{Control>}{ArrowDown}{/Control}');
    await expect.element(getItem('Cherry')).toHaveFocus();

    await userEvent.keyboard('{Control>}{ArrowUp}{/Control}');
    await expect.element(getItem('Apple')).toHaveFocus();
  });

  it('activates the focused item with Enter and closes the menu', async () => {
    const items = buildItems();
    render(
      <Dropdown items={items}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdownWithKeyboard();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    expect(items[1].onClick).toHaveBeenCalledTimes(1);
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
  });

  it('does not hide any scrollable overflow in the menu', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();

    const menu = page.getByRole('menu').element() as HTMLElement;
    expect(menu.scrollHeight).toBe(menu.clientHeight);
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

  it('closes and restores focus to the trigger when Tab is pressed', async () => {
    const onClose = vi.fn();
    render(
      <Dropdown items={buildItems()} onClose={onClose}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdownWithKeyboard();
    await userEvent.keyboard('{Tab}');

    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Open menu' })).toHaveFocus();
    expect(onClose).toHaveBeenCalledTimes(1);
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

  it('renders items as native buttons', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();

    const item = getItem('Apple').element() as HTMLButtonElement;
    expect(item.tagName).toBe('BUTTON');
    expect(item.type).toBe('button');
  });

  it('disables native button items with the disabled attribute', async () => {
    const items = buildItems();
    items[0].disabled = true;
    render(
      <Dropdown items={items}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();

    const item = getItem('Apple').element() as HTMLButtonElement;
    expect(item.tagName).toBe('BUTTON');
    expect(item.disabled).toBe(true);
  });

  it('opens from the keyboard on a non-editable trigger when handleTriggerEvents is set', async () => {
    render(
      <Dropdown items={buildItems()} handleTriggerEvents>
        <div role="button" tabIndex={0}>
          Open menu
        </div>
      </Dropdown>,
    );

    await page.getByText('Open menu').click();
    await expect.element(page.getByRole('menu')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();

    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('menu')).toBeVisible();
  });

  it('exposes the popup state on the trigger through aria attributes', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    const trigger = page.getByRole('button', { name: 'Open menu' });
    await expect.element(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect.element(trigger).not.toHaveAttribute('aria-controls');

    await trigger.click();
    await expect.element(page.getByRole('menu')).toBeVisible();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    const menuId = (page.getByRole('menu').element() as HTMLElement).id;
    expect(menuId).not.toBe('');
    await expect.element(trigger).toHaveAttribute('aria-controls', menuId);
  });

  it('exposes selectable items as menuitemradio with aria-checked in single mode', async () => {
    const items = buildItems();
    items[0].selected = true;
    items[1].selected = false;
    render(
      <Dropdown items={items}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();

    await expect
      .element(page.getByRole('menuitemradio', { name: 'Apple', exact: true }))
      .toHaveAttribute('aria-checked', 'true');
    await expect
      .element(page.getByRole('menuitemradio', { name: 'Banana', exact: true }))
      .toHaveAttribute('aria-checked', 'false');
    expect(page.getByRole('menuitem', { name: 'Cherry', exact: true }).elements()).toHaveLength(1);
  });

  it('exposes selectable items as menuitemcheckbox in multiple mode', async () => {
    const items = buildItems();
    items[1].selected = true;
    render(
      <Dropdown items={items} multiple>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();

    await expect
      .element(page.getByRole('menuitemcheckbox', { name: 'Banana', exact: true }))
      .toHaveAttribute('aria-checked', 'true');
  });

  it('marks disabled items with aria-disabled', async () => {
    const items = buildItems();
    items[0].disabled = true;
    render(
      <Dropdown items={items}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();

    await expect
      .element(page.getByRole('menuitem', { name: 'Apple', exact: true }))
      .toHaveAttribute('aria-disabled', 'true');
  });

  it('hides decorative icons from assistive technology', async () => {
    const items: Array<DropdownItem> = [
      { id: 'apple', label: 'Apple', icon: 'CheckmarkSquare', onClick: vi.fn() },
      {
        id: 'more',
        label: 'More',
        items: [{ id: 'sub-a', label: 'Sub A', onClick: vi.fn() }],
      },
    ];
    render(
      <Dropdown items={items}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();

    const itemIcon = page
      .getByRole('menuitem', { name: 'Apple', exact: true })
      .element()
      .querySelector('ds-icon');
    expect(itemIcon?.getAttribute('aria-hidden')).toBe('true');

    const chevronIcon = page
      .getByRole('menuitem', { name: 'More', exact: true })
      .element()
      .querySelector('ds-icon');
    expect(chevronIcon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps a single tabbable item and moves it with focus (roving tabindex)', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdownWithKeyboard();

    await expect.element(getItem('Apple')).toHaveAttribute('tabindex', '0');
    await expect.element(getItem('Banana')).toHaveAttribute('tabindex', '-1');
    await expect.element(getItem('Cherry')).toHaveAttribute('tabindex', '-1');

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(getItem('Banana')).toHaveFocus();
    await expect.element(getItem('Banana')).toHaveAttribute('tabindex', '0');
    await expect.element(getItem('Apple')).toHaveAttribute('tabindex', '-1');
  });

  it('skips disabled items with the arrow keys', async () => {
    const items = buildItems();
    items[1].disabled = true;
    render(
      <Dropdown items={items}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdownWithKeyboard();
    await expect.element(getItem('Apple')).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(getItem('Cherry')).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}');
    await expect.element(getItem('Apple')).toHaveFocus();
  });

  it('activates the focused item with Space and closes the menu', async () => {
    const items = buildItems();
    render(
      <Dropdown items={items}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdownWithKeyboard();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Space}');

    expect(items[1].onClick).toHaveBeenCalledTimes(1);
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
  });

  it('opens from the keyboard on a non-button trigger by default', async () => {
    render(
      <Dropdown items={buildItems()}>
        <div role="button" tabIndex={0}>
          Open menu
        </div>
      </Dropdown>,
    );

    const trigger = page.getByText('Open menu');
    await trigger.click();
    await expect.element(page.getByRole('menu')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();

    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('menu')).toBeVisible();
  });

  it('does not toggle when a space is typed inside an editable element in the trigger', async () => {
    render(
      <Dropdown items={buildItems()}>
        <div>
          <input aria-label="Trigger input" />
        </div>
      </Dropdown>,
    );

    const input = page.getByRole('textbox', { name: 'Trigger input' });
    await input.click();
    await expect.element(page.getByRole('menu')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();

    await userEvent.keyboard('a b');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    await expect.element(input).toHaveValue('a b');
  });

  it('does not open from the keyboard when handleTriggerEvents is explicitly false', async () => {
    render(
      <Dropdown items={buildItems()} handleTriggerEvents={false}>
        <div role="button" tabIndex={0}>
          Open menu
        </div>
      </Dropdown>,
    );

    await page.getByText('Open menu').click();
    await expect.element(page.getByRole('menu')).toBeVisible();
    await page.getByText('Open menu').click();
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();

    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
  });

  it('closes and restores focus to the trigger when Tab is pressed after a mouse open', async () => {
    const onClose = vi.fn();
    render(
      <Dropdown items={buildItems()} onClose={onClose}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdown();
    await userEvent.keyboard('{Tab}');

    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Open menu' })).toHaveFocus();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows a visible focus indicator on keyboard-focused items', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await userEvent.keyboard('{Tab}');
    await expect.element(page.getByRole('button', { name: 'Open menu' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('menu')).toBeVisible();
    await userEvent.keyboard('{ArrowDown}');

    const item = getItem('Banana').element() as HTMLElement;
    expect(window.getComputedStyle(item).outlineStyle).toBe('solid');
  });

  it('focuses the next matching item with typeahead', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdownWithKeyboard();
    await expect.element(getItem('Apple')).toHaveFocus();

    await userEvent.keyboard('{C}');

    await expect.element(getItem('Cherry')).toHaveFocus();
  });

  it('jumps to the first and last item with Home and End', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button">Open menu</button>
      </Dropdown>,
    );

    await openDropdownWithKeyboard();
    await expect.element(getItem('Apple')).toHaveFocus();

    await userEvent.keyboard('{End}');
    await expect.element(getItem('Cherry')).toHaveFocus();

    await userEvent.keyboard('{Home}');
    await expect.element(getItem('Apple')).toHaveFocus();
  });

  it('labels the menu with its trigger', async () => {
    render(
      <Dropdown items={buildItems()}>
        <button type="button" id="my-trigger">
          Open menu
        </button>
      </Dropdown>,
    );

    await openDropdown();

    const menu = page.getByRole('menu').element() as HTMLElement;
    expect(menu.getAttribute('aria-labelledby')).toBe('my-trigger');
    const trigger = page.getByRole('button', { name: 'Open menu' }).element() as HTMLElement;
    expect(trigger.id).toBe('my-trigger');
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

      await openDropdownWithKeyboard();
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

    it('focuses the first submenu item again when the submenu is reopened', async () => {
      render(
        <Dropdown items={buildNestedItems()}>
          <button type="button">Open menu</button>
        </Dropdown>,
      );

      await openDropdownWithKeyboard();
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(getItem('Sub A')).toBeVisible();

      await userEvent.keyboard('{ArrowLeft}');
      await expect.element(getItem('Sub A')).not.toBeInTheDocument();

      await userEvent.keyboard('{ArrowRight}');
      await expect.element(getItem('Sub A')).toBeVisible();
      await expect.element(getItem('Sub A')).toHaveFocus();
    });

    it('navigates the submenu with the keyboard without moving focus in the parent menu', async () => {
      const items = buildNestedItems();
      render(
        <Dropdown items={items}>
          <button type="button">Open menu</button>
        </Dropdown>,
      );

      await openDropdownWithKeyboard();
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

      await openDropdownWithKeyboard();
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

    it('keeps the migrated flex layout on the submenu row and its trigger', async () => {
      render(
        <Dropdown items={buildNestedItems()}>
          <button type="button">Open menu</button>
        </Dropdown>,
      );

      await openDropdown();

      const row = getItem('More').element() as HTMLElement;
      const rowStyle = window.getComputedStyle(row);
      expect(rowStyle.display).toBe('flex');
      expect(rowStyle.flexDirection).toBe('row');
      expect(rowStyle.alignItems).toBe('center');
      expect(rowStyle.justifyContent).toBe('flex-start');

      const trigger = row.querySelector('[aria-expanded]') as HTMLElement | null;
      expect(trigger).not.toBeNull();
      const triggerStyle = window.getComputedStyle(trigger as HTMLElement);
      expect(triggerStyle.display).toBe('flex');
      expect(triggerStyle.justifyContent).toBe('space-between');
      expect(triggerStyle.paddingTop).not.toBe('0px');
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
