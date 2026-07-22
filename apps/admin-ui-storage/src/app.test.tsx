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

const mockRights = vi.hoisted(() => ({
  rights: [] as Array<{ right: string; target: string }>,
}));

vi.mock('@zextras/ui-components', () => ({
  PrimaryBarTooltip: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@zextras/ui-shared', () => ({
  addRoute: vi.fn(),
  getRights: (
    rights: Array<{ right: string; target: string }>,
    target: string,
  ): Array<{ n: string }> =>
    rights.filter((r) => r.target === target).map((r) => ({ n: r.right })),
  useCurrentUserRights: () => ({ data: mockRights.rights }),
}));

vi.mock('react-i18next', () => ({
  Trans: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  useTranslation: () => [(key: string, fallback?: string) => fallback ?? key],
}));

vi.mock('./views/app-view', () => ({
  AppView: () => <div data-testid="app-view" />,
}));

describe('Storage App bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRights.rights = [];
  });

  it('calls addRoute when user has LIST_SERVER right under SERVER', () => {
    mockRights.rights = [{ right: 'listServer', target: 'server' }];

    render(<App />);

    expect(addRoute).toHaveBeenCalledTimes(1);
    expect(addRoute).toHaveBeenCalledWith(
      expect.objectContaining({
        route: 'storage',
        position: 4,
        visible: true,
        label: 'Storage',
        primaryBar: 'HardDriveOutline',
        trackerLabel: 'pb_storage',
        primarybarSection: { id: 'manage', label: 'Management', position: 3 },
      }),
    );
  });

  it('does NOT call addRoute when user does not have LIST_SERVER right', () => {
    mockRights.rights = [{ right: 'otherRight', target: 'other' }];

    render(<App />);

    expect(addRoute).not.toHaveBeenCalled();
  });

  it('does NOT call addRoute when rights are empty', () => {
    mockRights.rights = [];

    render(<App />);

    expect(addRoute).not.toHaveBeenCalled();
  });

  it('returns null (renders nothing)', () => {
    mockRights.rights = [{ right: 'listServer', target: 'server' }];

    const { container } = render(<App />);

    expect(container.firstChild).toBeNull();
  });
});
