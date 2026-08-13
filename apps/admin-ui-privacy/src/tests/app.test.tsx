/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react';
import { type Mock, vi } from 'vitest';

vi.mock('@zextras/ui-components', () => ({
  PrimaryBarTooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="primary-bar-tooltip">{children}</div>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback || key, { i18n: {} }],
  Trans: ({ defaults }: { defaults: string }) => <>{defaults}</>,
}));

vi.mock('@zextras/ui-shared', () => ({
  addRoute: vi.fn(),
  removeRoute: vi.fn(),
  useHasAllRights: vi.fn(),
}));

vi.mock('../views/app-view', () => ({
  AppView: () => <div data-testid="app-view" />,
}));

import { addRoute, removeRoute, useHasAllRights } from '@zextras/ui-shared';

import App from '../app';
import { PRIMARY_BAR_PRIVACY, PRIVACY_ROUTE_ID } from '../constants';
import { PrivacyTooltipView } from '../views/privacy-tooltip-view';

describe('App', () => {
  beforeEach(() => {
    (useHasAllRights as Mock).mockReturnValue(true);
  });

  it('should call addRoute with correct config when config rights are present', () => {
    render(<App />);

    expect(addRoute).toHaveBeenCalledWith(
      expect.objectContaining({
        route: PRIVACY_ROUTE_ID,
        position: 6,
        visible: true,
        label: 'Privacy',
        primaryBar: 'ShieldOutline',
        trackerLabel: PRIMARY_BAR_PRIVACY,
      }),
    );
  });

  it('should pass AppView and PrivacyTooltipView to addRoute', () => {
    render(<App />);

    const callArgs = (addRoute as Mock).mock.calls[0][0];
    expect(callArgs.appView).toBeDefined();
    expect(callArgs.tooltip).toBe(PrivacyTooltipView);
  });

  it('should pass management section to addRoute', () => {
    render(<App />);

    const callArgs = (addRoute as Mock).mock.calls[0][0];
    expect(callArgs.primarybarSection).toEqual({
      id: 'manage',
      label: 'Management',
      position: 3,
    });
  });

  it('should call removeRoute when config rights are absent', () => {
    (useHasAllRights as Mock).mockReturnValue(false);

    render(<App />);

    expect(removeRoute).toHaveBeenCalledWith(PRIVACY_ROUTE_ID);
    expect(addRoute).not.toHaveBeenCalled();
  });

  it('should render null', () => {
    const { container } = render(<App />);
    expect(container.innerHTML).toBe('');
  });
});
