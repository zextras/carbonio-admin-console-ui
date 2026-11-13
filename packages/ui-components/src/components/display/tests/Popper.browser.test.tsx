/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../../../web-components';

import { useRef, useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Popper } from '../Popper';

type HarnessProps = {
  onClose?: () => void;
  initialOpen?: boolean;
};

const Harness = ({ onClose, initialOpen = false }: HarnessProps) => {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(initialOpen);
  const close = () => {
    onClose?.();
    setOpen(false);
  };
  return (
    <>
      <button type="button" ref={anchorRef} onClick={() => setOpen(true)}>
        Anchor
      </button>
      <button type="button">Outside</button>
      <Popper open={open} anchorEl={anchorRef} onClose={close}>
        <button type="button">First action</button>
        <button type="button">Last action</button>
      </Popper>
    </>
  );
};

describe('Popper', () => {
  it('renders the content and moves focus into it when opened', async () => {
    render(<Harness />);

    await page.getByRole('button', { name: 'Anchor' }).click();

    await expect.element(page.getByRole('button', { name: 'First action' })).toBeVisible();
    await expect
      .element(page.getByTestId('popper'))
      .toContainElement(document.activeElement as HTMLElement);
  });

  it('closes on Escape when mounted open', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} initialOpen />);

    await page.getByRole('button', { name: 'First action' }).click();
    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
    await expect.element(page.getByTestId('popper')).not.toBeInTheDocument();
  });

  it('closes when clicking outside but not when clicking inside', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);

    await page.getByRole('button', { name: 'Anchor' }).click();
    await expect.element(page.getByTestId('popper')).toBeVisible();
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });

    await page.getByRole('button', { name: 'First action' }).click();
    expect(onClose).not.toHaveBeenCalled();

    await page.getByRole('button', { name: 'Outside' }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
    await expect.element(page.getByTestId('popper')).not.toBeInTheDocument();
  });

  it('wraps focus to the opposite end when a focus sentinel receives focus', async () => {
    render(<Harness initialOpen />);

    await expect.element(page.getByTestId('popper')).toBeVisible();
    const buttons = page.getByTestId('popper').getByRole('button');

    (buttons.first().element() as HTMLElement).focus();
    await expect.element(page.getByRole('button', { name: 'Last action' })).toHaveFocus();

    (buttons.last().element() as HTMLElement).focus();
    await expect.element(page.getByRole('button', { name: 'First action' })).toHaveFocus();
  });
});
