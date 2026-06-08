/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@zextras/ui-components', () => ({
  PrimaryBarTooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="primary-bar-tooltip">{children}</div>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => [(key: string, fallback?: string) => fallback || key, { i18n: {} }],
  Trans: ({ defaults }: { defaults: string }) => <>{defaults}</>,
}));

vi.mock('react-router', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('../views/app-view', () => ({
  __esModule: true,
  default: () => <div data-testid="app-view" />,
}));

import { CosTooltipView } from '../cos-tooltip-view';

describe('CosTooltipView', () => {
  it('should render Class of Service label', () => {
    const { container } = render(<CosTooltipView />);
    const textContent = container.textContent ?? '';
    expect(textContent).toContain('Class of Service');
  });

  it('should render tooltip description with features, Server Pools and Advanced', () => {
    const { container } = render(<CosTooltipView />);
    const textContent = container.textContent ?? '';
    expect(textContent).toContain('Class of Services');
    expect(textContent).toContain('Server Pools');
    expect(textContent).toContain('Advanced');
  });

  it('should render inside a PrimaryBarTooltip wrapper', () => {
    const { container } = render(<CosTooltipView />);
    const tooltip = container.querySelector('[data-testid="primary-bar-tooltip"]');
    expect(tooltip).not.toBeNull();
  });
});
