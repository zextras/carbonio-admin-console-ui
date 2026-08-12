/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-components', () => ({
  PrimaryBarTooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="primary-bar-tooltip">{children}</div>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback || key],
  Trans: ({ defaults }: { defaults: string }) => <>{defaults}</>,
}));

import { PrivacyTooltipView } from '../privacy-tooltip-view';

describe('PrivacyTooltipView', () => {
  it('should render privacy tooltip content', () => {
    render(<PrivacyTooltipView />);

    expect(screen.getByTestId('primary-bar-tooltip')).toBeTruthy();
    expect(screen.getByText('<bold>Privacy</bold>')).toBeTruthy();
    expect(
      screen.getByText(
        'Manage the <bold>Privacy</bold> settings such as <bold>data reports, error logs</bold> and <bold>surveys</bold>.',
      ),
    ).toBeTruthy();
  });
});
