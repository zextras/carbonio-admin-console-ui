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

vi.mock('../views/app-view', () => ({
  AppView: () => <div data-testid="app-view" />,
}));

import { addRoute, removeRoute, useHasAllRights, useIsAdvanced } from '@zextras/ui-shared';

import App from '../app';
import {
  MANAGE_APP_ID,
  PRIMARY_BAR_SUBSCRIPTIONS,
  SUBSCRIPTIONS_ROUTE_ID,
} from '../constants';

describe('App', () => {
  beforeEach(() => {
    (useIsAdvanced as Mock).mockReturnValue(true);
    (useHasAllRights as Mock).mockReturnValue(true);
  });

  it('should call addRoute with correct config when user is advanced with full rights', () => {
    render(<App />);

    expect(addRoute).toHaveBeenCalledWith(
      expect.objectContaining({
        route: SUBSCRIPTIONS_ROUTE_ID,
        position: 5,
        visible: true,
        label: 'Subscriptions',
        primaryBar: 'AwardOutline',
        trackerLabel: PRIMARY_BAR_SUBSCRIPTIONS,
      }),
    );
  });

  it('should pass AppView and a tooltip component to addRoute', () => {
    render(<App />);

    const callArgs = (addRoute as Mock).mock.calls[0][0];
    expect(callArgs.appView).toBeDefined();
    expect(typeof callArgs.tooltip).toBe('function');
  });

  it('should render the tooltip content', () => {
    render(<App />);

    const callArgs = (addRoute as Mock).mock.calls[0][0];
    const Tooltip = callArgs.tooltip as () => React.JSX.Element;
    const { getByTestId } = render(<Tooltip />);
    expect(getByTestId('primary-bar-tooltip')).toBeDefined();
  });

  it('should pass the Management section to addRoute', () => {
    render(<App />);

    const callArgs = (addRoute as Mock).mock.calls[0][0];
    expect(callArgs.primarybarSection).toEqual({
      id: MANAGE_APP_ID,
      label: 'Management',
      position: 3,
    });
  });

  it('should call removeRoute when user is not advanced', () => {
    (useIsAdvanced as Mock).mockReturnValue(false);

    render(<App />);

    expect(removeRoute).toHaveBeenCalledWith(SUBSCRIPTIONS_ROUTE_ID);
    expect(addRoute).not.toHaveBeenCalled();
  });

  it('should call removeRoute when user lacks config rights', () => {
    (useHasAllRights as Mock).mockReturnValue(false);

    render(<App />);

    expect(removeRoute).toHaveBeenCalledWith(SUBSCRIPTIONS_ROUTE_ID);
    expect(addRoute).not.toHaveBeenCalled();
  });

  it('should render null', () => {
    const { container } = render(<App />);
    expect(container.innerHTML).toBe('');
  });
});
