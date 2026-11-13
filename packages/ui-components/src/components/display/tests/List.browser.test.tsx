/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../../../web-components';

import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { List } from '../List/List';
import { ListItem } from '../ListItem';

const LABELS = ['Alpha', 'Beta', 'Gamma'];

function renderList(onSelect: (label: string) => void, keyboardShortcutsIsDisabled = false) {
  return render(
    <List keyboardShortcutsIsDisabled={keyboardShortcutsIsDisabled}>
      {LABELS.map((label) => (
        <ListItem key={label} data-testid={`item-${label}`}>
          {() => (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div onClick={() => onSelect(label)}>{label}</div>
          )}
        </ListItem>
      ))}
    </List>,
  );
}

function getItem(label: string) {
  return page.getByTestId(`item-${label}`);
}

describe('List', () => {
  it('moves focus between items with the arrow keys', async () => {
    renderList(vi.fn());

    await getItem('Alpha').click();
    await expect.element(getItem('Alpha')).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(getItem('Beta')).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}');
    await expect.element(getItem('Alpha')).toHaveFocus();
  });

  it('jumps to the first and last items with Ctrl+Arrow keys', async () => {
    renderList(vi.fn());

    await getItem('Beta').click();

    await userEvent.keyboard('{Control>}{ArrowDown}{/Control}');
    await expect.element(getItem('Gamma')).toHaveFocus();

    await userEvent.keyboard('{Control>}{ArrowUp}{/Control}');
    await expect.element(getItem('Alpha')).toHaveFocus();
  });

  it('blurs the focused item on Escape', async () => {
    renderList(vi.fn());

    await getItem('Beta').click();
    await expect.element(getItem('Beta')).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect.element(getItem('Beta')).not.toHaveFocus();
  });

  it('keeps focus on the item when Enter is pressed', async () => {
    renderList(vi.fn());

    await getItem('Beta').click();
    await userEvent.keyboard('{Enter}');

    await expect.element(getItem('Beta')).toHaveFocus();
  });

  it('calls onListBottom when the bottom of the list becomes visible', async () => {
    const onListBottom = vi.fn();
    render(
      <List onListBottom={onListBottom}>
        {LABELS.map((label) => (
          <ListItem key={label}>{() => <div>{label}</div>}</ListItem>
        ))}
      </List>,
    );

    await expect.element(page.getByTestId('list-bottom-element')).toBeInTheDocument();
    await expect.poll(() => onListBottom.mock.calls.length).toBeGreaterThan(0);
  });

  it('does not react to the arrow keys when keyboard shortcuts are disabled', async () => {
    renderList(vi.fn(), true);

    await getItem('Alpha').click();
    await userEvent.keyboard('{ArrowDown}');

    await expect.element(getItem('Alpha')).toHaveFocus();
  });
});
