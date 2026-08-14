/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  useIsAdvanced: vi.fn(),
  useHasAllRights: vi.fn(),
}));

vi.mock('../views/app-view', () => ({
  AppView: () => <div data-testid="app-view" />,
}));

import { addRoute, removeRoute, useHasAllRights, useIsAdvanced } from '@zextras/ui-shared';

import App from '../app';
import { BACKUP_ROUTE_ID, PRIMARY_BAR_BACKUP, SERVICES_ROUTE_ID } from '../constants';

describe('App', () => {
  beforeEach(() => {
    vi.mocked(useIsAdvanced).mockReturnValue(true);
    vi.mocked(useHasAllRights).mockReturnValue(true);
  });

  it('should call addRoute when user is advanced and has all config rights', () => {
    render(<App />);

    expect(addRoute).toHaveBeenCalledTimes(1);
    expect(addRoute).toHaveBeenCalledWith(
      expect.objectContaining({
        route: BACKUP_ROUTE_ID,
        position: 1,
        visible: true,
        label: 'Backup',
        primaryBar: 'BackupOutline',
        trackerLabel: PRIMARY_BAR_BACKUP,
        primarybarSection: {
          id: SERVICES_ROUTE_ID,
          label: 'Services',
          position: 4,
        },
      }),
    );
    expect(removeRoute).not.toHaveBeenCalled();
  });

  it('should call removeRoute when user does not have all config rights', () => {
    vi.mocked(useHasAllRights).mockReturnValue(false);

    render(<App />);

    expect(removeRoute).toHaveBeenCalledWith(BACKUP_ROUTE_ID);
    expect(addRoute).not.toHaveBeenCalled();
  });

  it('should not call addRoute when user is not advanced', () => {
    vi.mocked(useIsAdvanced).mockReturnValue(false);

    render(<App />);

    expect(addRoute).not.toHaveBeenCalled();
    expect(removeRoute).not.toHaveBeenCalled();
  });

  it('should call removeRoute when not advanced and no rights', () => {
    vi.mocked(useIsAdvanced).mockReturnValue(false);
    vi.mocked(useHasAllRights).mockReturnValue(false);

    render(<App />);

    expect(removeRoute).toHaveBeenCalledWith(BACKUP_ROUTE_ID);
    expect(addRoute).not.toHaveBeenCalled();
  });

  it('should render null', () => {
    const { container } = render(<App />);
    expect(container.innerHTML).toBe('');
  });
});
