/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-components', () => ({
  Container: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../shell-primary-bar', () => ({
  ShellPrimaryBar: () => <div data-testid="shell-primary-bar" />,
}));

import { ShellNavigationBar } from '../shell-navigation-bar';

describe('ShellNavigationBar', () => {
  it('renders without crashing', () => {
    const { container } = render(<ShellNavigationBar activeRoute={undefined} />);
    expect(container).toBeDefined();
  });

  it('renders ShellPrimaryBar', () => {
    render(<ShellNavigationBar activeRoute={undefined} />);
    expect(screen.getByTestId('shell-primary-bar')).toBeTruthy();
  });
});
