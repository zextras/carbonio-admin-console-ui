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
  default: () => <div data-testid="app-view" />,
}));

import { addRoute, removeRoute, useIsAdvanced } from '@zextras/ui-shared';

import App from '../app';
import { LOG_AND_QUEUES, NOTIFICATION_ROUTE_ID, PRIMARY_BAR_NOTIFICATIONS } from '../constants';
import { NotificationsTooltipView } from '../views/notifications-tooltip-view';

describe('App', () => {
  beforeEach(() => {
    (useIsAdvanced as Mock).mockReturnValue(true);
  });

  it('should call addRoute with correct config when user is advanced', () => {
    render(<App />);

    expect(addRoute).toHaveBeenCalledWith(
      expect.objectContaining({
        route: NOTIFICATION_ROUTE_ID,
        position: 1,
        visible: true,
        label: 'Notifications',
        primaryBar: 'BellOutline',
        trackerLabel: PRIMARY_BAR_NOTIFICATIONS,
      }),
    );
  });

  it('should pass AppView and NotificationsTooltipView to addRoute', () => {
    render(<App />);

    const callArgs = (addRoute as Mock).mock.calls[0][0];
    expect(callArgs.appView).toBeDefined();
    expect(callArgs.tooltip).toBe(NotificationsTooltipView);
  });

  it('should pass log and queues section to addRoute', () => {
    render(<App />);

    const callArgs = (addRoute as Mock).mock.calls[0][0];
    expect(callArgs.primarybarSection).toEqual({
      id: LOG_AND_QUEUES,
      label: 'Log & Queues',
      position: 5,
    });
  });

  it('should call removeRoute when user is not advanced', () => {
    (useIsAdvanced as Mock).mockReturnValue(false);

    render(<App />);

    expect(removeRoute).toHaveBeenCalledWith(NOTIFICATION_ROUTE_ID);
    expect(addRoute).not.toHaveBeenCalled();
  });

  it('should render null', () => {
    const { container } = render(<App />);
    expect(container.innerHTML).toBe('');
  });
});
