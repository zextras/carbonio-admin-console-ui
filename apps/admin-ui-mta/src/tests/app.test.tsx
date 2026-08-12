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

import { addRoute, removeRoute, useHasAllRights } from '@zextras/ui-shared';

import App from '../app';
import { MANAGE_APP_ID, MTA_ROUTE_ID, PRIMARY_BAR_MTA } from '../constants';
import { MtaTooltipView } from '../views/mta-tooltip-view';

describe('App', () => {
  beforeEach(() => {
    (useHasAllRights as Mock).mockReturnValue(true);
  });

  it('should call addRoute with correct config when user has all config rights', () => {
    render(<App />);

    expect(addRoute).toHaveBeenCalledWith(
      expect.objectContaining({
        route: MTA_ROUTE_ID,
        position: 3,
        visible: true,
        label: 'Mail Trans. Agent',
        primaryBar: 'MailFolderOutline',
        trackerLabel: PRIMARY_BAR_MTA,
      }),
    );
  });

  it('should pass AppView and MtaTooltipView to addRoute', () => {
    render(<App />);

    const callArgs = (addRoute as Mock).mock.calls[0][0];
    expect(callArgs.appView).toBeDefined();
    expect(callArgs.tooltip).toBe(MtaTooltipView);
  });

  it('should pass management section to addRoute', () => {
    render(<App />);

    const callArgs = (addRoute as Mock).mock.calls[0][0];
    expect(callArgs.primarybarSection).toEqual({
      id: MANAGE_APP_ID,
      label: 'Management',
      position: 3,
    });
  });

  it('should call removeRoute when user does not have all config rights', () => {
    (useHasAllRights as Mock).mockReturnValue(false);

    render(<App />);

    expect(removeRoute).toHaveBeenCalledWith(MTA_ROUTE_ID);
    expect(addRoute).not.toHaveBeenCalled();
  });

  it('should render null', () => {
    const { container } = render(<App />);
    expect(container.innerHTML).toBe('');
  });

  it('should render MtaTooltipView content', () => {
    const { getByTestId } = render(<MtaTooltipView />);
    expect(getByTestId('primary-bar-tooltip')).toBeDefined();
  });
});
