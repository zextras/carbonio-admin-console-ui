/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-shared', () => ({
  useCurrentRoute: () => undefined,
}));

vi.mock('@zextras/ui-components', () => ({
  Row: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../utility-bar', () => ({
  ShellUtilityBar: () => <div data-testid="shell-utility-bar" />,
  ShellUtilityPanel: () => <div data-testid="shell-utility-panel" />,
}));

vi.mock('../app-view-container', () => ({
  AppViewContainer: () => <div data-testid="app-view-container" />,
}));

vi.mock('../shell-header', () => ({
  ShellHeader: ({ children }: { children?: ReactNode }) => (
    <div data-testid="shell-header">{children}</div>
  ),
}));

vi.mock('../shell-navigation-bar', () => ({
  ShellNavigationBar: () => <div data-testid="shell-navigation-bar" />,
}));

import { ShellView } from '../shell-view';

describe('ShellView', () => {
  it('renders without crashing', () => {
    const { container } = render(<ShellView />);
    expect(container).toBeDefined();
  });
});
