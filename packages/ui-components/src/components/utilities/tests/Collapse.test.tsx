/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Collapse } from '../Collapse';

describe('Collapse', () => {
  it('renders the children collapsed when closed', () => {
    render(
      <Collapse open={false} data-testid="collapse">
        <span>Content</span>
      </Collapse>,
    );

    expect(screen.getByText('Content')).toBeTruthy();
    expect(screen.getByTestId('collapse').style.height).toBe('0px');
  });

  it('expands to the content height when opened', async () => {
    const { rerender } = render(
      <Collapse open={false} data-testid="collapse">
        <span>Content</span>
      </Collapse>,
    );

    rerender(
      <Collapse open data-testid="collapse">
        <span>Content</span>
      </Collapse>,
    );

    await expect.poll(() => screen.getByTestId('collapse').style.height).toBe('auto');
    expect(screen.getByTestId('collapse').style.visibility).toBe('visible');
  });
});
