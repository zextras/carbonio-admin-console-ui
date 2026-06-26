/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { CopyToClipboardButton } from '../CopyToClipboardButton';

describe('CopyToClipboardButton', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    writeText.mockClear();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  });

  it('renders the copy button', async () => {
    await render(<CopyToClipboardButton value="order-123" />);

    await expect.element(page.getByRole('button', { name: 'Copy' })).toBeVisible();
  });

  it('does not show the confirmation pill initially', async () => {
    await render(<CopyToClipboardButton value="order-123" />);

    await expect.element(page.getByText('Copied to clipboard')).not.toBeInTheDocument();
  });

  it('shows the confirmation pill after clicking copy', async () => {
    await render(<CopyToClipboardButton value="order-123" />);

    await page.getByRole('button', { name: 'Copy' }).click();

    await expect.element(page.getByText('Copied to clipboard')).toBeVisible();
    expect(writeText).toHaveBeenCalledWith('order-123');
  });

  it('hides the confirmation pill after the auto-hide delay', async () => {
    await render(<CopyToClipboardButton value="order-123" autoHideMs={50} />);

    await page.getByRole('button', { name: 'Copy' }).click();

    const pill = page.getByText('Copied to clipboard');
    await expect.element(pill).toBeVisible();
    await expect.element(pill).not.toBeVisible();
  });
});
