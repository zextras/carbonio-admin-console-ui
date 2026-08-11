/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react';
import { addRoute } from '@zextras/ui-shared';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './app';

const mockRouter = vi.hoisted(() => ({ pathname: '/', navigate: vi.fn() }));

vi.mock('@zextras/ui-components', () => ({
  PrimaryBarTooltip: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@zextras/ui-shared', () => ({
  DASHBOARD_ROUTE_ID: 'dashboard',
  addRoute: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  Trans: ({ defaults }: { defaults?: string }) => <>{defaults}</>,
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('react-router', () => ({
  useLocation: () => ({ pathname: mockRouter.pathname }),
  useNavigate: () => mockRouter.navigate,
}));

vi.mock('./views/app-view', () => ({
  AppView: () => <div data-testid="app-view" />,
}));

describe('Dashboard App bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.pathname = '/';
    mockRouter.navigate.mockReset();
  });

  it('calls addRoute with dashboard route configuration', () => {
    render(<App />);

    expect(addRoute).toHaveBeenCalledTimes(1);
    expect(addRoute).toHaveBeenCalledWith(
      expect.objectContaining({
        route: 'dashboard',
        position: 1,
        visible: true,
        label: 'Dashboard',
        primaryBar: 'HomeOutline',
        trackerLabel: 'pb_dashboard',
      }),
    );
  });

  it('passes AppView and tooltip components to addRoute', () => {
    render(<App />);

    const callArgs = (addRoute as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs.appView).toBeDefined();
    expect(callArgs.tooltip).toBeDefined();
  });

  it('navigates to dashboard when pathname is /', () => {
    mockRouter.pathname = '/';

    render(<App />);

    expect(mockRouter.navigate).toHaveBeenCalledWith('dashboard');
  });

  it('does not navigate when pathname is not /', () => {
    mockRouter.pathname = '/dashboard';

    render(<App />);

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('renders nothing (returns null)', () => {
    const { container } = render(<App />);

    expect(container.firstChild).toBeNull();
  });
});
