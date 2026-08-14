/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render, screen } from '@testing-library/react';
import { useAllConfig, useIsAdvanced } from '@zextras/ui-shared';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { TrackerProvider } from '../provider';

vi.mock('@posthog/react', () => ({
  PostHogProvider: ({ children }: { children?: ReactNode }) => (
    <div data-testid="posthog-provider">{children}</div>
  ),
}));

vi.mock('@zextras/ui-shared', () => ({
  useAllConfig: vi.fn(),
  useIsAdvanced: vi.fn(),
}));

vi.mock('../page-view', () => ({
  TrackerPageView: () => null,
}));

describe('TrackerProvider', () => {
  beforeEach(() => {
    (useIsAdvanced as Mock).mockReturnValue(false);
  });

  it('renders children when analytics are disabled', () => {
    (useAllConfig as Mock).mockReturnValue({
      data: [{ n: 'carbonioSendAnalytics', _content: 'FALSE' }],
      isLoading: false,
    });

    render(
      <TrackerProvider>
        <div>child-content</div>
      </TrackerProvider>,
    );

    expect(screen.getByText('child-content')).not.toBeNull();
    expect(screen.queryByTestId('posthog-provider')).toBeNull();
  });

  it('renders children when config is loading', () => {
    (useAllConfig as Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(
      <TrackerProvider>
        <div>child-content</div>
      </TrackerProvider>,
    );

    expect(screen.getByText('child-content')).not.toBeNull();
    expect(screen.queryByTestId('posthog-provider')).toBeNull();
  });
});
