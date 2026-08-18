/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../../../web-components';

import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { ListPanelItem } from '../list-panel-item';

function ToggleHarness() {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <ListPanelItem
      title="Manage"
      isListExpanded={isExpanded}
      setToggleView={(): void => {
        setIsExpanded(!isExpanded);
      }}
    />
  );
}

async function setupToggle() {
  render(<ToggleHarness />);
  const toggle = page.getByRole('button', { name: 'Manage' });
  await expect.element(toggle).toBeVisible();
  return toggle;
}

describe('ListPanelItem', () => {
  it('should render the section title', async () => {
    render(<ListPanelItem title="Manage" isListExpanded setToggleView={(): void => {}} />);
    await expect.element(page.getByText('Manage')).toBeVisible();
  });

  it('should expose the expanded state on the toggle', async () => {
    const toggle = await setupToggle();
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('should toggle the state when the toggle is clicked', async () => {
    const toggle = await setupToggle();

    await toggle.click();

    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('should toggle the state when Enter is pressed on the toggle', async () => {
    const toggle = await setupToggle();
    toggle.element().focus();

    await userEvent.keyboard('{Enter}');

    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('should toggle the state when Space is pressed on the toggle', async () => {
    const toggle = await setupToggle();
    toggle.element().focus();

    await userEvent.keyboard(' ');

    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('should not toggle the state when another key is pressed', async () => {
    const toggle = await setupToggle();
    toggle.element().focus();

    await userEvent.keyboard('a');

    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('should toggle back to expanded on a second click', async () => {
    const toggle = await setupToggle();

    await toggle.click();
    await toggle.click();

    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});
