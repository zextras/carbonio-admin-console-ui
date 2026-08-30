/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CustomChip } from '../CustomChip';

const writeText = vi.fn();

beforeEach(() => {
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
});

describe('CustomChip', () => {
  it('renders the label', () => {
    render(<CustomChip label="user@example.com" />);
    expect(screen.getByText('user@example.com')).toBeTruthy();
  });

  it('copies the label to the clipboard when the default copy action is clicked', () => {
    render(<CustomChip label="user@example.com" />);
    fireEvent.click(screen.getByRole('button'));
    expect(writeText).toHaveBeenCalledWith('user@example.com');
  });

  it('replaces the default copy action when custom actions are provided', () => {
    const onClick = vi.fn();
    render(
      <CustomChip
        label="user@example.com"
        actions={[{ id: 'custom-action', type: 'button', icon: 'Close', onClick }]}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
    expect(writeText).not.toHaveBeenCalled();
  });
});
